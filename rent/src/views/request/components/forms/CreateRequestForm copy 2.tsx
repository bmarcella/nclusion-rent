/* eslint-disable import/no-duplicates */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Alert } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { modePayments, exp_categories, ReqSteps } from '@/views/Entity/Request';
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
import { RequestType, RequestTypeEnum } from '../../entities/AuthRequest';
import { MoneyRequest, MoneyRequestSchema } from '../../entities/SchemaRequest';
import { ViewReqForm } from './ViewReqForm';
import React from 'react';

const schema = z.object({
  modePayment: z.enum(modePayments),
  amount: z.number().min(1),
  id_region: z.number().optional(),
  objectId: z.string().optional(),
  beneficiary_name_check: z.string().optional(),
  beneficiary_name_wire: z.string().optional(),
  beneficiary_name: z.string().min(3),
  currency: z.string().min(1),
  confirmationFrom: z.string().min(1),
  description: z.string().optional(),
  exp_category: z.enum(exp_categories),
});

type RequestFormValues = z.infer<typeof schema>;

interface Props {
  typeRequest : RequestType 
}

const CreateRequestForm = ( { typeRequest } : Props) => {
  const { t } = useTranslation();
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
const methods = useForm<MoneyRequest>({
resolver: zodResolver(MoneyRequestSchema),
defaultValues: {
  general : {
    type_request: typeRequest.key as any,
    id_region_user: 0,
    on_behave_id_region: 0,
    on_behalf_user_id: "",
    on_behalf_approve: "pending",
    paymentMethod: "cash",
    currency: "USD",
    typePayment: "full",
    documents: [],
  }
},
mode: "onChange",
});
 const {
    setValue,
    watch,
    reset,
    formState: { errors, isValid},
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
   if(typeRequest.key) fetchProprio();
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
      console.log('landlords:', landlords);
      const a = convertToSelectOptionsProprio(landlords);
      setAgents(a);
    } catch (error) {
      console.error('Error fetching page:', error);
    }

  };

  const submit = async (data: RequestFormValues) => {
    setSubmitting(true);
    try {
      const request = {
        ...data,
        step: "reqSteps.needConfirmation" as ReqSteps,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date()
      } as Partial<RequestType>;
      const docRef = await addDoc(ExpenseRequestDoc, data);
      console.log('Request Details:', request);
      reset();
      setStep(1);
      await updateDoc(docRef, { id: docRef.id });
      setRequest(docRef.id);
      setMessage("Requête enregistrée avec success");
      setAlert("success")
      setTimeout(() => setSubmitting(false), 1000);
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("Erreur lors de l'enregistrement de la requete");
      setAlert("danger")
    }
  };


  const nextStep = (step: number, data?: any) => {
    setStep(step);
  }

  
const type = watch("general.type_request");

// Keep the payload clean: when type changes, clear other sections
React.useEffect(() => {
const clearIfNot = (key: keyof MoneyRequest, keep: boolean) => {
  if (!keep) methods.setValue(key as any, undefined, { shouldValidate: true, shouldDirty: true });
};
const typeReq = Object.values(RequestTypeEnum) as readonly string[];
typeReq.forEach((key: any)=>{
   clearIfNot(key, type == key ); 
});
// clearIfNot("legal", type === "legal");
// clearIfNot("bill", type === "bill");
// clearIfNot("capex", type === "capex");
// clearIfNot("locomotif", type === "locomotif");
// clearIfNot("telecom", type === "telecom");
// clearIfNot("opex", type === "opex");
// clearIfNot("transport_logistique", type === "transport_logistique");
// clearIfNot("bank_renovation", type === "bank_renovation");
// clearIfNot("lease_payment", type === "lease_payment");
}, [type]);


const onSubmit: SubmitHandler<MoneyRequest> = (data) => {
// Here you would POST `data` to your backend.
// For demo, we print it nicely.
alert("Valid! Check console for payload.");
// eslint-disable-next-line no-console
console.log("Money request payload", data);
};

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
      {message && (
        <Alert showIcon className="mb-4" type={alert}>
          <span className="break-all">{message}</span>
        </Alert>
      )}
      {step == 0 && (<ViewReqForm 
      onSubmit={onSubmit} 
      methods={methods}  type={type} ></ViewReqForm>)}
      {step == 1 && (
        <ImageReq nextStep={nextStep} reqId={request} userId={userId || ''} ></ImageReq>
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
