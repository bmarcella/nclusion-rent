export const welcomeEmailTemplate = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Welcome</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin:0; padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border:1px solid #eee; border-radius:12px; padding:24px;">
            <tr>
              <td>
                <h2 style="margin:0 0 12px 0;">Hi {{firstName}},</h2>
                <p style="margin:0 0 12px 0;">
                  Welcome to <strong>{{companyName}}</strong> 🎉
                </p>
                <p style="margin:0 0 18px 0;">
                  You can get started here:
                </p>

                <p style="margin:0 0 24px 0;">
                  <a href="{{ctaUrl}}"
                     style="display:inline-block; background:#111827; color:#fff; text-decoration:none; padding:12px 16px; border-radius:10px;">
                    {{ctaText}}
                  </a>
                </p>

                <p style="margin:0; color:#6b7280; font-size:12px;">
                  If you didn’t request this, ignore this email.
                </p>

                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

                <p style="margin:0; font-size:12px; color:#6b7280;">
                  Sent on {{sendDate}}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
