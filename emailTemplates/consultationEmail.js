/**
 * UniquEra branded consultation submission email template.
 * Uses conservative HTML/CSS for broad email client support.
 */

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * @param {Object} params
 * @param {string} params.subjectName
 * @param {{label: string, value: string}[]} params.rows
 * @param {string=} params.pageUrl
 */
export function buildConsultationEmailHtml({subjectName, rows, pageUrl}) {
  // Gmail-safe palette (hex only)
  const bg = '#071314';
  const card = '#0d2224';
  const border = '#17383b';
  const brand = '#2dc7cc';
  const text = '#ffffff';
  const muted = '#b7c7c8';
  const zebraA = '#0f2628';
  const zebraB = '#0d2224';

  // PNG logo (avoid SVG for Gmail compatibility)
  const logoPng = 'https://uniqueraclinic.com/wp-content/uploads/2025/12/cropped-uniquera_clinic_turkey_logo.png';

  const safeName = escapeHtml(subjectName || 'Unknown');
  const safePageUrl = pageUrl ? escapeHtml(pageUrl) : '';
  const ctaHref = safePageUrl || 'https://uniqueraclinic.com/';

  const rowHtml = rows
    .map((r, idx) => {
      const label = escapeHtml(r.label);
      const value = escapeHtml(r.value);
      const zebra = idx % 2 === 0 ? zebraA : zebraB;
      return `
        <tr>
          <td width="38%" valign="top" style="padding:12px 14px;border-top:1px solid ${border};color:${muted};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;background:${zebra};">
            ${label}
          </td>
          <td valign="top" style="padding:12px 14px;border-top:1px solid ${border};color:${text};font-size:14px;line-height:20px;background:${zebra};">
            ${value}
          </td>
        </tr>
      `;
    })
    .join('');

  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>UniquEra Consultation Submission</title>
  </head>
  <body style="margin:0;padding:0;background:${bg};">
    <!-- Preheader (hidden text) -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:${bg};">
      <tr>
        <td style="padding:0;margin:0;">
          <span style="display:none;font-size:1px;line-height:1px;color:${bg};max-height:0;max-width:0;opacity:0;">
            New consultation form submission from ${safeName}.
          </span>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:${bg};">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <!-- Container -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="border-collapse:collapse;width:600px;max-width:600px;">
            <!-- Header -->
            <tr>
              <td style="padding:0 0 14px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td align="left" valign="middle" style="padding:0;">
                      <a href="https://uniqueraclinic.com/" style="text-decoration:none;">
                        <img src="${logoPng}" width="52" height="52" alt="UniquEra Clinic" style="display:block;border:0;outline:none;text-decoration:none;width:52px;height:52px;" />
                      </a>
                    </td>
                    <td align="right" valign="middle" style="padding:0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                        <tr>
                          <td bgcolor="#0b1e20" style="padding:6px 10px;border:1px solid ${border};border-radius:999px;">
                            <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:11px;color:${brand};font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                              New submission
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td bgcolor="${card}" style="border:1px solid ${border};border-radius:24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:24px 22px 10px 22px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;color:${text};font-size:22px;line-height:28px;font-weight:700;">
                        Consultation Form Submission
                      </div>
                      <div style="font-family:Arial,Helvetica,sans-serif;color:${muted};font-size:14px;line-height:20px;padding-top:8px;">
                        Received from <span style="color:${text};font-weight:700;">${safeName}</span>.
                      </div>
                      ${
                        safePageUrl
                          ? `<div style="font-family:Arial,Helvetica,sans-serif;color:${muted};font-size:12px;line-height:18px;padding-top:8px;">
                              Page URL: <a href="${safePageUrl}" style="color:${brand};text-decoration:underline;">${safePageUrl}</a>
                            </div>`
                          : ''
                      }
                    </td>
                  </tr>

                  <!-- CTA -->
                  <tr>
                    <td style="padding:10px 22px 6px 22px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                        <tr>
                          <td bgcolor="${brand}" style="border-radius:999px;">
                            <a href="${ctaHref}" style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:13px;font-weight:700;color:#071314;text-decoration:none;border-radius:999px;">
                              Open Details
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding:14px 22px 0 22px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                        <tr>
                          <td height="1" style="font-size:1px;line-height:1px;background:${border};">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Data table -->
                  <tr>
                    <td style="padding:14px 22px 18px 22px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;border:1px solid ${border};border-radius:16px;">
                        ${rowHtml}
                      </table>
                    </td>
                  </tr>

                  <!-- Tip -->
                  <tr>
                    <td style="padding:0 22px 22px 22px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;border:1px solid ${border};border-radius:16px;background:#0b1e20;">
                        <tr>
                          <td style="padding:14px 16px;">
                            <div style="font-family:Arial,Helvetica,sans-serif;color:${text};font-size:13px;line-height:19px;">
                              Tip: use <span style="font-weight:700;">Reply</span> to respond directly to the patient (Reply-To is set when provided).
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:14px 6px 0 6px;">
                <div style="font-family:Arial,Helvetica,sans-serif;color:${muted};font-size:11px;line-height:16px;">
                  © ${year} UniquEra Clinic · This email was generated from your landing page form.
                </div>
              </td>
            </tr>
          </table>
          <!-- /Container -->
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

