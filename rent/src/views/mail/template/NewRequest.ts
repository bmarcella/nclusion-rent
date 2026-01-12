export const NewReqEmailTemplate = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Nouvelle requête</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin:0; padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border:1px solid #eee; border-radius:12px; padding:24px;">
            <tr>
              <td>
                <h2 style="margin:0 0 12px 0;">Bonjour {{fullName}} ,</h2>
                <p style="margin:0 0 12px 0;">
                 Une nouvelle requête de type {{ type_request }}, pour un montant de {{ amount }} {{ currency }}, a été enregistrée sur AjiMobil et requiert votre validation.
                </p>
          
                <p style="margin:0 0 24px 0;">
                  <a href="{{reqUrl}}"
                     style="display:inline-block; background:#111827; color:#fff; text-decoration:none; padding:12px 16px; border-radius:10px;">
                    {{reqUrlText}}
                  </a>
                </p>

                <p style="margin:0; color:#6b7280; font-size:12px;">
                  Si cette demande ne vous concerne pas, merci d’ignorer cet email.
                </p>

                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
                <p style="margin:0; font-size:12px; color:#6b7280;">
                  Crée le {{createdAt}} par {{ createdBy }}
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
