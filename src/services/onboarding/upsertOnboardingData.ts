import config from '../../resources/config/config';

/**
 * Upserts onboarding data using SELECT -> UPDATE/INSERT pattern.
 * Bypasses PostgREST on_conflict parameter (avoids PGRST204 errors).
 */

type PostgrestErrorLike = {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
};

const isRecurringFrequencyConstraintViolation = (err: unknown): err is PostgrestErrorLike => {
  const e = err as PostgrestErrorLike | null;
  if (!e || typeof e.message !== 'string') return false;
  return e.code === '23514' && e.message.includes('onboarding_data_recurring_frequency_check');
};

type RecurringFrequencyNew = 'once_a_month' | 'twice_a_month' | 'weekly' | 'every_other_week';
type RecurringFrequencyLegacy = 'monthly' | 'bimonthly' | 'weekly' | 'biweekly';

const normalizeRecurringFrequencyToNew = (value: unknown): RecurringFrequencyNew | null => {
  if (value == null) return null;
  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;

  // Already in new format
  if (raw === 'once_a_month') return 'once_a_month';
  if (raw === 'twice_a_month') return 'twice_a_month';
  if (raw === 'weekly') return 'weekly';
  if (raw === 'every_other_week') return 'every_other_week';

  // Legacy values
  if (raw === 'monthly') return 'once_a_month';
  if (raw === 'bimonthly' || raw === 'bi-monthly' || raw === 'bi monthly') return 'twice_a_month';
  if (raw === 'biweekly' || raw === 'bi-weekly' || raw === 'bi weekly') return 'every_other_week';

  // Common UI labels / variants
  if (raw === 'once a month' || raw === 'once-a-month') return 'once_a_month';
  if (raw === 'twice a month' || raw === 'twice-a-month') return 'twice_a_month';
  if (raw === 'every other week' || raw === 'every-other-week') return 'every_other_week';

  return null;
};

const normalizeRecurringFrequencyToLegacy = (value: unknown): RecurringFrequencyLegacy | null => {
  if (value == null) return null;
  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;

  // Already in legacy format
  if (raw === 'monthly') return 'monthly';
  if (raw === 'bimonthly' || raw === 'bi-monthly' || raw === 'bi monthly') return 'bimonthly';
  if (raw === 'weekly') return 'weekly';
  if (raw === 'biweekly' || raw === 'bi-weekly' || raw === 'bi weekly') return 'biweekly';

  // New values
  if (raw === 'once_a_month') return 'monthly';
  if (raw === 'twice_a_month') return 'bimonthly';
  if (raw === 'every_other_week') return 'biweekly';

  // Common UI labels / variants
  if (raw === 'once a month' || raw === 'once-a-month') return 'monthly';
  if (raw === 'twice a month' || raw === 'twice-a-month') return 'bimonthly';
  if (raw === 'every other week' || raw === 'every-other-week') return 'biweekly';

  return null;
};

const normalizePayloadForDb = (
  payload: Record<string, unknown>,
  target: 'new' | 'legacy'
): Record<string, unknown> => {
  if (!Object.prototype.hasOwnProperty.call(payload, 'recurring_frequency')) return payload;

  // Common bug: UI sends empty string/"undefined" instead of null.
  const rawVal = payload.recurring_frequency;
  if (typeof rawVal === 'string') {
    const trimmed = rawVal.trim();
    const lowered = trimmed.toLowerCase();
    if (!trimmed || lowered === 'null' || lowered === 'undefined') {
      return { ...payload, recurring_frequency: null };
    }
  }

  const normalized =
    target === 'new'
      ? normalizeRecurringFrequencyToNew(payload.recurring_frequency)
      : normalizeRecurringFrequencyToLegacy(payload.recurring_frequency);

  // If we can't normalize confidently, keep original value (DB will reject if invalid).
  // This avoids silently changing unknown values.
  if (normalized === null) return payload;

  return { ...payload, recurring_frequency: normalized };
};

export const upsertOnboardingData = async (
  userId: string,
  payload: Record<string, unknown>
): Promise<{ error: { message: string } | null }> => {
  if (!config.supabaseClient) {
    return { error: { message: 'Supabase client not configured' } };
  }

  try {
    // 1. Check if row exists
    const { data: existing, error: selectError } = await config.supabaseClient
      .from('onboarding_data')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('[upsertOnboardingData] SELECT error:', selectError);
      return { error: { message: selectError.message } };
    }

    // 2. Update if exists, insert if not
    if (existing) {
      const updatePayload = normalizePayloadForDb(payload, 'new');
      const { error: updateError } = await config.supabaseClient
        .from('onboarding_data')
        .update({ ...updatePayload, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        // If the DB still expects legacy recurring_frequency values, retry once with legacy mapping.
        if (isRecurringFrequencyConstraintViolation(updateError)) {
          const retryPayload = normalizePayloadForDb(payload, 'legacy');
          const { error: retryError } = await config.supabaseClient
            .from('onboarding_data')
            .update({ ...retryPayload, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

          if (!retryError) {
            return { error: null };
          }

          console.error('[upsertOnboardingData] UPDATE retry (legacy recurring_frequency) error:', retryError);
          return { error: { message: retryError.message } };
        }

        console.error('[upsertOnboardingData] UPDATE error:', updateError);
        return { error: { message: updateError.message } };
      }
    } else {
      const insertPayload = normalizePayloadForDb(payload, 'new');
      const { error: insertError } = await config.supabaseClient
        .from('onboarding_data')
        .insert({ user_id: userId, ...insertPayload });

      if (insertError) {
        if (isRecurringFrequencyConstraintViolation(insertError)) {
          const retryPayload = normalizePayloadForDb(payload, 'legacy');
          const { error: retryError } = await config.supabaseClient
            .from('onboarding_data')
            .insert({ user_id: userId, ...retryPayload });

          if (!retryError) {
            return { error: null };
          }

          console.error('[upsertOnboardingData] INSERT retry (legacy recurring_frequency) error:', retryError);
          return { error: { message: retryError.message } };
        }

        console.error('[upsertOnboardingData] INSERT error:', insertError);
        return { error: { message: insertError.message } };
      }
    }

    return { error: null };
  } catch (err) {
    console.error('[upsertOnboardingData] Unexpected error:', err);
    return { error: { message: 'Unexpected error saving onboarding data' } };
  }
};
