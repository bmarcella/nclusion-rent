/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import { ColumnDef } from "@/components/shared/DataTable";
import { ExpenseRequestDoc } from "@/services/Landlord";
import classNames from "classnames";
import { QueryDocumentSnapshot, DocumentData, QueryConstraint, orderBy, where, CollectionReference, getCountFromServer, query, Query, limit, startAfter, getDocs, or, QueryCompositeFilterConstraint, and } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiHome } from "react-icons/hi";
import { getTypeRequestTagClasses, IRequest } from "../entities/IRequest";
import UserName from "@/views/bank/show/components/UserName";
import Currency from "@/views/shared/Currency";
import { formatRelative } from "date-fns/formatRelative";
import { fr } from "date-fns/locale/fr";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { Table, Pagination, Select, Button, Dialog, Badge, Tag, } from "@/components/ui";
import TBody from "@/components/ui/Table/TBody";
import Td from "@/components/ui/Table/Td";
import Th from "@/components/ui/Table/Th";
import THead from "@/components/ui/Table/THead";
import Tr from "@/components/ui/Table/Tr"; // or wherever your Select is
import { useTranslation } from "react-i18next";
import { hasAuthority } from "@/utils/RoleChecker";
import { useSessionUser } from "@/store/authStore";
import { PiEyeLight, PiPaperPlane } from "react-icons/pi";
import { useWindowSize } from "@/utils/hooks/useWindowSize";
import TabView from "../View/TabView";
import { getRegionsById } from "@/views/Entity/Regions";
import { manageAuth } from "@/constants/roles.constant";
import FilterRequest, { RequestFilter } from "../Filter/FilterRequest";
import { useNavigate } from "react-router-dom";
import { getCategorieName, getRequestCategorieById } from "../entities/AuthRequest";

/* eslint-disable @typescript-eslint/no-explicit-any */
const PAGE_SIZE_OPTIONS = [
  { value: 100, label: "100 / page" },
  { value: 200, label: "200 / page" },
  { value: 500, label: "500 / page" },
];

type AnyConstraint = QueryConstraint | QueryCompositeFilterConstraint;

