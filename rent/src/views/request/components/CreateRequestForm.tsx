/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormItem, Input, Select, Button, Alert } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { modePayments, support_docs, exp_categories, RequestType, ReqSteps } from '@/views/Entity/Request';
import { useSessionUser } from '@/store/authStore';
import { manageAuth } from '@/constants/roles.constant';
import { BankDoc, ExpenseRequestDoc, getLandlordDoc, Landlord } from '@/services/Landlord';
import { Proprio } from '@/views/Entity';
import { convertToSelectOptionsProprio } from '@/views/report/components/ReportTypeFilter';
import { Query, DocumentData, CollectionReference, query, where, getDocs, orderBy, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { OptionType } from '@/views/report/components/FilterBankWeek';
import { getBankImages } from '@/services/firebase/BankService';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import ImageReq from './ImageReq';
import EndBank from '@/views/bank/add/components/EndBank';

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

const CreateRequestForm = () => {
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const [ regions, setRegions] = useState([]) as any;
  const [ hideReg, setHideReg] = useState(false);
  const { userId, authority, proprio } = useSessionUser((state) => state.user);
  const [ accounts, setAccounts] = useState([]) as any;
  const [agents, setAgents] = useState<OptionType[]>([]);
  const [ sregion, setsRegion] = useState() as any;
  const [ banks, setBanks] = useState([]) as any;
  const [ cbank, setCBank] = useState() as any;
  const [ request, setRequest] = useState() as any;
  const [step, setStep] = useState(0);
  const [message, setMessage] = useTimeOutMessage()
  const [alert, setAlert] = useState("success") as any;
  
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      modePayment: modePayments[0],
      currency: 'HTG',
      id_region : 0,
      exp_category: exp_categories[0],
      description: '',
      amount: '',
      general_admin_memo: '',
    },
  });

  useEffect(() => {
    if (!authority || authority.length === 0) return;
    const auth = authority[0];
    const manage = async () => {
    const { regions  } = await manageAuth(auth, proprio, t);
     setRegions(regions); // setRegions first
     
     if (regions.length === 1) {
       setValue("id_region", regions[0].value); // safe to call here
       setsRegion(regions[0].value);
       setHideReg(true);
       setAccounts([regions[0].accounts]);
     }
    };
    manage();
    fetchProprio();
  }, [authority]);

  useEffect(() => {
    if (!sregion) return;
    fetchBanks();
    fetchProprio();
  }, [sregion]);

  const FrenchDate = (dateString: any, y = 0 ) => {
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
       setValue('description',''); 
       setValue('beneficiary_name',  "");
       setValue('objectId', '');
       setValue('amount', '');
       return;}
    if (cbank) {
      setValue('beneficiary_name', cbank?.landlord?.fullName || "");
      setValue('objectId', cbank.id);
      setValue('amount', cbank.final_rentCost || 0);
      setValue('description', ` Location pour une nouvelle bank : ${cbank.bankName} 
        \n Nom du proprietaire :  ${cbank?.landlord?.fullName || ""} 
        \n Adresse : ${cbank.city || ''} ${cbank.address || ''}
        \n Montant:  HTG ${ cbank.final_rentCost || 0}
        \n Durée : ${cbank.yearCount}
        \n Date de debut: ${FrenchDate(cbank.date)}
        \n Date de fin: ${FrenchDate(cbank.date, cbank.yearCount)}
        \n Description : ${cbank.description || 'Pas de description'} 
        `);
    }
  }, [cbank]);


  const fetchBanks = async () => {
          if (!sregion) return;
          const q: Query<DocumentData> =  query(BankDoc, orderBy("createdAt", "desc"), 
          where("id_region", "==", sregion),
          where ("approve", "==" ,true),
          where ("step","in",["bankSteps.needContract","bankSteps.needContract"]),
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
      const q: Query<DocumentData> = query(baseQuery, orderBy('fullName'), where("regions",'array-contains-any',[sregion]),
       where ('type_person', 'in', ['admin','super_manager', 'manager', 'assist_manager']));
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
      await updateDoc(docRef, {id: docRef.id});
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

  const isRegionSelected = watch('id_region');
  const cat = watch('exp_category');
  const modePayment = watch('modePayment');
  const nextStep = (step: number, data: any ) => {
    setStep(step);
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
       {message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}
  { step == 0 && (<Form onSubmit={handleSubmit(submit)}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
      <FormItem label={t('request.exp_category')} invalid={!!errors.exp_category} errorMessage={errors.exp_category?.message}>
        <Controller
          name="exp_category"
          control={control}
          render={({ field }) => (
            <Select options={exp_categories.map(e => ({ value: e, label: t(e) }))} value={{ value: field.value, label: t(field.value) }} onChange={val => field.onChange(val?.value)} />
          )}
        />
      </FormItem>
      { !hideReg && <FormItem label="Région" invalid={!!errors.id_region} errorMessage={errors.id_region?.message}>
                              <Controller name="id_region" control={control} render={({ field }) => 
                                <Select placeholder="Please Select" 
                                    options={regions.map((region: any) => ({ value: region.value, label: region.label, accounts: region.accounts }))}    
                                    onChange={(option: any) => { 
                                      setAccounts(option?.accounts);  
                                      setsRegion(option.value);
                                      field.onChange(option.value);
                                    } } /> 
                                } />
                </FormItem> }
      { (agents.length > 0) && (
        <FormItem label="Responsable" invalid={!!errors.confirmationFrom} errorMessage={errors.confirmationFrom?.message}>
            <Controller name="confirmationFrom" control={control} render={({ field }) => 
                    <Select
                      placeholder="choissir un responsable"
                      options={agents}
                      onChange={(option: any) => {
                        field.onChange(option.value);
                      }}
                    />
              } />
        </FormItem>
      )}

       { (banks.length > 0 && cat == 'request.expense.lease' ) && (
          <>
          <FormItem label="Bank" invalid={!!errors.objectId} errorMessage={errors.objectId?.message}>
                  <Controller name="objectId" control={control} render={({ field }) => 
                          <Select
                            placeholder="choissir une bank"
                            options={banks.map((bank: any) => ({ value: bank.id, label: bank.bankName }))}
                            onChange={(option: any) => {
                              setCBank(banks.find((b: any) => b.id === option.value));

                              field.onChange(option.value);
                            }}
                          />
                    } />
              </FormItem>
          </>
       )}
    
      <FormItem label={t('request.modePayment')} invalid={!!errors.modePayment} errorMessage={errors.modePayment?.message}>
        <Controller
          name="modePayment"
          control={control}
          render={({ field }) => (
            <Select options={modePayments.map(p => ({ value: p, label: t(p) }))} value={{ value: field.value, label: t(field.value) }} onChange={val => field.onChange(val?.value)} />
          )}
        />
      </FormItem>

      <FormItem label={t('request.beneficiary_name')} invalid={!!errors.beneficiary_name} errorMessage={errors.beneficiary_name?.message}>
        <Controller
          name="beneficiary_name"
          control={control}
          render={({ field }) => <Input type="text" {...field} onChange={e => field.onChange(e.target.value)} />} />
      </FormItem>

      
      { modePayment =="request.check" && <FormItem label={t('request.beneficiary_name_check')} invalid={!!errors.beneficiary_name_check} errorMessage={errors.beneficiary_name_check?.message}>
        <Controller
          name="beneficiary_name_check"
          control={control}
          render={({ field }) => <Input type="text" {...field} onChange={e => field.onChange(e.target.value)} />} />
      </FormItem> }

      { modePayment =="request.wire_transfer" && <FormItem label={t('request.beneficiary_name_wire')} invalid={!!errors.beneficiary_name_wire} errorMessage={errors.beneficiary_name_wire?.message}>
        <Controller
          name="beneficiary_name_wire"
          control={control}
          render={({ field }) => <Input type="text" {...field} onChange={e => field.onChange(e.target.value)} />} />
      </FormItem> }

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
      <FormItem label={t('request.amount')} invalid={!!errors.amount} errorMessage={errors.amount?.message}>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />} />
      </FormItem>
      <FormItem label={t('request.currency')} invalid={!!errors.currency} errorMessage={errors.currency?.message}>
            <Controller
            name="currency"
            control={control}
            render={({ field }) => (
                <Select options={[{ value: 'HTG', label: 'HTG' }, { value: 'USD', label: 'USD' }]} 
                value={{ value: field.value, label: field.value }} 
                onChange={val => field.onChange(val?.value)} />
            )}
            />
        </FormItem>
        </div>

      <FormItem label={t('request.description')} invalid={!!errors.description} errorMessage={errors.description?.message}>
        <Controller name="description" control={control} render={({ field }) => <textarea className='w-full h-50 bg-gray-100'  {...field} />} />
      </FormItem>

      {/* <FormItem label={t('request.support_docs')} invalid={!!errors.support_docs} errorMessage={errors.support_docs?.message}>
        <Controller
          name="support_docs"
          control={control}
          render={({ field }) => (
            <Checkbox.Group vertical value={field.value} onChange={field.onChange}>
              {support_docs.map(doc => (
                <Checkbox key={doc} value={doc}>{t(doc)}</Checkbox>
              ))}
            </Checkbox.Group>
          )}
        />
      </FormItem> */}
      </div>

      {/* <FormItem label={t('request.general_admin_memo')}>
        <Controller name="general_admin_memo" control={control} render={({ field }) => <textarea className='w-full bg-gray-100' {...field} />} />
      </FormItem> */}

    {/* {  isRegionSelected && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <FormItem label={t('request.account')} invalid={!!errors.account} errorMessage={errors.account?.message}>
            <Controller
            name="account"
            control={control}
            render={({ field }) => (
                <Select options={accounts.map((a: string) => ({ value: a, label: a }))} value={{ value: field.value, label: field.value }} onChange={val => field.onChange(val?.value)} />
            )}
            />
        </FormItem>

    </div> } */}
     

      <div className="mt-6">
        <Button type="submit" variant="solid" loading={isSubmitting}>
          {t('common.submit')}
        </Button>
      </div>
    </Form>) }
    { step == 1 && (
      <ImageReq nextStep={nextStep} reqId={request} userId={userId || ''} ></ImageReq>
    )}
     {step === 2 && (
            <div className="text-gray-700 dark:text-white">
             <EndBank message={t("entity.submitSuccess")} btnText="Nouvelle requête" onRestart={(): void => {
                setStep(0);
                setRequest(null);
                reset();
              } } ></EndBank>
            </div>
        )}

    </div>
  );
};

export default CreateRequestForm;
