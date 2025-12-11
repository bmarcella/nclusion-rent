
/* eslint-disable @typescript-eslint/no-explicit-any */
// ----------------------
// Enums & options

import { z } from "zod";
import { RequestTypeEnum } from "./AuthRequest";

// ----------------------
const OnBehalfApproveEnum = z.enum(["pending", "approve", "reject"]);

export const PaymentMethodEnum = z.enum(["bank_transfer", "cash", "check"]);
export const CurrencyEnum = z.enum(["HTG", "USD", "PESOS"]);
export const TypePaymentEnum = z.enum(["partial", "full"]);
export const DocumentTypeEnum = z.enum(["proformat", "invoice", "id_card", "contract"]);
export const typeReq = Object.values(RequestTypeEnum) as readonly string[];
export const RequestTypeEnum_2 = z.enum(typeReq as any);
export const LocomotifSpentEnum = z.enum(["Carburant", "Maintenance"]);
export const LocomotifTypeEnum = z.enum(["Voiture", "Moto"]);
export const ProviderTelecomEnum = z.enum(["Natcom", "Digicel", "Access Haiti", "Starlink"]);
export const RenovationTypeEnum = z.enum(["painting", "counter"]);

// ----------------------
// Schemas
// ----------------------
export const DocumentSchema = z.object({
  type: DocumentTypeEnum,
});

export const GeneralSchema = z.object({
  type_request: RequestTypeEnum_2,
  id_region_user: z.number(),
  approvalFlow: z.coerce.number().nullable().optional(),
  is_for_other: z.boolean().default(false).optional(),
  on_behalf_user_id: z.string().optional(),
  on_behalf_approve: OnBehalfApproveEnum.optional(),
  paymentMethod: PaymentMethodEnum,
  currency: CurrencyEnum,
  beneficiaryName: z.string().optional(),
  typePayment: TypePaymentEnum
});

export const BankInfoSchema = z.object({
  BankName: z.string().min(1, "Required"),
  AccountName: z.string().min(1, "Required"),
  AccountNumber: z.coerce.number().nonnegative(),
  SWIFT: z.string().min(3, "Too short").optional(),
});

export const LegalSchema = z.object({
  beneficiary: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  description: z.string().min(1),
  target_date: z.coerce.date(),
  support_docs: z.array(z.any()).default([]),
});

export const BillSchema = z.object({
  categorie: z.coerce.number().nonnegative(),
  type: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  description: z.string().min(1),
  target_date: z.coerce.date(),
  support_docs: z.array(z.any()).default([]),
});


export const DiversSchema = z.object({
  categorie: z.coerce.number().nonnegative(),
  type: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  description: z.string().min(1),
  target_date: z.coerce.date(),
  support_docs: z.array(z.any()).default([]),
});

export const CapexSchema = z.object({
  categorie: z.coerce.number().nonnegative(),
  type: z.string().optional(),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().gt(0, { message: "Price must be greater than 0" }),
  unit_price: z.coerce.number().gt(0, { message: "Unit Price must be greater than 0" }),
  provider: z.string().min(1),
  target_date: z.coerce.date(),
  decripstion: z.string().min(1), // spelling preserved from spec
});

export const LocomotifSchema = z.object({
  categorie: z.coerce.number().nonnegative(),
  type_locomotif: LocomotifTypeEnum,
  plaque: z.string().optional(),
  provider: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  description: z.string().min(1),
});



export const TelecomPlanSchema = z.object({
  beneficiary: z.string().min(1),
  provider: ProviderTelecomEnum,
  plan_type: z.string().min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  price: z.coerce.number().gt(0, { message: "Price must be greater than 0" }),
  id_card: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.end_date < val.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "End date cannot be before start date",
    });
  }
});

export const TelecomSchema = z.object({
  categorie: z.coerce.number().nonnegative(),
  plans: z.array(TelecomPlanSchema).min(1),
  description: z.string().optional(),
  total_price: z.coerce.number().nonnegative(),
});

export const OpexItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  unit_price: z.coerce.number().nonnegative(),
  total_price: z.coerce.number().nonnegative(),
});

export const OpexSchema = z.object({
  categorie: z.coerce.number().nonnegative(),
  other_categorie: z.string().optional().default(""),
  items: z.array(OpexItemSchema).min(1),
  amount: z.coerce.number().nonnegative(),
  description: z.string().optional(),
  masterbankId: z.string().optional(),
});



export const TransportItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const TransportAddressSchema = z.object({
  region: z.coerce.number().int().nonnegative(),
  city: z.string(),
  street: z.string().optional(),
});

