/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Dialog } from "@/components/ui"
import { useWindowSize } from "@/utils/hooks/useWindowSize";
import { useMemo, useState } from "react";

import { where, and, QueryConstraint, QueryCompositeFilterConstraint, DocumentData, CollectionReference, Query, query, getDocs, orderBy } from "firebase/firestore";
import { useSessionUser } from "@/store/authStore";
import { ExpenseRequestDoc } from "@/services/Landlord";
import { IRequest } from "../entities/IRequest";
import { exportRequestsCsv } from "./exportRequestsCsv";
import { useTranslation } from "@/utils/hooks/useTranslation";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import FilterRequestCsv, { RequestFilterCsv } from "../Filter/FilterRequestExportCsv";
import { Proprio } from "@/views/Entity";
import ShowCSVRequest from "./ShowCSVRequest";


type AnyConstraint = QueryConstraint | QueryCompositeFilterConstraint;


function ExportCsv() {
  const [dialogIsOpen, setIsOpen] = useState(false);
  const { width, height } = useWindowSize();
  const [filter, setFilter] = useState<RequestFilterCsv>();
  type SortKey = "created-desc" | "created-asc" | "status-asc";
  const [sortKey, setSortKey] = useState<SortKey>("created-desc");
  const { userId, authority } = useSessionUser((state) => state.user);
  const [regions, setRegions] = useState([]) as any;
  const [request, setRequest] = useState<IRequest[]>([]) as any;
  const { t } = useTranslation();
  const [message, setMessage] = useTimeOutMessage()
  const [alert, setAlert] = useState("success") as any;
  const [proprios, setProprio] = useState<any[]>([]);

  const proprioMap = useMemo(() => {
    const map = new Map<string, Proprio>();
       proprios.forEach((p: Proprio) => map.set(p.id_user ?? p.id, p));
    return map;
  }, [proprios]);



  // data
  const [loading, setLoading] = useState(false);

  const toggleDialog = (toggle: boolean) => {
    setIsOpen(toggle);
  }

  const onFilterChange = (data: RequestFilterCsv) => {
    setProprio(data.proprios);
    setFilter(data);
  }

  const constraints = useMemo<AnyConstraint[]>(() => {
    const role = authority![0];
    const reg = regions.map((r: any) => r.id);

    const filters: any[] = []; // only where/or/and stuff
    const orderings: any[] = []; // orderBy stuff

    const rg = (!filter?.regions || filter?.regions == null || filter?.regions == 0) ? reg : [filter.regions];
    // REGION
    if (role !== "admin" && rg.length > 0) {

      if (rg.length == 1) {
        filters.push(
          where(
            "general.id_region_user",
            "==",
            rg[0]
          )
        );
      }

      if (rg.length > 1) {
        filters.push(
          where(
            "general.id_region_user",
            "in",
            rg
          )
        );
      }
    }

    if (role === "admin" && filter?.regions) {
      filters.push(where("general.id_region_user", "in", [filter.regions]));
    }

    if (filter?.user) {
      filters.push(where("createdBy", "==", filter.user));
    }

    // requestType:
    if (filter?.reqType) {
      filters.push(where("requestType", "==", filter.reqType));
    }

    if (filter?.status) {
      filters.push(where("status", "==", filter.status));
    }

    if (filter?.currency) {
      filters.push(where("general.currency", "==", filter.currency));
    }

    // DATE
    if (filter?.date?.start) filters.push(where("createdAt", ">=", filter.date.start));
    if (filter?.date?.end) filters.push(where("createdAt", "<=", filter.date.end));

    // ORDER BY (not inside and/or)
    switch (sortKey) {
      case "created-desc":
        orderings.push(orderBy("createdAt", "desc"));
        break;
      case "created-asc":
        orderings.push(orderBy("createdAt", "asc"));
        break;
      case "status-asc":
        orderings.push(orderBy("status", "asc"), orderBy("createdAt", "desc"));
        break;
    }

    const topLevelFilter =
      filters.length === 0 ? [] : [and(...filters)];

    return [...topLevelFilter, ...orderings];
  }, [filter, sortKey, userId, regions, authority]);

  const getAllRequest = async () => {
    setLoading(true);
    try {
      setRequest([]); // clear previous data
      const base = ExpenseRequestDoc as CollectionReference<DocumentData>;
      const q: Query<DocumentData> = query(base, ...constraints as any);
      const snap = await getDocs(q);
      const items: IRequest[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setRequest(items);
      return items;
    } catch (e) {
      console.error("Error fetching page:", e);
      console.log(e);
      return [];
    }
  };

  const loadRequest = async () => {
    setLoading(true);
    await getAllRequest();
    setLoading(false);
  }

  const exportCSV = async () => {
    setLoading(true);
    if (request.length > 0) {
      await exportRequestsCsv({ requests: request, t, proprios: proprioMap });
    }
    setLoading(false);
  }

  const reset = async () => {
    setRequest([]);
  }

  return (
    <>
      {<Button variant="solid" disabled={loading} onClick={() => { toggleDialog(true) }}>
        Export csv
      </Button>}

      <Dialog
        isOpen={dialogIsOpen}
        width={width * 0.9}
        height={height * 0.9}
        onClose={() => { toggleDialog(false) }}
      >
        <div className="flex flex-col h-full px-4 py-6 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="flex flex-col gap-4">
            <h5 className="text-lg font-semibold mb-4">
              Export CSV
            </h5>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FilterRequestCsv onChange={onFilterChange} data={{ status: false, step: false, action: false, forMe: false, sentByMe: false, recieve: false, transition: false, rejected: false }} />
            <div className="mt-4"></div>
            <h5 className="text-sm font-semibold mb-4 ml-4">
              {request.length} {t("requests")} trouvées
            </h5>
            {filter?.proprios && filter?.proprios.length > 0 && request.length == 0 && <Button
              className="m-2"
              variant="solid"
              onClick={() => { loadRequest() }} >
              Load Request
            </Button>}

            {request.length > 0 && <Button
              variant="solid"
              className="ml-1 bg-red-400 hover:bg-red-300 border-0 hover:ring-0 m-2"
              onClick={() => { reset() }} >
              reset
            </Button>}

            {request.length > 0 && <Button
              className="ml-1 bg-green-400 hover:bg-green-300 border-0 hover:ring-0 m-2"
              variant="solid"
              onClick={() => { exportCSV() }} >
              Export Now
            </Button>}

            {request.length > 0 && <ShowCSVRequest requests={request} ></ShowCSVRequest>}
            
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default ExportCsv
