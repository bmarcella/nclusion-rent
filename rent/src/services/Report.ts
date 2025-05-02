/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListBankSteps, ReportSteps } from "@/views/demo/Entity";
import { BankDoc } from "./Landlord";
import { DocumentData, getDocs, orderBy, Query, query, QueryConstraint, Timestamp, where } from "firebase/firestore";
import { getRegionIds } from "@/views/demo/Entity/Regions";

export interface ReportItem {
  name: string; // creator ID or name
  steps: string[];
  values: number[];
}

 export const getQueryFilters = (q: Query<DocumentData, DocumentData>, { regions, agents, start, end, steps, proprio, authority }: any)  => {
         
            const filters: QueryConstraint[] = [];

            if (regions && regions != 0) {
                filters.push(where('id_region', '==', regions));
            } else {
                const ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
                filters.push(where("id_region", "in", ids))
            }

            if (agents) {
                filters.push(where('createdBy', '==', agents));
            }

            if (steps) {
                filters.push(where('step', '==', steps));
            }
           
            if (start && end) {
                const isSameDay =
                start.toDateString() === end.toDateString();

                if (isSameDay) {
                const startOfDay = new Date(start);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(end);
                endOfDay.setHours(23, 59, 59, 999);

                filters.push(where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
                filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
                } else {
                filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
                filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
                }
            } else {
                if (start) {
                filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
                }
                if (end) {
                filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
                }
            }
            return filters.length > 0 ? query(q, ...filters) : q;
    }

    export const getQueryFiltersDate = (q: Query<DocumentData, DocumentData>, {  start, end }: any)  => {
         
      const filters: QueryConstraint[] = [];
      if (start && end) {
          const isSameDay =
          start.toDateString() === end.toDateString();

          if (isSameDay) {
          const startOfDay = new Date(start);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(end);
          endOfDay.setHours(23, 59, 59, 999);

          filters.push(where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
          filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
          } else {
          filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
          filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
          }
      } else {
          if (start) {
          filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
          }
          if (end) {
          filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
          }
      }
      return filters.length > 0 ? query(q, ...filters) : q;
}

export const fetchReportPerCreator = async (ReportSteps: [], q: Query<DocumentData>): Promise<ReportItem[]> => {
  const creatorsSet = new Set<string>();
  const allBanksSnapshot = await getDocs(q);
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
          ReportSteps.map(async (step: any) => {
            const q = query(
              BankDoc,
              orderBy("createdAt", "desc"),
              where("step", "in", step.key),
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
