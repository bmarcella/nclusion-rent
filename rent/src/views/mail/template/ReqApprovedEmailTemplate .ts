export const ReqApprovedEmailTemplate = `
<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" style="border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
            <tr>
              <td>
                <h2>Bonjour {{fullName}},</h2>
                <p>
                  La requête de type <strong>{{type_request}}</strong>,
                  d’un montant de <strong>{{amount}} {{currency}}</strong>,
                  a été <strong style="color:#16a34a;">approuvée</strong>.
                  Vous pouvez désormais procéder au paiement de la requête. Nous vous remercions par avance.
                </p>

                {{request}}

                <p style="margin:24px 0;">
                  <a href="{{reqUrl}}" style="background:#16a34a;color:#fff;padding:12px 16px;border-radius:10px;text-decoration:none;">
                    Consulter la requête
                  </a>
                </p>

                <hr />

                <p style="font-size:12px;color:#6b7280;">
                  Approuvée le {{madeAt}} par {{madeBy}}
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
