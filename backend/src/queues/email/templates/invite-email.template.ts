export interface InviteEmailParams {
  householdName: string;
  inviterName: string;
  link: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function inviteEmailTemplate({
  householdName,
  inviterName,
  link,
}: InviteEmailParams): RenderedEmail {
  const subject = `${inviterName} convidou você para "${householdName}" no Together Account`;

  const text = [
    `${inviterName} convidou você para participar da casa "${householdName}" no Together Account.`,
    '',
    `Aceite o convite: ${link}`,
    '',
    'Se você não esperava este convite, pode ignorar este e-mail com segurança.',
  ].join('\n');

  const html = `
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#f4f4f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:2px solid #111111;border-radius:12px;max-width:480px;width:100%;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0;font-size:16px;font-weight:700;color:#111111;">
                  Together Account
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;">
                <h1 style="margin:0 0 16px 0;font-size:20px;line-height:1.4;color:#111111;">
                  Você foi convidado(a) para uma casa
                </h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#333333;">
                  <strong>${escapeHtml(inviterName)}</strong> convidou você para participar de
                  <strong>"${escapeHtml(householdName)}"</strong> no Together Account, a plataforma
                  para organizar as finanças compartilhadas da casa.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <a
                  href="${link}"
                  style="display:inline-block;background-color:#00e67a;color:#111111;font-weight:700;font-size:15px;text-decoration:none;padding:12px 24px;border:2px solid #111111;border-radius:8px;"
                >
                  Aceitar convite
                </a>
                <p style="margin:20px 0 0 0;font-size:12px;line-height:1.6;color:#777777;">
                  Ou copie e cole este link no navegador:<br />
                  <a href="${link}" style="color:#00994f;word-break:break-all;">${link}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px 32px;border-top:1px solid #e5e5e5;">
                <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:#999999;">
                  Se você não esperava este convite, pode ignorar este e-mail com segurança.
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

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