export const TransportSchema = z.object({
  categorie: z.coerce.number().nonnegative(),
  transport_date: z.coerce.date(),
  From: TransportAddressSchema,
  To: TransportAddressSchema,
  purpose: z.string().optional(),
  donebyAnEmployee: z.coerce.boolean().default(false),
  amount: z.coerce.number().nonnegative(),
  items: z.array(TransportItemSchema).min(1, "Vous devez ajouter au moins un materiel"),
}).superRefine((val, ctx) => {
  if (val.transport_date < new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["transport_date"],
      message: "Transport date cannot be before start date",
    });
  }
});

export const BankRenovationSchema = z.object({
  categorie: z.coerce.number().nonnegative(),
  type: z.string().optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  vendor_id: z.string().min(1),
  vendor_name: z.string().min(1),
  total_amount: z.coerce.number().nonnegative(),
  contract_id: z.string().min(1),
  description: z.string().optional(),
});

export const LeasePaymentSchema = z.object({
  type: z.string().optional(),
  categorie: z.coerce.number().nonnegative(),
  id_bank: z.string().min(1),
  bankName: z.string().min(1),
  id_landlord: z.string().min(1),
  landlordName: z.string().min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  yearNumber: z.coerce.number().int().positive(),
  rentCost: z.coerce.number().nonnegative(),
  description: z.string().optional().default(""),
  renovationByTheLandlord: z.coerce.boolean(),
  whoApproveTheBank: z.string().min(1),
  create_by: z.string().min(1),
}).superRefine((val, ctx) => {
  if (val.end_date < val.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["transport_date"],
      message: "End date cannot be before start date",
    });
  }
});;



export const MoneyRequestSchema = z
  .object({
    general: GeneralSchema.optional(),
    BankInfo: BankInfoSchema.nullable().optional(),
    bill: BillSchema.nullable().optional(),
    divers: DiversSchema.nullable().optional(),
    capex: CapexSchema.nullable().optional(),
    locomotif: LocomotifSchema.nullable().optional(),
    telecom: TelecomSchema.nullable().optional(),
    opex: OpexSchema.nullable().optional(),
    transport_logistique: TransportSchema.nullable().optional(),
    bank_renovation: BankRenovationSchema.nullable().optional(),
    lease_payment: LeasePaymentSchema.nullable().optional(),
    legal: LegalSchema.nullable().optional(),
  })
  .superRefine((val, ctx) => {
    // Conditional requirements by type_request
    switch (val.general?.type_request) {
       case "divers":
        if (!val.divers) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["divers"], message: "Divers section is required" });
        break;
      case "legal":
        if (!val.legal) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["legal"], message: "Legal section is required" });
        break;
      case "bill":
        if (!val.bill) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bill"], message: "Bill section is required" });
        break;
      case "capex":
        if (!val.capex) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["capex"], message: "Capex section is required" });
        break;
      case "locomotif":
        if (!val.locomotif) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["locomotif"], message: "Locomotif section is required" });
        break;
      case "telecom":
        if (!val.telecom) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["telecom"], message: "Telecom section is required" });
        break;
      case "opex":
        if (!val.opex) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["opex"], message: "Opex section is required" });
        break;
      case "transport_logistique":
        if (!val.transport_logistique) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["transport_logistique"], message: "Transport section is required" });
        break;
      case "bank_renovation":
        if (!val.bank_renovation) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bank_renovation"], message: "Bank renovation section is required" });
        break;
      case "lease_payment":
        if (!val.lease_payment) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lease_payment"], message: "Lease payment section is required" });
        break;
    }

    // BankInfo required if payment method is bank transfer
    const isBankTransfer = val.general?.paymentMethod == "bank_transfer";

    // BankInfo required if payment method is bank transfer
    if (isBankTransfer && !val.BankInfo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["BankInfo"],
        message: "Bank information is required for bank transfers",
      });
    }

  })

  // 2) Enforce exclusivity: only the selected type_request may contain data
  .superRefine((val, ctx) => {
    const sections: Record<string, unknown> = {
      bill: val.bill,
      capex: val.capex,
      locomotif: val.locomotif,
      telecom: val.telecom,
      opex: val.opex,
      transport_logistique: val.transport_logistique,
      bank_renovation: val.bank_renovation,
      lease_payment: val.lease_payment,
    };

    const filled = Object.entries(sections).filter(
      ([, v]) => v !== undefined && v !== null,
    );

    if (filled.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["type_request"],
        message: `Only one request type is allowed, but received data for: ${filled
          .map(([k]) => k)
          .join(", ")}`,
      });
    }

    for (const [key, value] of Object.entries(sections)) {
      if (key !== val.general?.type_request && value !== undefined && value !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `Remove data for "${key}". A request can only be of type "${val.general?.type_request}".`,
        });
      }
    }
  });







export type MoneyRequest = z.infer<typeof MoneyRequestSchema>;