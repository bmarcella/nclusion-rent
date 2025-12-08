/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSessionUser } from '@/store/authStore';
import ShowReq from './ShowReq'
import { useTranslation } from 'react-i18next';
import { manageAuth } from '@/constants/roles.constant';
import { AuthRequestDoc } from '@/services/Landlord';
import {  where, getDocs, query } from 'firebase/firestore';
import {  } from 'http';
import { useEffect, useRef, useState } from 'react';
import { AuthRequest } from '../entities/AuthRequest';
import { Spinner } from '@/components/ui';
export default function RecieveReq() {
 const { proprio, authority } = useSessionUser((state) => state.user);
  const { t } = useTranslation();
 const [rules , setRules]=  useState<AuthRequest [] | undefined>([]) as any [];
 const [loadingRules , seLoadingRules]=  useState<boolean>(false);

 const [nquery , setQuery]=  useState<{ status : [], reqType: [] }>() as any [];
 const didRun = useRef(false);
   const fetchRule = async () => {
    if (!proprio?.type_person) return; // avoid undefined in query
    if (didRun.current) return;
     didRun.current = true;
    seLoadingRules(true);
    const role = authority![0];
    const { regions } = await manageAuth(authority![0], proprio, t);
    const reg = regions.map((r)=>r.id);
      const q = (role == 'admin') ? query(
        AuthRequestDoc,
        where("roles", "array-contains", role),
      ) : query(
        AuthRequestDoc,
        where("region_id", "in", reg),
        where("roles", "array-contains", role),
      )
    const snapshot = await getDocs(q);
    seLoadingRules(false);
    const objs = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data() as any;
        return { id: docSnap.id, ...data };
      });
    setRules(objs);
    const val = {
         status: [...new Set(objs.map(o => o.status))],
          reqType: [...new Set(objs.flatMap(o => o.reqType))], // o.reqType is an array
    };
    setQuery(
     val
    );
   console.log(val);
  };

  useEffect(()=>{
     const  run = async ()=>{
       await fetchRule();
     };
     run();
  }, [authority, proprio]);

  return (<>
          { nquery && rules && rules.length > 0 && (<ShowReq  recieve={nquery} />) }
          { loadingRules && rules.length == 0 && <>
          <div className="flex items-center justify-center">
               <Spinner />
                  </div>
          </> }

           { !loadingRules && rules.length==0 && <>
                <div className="flex items-center justify-center text-center">
                        <h3>{ "Vous n'avez pas encore reçu de requête pour' l'instant" } </h3>
                </div>
          </> }
        </>
  )
}
