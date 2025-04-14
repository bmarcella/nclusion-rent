/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */


import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {  getBankImages, getLordImages } from "@/services/firebase/BankService";
import { useEffect, useState, useRef } from "react";
import { PiCheckFatFill, PiThumbsDownFill } from "react-icons/pi";
import GoogleMapApp from "./Map";
import CommentsBank from "../add/components/CommentsBank";
import ImageGallery, { BankImage } from "./components/ImageGallery";
import ImageLordComp, { LordImage } from "./components/ImageLord";
import BankInfo from "./components/BankInfo";
import Rejected from "./reject/Rejected";
import { Bank, ListBankStepsDetails } from "@/views/Entity";
import generatePDF from 'react-to-pdf';
import { PdfOps } from "./pdfOps";
import { useReactToPrint } from "react-to-print";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import { useSessionUser } from "@/store/authStore";
import LeaseContractForm from "./components/LeaseContractForm";
import { Steps } from "@/components/ui/Steps";
import { useTranslation } from "@/utils/hooks/useTranslation";
import { BiPrinter } from "react-icons/bi";
import AllTask from "./components/AllTask";

interface Props {
    bankId: string;
    onRejectOk?: (data: any) => void
    onApproveOk: (data: any) => void ,
    onContratOk: () => void ,
    onPermitOk: () => void 
    onRenovOk: () => void,
    onChangeState: (component: React.ReactNode, name?: string) => void;
    onPendingOk: (data: any) => void
    genTasks?: () => void
    bank?: Bank;
    userId: string
}

