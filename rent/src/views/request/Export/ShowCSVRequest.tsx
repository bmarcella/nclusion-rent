
import { formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ColumnDef } from "@/components/shared/DataTable";
import { getTypeRequestTagClasses, IRequest } from "../entities/IRequest";
import classNames from 'classnames';
import UserName from '@/views/bank/show/components/UserName';
import { getRegionsById } from '@/views/Entity/Regions';
import Currency from '@/views/shared/Currency';
import { getCategorieName } from '../entities/AuthRequest';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { useMemo } from 'react';
import Tag from '@/components/ui/Tag';
import Table from '@/components/ui/Table/Table';
import THead from '@/components/ui/Table/THead';
import { Badge } from '@/components/ui';
import TBody from '@/components/ui/Table/TBody';
import Td from '@/components/ui/Table/Td';
import Th from '@/components/ui/Table/Th';
import Tr from '@/components/ui/Table/Tr';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { useSessionUser } from '@/store/authStore';
interface Props {
    requests : IRequest[];
}
function ShowCSVRequest( {requests} : Props) {

   const { t } = useTranslation();
   const { userId } = useSessionUser((state) => state.user);
  
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
      }
    ],
    [],
  );
    const table = useReactTable({
      data: requests,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });

  return (
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
                 <Tr key={'total'}>
                   <Td colSpan={columns.length} className="text-center font-bold">
                    + {requests.length-table.getRowModel().rows.length} {t("requests")}  More
                   </Td>
                 </Tr>
            </TBody>
          </Table>
        </>
        }
      </div>
  )
}

export default ShowCSVRequest