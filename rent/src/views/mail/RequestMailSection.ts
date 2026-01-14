import { getRegionsById } from './../Entity/Regions';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IRequest } from "../request/entities/IRequest";
import { getRequestCategorieById, getRequestType } from "../request/entities/AuthRequest";

export type TFunction = (key: string) => string;

export function buildRequestEmailDetailsSection(request: IRequest, t: TFunction): string {
  const general = (request as any)?.general ?? {};
  const type = (request as any)?.requestType;
  const typeRequest = (general.type_request as string | undefined) ?? "";

  const currency = general.currency ?? "";
  const metaId = (request as any).id ?? (request as any)._id ?? "";
  const metaStatus = (request as any).status ?? (request as any).state ?? "";

  const fmtMoney = (value: any) => {
    if (value == null || value === "") return "-";
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  const fmtDate = (value: any) => {
    if (!value) return "-";
    const d: Date = value?.toDate?.() || value;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).format(d);
  };

  const fmtDateTime = (value: any) => {
    if (!value) return "-";
    const d: Date = value?.toDate?.() || value;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const row = (label: string, value: any) => `
    <tr>
      <td style="padding:8px 0;color:#111827;font-weight:600;vertical-align:top;width:220px;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:8px 0;color:#111827;vertical-align:top;">
        ${escapeHtml(value ?? "-")}
      </td>
    </tr>
  `;

  const descriptionBlock = (text: any) => `
    <div style="margin-top:12px;">
      <div style="font-weight:600;color:#111827;margin-bottom:6px;">Description</div>
      <div style="white-space:pre-wrap;color:#111827;">${escapeHtml(text)}</div>
    </div>
  `;

  const card = (title: string, rowsHtml: string, extraHtml = "", opts?: { showMeta?: boolean }) => {
    const showMeta = opts?.showMeta ?? false;

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border:1px solid #e5e7eb;border-radius:12px;">
        <tr>
          <td style="padding:16px 16px 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;">
                  <h3 style="margin:0 0 8px 0;font-size:16px;color:#111827;">${escapeHtml(title)}</h3>
                </td>
                <td align="right" style="vertical-align:top;">
                  ${
                    showMeta && metaStatus
                      ? `<span style="display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;background:#f1f5f9;color:#111827;">
                          ${escapeHtml(String(metaStatus).toUpperCase())}
                        </span>`
                      : ""
                  }
                </td>
              </tr>
            </table>
            ${
              showMeta && metaId
                ? `<div style="font-size:12px;color:#6b7280;margin-bottom:6px;">
                    ID: <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
                      ${escapeHtml(metaId)}
                    </span>
                  </div>`
                : ""
            }
          </td>
        </tr>
        <tr>
          <td style="padding:0 16px 16px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rowsHtml}
            </table>
            ${extraHtml}
          </td>
        </tr>
      </table>
    `;
  };

  // -------------------------
  // GENERAL SECTION
  // -------------------------
  const generalTypeLabel = typeRequest ? t(`request.${typeRequest}`) : "-";
  const createdAt = (request as any).createdAt;

  const generalRows = [
    row("Type de requête", generalTypeLabel),
    row("Payment method", general.paymentMethod ?? "-"),
    row("Currency", currency || "-"),
    row("Beneficiary name", general.beneficiaryName ?? "-"),
    row("Region", getRegionsById(general.id_region_user).capital ?? "-"),
    row("Created at", fmtDateTime(createdAt)),
  ].join("");

  const onBehalf =
    general.is_for_other
      ? `<div style="margin-top:10px;color:#111827;">
          <span style="font-weight:600;">On behalf of:</span>
          <span> ${escapeHtml(general.on_behalf_user_id ?? "-")}</span>
        </div>`
      : "";

  const generalSection = card("Request Details", generalRows, onBehalf, { showMeta: true });

  // -------------------------
  // BANK INFO (optional)
  // -------------------------
  const bankInfo = (request as any).BankInfo;
  const bankInfoSection = bankInfo
    ? card(
        "Bank information",
        [
          row("Bank name", bankInfo.BankName ?? "-"),
          row("Account name", bankInfo.AccountName ?? "-"),
          row("Account number", bankInfo.AccountNumber ?? "-"),
          row("SWIFT", bankInfo.SWIFT ?? "-"),
        ].join("")
      )
    : "";

  // -------------------------
  // MAIN SECTION (by type_request)
  // -------------------------
  const mainSection = (() => {
    // BILL
    if (typeRequest === "bill" && (request as any).bill) {
      const b = (request as any).bill;
      const categorieLabel = getRequestCategorieById(t, type, b.categorie);
      const typeLabel = getRequestType(t, type, b.categorie, b.type);

      const rows = [
        row("Amount", `${fmtMoney(b.price)} ${currency}`),
        row("Target date", fmtDate(b.target_date)),
        row("Categorie", categorieLabel),
        row("Type", typeLabel),
      ].join("");

      return card("Bill", rows, b.description ? descriptionBlock(b.description) : "");
    }

    // DIVERS
    if (typeRequest === "divers" && (request as any).divers) {
      const d = (request as any).divers;
      const categorieLabel = getRequestCategorieById(t, type, d.categorie);
      const typeLabel = getRequestType(t, type, d.categorie, d.type);

      const rows = [
        row("Amount", `${fmtMoney(d.price)} ${currency}`),
        row("Target date", fmtDate(d.target_date)),
        row("Categorie", categorieLabel),
        row("Type", typeLabel),
      ].join("");

      return card("Divers", rows, d.description ? descriptionBlock(d.description) : "");
    }

    // CAPEX (avec Categorie/Type comme l’UI)
    if (typeRequest === "capex" && (request as any).capex) {
      const c = (request as any).capex;
      const categorieLabel = getRequestCategorieById(t, type, c.categorie);
      const typeLabel = getRequestType(t, type, c.categorie, c.type);

      const rows = [
        row("Categorie", categorieLabel),
        row("Type", typeLabel),
        row("Quantity", c.quantity ?? "-"),
        row("Unit price", `${fmtMoney(c.price)} ${currency}`),
        row("Target date", fmtDate(c.target_date)),
        row("Fournisseur", c.provider ?? "-"),
      ].join("");

      return card("Capex", rows, c.decripstion ? descriptionBlock(c.decripstion) : "");
    }

    // TELECOM
    if (typeRequest === "telecom" && (request as any).telecom) {
      const tel = (request as any).telecom;
      const categorieLabel = getRequestCategorieById(t, type, tel.categorie);
      const typeLabel = getRequestType(t, type, tel.categorie, tel.type);

      const rows = [
        row("Total price", `${fmtMoney(tel.total_price)} ${currency}`),
        row("Categorie", categorieLabel),
        row("Type", typeLabel),
      ].join("");

      const desc = tel.description ? descriptionBlock(tel.description) : "";

      const plans =
        Array.isArray(tel.plans) && tel.plans.length > 0
          ? `
            <div style="margin-top:14px;">
              <div style="font-weight:600;color:#111827;margin-bottom:8px;">Plans</div>
              ${tel.plans
                .map(
                  (p: any) => `
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:10px;">
                    <tr><td style="padding:12px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${row("Beneficiary", p.beneficiary ?? "-")}
                        ${row("Provider", p.provider ?? "-")}
                        ${row("Plan type", p.plan_type ?? "-")}
                        ${row("Start date", fmtDate(p.start_date))}
                        ${row("End date", fmtDate(p.end_date))}
                        ${row("Price", `${fmtMoney(p.price)} ${currency}`)}
                        ${row("Nif / NIN", p.id_card ?? "-")}
                      </table>
                    </td></tr>
                  </table>
                `
                )
                .join("")}
            </div>
          `
          : "";

      return card("Telecom", rows, desc + plans);
    }

    // OPEX
    if (typeRequest === "opex" && (request as any).opex) {
      const o = (request as any).opex;
      const categorieLabel = getRequestCategorieById(t, type, o.categorie);
      const typeLabel = getRequestType(t, type, o.categorie, o.type);

      const rows = [
        row("Categorie", categorieLabel),
        row("Other category", o.other_categorie ?? "-"),
        row("Type", typeLabel),
        row("Amount", `${fmtMoney(o.amount)} ${currency}`),
        row("ID Bank", o.masterbankId ?? "-"),
      ].join("");

      const desc = o.description ? descriptionBlock(o.description) : "";

      const items =
        Array.isArray(o.items) && o.items.length > 0
          ? `
            <div style="margin-top:14px;">
              <div style="font-weight:600;color:#111827;margin-bottom:8px;">Items</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;">
                <tr>
                  <td style="padding:12px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${o.items
                        .map(
                          (it: any) =>
                            row(
                              it.name ?? "Item",
                              `Qty: ${it.quantity ?? "-"} — Total: ${fmtMoney(it.total_price)} ${currency}`
                            )
                        )
                        .join("")}
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          `
          : "";

      return card("Opex", rows, desc + items);
    }

    // Fallback
    return card(
      "Détails de la requête",
      [row("Type", typeRequest || "-"), row("Beneficiary", general.beneficiaryName ?? "-")].join(""),
      `<div style="margin-top:10px;color:#6b7280;font-size:12px;">Aucune section spécifique disponible pour ce type.</div>`
    );
  })();

  return `${generalSection}${bankInfoSection}${mainSection}`;
}

function escapeHtml(value: any): string {
  const s = String(value ?? "");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