const SubmissionReview = ( { bankId, genTasks, onChangeState, onRenovOk, onRejectOk, onPendingOk, onApproveOk, onPermitOk, onContratOk, bank, userId } : Props) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });
    const [images, setImages] = useState<BankImage[]>([])
    const [lImages, setLImages] = useState<LordImage[]>([])
    const [pdf, setPdf] = useState(false);
    const [contrat, setContrat] = useState(false);
    const [h, setH] = useState(null);
    const [h2, setH2] = useState(null);
    const [h3, setH3] = useState(null);
    const [pConfig, setPConfig] = useState(false);
    const { authority } = useSessionUser((state) => state.user);
    const { t } = useTranslation();
    useEffect(() => {
             getBankImages(bankId).then((imgs: BankImage[]) => {
                 console.log("Bank Images: ", imgs);
                 setImages(imgs);
             });
    }, [bankId]);

    useEffect(() => {
    
        if (bank)  getLordImages(bank.landlord).then((imgs: any[]) => {
            console.log("Bank Images: ", imgs);
            setLImages(imgs);
        });
      }, [bank]);

      useEffect(() => {
         
     }, [bankId]);
     const pdfExport = async () => {
       setPdf(true);
       setTimeout(async () => {
        await   generatePDF(contentRef,  PdfOps(bank?.bankName+'.pdf'));
        setPdf(false);
       }, 2000);
     }

     const print = async () => {
      setPdf(true);
      setTimeout(async () => {
       await  reactToPrintFn();
       setPdf(false);
      }, 2000);
    }

    const  canApprove = () => {
      try {
        const role = authority?.[0] || null;
        if (bank?.approve && bank?.step === "bankSteps.needApprobation" && (role =="admin" || role =="manager" || role =="asssit_manager") ) {
            return true;
        }
        return false;
      } catch (error) {
        console.error("Error checking approval:", error);
        return false;
     }
    }

 
  return (
    <>
    <div className="flex gap-2 pt-6  space-y-6 rounded bg-white pl-1 mb-4 pr-1"  >
    <div className="w-full"  >
    {/* <Button loading={pdf} variant="solid" onClick={() => {
        pdfExport()
     }}>Download PDF</Button> */}
      <Button loading={pdf} variant="solid"  className=" ml-4" icon={<BiPrinter/>} onClick={() => {
        print()
     }}> </Button>
     </div>
        <div>
            <Checkbox defaultChecked={false} onChange={(e)=>{
              setPConfig(e);
            }}>
               Outils
            </Checkbox>
        </div>
        <div>
            { bank && bank.step!='bankSteps.needContract' && <Checkbox defaultChecked={false} onChange={(e)=>{
              setContrat(e);
            }}>
               Contrat
            </Checkbox>} 
        </div>
       { pConfig && 
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4  rounded bg-white p-2 mb-6">
        <Input  type="number" value={h3} placeholder="Margin Contrats" onChange={ (v: any)=> { 
           setH3(v.target.value);
        }} />
        <Input  type="number" value={h} placeholder="Margin Pictures" onChange={ (v: any)=> { 
        setH(v.target.value);
        }} />
         <Input  type="number" value={h2} placeholder="Margin Details" onChange={ (v: any)=> { 
          setH2(v.target.value);
        }} />
        </div>} 
     
    </div>

    { (ListBankStepsDetails.findIndex(step => step.key == bank?.step)!=-1) && 
    <div className="w-full overflow-x-auto  rounded-lg bg-white dark:bg-gray-800 mb-6 p-1 pt-6">  
        <Steps
            current={ListBankStepsDetails.findIndex(step => step.key == bank?.step)}
            className="w-full mb-6"
          >
            {ListBankStepsDetails.map((step, index) => (
              <Steps.Item key={index} title={t('bank.' + step.key)} />
            ))}
          </Steps>
        </div> } 
 
     <div className="p-6 space-y-6"  ref={contentRef}>

      {/* { bank && bank.step=='bankSteps.needRenovation' && <TaskManager bank={bank} /> } */}

      { bank && (contrat || bank.step=='bankSteps.needContract') && <LeaseContractForm bank={bank} ></LeaseContractForm> }

      { bank && bank.id && (bank.step=='bankSteps.needRenovation') && <div>
        <h2 className="text-2xl font-bold mb-2 text-pink-600">Rénovation</h2>
        <AllTask bankId={bank.id} genTasks={genTasks}></AllTask>
        </div> }

      {  (pdf || pConfig) && <div className={ (pConfig && !pdf ) ? "w-full border" : "w-full" } style={{ height: h3+'px' }}></div> }
     <h2 className="text-2xl font-bold mb-2 text-pink-600">Bank Location</h2>
      {/* Map section */}
      <div className="w-full h-100 mb-6 rounded-lg shadow-lg overflow-hidden">
        { bank && <GoogleMapApp position={bank.location} ></GoogleMapApp> }
      </div>

      {/* Photos */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-pink-600">Photo</h2>
        <div className="grid grid-flow-row-dense grid-cols-3 grid-rows-2 gap-4">
            <div className="col-span-2 row-span-2 shadow-lg p-4 rounded-lg">
               <ImageGallery images={images} userId={userId || ''} canDelete={false} showPic={true} ></ImageGallery>
            </div>
      
            <div className="shadow-lg p-4 rounded-lg">
              <ImageLordComp images={lImages} userId={userId || ''} canDelete={false} showPic={true} ></ImageLordComp>
            </div>
        </div>
      </div>

      
       {  (pdf || pConfig) && <div className={ (pConfig && !pdf ) ? "w-full border" : "w-full" } style={{ height: h+'px' }}></div> }
      

      {/* Details */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-pink-600">Details</h2>
        <Card  className="p-2 rounded-lg">
         { bank && <BankInfo bank={bank} /> }
        </Card>
      </div>

      { (pdf || pConfig) && <div  className={ (pConfig && !pdf) ? "w-full border" : "w-full" }  style={{ height: h2+'px' }}></div> }

      {/* Comments */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-pink-600">Commentaires</h2>
        <Card>
        { bank && bank.id && <CommentsBank  bankId={bank.id} userId={userId || ''} isEdit={true} nextStep={function (step: number, data: any): void {
                      throw new Error("Function not implemented.");
                  } }  only={pdf} /> }
        </Card>
      </div> 

      {/* Action buttons */}
      { !pdf &&  
      <div className="flex justify-around items-center pt-6">
         { (bank &&  bank.step=='bankSteps.needRenovation')  && bank?.approve && <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-1"
         onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={ () => { onRenovOk() }} />, "Approbation")}
        >
          <PiCheckFatFill /> Rénovation terminée
        </Button> }

        { (bank &&  bank.step=='bankSteps.needContract')  && bank?.approve && <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-1"
         onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={ () => { onContratOk() }} />, "Approbation")}
        >
          <PiCheckFatFill /> Contrat Signé
        </Button> }
        {  !bank?.approve  && <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-1"
         onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={ (data) => { onApproveOk(data) }} />, "Approbation")}
        >
          <PiCheckFatFill /> Validé
        </Button> }
        {  canApprove() && <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-1"
         onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={ () => { onPermitOk() }} />, "Approbation")}
        >
          <PiCheckFatFill /> Approuvé
        </Button> }
       {  !bank?.reject  &&<Button className="bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center gap-1" 
          onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={onRejectOk} />)}
          >
          <PiThumbsDownFill/> Rejeté
        </Button> }
        {  !bank?.pending &&  <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full" 
          onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={ (data) => { onPendingOk(data) }} />, "Consideration")}
          >
          Attente
        </Button> }
      </div> }
    </div>
    </>
  
  );
};

export default SubmissionReview;
