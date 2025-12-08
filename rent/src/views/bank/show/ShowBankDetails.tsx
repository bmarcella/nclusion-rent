/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate, useParams } from "react-router-dom";
import SubmissionReview from "./SubmissionReview";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { addBankLease, addBankTask, addDecisionHistory, addStepsHistory, getBankById, updateBankById } from "@/services/firebase/BankService";
import { Bank, BankLease, BankStep, BankTask, finalDecisionStatuses, getEndDateYear, HistoricDecision, RenovStep, renovSteps, StepDecision } from "@/views/Entity";
import { useSessionUser } from "@/store/authStore";

export const ShowBankDetailsBase = () => {
  const { bankId } = useParams();
  const [dialogIsOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [bank, setBank] = useState<Bank>();
  const [loading, setLoading] = useState(true);
  const { userId } = useSessionUser((state) => state.user);
  const [nameDialog, setDialogName] = useState<any>(null);
  useEffect(() => {
    const fetchBank = async () => {
      setLoading(true);
      const result = await getBankById(bankId!);
      setBank(result);
      setLoading(false);
    };
    if (bankId) fetchBank();
  }, [bankId]);

  const openDialog = (component: React.ReactNode, name: string = "Rejection") => {
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
      reason_why: (data.text) ? data.text : 'Aucune raison fournie',
    } as HistoricDecision;
    const reject = {
      reject: true,
      approve: false,
      pending: false,
      step: "bankSteps.rejected",
      finalDecision: dec
    };
    const step = {
      createdBy: userId,
      createdAt: new Date(),
      step: "bankSteps.rejected" as BankStep,
    } as StepDecision;
    SaveSteps(step);
    SaveHistory(reject, dec);
  }


  const onPendingOk = async (data: any) => {
    const dec = {
      date: new Date(),
      createdBy: userId,
      createdAt: new Date(),
      status: finalDecisionStatuses[2],
      reason_why: (data.text) ? data.text : 'Aucune raison fournie',
    } as HistoricDecision;
    const reject = {
      reject: false,
      approve: false,
      pending: true,
      step: "bankSteps.pending" as BankStep,
      finalDecision: dec
    };
    const step = {
      createdBy: userId,
      createdAt: new Date(),
      step: "bankSteps.pending" as BankStep,
    } as StepDecision;
    SaveSteps(step);
    SaveHistory(reject, dec);
  }

  const onApproveOk = async (data: any) => {
    const dec = {
      date: new Date(),
      createdBy: userId,
      createdAt: new Date(),
      status: finalDecisionStatuses[0],
      reason_why: (data.text) ? data.text : 'Aucune raison fournie',
    } as HistoricDecision;

    const reject = {
      reject: false,
      approve: true,
      pending: false,
      step: "bankSteps.needApprobation" as BankStep,
      finalDecision: dec
    };
    const step = {
      createdBy: userId,
      createdAt: new Date(),
      step: "bankSteps.needApprobation" as BankStep,
    } as StepDecision;
    SaveHistory(reject, dec);
    SaveSteps(step);
  }

  const onPermitOk = async () => {
    const step = {
      createdBy: userId,
      createdAt: new Date(),
      step: "bankSteps.needContract" as BankStep,
    } as StepDecision;
    const reject = {
      step: "bankSteps.needContract" as BankStep,
    };
    SaveHistory(reject);
    SaveSteps(step);
  }
  const onContratOk = async () => {
    const step = {
      createdBy: userId,
      createdAt: new Date(),
      step: "bankSteps.needRenovation" as BankStep,
    } as StepDecision;
    const reject = {
      step: "bankSteps.needRenovation" as BankStep,
      renovStep: "renovSteps.comptoire" as RenovStep,
    };
    const lease: BankLease = {
      createdBy: userId || '',
      createdAt: new Date(),
      date_debut: (bank?.date) ? new Date(bank.date) : new Date(),
      date_fin: (bank) ? getEndDateYear(bank?.date, Number(bank.yearCount)) : new Date(),
      montant_total: Number(bank?.rentCost),
      bankId: bankId,
      structure_payment: bank?.rentDetails?.paymentStructure,
      payment_method: bank?.rentDetails?.paymentMethod,
    };
    SaveBankTasks();
    SaveLease(lease);
    SaveHistory(reject);
    SaveSteps(step);
  }

  const onRenovOk = async () => {
    const step = {
      createdBy: userId,
      createdAt: new Date(),
      step: "bankSteps.readyToUse" as BankStep,
    } as StepDecision;
    const reject = {
      step: "bankSteps.readyToUse" as BankStep,
    };

    SaveHistory(reject);
    SaveSteps(step);
  }

  const SaveLease = async (l: any) => {
    l.bankId = bankId;
    await addBankLease(l);
  }

  const SaveSteps = async (step: StepDecision) => {
    if (step) {
      step.bankId = bankId;
      await addStepsHistory(step);
    }
  }

  const SaveBankTasks = async () => {
  const hasRenov =  ((bank?.renovationDetails?.neededSecurity?.length ?? 0) > 0  || 
                      (bank?.renovationDetails?.majorRenovation?.length ?? 0) > 0 || 
                      (bank?.renovationDetails?.minorRenovation?.length ?? 0) > 0 )
   const tasks: BankTask [] = [];
   renovSteps.forEach(async (step, index) => {
      const task: BankTask  = {
        createdBy: userId!,
        createdAt: new Date(),
        taskName: step,
        bankId: bankId!,
        id_region: bank?.id_region,
        done: false,
        index,
        state: "pending",
        id: "",
        description: ""
      };
      tasks.push(task);
    });
    tasks.pop();
    tasks.pop();
    if (!hasRenov) { tasks.shift(); }
    tasks.forEach(async (task) => {
      await addBankTask(task);
    });
  }

  const SaveHistory = async (reject: any, dec?: HistoricDecision) => {
    if (bankId) await updateBankById(bankId, reject).then(async () => {
      if (dec) {
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
      {bankId && <SubmissionReview bankId={bankId}
        onPermitOk={onPermitOk}
        onApproveOk={onApproveOk}
        onPendingOk={onPendingOk}
        onRejectOk={onRejectOk}
        onContratOk={onContratOk}
        onRenovOk={onRenovOk}
        genTasks={SaveBankTasks}
        onChangeState={(comp, name) => { openDialog(comp, name) }}
        bank={bank} userId={userId} />}
      <Dialog
        isOpen={dialogIsOpen}
        onClose={onDialogClose}
        onRequestClose={onDialogClose}
      >
        <h5 className="mb-4"> {nameDialog} </h5>

        {modalContent && (
          <div >
            {modalContent}
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