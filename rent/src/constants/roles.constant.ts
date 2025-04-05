
export const ADMIN = 'admin'
export const AGENT_IMMOBILLIER= 'agent_immobilier'
export const COORDONATOR = 'coordonator'
export const ASSIST_COORDONATOR = 'assist_coordonator'
export const MANAGER = 'manager'
export const ASSIST_MANAGER = 'assist_manager'
export const PROPRIETOR = 'proprietor'
export const OPERATION = 'operation'
export const VENDOR_MANAGEMENT = 'vendor_management'
export const FIELDS_OPS = 'fields_ops'
export const VENDOR = 'vendeur'
export const PROPRIETARY = 'proprietaire'
export const REFERENCE = 'reference'

export const USER_ROLES = ["vendeur", "proprietaire", "reference", "agent_immobilier", "coordonator", "assist_coordonator", "manager", "assist_manager", "operation", "admin", "fields_ops"] as const;
export type  USER_ROLE = typeof USER_ROLES[number];