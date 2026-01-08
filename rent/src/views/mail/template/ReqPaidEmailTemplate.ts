export const ReqPaidEmailTemplate = `
<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; margin:0; padding:24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                 style="border:1px solid #dcfce7; border-radius:12px; padding:24px;">
            <tr>
              <td>
                <h2 style="margin:0 0 12px 0;">Bonjour {{fullName}},</h2>

                <p style="margin:0 0 12px 0;">
                  La requête de type <strong>{{type_request}}</strong>,
                  d’un montant de <strong>{{amount}} {{currency}}</strong>,
                  a été <strong style="color:#16a34a;">payée avec succès</strong>.
                </p>

                <p style="margin:0 0 24px 0;">
                  Le paiement a été effectué le <strong>{{paidAt}}</strong>
                  via <strong>{{paymentMethod}}</strong>.
                </p>

                <p style="margin:0 0 24px 0;">
                  <a href="{{reqUrl}}"
                     style="display:inline-block; background:#16a34a; color:#fff;
                            text-decoration:none; padding:12px 16px; border-radius:10px;">
                    Consulter la requête
                  </a>
                </p>

                <p style="margin:0; color:#6b7280; font-size:12px;">
                  Cette requête est maintenant <strong>finalisée</strong>.
                </p>

                <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />

                <p style="margin:0; font-size:12px; color:#6b7280;">
                  Payée le {{paidAt}} par {{paidBy}}
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
