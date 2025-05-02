/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSessionUser } from "@/store/authStore";
import { useEffect, useState } from "react";
import { fetchReportPerReport, getBankCountsByRegion } from "./demo/Entity/Regions";
import SimplePie from "./Charts/SimplePie";
import classNames from "classnames";

const Home = () => {
  const { userId, authority } = useSessionUser((state) => state.user);
  const is_ai = authority && authority[0] == "agent_immobilier"; 
  const [ regions, setRegions] = useState<any[]>([]);
  const [ values, setValues] = useState<any[]>([]);
  const [ report, setReport] = useState<any[]>([]);
  useEffect(() => {
    const regs = async () => { 
        const { regions, values } = await getBankCountsByRegion();
        const report = await fetchReportPerReport();
        setRegions(regions);
        setValues(values);
        setReport(report);
    }
    regs();
  }, [userId]);
    return <>
   { !is_ai && <div className="flex flex-col w-full text-center px-4">
     
        <div className="mb-4">
            <SimplePie labels={regions} series={values}        ></SimplePie>
        </div>
        <div className={classNames("overflow-x-auto", { "hidden": is_ai })} >
        & <div className="grid grid-flow-col auto-cols-max gap-4" >
            {report.map((item, index) => (
                <div key={index} className="rounded bg-white m-1" >
                    <h6 className="text-center text-lg font-bold text-gray-400">
                         {item.name}
                    </h6>
                    <div className="col-span-4 flex justify-center">
                       <SimplePie labels={item.steps} series={item.values}  ptype={"donut"}/>
                    </div>
                </div>
            ))}
        </div> 
        </div>
        </div> }
          
    
        {userId && is_ai && (
         <div className="mt-8 flex flex-col gap-2 items-center justify-center w-full">
                   <h1 className="text-4xl font-bold">Bienvenue sur la plateforme de gestion immobilière</h1>
                   <p className="mt-4 text-lg">Utilisez le bouton en haut à droite pour ouvrir le menu.</p>
            <a href="/proprio/add" className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Ajouter entité
            </a>
            <a href="/proprio/myEntity" className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Accéder à mes entités
            </a>
            <a href="/bank/add" className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Ajouter banques
            </a>
            <a href="/bank/show" className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Accéder à mes banques
            </a>
            </div>
        )}
   

    </>
}

export default Home
