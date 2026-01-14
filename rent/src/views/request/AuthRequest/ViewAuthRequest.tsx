/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import Table from "@/components/ui/Table";
import {
  CollectionReference,
  DocumentData,
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { AuthRequestDoc } from "@/services/Landlord";
import type { AuthRequest } from "../entities/AuthRequest";
import { Button, Pagination, Tag } from "@/components/ui";
import UserName from "@/views/bank/show/components/UserName";
import { getRegionsById } from "@/views/Entity/Regions";

const { Tr, Th, Td, THead, TBody } = Table;

type Filter = {
  isUser?: string;      // creator user id/email
  roles: string[];      // array of roles to overlap
  reqType: number[];    // array of req types to overlap
  region?: number;      // region_id
};

const PAGE_SIZE_OPTIONS = [
  { value: 100, label: "100 / page" },
  { value: 200, label: "200 / page" },
  { value: 500, label: "500 / page" },
];

type SelectOpt = { value: number; label: string };

export const ViewAuthRequest: React.FC = () => {
  // server-side paging state
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [hasNext, setHasNext] = useState(true);
  const [pageSizeIdx, setPageSizeIdx] = useState(0);
  const pageSize = PAGE_SIZE_OPTIONS[pageSizeIdx].value;

  // data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AuthRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // filters & sort
  const [filter, setFilter] = useState<Filter>({
    isUser: undefined,
    roles: [],
    reqType: [],
    region: undefined,
  });

  type SortKey = "created-desc" | "created-asc" | "status-asc";
  const [sortKey, setSortKey] = useState<SortKey>("created-desc");

  // ---------- Columns ----------
  const columns = [
    { key: "status", label: "Status" },
    { key: "max_amount", label: "Max Amount" },
    { key: "roles", label: "Roles" },
    { key: "reqType", label: "Req Types" },
    { key: "region_id", label: "Region" },
    { key: "created_by", label: "Created By" },
    { key: "created_at", label: "Created At" },
    { key: "canApprove", label: "Can Approve" },
  ] as const;

  // ---------- Constraints ----------
  const constraints = useMemo<QueryConstraint[]>(() => {
    const cs: QueryConstraint[] = [];

    // Un-comment these when you're ready to use them (note: Firestore
    // only allows ONE array-contains-any / in / not-in field per query).

    if (filter.isUser && filter.isUser.trim() !== "") {
      cs.push(where("created_by", "==", filter.isUser.trim()));
    }

    if (filter.roles?.length) {
      cs.push(where("roles", "array-contains-any", filter.roles.slice(0, 10)));
    }

    if (typeof filter.region === "number") {
      cs.push(where("region_id", "==", filter.region));
    }

    // ⚠ If you also need reqType, you CANNOT keep array-contains-any
    // on both roles and reqType at the same time.
    if (filter.reqType?.length) {
      // cs.push(where("reqType", "array-contains-any", filter.reqType.slice(0, 10)));
    }

    // Sorting (make sure you have composite indexes for combinations)
    if (sortKey === "created-desc") cs.push(orderBy("created_at", "desc"));
    if (sortKey === "created-asc") cs.push(orderBy("created_at", "asc"));
    if (sortKey === "status-asc") cs.push(orderBy("status", "asc"));

    return cs;
  }, [filter, sortKey]);

  // reset pagination when constraints or pageSize change
  useEffect(() => {
    setPage(1);
    setPageCursors([]);
    setHasNext(true);
  }, [constraints, pageSize]);

  // total count for pagination UI
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = AuthRequestDoc as CollectionReference<DocumentData>;
        const cntSnap = await getCountFromServer(query(base, ...constraints));
        if (!cancelled) {
          setTotalCount(Number(cntSnap.data().count || 0));
        }
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
      const base = AuthRequestDoc as CollectionReference<DocumentData>;

      let q: Query<DocumentData>;
      if (pageNumber === 1) {
        q = query(base, ...constraints, limit(pageSize));
      } else {
        const prevCursor = pageCursors[pageNumber - 2];
        if (!prevCursor) {
          // no cursor stored for this page yet
          setLoading(false);
          return;
        }
        q = query(base, ...constraints, startAfter(prevCursor), limit(pageSize));
      }

      const snap = await getDocs(q);
      const items: AuthRequest[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      if (snap.docs.length > 0) {
        setPageCursors((prev) => {
          const next = [...prev];
          next[pageNumber - 1] = snap.docs[snap.docs.length - 1];
          return next;
        });
      }

      setRows(items);
      setPage(pageNumber);
      setHasNext(snap.docs.length === pageSize);
    } catch (e) {
      console.error("Error fetching page:", e);
    } finally {
      setLoading(false);
    }
  };

  // initial & re-run on filter/size/sort changes
  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constraints, pageSize]);

  // paging handlers
  const goPrev = () => page > 1 && !loading && fetchPage(page - 1);
  const goNext = () => hasNext && !loading && fetchPage(page + 1);

  // ---------- Simple controls ----------
  const setRolesCsv = (csv: string) =>
    setFilter((f) => ({
      ...f,
      roles: csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));

  const setReqTypesCsv = (csv: string) =>
    setFilter((f) => ({
      ...f,
      reqType: csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n)),
    }));

  const fmt = (v: any) => {
    if (!v) return "-";
    if (typeof v?.toDate === "function") return v.toDate().toLocaleString();
    if (v instanceof Date) return v.toLocaleString();
    return String(v);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      {/* <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm mb-1">Created by</label>
          <input
            className="border px-2 py-1 rounded w-64"
            placeholder="user id or email"
            value={filter.isUser ?? ""}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                isUser: e.target.value || undefined,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Roles (CSV)</label>
          <input
            className="border px-2 py-1 rounded w-64"
            placeholder="admin,user,manager"
            value={filter.roles.join(",")}
            onChange={(e) => setRolesCsv(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">
            Max 10 values (Firestore limit).
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">ReqTypes (CSV)</label>
          <input
            className="border px-2 py-1 rounded w-40"
            placeholder="1,2,3"
            value={filter.reqType.join(",")}
            onChange={(e) => setReqTypesCsv(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Region ID</label>
          <input
            type="number"
            className="border px-2 py-1 rounded w-28"
            placeholder="e.g. 5"
            value={filter.region ?? ""}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                region:
                  e.target.value === "" ? undefined : Number(e.target.value),
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Sort</label>
          <select
            className="border px-2 py-1 rounded"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="created-desc">Created (newest)</option>
            <option value="created-asc">Created (oldest)</option>
            <option value="status-asc">Status (A → Z)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Page size</label>
          <Select<SelectOpt>
            size="sm"
            isSearchable={false}
            value={PAGE_SIZE_OPTIONS.find((o) => o.value === pageSize) as any}
            options={PAGE_SIZE_OPTIONS as any}
            onChange={(opt) =>
              setPageSizeIdx(
                Math.max(
                  0,
                  PAGE_SIZE_OPTIONS.findIndex(
                    (o) => o.value === (opt?.value ?? PAGE_SIZE_OPTIONS[0].value),
                  ),
                )
              )
            }
          />
        </div>
      </div> */}

      <div className="w-full mt-6 bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
        {/* Table */}
        <Table>
          <THead>
            <Tr>
              {columns.map((c) => (
                <Th key={c.key as string}>{c.label}</Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            {loading && (
              <Tr>
                <Td colSpan={columns.length}>Loading…</Td>
              </Tr>
            )}
            {!loading &&
              rows.map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <span className="inline-flex items-center gap-2">
                      <Tag className="bg-emerald-100 text-emerald-700 border-0">
                        {r.status}
                      </Tag>
                    </span>
                  </Td>
                  <Td>{r.max_amount}</Td>
                  <Td>{Array.isArray(r.roles) ? r.roles.join(", ") : "-"}</Td>
                  <Td>{Array.isArray(r.reqType) ? r.reqType.join(", ") : "-"}</Td>
                  <Td>{r.region_id ? getRegionsById(r.region_id).capital : "-"}</Td>
                  <Td><UserName userId={r.created_by ?? "-"}></UserName></Td>
                  <Td>{fmt(r.created_at)}</Td>
                  <Td>{String()}
                    {(r.canApprove) &&
                      <Tag className="bg-emerald-100 text-emerald-700 border-0">
                        Oui
                      </Tag>
                    }
                    {(!r.canApprove) &&
                      <Tag className="bg-red-100 text-red-700 border-0">
                        Non
                      </Tag>}
                  </Td>
                </Tr>
              ))}
            {!loading && rows.length === 0 && (
              <Tr>
                <Td colSpan={columns.length}>No results</Td>
              </Tr>
            )}
          </TBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <Pagination
            pageSize={pageSize}
            currentPage={page}
            total={totalCount}
            onChange={(next) => {
              if (next === page + 1) return hasNext && fetchPage(next);
              if (next === page - 1) return page > 1 && fetchPage(next);
              fetchPage(next);
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              className="border px-3 py-1 rounded disabled:opacity-50"
              disabled={page === 1 || loading}
              onClick={goPrev}
            >
              Prev
            </Button>
            <Button
              className="border px-3 py-1 rounded disabled:opacity-50"
              disabled={!hasNext || loading}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
