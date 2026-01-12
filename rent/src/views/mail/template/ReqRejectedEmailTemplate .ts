export const ReqRejectedEmailTemplate = `
<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" style="border:1px solid #fee2e2;border-radius:12px;padding:24px;">
            <tr>
              <td>
                <h2>Bonjour {{fullName}},</h2>

                <p>
                  Votre requête de type <strong>{{type_request}}</strong>,
                  d’un montant de <strong>{{amount}} {{currency}}</strong>,
                  a été <strong style="color:#dc2626;">rejetée</strong>.
                </p>

                <p>
                  <strong>Motif :</strong><br />
                  {{rejectionReason}}
                </p>

                <p style="margin:24px 0;">
                  <a href="{{reqUrl}}" style="background:#dc2626;color:#fff;padding:12px 16px;border-radius:10px;text-decoration:none;">
                    Consulter la requête
                  </a>
                </p>

                <hr />

                <p style="font-size:12px;color:#6b7280;">
                  Rejetée le {{rejectedAt}} par {{rejectedBy}}
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
