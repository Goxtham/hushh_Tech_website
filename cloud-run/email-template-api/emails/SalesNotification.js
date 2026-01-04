// cloud-run/email-template-api/emails/SalesNotification.js
// Gmail-safe: NO Tailwind, NO JS. Table-based + inline styles.
// Matches the provided "Hussh Technologies Email Template Refined" content + UI (light mode look).

const escapeHtml = (val = "") =>
  String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (val = "") =>
  String(val)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function SalesNotification(input = {}) {
  const d = input || {};

  // Palette (from your tailwind config)
  const C = {
    primary: "#0088cc",
    bg: "#f5f7f8",
    card: "#ffffff",
    border: "#f3f4f6",

    gray900: "#111827",
    gray800: "#1f2937",
    gray700: "#374151",
    gray600: "#4b5563",
    gray500: "#6b7280",
    gray400: "#9ca3af",
    gray300: "#d1d5db",
  };

  // ---- Defaults = EXACT content from your HTML ----
  const subject = escapeHtml(d.subject ?? "Hussh Technologies");
  const previewText = escapeHtml(
    d.previewText ?? "Hussh Technologies — Who we are, inspiration, values, approach."
  );

  const viewInBrowserText = escapeHtml(d.viewInBrowserText ?? "View in browser");
  const viewInBrowserUrl = escapeHtml(d.viewInBrowserUrl ?? "#");

  const brand = escapeHtml(d.brand ?? "Hussh");
  const siteUrl = escapeHtml(d.siteUrl ?? "https://www.hushhtech.com/");
  const siteLinkText = escapeHtml(d.siteLinkText ?? "https://www.hushhtech.com/ 🤫");

  const whoTitle = escapeHtml(d.whoTitle ?? "Who we are");
  const whoP1 = escapeHtml(
    d.whoP1 ??
      "Hussh Technologies is an investment management firm that employs human intelligence & psychology along with ai, data, mathematical and statistical methods in the design and execution of its investment programs."
  );
  const whoP2 = escapeHtml(
    d.whoP2 ??
      "Our mission is to generate sustainable alpha while delivering trust, value, and transparency as an AI powered Berkshire Hathaway."
  );

  const inspTitle = escapeHtml(d.inspTitle ?? "Our Inspiration");
  const inspIntro = escapeHtml(d.inspIntro ?? "We are inspired by the timeless strategies of industry pioneers:");
  const inspItems =
    Array.isArray(d.inspItems) && d.inspItems.length
      ? d.inspItems
      : [
          {
            name: "Renaissance Technologies:",
            desc: "Quantitative precision and market-leading algorithms.",
          },
          {
            name: "Bridgewater Associates:",
            desc: "Radical transparency and systematic diversification.",
          },
          {
            name: "Berkshire Hathaway:",
            desc: "Long-term value creation driven by Warren Buffett and Charlie Munger's enduring philosophy.",
          },
        ];

  const valuesTitle = escapeHtml(d.valuesTitle ?? "Core Values");
  const valuesItems =
    Array.isArray(d.valuesItems) && d.valuesItems.length
      ? d.valuesItems
      : [
          {
            name: "Human-Centered Design:",
            desc: "Leveraging psychological insights to optimize decision-making.",
          },
          {
            name: "AI-Driven Precision:",
            desc: "Uncovering market inefficiencies using advanced machine learning and analytics.",
          },
          {
            name: "Quantitative Rigor:",
            desc: "Applying consistent, scalable, and repeatable strategies backed by mathematics and statistics.",
          },
          {
            name: "Long-Term Thinking:",
            desc: "Owning the best free cash flow businesses and compounding returns over decades.",
          },
        ];

  const approachTitle = escapeHtml(d.approachTitle ?? "Our Approach");
  const approachItems =
    Array.isArray(d.approachItems) && d.approachItems.length
      ? d.approachItems
      : [
          {
            name: "AI Meets Alpha:",
            desc: "Proprietary algorithms combined with behavioral finance principles to adapt dynamically to markets.",
          },
          {
            name: "Disciplined Execution:",
            desc: "Fully data-driven processes to eliminate emotional bias.",
          },
          {
            name: "Transparency and Integrity:",
            desc: "Aligned with Bridgewater's principles, ensuring clarity in performance, risks, and fees.",
          },
        ];

  const whyTitle = escapeHtml(d.whyTitle ?? "Why Hushh Technologies?");
  const whyIntro = escapeHtml(d.whyIntro ?? "We are crafting the future of alpha generation by:");
  const whyItems =
    Array.isArray(d.whyItems) && d.whyItems.length
      ? d.whyItems
      : [
          {
            name: "Blending Human Intuition with Machine Intelligence:",
            desc: "Merging creativity and decision-making with computational power.",
          },
          {
            name: "Setting New Standards in Alpha Creation:",
            desc: "Emulating the best practices of our role models while innovating.",
          },
          {
            name: "Building Generational Wealth:",
            desc: "Creating lasting value for investors, employees, and stakeholders.",
          },
        ];

  const quoteText = escapeHtml(
    d.quoteText ?? '"Welcome to the future of investment management, where tradition meets innovation."'
  );

  const ctaText = escapeHtml(d.ctaText ?? "Connect Now");
  const ctaUrl = escapeHtml(d.ctaUrl ?? "#");

  const copyrightText = escapeHtml(d.copyrightText ?? "© 2024 Hussh Technologies");
  const footerAddress = escapeHtml(
    d.footerAddress ?? "Hushh 🤫 Technologies LLC, 1021 5th St W, Kirkland, WA 98033"
  );
  const footerReason = escapeHtml(
    d.footerReason ?? "You are receiving this email because you signed up for our newsletter."
  );
  const unsubscribeText = escapeHtml(d.unsubscribeText ?? "Unsubscribe");
  const unsubscribeUrl = escapeHtml(d.unsubscribeUrl ?? "#");
  const privacyText = escapeHtml(d.privacyText ?? "Privacy Policy");
  const privacyUrl = escapeHtml(d.privacyUrl ?? "#");

  // ---- UI helpers for lists (email-safe) ----
  const bulletRows = (items) =>
    (items || [])
      .map((it) => {
        const name = escapeHtml(it?.name ?? "");
        const desc = escapeHtml(it?.desc ?? "");
        return `
          <tr>
            <td valign="top" width="18" style="padding:6px 10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:18px;color:${C.gray600};">•</td>
            <td style="padding:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${C.gray600};">
              <strong style="color:${C.gray900};font-weight:700;">${name}</strong> ${desc}
            </td>
          </tr>
        `;
      })
      .join("");

  const orderedRows = (items) =>
    (items || [])
      .map((it, idx) => {
        const name = escapeHtml(it?.name ?? "");
        const desc = escapeHtml(it?.desc ?? "");
        const n = String(idx + 1);
        return `
          <tr>
            <td valign="top" width="26" style="padding:6px 10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:16px;color:${C.gray600};font-weight:700;">
              ${n}.
            </td>
            <td style="padding:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${C.gray600};">
              <strong style="color:${C.gray900};font-weight:700;">${name}</strong> ${desc}
            </td>
          </tr>
        `;
      })
      .join("");

  // ---- HTML (structure mirrors your provided UI) ----
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${C.bg};">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
      ${previewText}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.bg};">
      <!-- View in browser -->
      <tr>
        <td align="center" style="padding:40px 12px 18px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">
            <tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:${C.gray400};font-weight:600;">
                <a href="${viewInBrowserUrl}" target="_blank" style="color:${C.gray400};text-decoration:none;">
                  ${viewInBrowserText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Card -->
      <tr>
        <td align="center" style="padding:0 12px 20px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
            style="width:600px;max-width:600px;background-color:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};box-shadow:0 6px 16px rgba(0,0,0,0.06);">

            <!-- Brand header (centered) -->
            <tr>
              <td align="center" style="padding:48px 24px 18px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle" style="padding-right:10px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="36" height="36"
                        style="width:36px;height:36px;border-radius:8px;background-color:${C.primary};box-shadow:0 10px 22px rgba(0,136,204,0.20);">
                        <tr>
                          <td align="center" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:20px;color:#ffffff;font-weight:900;">
                            ▦
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:26px;color:${C.gray900};font-weight:900;letter-spacing:-0.6px;">
                      ${brand}<span style="color:${C.primary};">.</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:0 32px 36px 32px;">

                <!-- Who we are -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:32px;line-height:38px;color:${C.gray900};font-weight:900;letter-spacing:-0.6px;margin:0 0 10px 0;">
                  ${whoTitle}
                </div>

                <div style="margin:0 0 14px 0;">
                  <a href="${siteUrl}" target="_blank"
                    style="color:${C.primary};text-decoration:underline;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;font-weight:600;">
                    ${siteLinkText}
                  </a>
                </div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${C.gray600};margin:0 0 10px 0;">
                  ${whoP1}
                </div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${C.gray600};margin:0 0 18px 0;">
                  ${whoP2}
                </div>

                <!-- Our Inspiration -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:${C.gray900};font-weight:800;margin:18px 0 8px 0;">
                  ${inspTitle}
                </div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${C.gray600};margin:0 0 10px 0;">
                  ${inspIntro}
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px 0;">
                  ${bulletRows(inspItems)}
                </table>

                <!-- Core Values -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:${C.gray900};font-weight:800;margin:18px 0 8px 0;">
                  ${valuesTitle}
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px 0;">
                  ${orderedRows(valuesItems)}
                </table>

                <!-- Our Approach -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:${C.gray900};font-weight:800;margin:18px 0 8px 0;">
                  ${approachTitle}
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px 0;">
                  ${bulletRows(approachItems)}
                </table>

                <!-- Why Hushh -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:${C.gray900};font-weight:800;margin:18px 0 8px 0;">
                  ${whyTitle}
                </div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${C.gray600};margin:0 0 10px 0;">
                  ${whyIntro}
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 10px 0;">
                  ${bulletRows(whyItems)}
                </table>

                <!-- Quote (with top border) -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${C.border};margin-top:10px;">
                  <tr>
                    <td style="padding:16px 0 0 0;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:28px;color:${C.gray800};font-weight:700;font-style:italic;text-align:center;">
                        ${quoteText}
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- CTA -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:18px;">
                  <tr>
                    <td align="center">
                      <a href="${ctaUrl}" target="_blank"
                        style="display:inline-block;width:100%;max-width:520px;height:56px;line-height:56px;text-align:center;background-color:${C.primary};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;border-radius:10px;box-shadow:0 14px 28px rgba(0,136,204,0.25);">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>

          <!-- Footer (outside card, centered, max 400px) -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="400"
            style="width:400px;max-width:400px;margin-top:18px;">
            <tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;color:${C.gray400};font-weight:800;text-transform:uppercase;letter-spacing:3px;padding:0 0 12px 0;">
                ${copyrightText}
              </td>
            </tr>
            <tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${C.gray400};padding:0 0 12px 0;">
                ${footerAddress}<br/>
                ${footerReason}
              </td>
            </tr>
            <tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:${C.gray400};font-weight:700;">
                <a href="${unsubscribeUrl}" target="_blank" style="color:${C.gray400};text-decoration:underline;">${unsubscribeText}</a>
                <span style="color:${C.gray300};padding:0 8px;">•</span>
                <a href="${privacyUrl}" target="_blank" style="color:${C.gray400};text-decoration:underline;">${privacyText}</a>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <tr><td style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>
    </table>
  </body>
</html>`;

  const text = [
    `${stripHtml(brand)}.`,
    "",
    stripHtml(whoTitle),
    stripHtml(siteUrl),
    "",
    stripHtml(whoP1),
    "",
    stripHtml(whoP2),
    "",
    stripHtml(inspTitle),
    stripHtml(inspIntro),
    ...inspItems.map((x) => `- ${stripHtml(x.name)} ${stripHtml(x.desc)}`),
    "",
    stripHtml(valuesTitle),
    ...valuesItems.map((x, i) => `${i + 1}. ${stripHtml(x.name)} ${stripHtml(x.desc)}`),
    "",
    stripHtml(approachTitle),
    ...approachItems.map((x) => `- ${stripHtml(x.name)} ${stripHtml(x.desc)}`),
    "",
    stripHtml(whyTitle),
    stripHtml(whyIntro),
    ...whyItems.map((x) => `- ${stripHtml(x.name)} ${stripHtml(x.desc)}`),
    "",
    stripHtml(quoteText),
    "",
    `${stripHtml(ctaText)}: ${stripHtml(ctaUrl)}`,
    "",
    stripHtml(copyrightText),
    stripHtml(footerAddress),
    stripHtml(footerReason),
    `${stripHtml(unsubscribeText)}: ${stripHtml(unsubscribeUrl)} | ${stripHtml(privacyText)}: ${stripHtml(privacyUrl)}`,
  ].join("\n");

  return { subject, html, text };
};
