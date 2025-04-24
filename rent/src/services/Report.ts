import { ListBankSteps } from "@/views/Entity";
import { BankDoc } from "./Landlord";
import { getDocs, orderBy, query, where } from "firebase/firestore";

export interface ReportItem {
  name: string; // creator ID or name
  steps: string[];
  values: number[];
}

export const fetchReportPerCreator = async (): Promise<ReportItem[]> => {
  const creatorsSet = new Set<string>();
  const allBanksSnapshot = await getDocs(BankDoc);
  // 1. Extract all unique creators
  allBanksSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.createdBy) {
      creatorsSet.add(data.createdBy);
    }
  });

  const creators = Array.from(creatorsSet);
  // 2. Generate report
  const report: ReportItem[] = (
    await Promise.all(
      creators.map(async (creator) => {
        const steps: string[] = [];
        const values: number[] = [];

        await Promise.all(
          ListBankSteps.map(async (step) => {
            const q = query(
              BankDoc,
              orderBy("createdAt", "desc"),
              where("step", "==", step.key),
              where("createdBy", "==", creator)
            );

            const snapshot = await getDocs(q);

            steps.push(step.label);
            values.push(snapshot.size);
          })
        );

        if (values.every((v) => v === 0)) return null;

        return {
          name: creator,
          steps,
          values,
        };
      })
    )
  ).filter((item): item is ReportItem => item !== null);

  return report;
};
