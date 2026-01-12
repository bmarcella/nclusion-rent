/* eslint-disable import/no-duplicates */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Button, Steps } from '@/components/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { useSessionUser } from '@/store/authStore';
import { manageAuth } from '@/constants/roles.constant';
import { BankDoc, ExpenseRequestDoc, getLandlordDoc, Landlord } from '@/services/Landlord';
import { Proprio } from '@/views/Entity';
import { convertToSelectOptionsProprio } from '@/views/report/components/ReportTypeFilter';
import { Query, DocumentData, CollectionReference, query, where, getDocs, orderBy, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { OptionType } from '@/views/report/components/FilterBankWeek';
import { getBankImages } from '@/services/firebase/BankService';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import ImageReq from '../ImageReq';
import EndBank from '@/views/bank/add/components/EndBank';
import { getNextNodeV2, requestStatusAll, RequestType, RequestTypeEnum } from '../../entities/AuthRequest';
import { MoneyRequest, MoneyRequestSchema } from '../../entities/SchemaRequest';
import { ViewReqForm } from './ViewReqForm';
import { IRequest } from '../../entities/IRequest';
import ProcessNewMail from '@/views/mail/ProcessNewMail';
import { ApiSendMail } from '@/services/MailService';

interface Props {
  typeRequest: RequestType
  goBack: () => void
}

const CreateRequestForm = ({ typeRequest, goBack }: Props) => {
  const { t } = useTranslation();
  const statuses = requestStatusAll(t);
  const [regions, setRegions] = useState([]) as any;
  const [roles, setRoles] = useState([]) as any;
  const { userId, authority, proprio } = useSessionUser((state) => state.user);
  const [hideReg, setHideReg] = useState(false);
  const [accounts, setAccounts] = useState([]) as any;
  const [agents, setAgents] = useState<OptionType[] | any>([]);
  const [sregion, setsRegion] = useState() as any;
  const [banks, setBanks] = useState([]) as any;
  const [cbank, setCBank] = useState() as any;
  const [request, setRequest] = useState() as any;
  const [step, setStep] = useState(0);
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useTimeOutMessage()
  const [alert, setAlert] = useState("success") as any;
  const [newReq, setNewReq] = useState() as any;
  const mailRef = useRef(null);

  const methods = useForm<MoneyRequest>({
    resolver: zodResolver(MoneyRequestSchema),
    defaultValues: {
      general: {
        type_request: typeRequest.key as any,
        id_region_user: 0,
        on_behalf_user_id: "",
        on_behalf_approve: "pending",
        paymentMethod: "cash",
        currency: "USD",
        typePayment: "full",
        is_for_other: false
      }
    },
    mode: "onChange",
  });
  const {
    setValue,
    watch,
    reset,
    trigger,
    clearErrors,
    formState: { errors, isValid },
  } = methods;

  useEffect(() => {
    if (!authority || authority.length === 0) return;
    const auth = authority[0];
    const manage = async () => {
      const { regions, roles } = await manageAuth(auth, proprio, t);
      setRegions(regions);
      setRoles(roles);
      if (regions.length === 1) {
        setValue("general.id_region_user", regions[0].value); // safe to call here
        setsRegion(regions[0].value);
        setHideReg(true);
        setAccounts([regions[0].accounts]);
      }
    };
    manage();
    if (typeRequest.key) fetchProprio();
  }, [authority]);

  useEffect(() => {
    if (!sregion) return;
    fetchBanks();
    fetchProprio();
  }, [sregion]);

  const FrenchDate = (dateString: any, y = 0) => {
    const date = new Date(dateString);

    // Add y years if y > 0
    if (y > 0) {
      date.setFullYear(date.getFullYear() + y);
    }
    const formatted = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

    return formatted;
  };

  useEffect(() => {
    if (!cbank) {
      setValue('description', '');
      setValue('beneficiary_name', "");
      setValue('objectId', '');
      setValue('amount', 0);
      return;
    }
    if (cbank) {
      setValue('beneficiary_name', cbank?.landlord?.fullName || "");
      setValue('objectId', cbank.id);
      setValue('amount', cbank.final_rentCost || 0);
      setValue('description', ` Location pour une nouvelle bank : ${cbank.bankName} 
        \n Nom du proprietaire :  ${cbank?.landlord?.fullName || ""} 
        \n Adresse : ${cbank.city || ''} ${cbank.address || ''}
        \n Montant:  HTG ${cbank.final_rentCost || 0}
        \n Durée : ${cbank.yearCount}
        \n Date de debut: ${FrenchDate(cbank.date)}
        \n Date de fin: ${FrenchDate(cbank.date, cbank.yearCount)}
        \n Description : ${cbank.description || 'Pas de description'} 
        `);
    }
  }, [cbank]);


  const fetchBanks = async () => {
    if (!sregion) return;
    const q: Query<DocumentData> = query(BankDoc, orderBy("createdAt", "desc"),
      where("id_region", "==", sregion),
      where("approve", "==", true),
      where("step", "in", ["bankSteps.needContract", "bankSteps.needContract"]),
    );
    const snapshot = await getDocs(q);
    const newBanks = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const landlordId = data.landlord;
        let landlord = null;
        if (landlordId) {
          const landlordSnap = await getDoc(getLandlordDoc(landlordId));
          landlord = landlordSnap.exists() ? landlordSnap.data() : null;
        }
        const images = await getBankImages(docSnap.id);
        return { id: docSnap.id, ...data, landlord, images };
      })
    );
    // Instead of replacing, accumulate
    setBanks(newBanks);


  };


  const fetchProprio = async () => {
    if (!sregion) return;
    try {
      const baseQuery: Query<DocumentData> = Landlord as CollectionReference<DocumentData>;
      const q: Query<DocumentData> = query(baseQuery, orderBy('fullName'), where("regions", 'array-contains-any', [sregion]),
        where('type_person', 'in', ['admin', 'super_manager', 'manager', 'assist_manager']));
      const snapshot = await getDocs(q);
      const landlords: Proprio[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Proprio[];
      const a = convertToSelectOptionsProprio(landlords);
      setAgents(a);
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  };

  const nextStep = (step: number, data?: any) => {
    setStep(step);
    if (step >= 2) setNewReq(undefined);
  }


  const type = watch("general.type_request");

  const paymentMethod = watch("general.paymentMethod");

  const addNull = (value: any) => {
    const clearIfNot = (key: keyof MoneyRequest, keep: boolean) => {
      if (!keep) methods.setValue(key as any, value, { shouldValidate: true, shouldDirty: true });
    };
    const typeReq = Object.values(RequestTypeEnum) as readonly string[];
    typeReq.forEach((key: any) => {
      clearIfNot(key, type == key);
    });

  }

  // Keep the payload clean: when type changes, clear other sections
  useEffect(() => {
    addNull(null);
  }, [type]);

  useEffect(() => {
    if (paymentMethod === "bank_transfer") {
      // ensure BankInfo is validated when bank transfer is selected
      trigger("BankInfo");
    } else {
      methods.setValue("BankInfo", null, {
        shouldValidate: false,
        shouldDirty: true,
      });
      // remove BankInfo errors when not bank transfer
      clearErrors([
        "BankInfo",
        "BankInfo.AccountName",
        "BankInfo.AccountNumber",
        "BankInfo.BankName",
        "BankInfo.SWIFT",
      ]);
    }
  }, [paymentMethod]);

  const getAmount = (data: MoneyRequest, type: string): number | undefined => {
    switch (type) {
      case "divers":
        return data.divers!.price!;
      case "legal":
        return data.legal!.price!;
      case "bill":
        return data.bill!.price!;
      case "capex":
        return data.capex!.price!;
      case "locomotif":
        return data.locomotif!.price!;
      case "telecom":
        return data.telecom!.total_price!;
      case "opex":
        return data.opex!.amount!;
      case "transport_logistique":
        return data.transport_logistique!.amount!;
      case "bank_renovation":
        return data.bank_renovation!.total_amount!;
      case "lease_payment":
        return data.lease_payment!.rentCost!;
    }
  }

  const onSubmit: SubmitHandler<MoneyRequest> = async (data) => {
    try {
      let new_status = undefined
      if (data.general?.is_for_other) {
        new_status = statuses[0].value;
      } else {
        const flow = data?.general?.approvalFlow;
        if (flow == 1 || flow == 2) {
          new_status = statuses[1].value;
        } else if (flow == 4) {
          new_status = statuses[3].value;
        } else {
          new_status = statuses[2].value;
        }
      }
      setSubmitting(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      const request = {
        ...data,
        preApproval_by: null,
        regionalApproved_by: null,
        accountantApproval: null,
        managerGlobalApproval: null,
        rejectedBy: null,
        cancelledBy: null,
        approvedBy: null,
        completedBy: null,
        historicApproval: [{
          status_to: new_status,
          status_from: null,
          by_who: userId,
          createdAt: new Date(),
        }],
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
        status: new_status,
        requestType: typeRequest.key,
        amount: getAmount(data, typeRequest.key)
      } as unknown as Partial<IRequest>;
      // console.log(request);
      const docRef = await addDoc(ExpenseRequestDoc, request);

      reset();
      setStep(1);
      await updateDoc(docRef, { id: docRef.id });
      setRequest(docRef.id);
      const newReq: any = { ...request, id: docRef.id };
      setNewReq(newReq);

      setMessage("Requête enregistrée avec succes");
      setAlert("success")
      setTimeout(() => setSubmitting(false), 1000);

      try {
        initMail(newReq);
      } catch (error) {
        console.error("Error initializing mail after submit:", error);
      }

    } catch (error) {
      // console.error("Error adding document: ", error);
      setSubmitting(false);
      setMessage("Erreur lors de l'enregistrement de la requete");
      setAlert("danger")
    }
  };

  const initMail = async (req: IRequest) => {
    try {
      if (mailRef.current && (mailRef.current as any).init) {
        (mailRef.current as any).init(req, 'new');
      } else {
        console.log("Mail component not yet initialized")
      }
    } catch (error) {
      console.error("Error initializing mail:", error);
    }

  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">

      <Steps current={step}>
        <Steps.Item title={"Ajouter requête  " + typeRequest.label} />
        <Steps.Item title={"Document  " + typeRequest.label} />
        <Steps.Item title={"Terminé"} />
      </Steps>
      {message && (
        <Alert showIcon className="mb-4 mt-4" type={alert}>
          <span className="break-all">{message}</span>
        </Alert>
      )}

      <ProcessNewMail ref={mailRef} />

      {step == 0 && (<ViewReqForm
        onSubmit={onSubmit}
        methods={methods} stype={typeRequest} goBack={goBack} ></ViewReqForm>)
      }
      {step == 1 && (
        <ImageReq nextStep={nextStep} reqId={request} userId={userId || ''} end={false} isEdit={false} ></ImageReq>
      )}

      {step === 2 && (
        <div className="text-gray-700 dark:text-white">
          <EndBank message={t("entity.submitSuccess")} btnText="Nouvelle requête" onRestart={(): void => {
            setStep(0);
            setRequest(null);
            reset();
          }} ></EndBank>
        </div>
      )}

    </div>
  );
};

export default CreateRequestForm;
