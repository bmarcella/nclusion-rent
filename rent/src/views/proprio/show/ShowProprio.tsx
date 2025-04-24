/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
    CollectionReference,
    where,
    Query,
  } from 'firebase/firestore';
  import React, { useEffect, useMemo, useRef, useState } from 'react';
  import { Proprio } from '@/views/Entity';
  import { Landlord } from '@/services/Landlord';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import Table from '@/components/ui/Table';
import { Button, Dialog, Pagination, Select, Tag } from '@/components/ui';
import {  PiEyeLight } from 'react-icons/pi';
import EditEntity from './components/EditEntity';
import { useSessionUser } from '@/store/authStore';
import { useWindowSize } from '@/utils/hooks/useWindowSize';
import UserName from '@/views/bank/show/components/UserName';
import { formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale';
import useTranslation from '@/utils/hooks/useTranslation';
import { getRegionsByValues } from '@/views/Entity/Regions';
import { hasAuthority } from '@/utils/RoleChecker';
import YesOrNoPopup from '@/views/shared/YesOrNoPopup';
import { deleteLord } from '@/services/firebase/BankService';
import FilterProprio from './components/FilterProprio';

const { Tr, Th, Td, THead, TBody } = Table
  const PAGE_SIZE = 0;
  const pageSizeOption = [
    { value: 50, label: '50 / page' },
    { value: 100, label:'100 / page' },
    { value: 200, label: '200 / page' },
    { value: 500, label: '500 / page' },
]

type Option = {
    value: number
    label: string
}

interface Props {
  name?: string,
  isUser?: string,
}

  
  function ShowProprio( { name = "Entités", isUser = undefined}: Props) {
    const [data, setData] = useState<Proprio [] >([]);
    const [totalData, setTotalData] = useState(1);
    const [page, setPage] = useState(1);
    const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasNext, setHasNext] = useState(true);
    const fetchedRef = useRef(false);
    const [cEnt, setEnt] = useState<Proprio>();
    const [dialogIsOpen, setIsOpen] = useState(false);
    const { userId, authority, proprio } = useSessionUser((state) => state.user);
    const { t } = useTranslation();
    const { width, height } = useWindowSize();
    const [ regions, setRegions] = useState<number []>([]);
    const [roles, setRoles] = useState<string>();

     const openDialog = (e: string) => {
            setEnt(e);
            setIsOpen(true)
        }
        const yes  = async  (idToDel: string) => {
            await deleteLord(idToDel || '');
            setData(prev => prev.filter(item => item.id !== idToDel));
        }
    
        const onDialogClose = () => {
            setIsOpen(false)
        }

      
   

        const columns = useMemo<ColumnDef<Proprio>[]>(() => {
          const baseColumns: ColumnDef<Proprio>[] = [
              {
                  header: 'FullName',
                  accessorKey: 'fullName',
              },
              {
                  header: 'Role',
                  cell: ({ row }) => (
                      <>
                          <div className="font-medium text-gray-500">
                              {t(`roles.${row.original.type_person}`)}
                          </div>
                          <div className="mr-2 rtl:ml-2 mt-2">
                              {!row.original.active && (
                                  <Tag className="text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20 border-0">
                                      {t('notActive')}
                                  </Tag>
                              )}
                              {row.original.active && (
                                  <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                                      {t('active')}
                                  </Tag>
                              )}
                          </div>
                      </>
                  ),
              },
              {
                  header: 'Email',
                  accessorKey: 'email',
              },
              {
                  header: 'Coordonées',
                  cell: ({ row }) => (
                      <div className="min-w-[160px]">
                          <div className="font-medium">{row.original?.phone || ''}</div>
                          <div className="text-sm text-gray-500">{row.original?.address || ''}</div>
                      </div>
                  ),
              },
              {
                  header: 'Creation',
                  cell: ({ row }) => (
                      <div className="min-w-[160px]">
                          <div className="font-medium">
                              Crée par :{' '}
                              {row.original?.createBy ? (
                                  <UserName userId={row.original?.createBy || ''} />
                              ) : (
                                  ''
                              )}
                          </div>
                          <div className="text-sm text-gray-500">
                              Crée le :{' '}
                              {row.original?.createdAt
                                  ? formatRelative(
                                        row.original?.createdAt?.toDate?.() || row.original.createdAt,
                                        new Date(),
                                        { locale: fr }
                                    )
                                  : ''}
                          </div>
                      </div>
                  ),
              },
              {
                  header: 'Régions',
                  cell: ({ row }) => (
                      <div className="flex items-center">
                          <div>
                              <div className="rtl:ml-2 mb-1">
                                  {row.original?.city && (
                                      <Tag className="text-white bg-indigo-600 border-0">
                                          {row.original?.city}
                                      </Tag>
                                  )}
                              </div>
                              { row.original?.regions && row.original?.regions?.length > 0 && (
                                  <>
                                      {getRegionsByValues(row.original.regions)
                                          .slice(0, 2)
                                          .map((region: any) => (
                                              <div key={region.id} className="text-sm text-gray-500">
                                                  {region.name}
                                              </div>
                                          ))}
                                      {getRegionsByValues(row.original.regions).length > 2 && (
                                          <span className="inline-block bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">
                                              +{getRegionsByValues(row.original.regions).length - 2}
                                          </span>
                                      )}
                                  </>
                              )}
                          </div>
                      </div>
                  ),
              },
            
          ];
      
          // ✅ Conditionally push a new column
          if (hasAuthority(authority, 'admin') || isUser) {
              baseColumns.push({
                header: 'Action',
                cell: ({ row }) => (
                    <div className="flex items-center justify-end">
                        { (row.original.type_person!="admin" || hasAuthority(authority, 'admin')) && <div>
                            <Button variant="solid" shape='circle' size="xs" onClick={() => openDialog(row?.original)}>
                                <PiEyeLight />
                            </Button>
                           { !row.original.email && <YesOrNoPopup Ok={yes} id={row.original.id} ></YesOrNoPopup>}
                           
                        </div> }
                    </div>
                ),
            },);
          }
      
          return baseColumns;
      }, [/* dependencies if any */]);
      

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchPage(1); // load first page
    }, [roles, regions]);

   