function ShowReq({ status = undefined, step = false, action = false, forMe = false, sentByMe = false, recieve, transition = undefined, rejected = false }: any) {
  // server-side paging state
  const [currentPage, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [hasNext, setHasNext] = useState(true);
  const [pageSize, setPageSize] = useState<any>(PAGE_SIZE_OPTIONS[0].value);
  const { t } = useTranslation();
  const fetchedRef = useRef(false);
  type SortKey = "created-desc" | "created-asc" | "status-asc";
  const [sortKey, setSortKey] = useState<SortKey>("created-desc");
  // data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { userId, proprio, authority } = useSessionUser((state) => state.user);
  const [cObj, setCObj] = useState<IRequest>();
  const [dialogIsOpen, setIsOpen] = useState(false);
  const { width, height } = useWindowSize();
  const [regions, setRegions] = useState([]) as any;
  const [filter, setFilter] = useState<RequestFilter>();
  const navigate = useNavigate()

  const openDialog = (obj: IRequest) => {
    setCObj(obj as any);
    setIsOpen(true)
  }
  const onDialogClose = (close = false, data?: any) => {
    setIsOpen(close);
    if (data) updateRowById(data.id, data);
  }

  const onDialogCloseNow = () => {
    setIsOpen(false);
  }

  const updateRowById = (id: string, newValue: any) => {
    setRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, ...newValue } : row
      )
    );
  };

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

    // STATUS exact
    if (status && status.length > 0) {
      filters.push(where("status", "==", status));
    }

    // FOR ME
    if (forMe) {
      filters.push(
        or(
          where("preApproval_by", "==", userId!),
          where("regionalApproved_by", "==", userId),
          where("managerGlobalApproval", "==", userId),
          where("approvedBy", "==", userId),
          where("completedBy", "==", userId)
        )
      );
    }

    // REJECTED
    if (rejected) {
      filters.push(
        or(
          where("rejectedBy", "==", userId),
          where("cancelledBy", "==", userId)
        )
      );
    }

    // CREATED BY
    if (sentByMe) {
      filters.push(where("createdBy", "==", userId));
    } else if (filter?.user) {
      filters.push(where("createdBy", "==", filter.user));
    }

    // RECIEVE (status/type IN)
    // RECIEVE (status/type IN)
    if (recieve) {
      const statusValues = !filter?.status
        ? recieve.status
        : [filter.status];

      // status: if only one, use '==' (no change in behavior, fewer disjunctions)
      if (statusValues.length === 1) {
        filters.push(where("status", "==", statusValues[0]));
      } else if (statusValues.length > 1) {
        filters.push(where("status", "in", statusValues));
      }

      // requestType:
      // - if user explicitly selected one type -> filter by that
      // - if not (meaning "All") -> DO NOT add a requestType filter
      if (filter?.reqType) {
        filters.push(where("requestType", "==", filter.reqType));
      }
    } else {
      if (filter?.status) {
        filters.push(where("status", "==", filter.status));
      }
      if (filter?.reqType) {
        filters.push(where("requestType", "==", filter.reqType));
      }
    }

    // AMOUNT
    if (filter?.amount?.min != null) filters.push(where("amount", ">=", filter.amount.min));
    if (filter?.amount?.max != null) filters.push(where("amount", "<=", filter.amount.max));

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
  }, [status, forMe, sentByMe, recieve, filter, sortKey, userId, regions, authority, rejected]);

  // total count for pagination UI
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = ExpenseRequestDoc as CollectionReference<DocumentData>;
        const cnt = await getCountFromServer(query(base, ...constraints as any));
        const total = Number(cnt.data().count || 0);
        if (!cancelled) setTotalCount(total);
      } catch {
        // optional: swallow count errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [constraints]);

  // fetch a specific page using cursor
  const fetchPage = async (pageNumber: number) => {
    setLoading(true);
    try {
      const base = ExpenseRequestDoc as CollectionReference<DocumentData>;
      let q: Query<DocumentData>;
      if (pageNumber === 1) {
        q = query(base, ...constraints as any, limit(pageSize));
      } else {
        const prevCursor = pageCursors[pageNumber - 2];
        if (!prevCursor) {
          setLoading(false);
          return;
        }
        q = query(base, ...constraints as any, startAfter(prevCursor), limit(pageSize));
      }
      const snap = await getDocs(q);
      const items: IRequest[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

      if (snap.docs.length > 0) {
        setPageCursors((prev) => {
          const next = [...prev];
          next[pageNumber - 1] = snap.docs[snap.docs.length - 1];
          return next;
        });
      }
      console.log("Fetched items:", items);
      setRows(items);
      setPage(pageNumber);
      setHasNext(snap.docs.length == pageSize);
    } catch (e) {
      console.error("Error fetching page:", e);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onPaginationChange = (page: number) => {
    if (page != currentPage) {
      fetchPage(page); // fetch next page when needed
    }
    table.setPageIndex(page - 1);
  }



  const columns = useMemo<ColumnDef<IRequest>[]>(
    () => [

      {
        header: 'Requête',
        cell: ({ row }) => (
          <div className="max-w-[160px]" >
            <div className="font-medium" title={row.original.id}>
              <Tag className={classNames(
                getTypeRequestTagClasses(row.original.requestType), "mb-1 mr-1"
              )}>{t("request." + row.original.requestType)}</Tag>

            </div>
            <div className="font-medium" title={getCategorieName(t, row.original)}>
              <Tag className="mt-1" >  {String(getCategorieName(t, row.original)).substring(0, 30)} </Tag>
            </div>
          </div>
        ),
      },
      {
        header: 'Montant',
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <div className="font-medium"> <Currency amount={row.original.amount} tag={row.original.general?.currency}></Currency></div>
          </div>
        ),
      },
      {
        header: 'Region',
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <div className="font-medium"> {getRegionsById(row.original.general!.id_region_user!).label}</div>
          </div>
        ),
      },
      {
        header: 'Status',
        cell: ({ row }) => (
          <div className="min-w-auto">
            {t('request.status.' + row.original.status)}
            <br />
            {transition && (
              <>
                {row.original.historicApproval
                  ?.filter((a) => a.by_who === userId)
                  .map((a) => {
                    if (!a?.status_from) return null;
                    const k = `${a.by_who}-${a.status_from}-${a.status_to}`; // add more fields if needed for uniqueness
                    return (
                      <div key={k} className="mt-1">
                        <Badge content={`${a.status_from} <=> ${a.status_to}`} />
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        ),
      },
      {
        header: 'Meta',
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <div className="font-medium">Crée {formatRelative(row.original?.createdAt.toDate?.() || row.original.createdAt, new Date(), { locale: fr })}</div>
            <div className="font-medium"> par {row.original?.createdBy != userId ?
              (row.original?.createdBy) ? <UserName userId={row.original.createdBy} /> : "" : "Moi"}
            </div>
            <div className="font-medium"> pour  <b>{row.original?.general?.beneficiaryName}</b >
            </div>
          </div>
        ),
      },
      {
        header: 'Action',
        cell: ({ row }) => {

          return (<div className="min-w-[200px]">
            {(hasAuthority(authority, 'agent_immobilier', true)) &&
              <Button variant="solid" shape="circle" size="xs" className='mr-1 ' onClick={() => openDialog(row?.original)}>
                <PiEyeLight />
              </Button>}

            <Button className="ml-1 bg-green-300 hover:bg-green-400 border-0 hover:ring-0" variant="solid" shape="circle" size="xs" onClick={() => navigate("/request/" + row.original.id)}>
              <PiPaperPlane />
            </Button>

          </div>);


        }
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const onFilterChange = (data: RequestFilter) => {
    setFilter(data);
  }

  const onSelectChange = (value = 0) => {
    const num = Number(value);
    table.setPageSize(num);
    setPageSize(num);
  }

  useEffect(() => {
    setPage(1);
    setPageCursors([]);
    onSelectChange(pageSize);
    fetchPage(1);
  }, [constraints, regions]);

  useEffect(() => {
    if (fetchedRef.current) return;
    const run = async () => {
      const { regions } = await manageAuth(authority![0], proprio, t);
      setRegions(regions);
    }
    run();
  }, []);

  const approved = () => {
    fetchPage(currentPage);
  }

  return (
    <>
      <div className="grid grid-cols-6 gap-4 mt-6 mb-6">
        <div className={classNames('rounded-2xl p-4 flex flex-col justify-center', 'bg-green-100')} >
          <div className="flex justify-between items-center relative">
            <div>
              <div className="mb-4 text-gray-900 font-bold">{'Total Requête'}</div>
              <h1 className="mb-1 text-gray-900">{totalCount}</h1>
            </div>
            <div
              className={
                'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 bg-gray-900 text-white rounded-full text-2xl md:hidden'
              }
            >
              <HiHome />
            </div>
          </div>
        </div>
      </div>
      <FilterRequest onChange={onFilterChange} data={{ status, step, action, forMe, sentByMe, recieve, transition, rejected }} />
      <div className="w-full  mt-6 bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
        {<>
          <Table>
            <THead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Th
                        key={header.id}
                        colSpan={header.colSpan}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </Th>
                    )
                  })}
                </Tr>
              ))}
            </THead>
            <TBody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <Tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <Td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </Td>
                      )
                    })}
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        </>
        }
        <div className="flex items-center justify-between mt-4">
          <Pagination
            pageSize={table.getState().pagination.pageSize}
            currentPage={table.getState().pagination.pageIndex + 1}
            total={totalCount}
            onChange={onPaginationChange}
          />
          <div style={{ minWidth: 130 }}>
            <Select
              size="sm"
              isSearchable={false}
              value={PAGE_SIZE_OPTIONS.filter(
                (option) =>
                  option.value == pageSize,
              ) as any}
              options={PAGE_SIZE_OPTIONS}
              onChange={(option) => onSelectChange(option?.value)}
            />
          </div>

        </div>
      </div>

      <Dialog
        isOpen={dialogIsOpen}
        width={width * 0.9}
        height={height * 0.9}
        onClose={onDialogCloseNow}
      >
        <div className="flex flex-col h-full px-4 py-6 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="flex flex-col gap-4">
            <h5 className="text-lg font-semibold mb-4">
              Details de la Requête :  {cObj?.requestType}
            </h5>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TabView data={cObj!} onDialogClose={onDialogClose} action={action} approved={approved} />
          </div>
          <div className="text-right mt-6">
            <Button
              className="ltr:mr-2 rtl:ml-2"
              variant="plain"
              onClick={onDialogCloseNow}
            >
              Fermer
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default ShowReq