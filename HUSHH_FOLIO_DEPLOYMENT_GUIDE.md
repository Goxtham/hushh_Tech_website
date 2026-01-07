# Hushh Folio - Backend Deployment Guide

## ✅ Deployment Complete!

All 3 Supabase Edge Functions have been deployed and configured successfully.

## Deployed Functions

| Function | Status | Description |
|----------|--------|-------------|
| `portfolio-generate` | ✅ ACTIVE | Uses Gemini 1.5 Pro to generate portfolio content from interview answers |
| `portfolio-photo-enhance` | ✅ ACTIVE | Uses GCP Imagen API for AI photo enhancement |
| `portfolio-slug-check` | ✅ ACTIVE | Checks URL slug availability and generates suggestions |

## Function Endpoints

Base URL: `https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1`

- **Generate Portfolio**: `POST /portfolio-generate`
- **Enhance Photo**: `POST /portfolio-photo-enhance`
- **Check Slug**: `POST /portfolio-slug-check`

## Configured Secrets

| Secret | Status | Description |
|--------|--------|-------------|
| `GEMINI_API_KEY` | ✅ Set | Google Gemini API key for AI content generation |
| `GCP_PROJECT_ID` | ✅ Set | `hushone-app` - GCP project for Imagen API |
| `GOOGLE_ACCESS_TOKEN` | ✅ Set | OAuth token for GCP API access |

## API Usage Examples

### 1. Generate Portfolio Content

```bash
curl -X POST "https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/portfolio-generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "portfolio_id": "uuid-here",
    "name": "John Doe",
    "interview_answers": [
      {"question_id": 1, "question_text": "What do you do?", "answer": "Software Engineer"}
    ]
  }'
```

### 2. Check Slug Availability

```bash
curl -X POST "https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/portfolio-slug-check" \
  -H "Content-Type: application/json" \
  -d '{"slug": "john-doe"}'
```

### 3. Enhance Photo

```bash
curl -X POST "https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/portfolio-photo-enhance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "portfolio_id": "uuid-here",
    "image_url": "https://example.com/photo.jpg",
    "enhancement_type": "professional"
  }'
```

## Redeployment Commands

If you need to redeploy functions:

```bash
# Deploy all portfolio functions
npx supabase functions deploy portfolio-generate --no-verify-jwt --project-ref ibsisfnjxeowvdtvgzff
npx supabase functions deploy portfolio-photo-enhance --no-verify-jwt --project-ref ibsisfnjxeowvdtvgzff
npx supabase functions deploy portfolio-slug-check --no-verify-jwt --project-ref ibsisfnjxeowvdtvgzff
```

## Updating Secrets

```bash
# Update Gemini API key
npx supabase secrets set GEMINI_API_KEY="new-key-here" --project-ref ibsisfnjxeowvdtvgzff

# Update GCP project
npx supabase secrets set GCP_PROJECT_ID="project-id" --project-ref ibsisfnjxeowvdtvgzff
```

## Viewing Logs

```bash
# View function logs
npx supabase functions logs portfolio-generate --project-ref ibsisfnjxeowvdtvgzff
```

## Database Tables Required

Ensure these tables exist (from migration `20260107300000_create_portfolio_tables.sql`):
- `portfolios` - Main portfolio data
- `portfolio_interview` - Interview Q&A storage
- `portfolio_sections` - Custom sections
- `portfolio_skills` - Skills list

---

**Deployed by**: Cline AI Assistant  
**Date**: January 7, 2026  
**Status**: ✅ Production Ready
