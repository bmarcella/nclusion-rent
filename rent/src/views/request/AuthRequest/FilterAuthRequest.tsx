/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker, Input, Select } from '@/components/ui';
import React, { useEffect, useMemo, useState } from 'react';

type Option = { label: string; value: string | number };
type SortKey = 'created-desc' | 'created-asc' | 'status-asc';

export type AuthRequestFilterPatch = {
  isUser?: string | undefined;
  roles?: string[];
  reqType?: number[];
  region?: number | undefined;
  sort?: SortKey;
};

interface Props {
  /** i18n function (optional) */
  t?: (key: string) => string;

  /** Options for multi-selects / selects */
  roleOptions?: string[];        // e.g. ["admin","manager","user"]
  reqTypeOptions?: number[];     // e.g. [1,2,3,4]
  regionOptions?: Array<{ value: number; label: string }>;
  
  /** Emit patches on any change */
  onChange: (patch: AuthRequestFilterPatch) => void;

  /** Show/hide date range controls */
  enableDateRange?: boolean;

  /** Initial values (optional, useful when editing stored filters) */
  initial?: Partial<AuthRequestFilterPatch>;
}

/** Helpers */
const toOptions = (items: Array<string | number>): Option[] =>
  items.map((v) => ({ value: v, label: String(v) }));

export default function FilterAuthRequest({
  t = (s) => s,
  roleOptions = [],
  reqTypeOptions = [],
  regionOptions = [],
  onChange,
  initial = {},
}: Props) {
  // local controlled UI state
  const [isUser, setIsUser] = useState<string | undefined>(initial.isUser);
  const [roles, setRoles] = useState<string[]>(initial.roles ?? []);
  const [reqType, setReqType] = useState<number[]>(initial.reqType ?? []);
  const [region, setRegion] = useState<number | undefined>(initial.region);
  const [sort, setSort] = useState<SortKey>(initial.sort ?? 'created-desc');

  // memoized options
  const roleOpts = useMemo(() => toOptions(roleOptions), [roleOptions]);
  const reqTypeOpts = useMemo(() => toOptions(reqTypeOptions), [reqTypeOptions]);

  // emit changes (granular) — callers merge patches
  useEffect(() => { onChange({ isUser }); }, [isUser]);
  useEffect(() => { onChange({ roles }); }, [roles]);
  useEffect(() => { onChange({ reqType }); }, [reqType]);
  useEffect(() => { onChange({ region }); }, [region]);
  useEffect(() => { onChange({ sort }); }, [sort]);

  const reset = () => {
    setIsUser(undefined);
    setRoles([]);
    setReqType([]);
    setRegion(undefined);
    setSort('created-desc');
    onChange({
      isUser: undefined,
      roles: [],
      reqType: [],
      region: undefined,
      sort: 'created-desc',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-4 rounded">
      {/* Created by */}
      <div className="col-span-2">
        <label className="block text-sm mb-1">{t('filters.createdBy') || 'Created by'}</label>
        <Input
          placeholder={t('filters.userPlaceholder') || 'user id or email'}
          value={isUser ?? ''}
          onChange={(e) => setIsUser(e.target.value || undefined)}
        />
      </div>

      {/* Roles multi-select */}
      <div className="col-span-2">
        <label className="block text-sm mb-1">{t('filters.roles') || 'Roles'}</label>
        <Select<Option, true>
          isMulti
          placeholder={t('filters.rolesPlaceholder') || 'Select roles'}
          options={roleOpts as any}
          value={roles.map((r) => ({ value: r, label: String(r) })) as any}
          onChange={(vals: Option[]) => setRoles(vals?.map((v) => String(v.value)) ?? [])}
        />
        <div className="text-xs text-gray-500 mt-1">
          {t('filters.rolesNote') || 'Up to 10 values (Firestore array-contains-any limit).'}
        </div>
      </div>

      {/* ReqType multi-select */}
      <div className="col-span-2">
        <label className="block text-sm mb-1">{t('filters.reqTypes') || 'Req Types'}</label>
        <Select<Option, true>
          isMulti
          placeholder={t('filters.reqTypesPlaceholder') || 'Select types'}
          options={reqTypeOpts as any}
          value={reqType.map((n) => ({ value: n, label: String(n) })) as any}
          onChange={(vals: Option[]) => setReqType(vals?.map((v) => Number(v.value)) ?? [])}
        />
      </div>

      {/* Region */}
      <div className="col-span-2">
        <label className="block text-sm mb-1">{t('filters.region') || 'Region'}</label>
        <Select<Option, false>
          isClearable
          placeholder={t('filters.regionPlaceholder') || 'Select region'}
          options={regionOptions as any}
          value={
            typeof region === 'number'
              ? ({ value: region, label: String(region) } as any)
              : null
          }
          onChange={(opt: Option | null) =>
            setRegion(opt ? Number(opt.value) : undefined)
          }
        />
      </div>

      {/* Sort */}
      <div className="col-span-2">
        <label className="block text-sm mb-1">{t('filters.sort') || 'Sort'}</label>
        <Select<Option, false>
          options={[
            { value: 'created-desc', label: t('filters.createdDesc') || 'Created (newest first)' },
            { value: 'created-asc', label: t('filters.createdAsc') || 'Created (oldest first)' },
            { value: 'status-asc', label: t('filters.statusAsc') || 'Status (A → Z)' },
          ] as any}
          value={{ value: sort, label: String(
            sort === 'created-desc' ? (t('filters.createdDesc') || 'Created (newest first)')
              : sort === 'created-asc' ? (t('filters.createdAsc') || 'Created (oldest first)')
              : (t('filters.statusAsc') || 'Status (A → Z)')
          ) } as any}
          onChange={(opt: Option | null) => setSort((opt?.value as SortKey) ?? 'created-desc')}
        />
      </div>

      {/* Reset */}
      <div className="col-span-2 flex items-end">
        <button
          className="border px-3 py-2 rounded"
          onClick={reset}
          type="button"
        >
          {t('filters.reset') || 'Reset'}
        </button>
      </div>
    </div>
  );
}