const fetchPage = async (pageNumber: number) => {
    setLoading(true);
    try {
      let q: Query<DocumentData>;
      let baseQuery: Query<DocumentData> = Landlord as CollectionReference<DocumentData>;
  
      // Build conditional filters
      if (isUser !== undefined) {
        baseQuery = query(baseQuery, where('createBy', '==', isUser));
        console.log('isUser:', isUser);
      }
  
      if (roles && regions.length === 0 ) {
        baseQuery = query(baseQuery, where('type_person', '==', roles));
        console.log('roles:', roles);
      } else if (regions.length > 0 && !roles)  {
           baseQuery = query(baseQuery, where('regions', 'array-contains-any', regions));
           console.log('regions:', regions);
      } else if (roles && regions.length > 0 )  {
        baseQuery = query(baseQuery, where('type_person', '==', roles), where('regions', 'array-contains-any', regions));
      }
  
      const pageSize = pageSizeOption[PAGE_SIZE].value;
  
      // First page
      if (pageNumber === 1) {
        q = query(baseQuery, orderBy('fullName'), limit(pageSize));
      } else {
        const prevCursor = pageCursors[pageNumber - 2]; // e.g. page 2 → index 0
        if (!prevCursor) {
          console.warn(`Missing cursor for page ${pageNumber - 1}`);
          setLoading(false);
          return;
        }
  
        q = query(baseQuery, orderBy('fullName'), startAfter(prevCursor), limit(pageSize));
      }
  
      const snapshot = await getDocs(q);
  
      const landlords: Proprio[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Proprio[];
  
      setTotalData(snapshot.size);
  
      // Store cursor if not already stored
      if (snapshot.docs.length > 0 && !pageCursors[pageNumber - 1]) {
        setPageCursors((prev) => {
          const updated = [...prev];
          updated[pageNumber - 1] = snapshot.docs[snapshot.docs.length - 1];
          return updated;
        });
      }
  
      setData(landlords);
      setPage(pageNumber);
      setHasNext(snapshot.docs.length === pageSize);
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  
    setLoading(false);
  };
    
  
  
    useEffect(() => {
      if (fetchedRef.current) return;
      fetchPage(1); // load first page
    }, []);

    const handlePrev = () => {
        if (page > 1) {
          fetchPage(page - 1);
        }
      };
    
      const handleNext = () => {
        if (hasNext) {
          fetchPage(page + 1);
        }
      };

      const onChange  = (payload: any) => {
        console.log("onChange: ", payload);
        if (cEnt?.id){
          setEnt(prev => {
            const p = { ...prev, ...payload };
            setData(prev =>
              prev.map(item =>
                item.id === cEnt.id ? p : item
              )
            );
            return p;
          });
        }
          
      
       }
      
      const table = useReactTable({
        data,
        columns,
        // Pipeline
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const onPaginationChange = (page: number) => {
        table.setPageIndex(page - 1)
    }

    const onSelectChange = (value = 0) => {
        table.setPageSize(Number(value))
    }

    const onChangeRegion = async (ids: any[]) => {
        console.log("onChangeRegion: ", ids);
        setRegions(ids);
    }

    const  onChangeRole = async (role: string) =>{
        console.log("onChangeRegion: ", role);
       setRoles(role);
   }
  
    return (

      <div>
         <h4>{name} - {data.length}</h4>
         <FilterProprio authority={authority || []} proprio={proprio} t={t} onChangeRegion={onChangeRegion} onChangeRole={onChangeRole} ></FilterProprio>
      
      
        <div className="w-full  mt-6 bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
       
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
        <div className="flex items-center justify-between mt-4">
                <Pagination
                    pageSize={table.getState().pagination.pageSize}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    total={totalData}
                    onChange={onPaginationChange}
                />
                <div style={{ minWidth: 130 }}>
                    <Select<Option>
                        size="sm"
                        isSearchable={false}
                        value={pageSizeOption.filter(
                            (option) =>
                                option.value ===
                                table.getState().pagination.pageSize,
                        )}
                        options={pageSizeOption}
                        onChange={(option) => onSelectChange(option?.value)}
                    />
                </div>
          </div>
        </div>

      

        <Dialog
                isOpen={dialogIsOpen}
                width={width*0.9}
                height={height*0.9}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <div className="flex flex-col h-full overflow-y-auto">
                    <h5 className="mb-4">{ cEnt?.fullName } - { t(`roles.${cEnt?.type_person}`)  }</h5>
                    { cEnt && <EditEntity userId={userId || ''} lord={cEnt} onChange={onChange} isUser={isUser} ></EditEntity>}
                    <div className="text-right mt-6">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            variant="plain"
                            onClick={onDialogClose}
                        >
                            Fermer
                        </Button>
                    
                    </div>
                </div>
        </Dialog>
       
       
      </div>
    );
  }
  
  
  export default ShowProprio;
  