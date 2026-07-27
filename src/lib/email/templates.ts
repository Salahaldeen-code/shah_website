import "server-only";

const BRAND_YELLOW = "#fac814";
const BRAND_DARK = "#0a0a0a";
const BRAND_RED = "#e11d2e";

export type EmailDetailRow = {
  label: string;
  value: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function formatDetailValueHtml(value: string) {
  return value
    .split("\n")
    .map((line) => escapeHtml(line))
    .join("<br>");
}

function renderDetailsTable(rows: EmailDetailRow[]) {
  const body = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.55);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;width:38%;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);color:#ffffff;font-size:14px;line-height:1.5;vertical-align:top;">
            ${formatDetailValueHtml(row.value)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:rgba(255,255,255,0.03);border:1px solid rgba(250,200,20,0.18);border-radius:12px;overflow:hidden;">
      ${body}
    </table>
  `;
}

function renderButton(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
      <tr>
        <td align="center" style="border-radius:999px;background:${BRAND_YELLOW};">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND_DARK};text-decoration:none;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function renderBrandedEmail({
  preheader,
  eyebrow,
  title,
  intro,
  secondaryIntro,
  detailsTitle,
  details,
  footerNote,
  button,
}: {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  secondaryIntro?: string;
  detailsTitle?: string;
  details?: EmailDetailRow[];
  footerNote?: string;
  button?: { href: string; label: string };
}) {
  const detailsBlock =
    details && details.length > 0
      ? `
        <h2 style="margin:32px 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND_YELLOW};">
          ${escapeHtml(detailsTitle || "Registration details")}
        </h2>
        ${renderDetailsTable(details)}
      `
      : "";

  const buttonBlock = button ? renderButton(button.href, button.label) : "";

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#111111;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#111111;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 18px;text-align:center;">
                <div style="display:inline-block;padding:8px 14px;border:1px solid rgba(250,200,20,0.35);border-radius:999px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND_YELLOW};">
                  ${escapeHtml(eyebrow)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:${BRAND_DARK};border:1px solid rgba(250,200,20,0.22);border-radius:18px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,0.35);">
                <div style="height:4px;background:linear-gradient(90deg, ${BRAND_YELLOW}, ${BRAND_RED});"></div>
                <div style="padding:34px 28px 30px;">
                  <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND_YELLOW};">
                    ${escapeHtml(title)}
                  </h1>
                  <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.82);">
                    ${intro}
                  </p>
                  ${
                    secondaryIntro
                      ? `<p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.62);">${secondaryIntro}</p>`
                      : ""
                  }
                  ${detailsBlock}
                  ${buttonBlock}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 8px 0;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.45);">
                  ${escapeHtml(footerNote || "Persatuan Sukan & Rekreasi (PSR)")}
                </p>
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);">
                  <a href="${escapeHtml(siteUrl())}" style="color:rgba(250,200,20,0.8);text-decoration:none;">
                    ${escapeHtml(siteUrl())}
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export function renderPlainTextEmail({
  title,
  intro,
  secondaryIntro,
  details,
  footerNote,
  button,
}: {
  title: string;
  intro: string;
  secondaryIntro?: string;
  details?: EmailDetailRow[];
  footerNote?: string;
  button?: { href: string; label: string };
}) {
  const lines = [title, "", intro];

  if (secondaryIntro) {
    lines.push("", secondaryIntro);
  }

  if (details && details.length > 0) {
    lines.push("", "Registration details", "-------------------");
    for (const row of details) {
      lines.push(`${row.label}: ${row.value}`);
    }
  }

  if (button) {
    lines.push("", `${button.label}: ${button.href}`);
  }

  lines.push("", footerNote || "Persatuan Sukan & Rekreasi (PSR)", siteUrl());

  return lines.join("\n");
}

export function formatPhoneMY(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `+60 ${digits}` : phone;
}

export function buildRegistrationDetails({
  fullName,
  email,
  icNumber,
  phone,
  addressLine,
  address,
  sport,
}: {
  fullName: string;
  email: string;
  icNumber: string;
  phone: string;
  addressLine: string;
  address: string;
  sport: string;
}): EmailDetailRow[] {
  return [
    { label: "Full name", value: fullName },
    { label: "IC number", value: icNumber },
    { label: "Email", value: email },
    { label: "Phone (WhatsApp)", value: formatPhoneMY(phone) },
    { label: "Address", value: `${addressLine}\n${address}` },
    { label: "Sport preference", value: sport },
  ];
}
