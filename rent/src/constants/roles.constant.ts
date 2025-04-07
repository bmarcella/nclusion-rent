/* eslint-disable @typescript-eslint/no-explicit-any */

import { convertStringToSelectOptions } from "@/views/bank/add/components/InfoBank"
import { getRegionsByValues, Regions } from "@/views/Entity/Regions"

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

 export const manageAuth = async (auth : string, proprio: any, t : any )=> {
    let regions : any[] = Regions;
    if (auth !== "admin") {
        regions  = getRegionsByValues(proprio?.regions || []);
    }
    const xroles = getRolesByAhth(auth);
    const roles = await convertStringToSelectOptions([...xroles], t, "roles");
    return { regions , roles }
  }

export const getRolesByAhth = (auth: string ) => {
     let roles: any [] = [ "proprietaire", "reference"]
        switch (auth) {
           case "admin":
               roles  = [...USER_ROLES];
            break;
          case "coordonator":
            roles = roles.concat(["agent_immobilier","assist_coordonator"])
            break;
      
          case "assist_coordonator":
            roles.push("agent_immobilier");
            break;
      
          case "manager":
            roles = roles.concat(["agent_immobilier","assist_manager", "assist_coordonator", "coordonator"]);
            break;
      
          case "assist_manager":
            roles = roles.concat(["agent_immobilier", "assist_coordonator", "coordonator"]);
            break;
      
          case "operation":
            roles = roles.concat(["agent_immobilier","vendeur"]);
            break;
      
          case "vendor_management":
            roles = roles.concat(["vendeur"]);
          break;
          default:
            // console.log("Rôle non reconnu :", auth);
          break;
        }
        return roles;
}