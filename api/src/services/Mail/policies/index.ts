import { applyPolicies } from "src/common/Damba/v2/policies";
import { DEvent } from "src/damba.import";

// policies barrel
;

// policies barrel
export const defaultPolicy = async (e: DEvent) => {
  await applyPolicies(e);
  if (e.out.headersSent) return; // a policy already responded
};
