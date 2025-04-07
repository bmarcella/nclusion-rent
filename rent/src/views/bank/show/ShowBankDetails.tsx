/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate, useParams } from "react-router-dom";
import SubmissionReview from "./SubmissionReview";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { addDecisionHistory, getBankById, updateBankById } from "@/services/firebase/BankService";
import {  Bank, BankStep, finalDecisionStatuses, HistoricDecision } from "@/views/Entity";
import { useSessionUser } from "@/store/authStore";

export const ShowBankDetailsBase= () => {
  const { bankId } = useParams();
  const [dialogIsOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useSessionUser((state) => state.user);
  const [nameDialog, setDialogName] = useState<any>(null);
   useEffect(() => {
          const fetchBank = async () => {
            setLoading(true);
            const result = await getBankById(bankId);
            setBank(result);
            setLoading(false);
          };
          if (bankId) fetchBank();
        }, [bankId]);

  const openDialog = (component: React.ReactNode, name : string = "Rejection" ) => {
      console.log("openDialog")
      setIsOpen(true)
      setDialogName(name);
      setModalContent(component);
  }

  const onRejectOk = async (data: any) => {
      const dec = {
        date: new Date(),
        createdBy: userId,
        createdAt: new Date(),
        status: finalDecisionStatuses[1],
        reason_why:  (data.text) ? data.text : 'Aucune raison fournie',
      } as HistoricDecision;
      const reject = {
         reject: true,
         approve: false,
         pending: false,
         step : "bankSteps.rejected",
         finalDecision: dec
      };
      SaveHistory(reject, dec);
  }


  const onPendingOk = async (data: any) => {
    const dec = {
      date: new Date(),
      createdBy: userId,
      createdAt: new Date(),
      status: finalDecisionStatuses[2],
      reason_why:  (data.text) ? data.text : 'Aucune raison fournie',
    } as HistoricDecision;
    const reject = {
       reject: false,
       approve: false,
       pending: true,
       step : "bankSteps.pending" as BankStep,
       finalDecision: dec
    };
    SaveHistory(reject, dec);
  }

  const onApproveOk = async (data: any) => {
    const dec = {
      date: new Date(),
      createdBy: userId,
      createdAt: new Date(),
      status: finalDecisionStatuses[0],
      reason_why:  (data.text) ? data.text : 'Aucune raison fournie',
    } as HistoricDecision;
    const reject = {
       reject: false,
       approve: true,
       pending: false,
       step : "bankSteps.needApprobation" as BankStep,
       finalDecision: dec
    };
    SaveHistory(reject, dec);
  }

  const onPermitOk = async () => {
    const reject = {
       step : "bankSteps.needContract" as BankStep,
    };
    SaveHistory(reject);
  }

  const SaveHistory = async (reject: any, dec? : HistoricDecision  ) => {
    if (bankId) await updateBankById(bankId, reject).then(async () => {
      if(dec) { 
        dec.bankId = bankId;
        console.log(dec);
        await addDecisionHistory(dec);
      }
      setBank((prevBank: Bank | null) => (prevBank ? { ...prevBank, ...reject } : reject));
      setIsOpen(false)
      setModalContent(null);
    });
  }


  const onDialogClose = () => {
      setIsOpen(false)
  }

  { !bankId && <Navigate to="/" /> }
  return (
    <div>
      { bankId && <SubmissionReview bankId={bankId} onPermitOk={onPermitOk} onApproveOk = {onApproveOk} onChangeState={ (comp, name) => { openDialog(comp, name) } } onRejectOk={onRejectOk} bank={bank}  userId={userId} onPendingOk={onPendingOk}/> }
        <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4"> { nameDialog } </h5>
                
                {modalContent && (
                <div >
                  { modalContent }
                </div>
                 )}
                <div className="text-right mt-6">
                    <Button variant="plain" onClick={onDialogClose}>
                        Fermer
                    </Button>
                </div>
            </Dialog>
    </div>
  );
}


const ShowBankDetails = () => {
    return <ShowBankDetailsBase />
}

export default ShowBankDetails;