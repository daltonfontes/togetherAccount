import { RenderedEmail } from './invite-email.template';

export interface MagicLinkEmailParams {
  link: string;
  expiresInMinutes: number;
}

export function magicLinkEmailTemplate({
  link,
  expiresInMinutes,
}: MagicLinkEmailParams): RenderedEmail {
  const subject = 'Seu link de acesso ao Together Account';

  const text = [
    'Use o link abaixo para entrar no Together Account:',
    '',
    link,
    '',
    `Esse link expira em ${expiresInMinutes} minutos e só pode ser usado uma vez.`,
    '',
    'Se você não pediu esse link, pode ignorar este e-mail com segurança.',
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
                  Seu link de acesso
                </h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#333333;">
                  Clique no botão abaixo para entrar. Esse link expira em
                  ${expiresInMinutes} minutos e só pode ser usado uma vez.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <a
                  href="${link}"
                  style="display:inline-block;background-color:#00e67a;color:#111111;font-weight:700;font-size:15px;text-decoration:none;padding:12px 24px;border:2px solid #111111;border-radius:8px;"
                >
                  Entrar no Together Account
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
                  Se você não pediu esse link, pode ignorar este e-mail com segurança —
                  ninguém consegue entrar na sua conta sem clicar nele.
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
