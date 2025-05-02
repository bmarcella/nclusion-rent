/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Select, DatePicker, Input, Button, Alert } from '@/components/ui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { getDocs, updateDoc, doc, where, orderBy, query, getDoc, } from 'firebase/firestore';
import {  useEffect, useState } from 'react';
import { BankDoc,  getBankDoc,  getContratDoc, Landlord } from '@/services/Landlord';
import { useSessionUser } from '@/store/authStore';
import { getRegionIds, getRegionsById } from '@/views/demo/Entity/Regions';
import { Bank, Proprio, RenovContract, RenovStep } from '@/views/demo/Entity';
import { convertToSelectOptions } from '../../bank/add/components/InfoBank';
import { formatRelative } from 'date-fns/formatRelative';
import { fr } from 'date-fns/locale';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import UserName from '@/views/bank/show/components/UserName';


const schema = z.object({
  renovStep: z.string().min(1, 'Required'),
  assignee: z.string().min(1, 'Required'),
  montant_total: z.string().min(1, 'Required'),
  montant_initial: z.string().min(1, 'Required'),
  transport: z.string(),
  description: z.string().optional(),
  startDate: z.string().min(1 ,'Required'),
  endDate: z.string().min(1, 'Required'),
});

type TaskForm = z.infer<typeof schema>;
interface Props {
  contrat : RenovContract
}

function EditContrat(  { contrat } : Props) {
  const { t } = useTranslation();
  const [banks, setBanks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | TaskForm['state']>('all');
  const [isSubmitting, setSubmitting] = useState(false);
  const { userId,  proprio , authority } = useSessionUser((state) => state.user);
  const [landlordsOptions, setLandlordsOptions] = useState<any  []>([]);
  const [selectedtasks, setSelectedTasks] = useState<any[]>([]);
  const [message, setMessage] = useTimeOutMessage();
  const [alert, setAlert] = useState("success") as any;
  const [bankSearch, setBankSearch] = useState('');
  const [selectedStep, setSelectedStep] = useState<any>(contrat.renovStep);


  // 

  const [ regions, setRegions] = useState<number>(0);
  const [agents, setAgents] = useState<string>();
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  const [steps, setSteps] = useState<string>();
  const [states, setStates] = useState<string>();
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      assignee: contrat.assignee,
      renovStep: contrat.renovStep,
      montant_total: String(contrat.montant_total),
      montant_initial: String(contrat.montant_initial),
      description: contrat.description,
      transport: String(contrat.transport),
      startDate: new Date(contrat.startDate).toISOString(),
      endDate:  new Date(contrat.endDate).toISOString(),
    },
  });
  const renovStep = watch('renovStep');
  const ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
  const fetchLandlords = async () => {
          try {
            let q = null;
            q = query(Landlord, orderBy("createdAt", "desc"),   where("regions", "array-contains-any", ids),  where("type_person", "==", "vendeur"));
            const snapshot = await getDocs(q);
            const landlords: Proprio[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proprio));
            const persons = await convertToSelectOptions(landlords);
            setLandlordsOptions(persons);
          } catch (err) {
            console.error("Error fetching landlords:", err);
          }
    };

 const fetchBanks = async (step : RenovStep) => {
        const q = query(BankDoc, orderBy("createdAt", "desc"), 
        where("step", "==", "bankSteps.needRenovation"), 
        where("id_region", "in", ids),
        where("renovStep", "==", step));
        const snapshot = await getDocs(q);
        const banks: Bank[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bank));
        // Update state
        setBanks(banks);
    
    };


     useEffect(() => {
        const fetchBanks = async () => {
          const promises = contrat.banksId.map(async (id) => {
            const docRef = getBankDoc(id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              return {  ...snap.data() } as Bank;
            }
            return null;
          });
    
          const results = await Promise.all(promises);
          setSelectedTasks(results.filter((b): b is Bank => b !== null)); // filter out nulls
        };
    
        if (contrat.banksId.length > 0) {
          fetchBanks();
        }
      }, [contrat.banksId]);
    


  const onSubmitContrat = async (data: TaskForm) => {
    if (parseInt(data.montant_total) < parseInt(data.montant_initial)) {
      setAlert("danger");
      setMessage( 'Montant versé doit être inférieur ou egal au montant total' );
      return;
    }
    try {
      setSubmitting(true);
      //const banksId = selectedtasks.map((task) => task.id);
      // let regionsId = selectedtasks.map((task) => task.id_region);
      // regionsId = [...new Set(regionsId)];
      const newData = {
        updatedBy: userId,
        updatedAt: new Date(),
        ...data,
      } ;
      const docRef = getContratDoc(contrat.id);
      await updateDoc(docRef, newData);
      setAlert("success");
      setMessage( 'Contrat modifié avec succes' );
      setSelectedTasks([]);
      fetchBanks(data.renovStep as RenovStep);
      reset();
    } catch (err) {
      console.error(err);
      setAlert("danger");
      setMessage("Error updating contrat: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLandlords();
    if (selectedStep) fetchBanks(selectedStep);
  }, [selectedStep]);
 const renovs = [ 
  {
  value: 'renovSteps.comptoire',
  label: t('bank.renovSteps.comptoire'),
  },
  {
    value: 'renovSteps.peinture',
    label: t('bank.renovSteps.peinture'),
  }
];
  return (
    <>
     { message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
         )}


  <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
  <div className="max-w-5xl w-full rounded p-6">
    {/* Your form goes here */}
    <div className="bg-white dark:bg-gray-700 rounded p-6 shadow w-full">
    <form onSubmit={handleSubmit(onSubmitContrat)}>
          <div className="grid grid-cols-2 gap-4">

            <FormItem label="Type Rénovation" invalid={!!errors.renovStep} errorMessage={errors.renovStep?.message}>
              <Controller name="renovStep" control={control} render={({ field }) =>
                <Select
                  isDisabled={true}
                  placeholder="Selectionner Type Rénovation"
                  options={renovs}
                  value={renovs.find(option => option.value === field.value) || null}
                  onChange={(option) => { 
                    field.onChange(option?.value);
                     setSelectedTasks([]);
                     if (option?.value) setSelectedStep(option?.value);
                     else setBanks([]);
                    }}
                />
              } />
            </FormItem>

          { renovStep && (<>
            <FormItem label="Assignee" invalid={!!errors.assignee} errorMessage={errors.assignee?.message}>
              <Controller name="assignee" control={control} render={({ field }) =>
                <Select
                  placeholder="Select assignee"
                  options={landlordsOptions}
                  value={landlordsOptions.find(option => option.value === field.value) || null}
                  onChange={(option) => { 
                    field.onChange(option?.value);
                  }}
                />
              } />
            </FormItem>

            <FormItem label="Montant Total" invalid={!!errors.montant_total} errorMessage={errors.montant_total?.message}>
              <Controller name="montant_total" control={control} render={({ field }) =>
                <Input
                type="number"
              {...field}
              placeholder="Montant total"
             
            />
              } />
            </FormItem>

            <FormItem label="Montant versé" invalid={!!errors.montant_initial} errorMessage={errors.montant_initial?.message}>
              <Controller name="montant_initial" control={control} render={({ field }) =>
                <Input
                  type="number"
                  {...field}
                  placeholder="Montant versé"
                 
                />
              } />
            </FormItem>

            <FormItem label="Frais de transport" invalid={!!errors.transport} errorMessage={errors.transport?.message}>
              <Controller name="transport" control={control} render={({ field }) =>
                <Input
                type="number"
              {...field}
              placeholder="Frais de transport"
             
            />
              } />
            </FormItem>

           

            <FormItem label="Start Date" invalid={!!errors.startDate} errorMessage={errors.startDate?.message}>
              <Controller name="startDate" control={control} render={({ field }) =>
                <DatePicker
                  placeholder="Choose start date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : new Date())}
                />
              } />
            </FormItem>

            <FormItem label="End Date" invalid={!!errors.endDate} errorMessage={errors.endDate?.message}>
              <Controller name="endDate" control={control} render={({ field }) =>
                <DatePicker
                  placeholder="Choose end date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : new Date() )}
                />
              } />
            </FormItem>

        
            </>) }
          </div>
          <div className="grid grid-cols-1 gap-4">
           <FormItem label="Description" invalid={!!errors.description} errorMessage={errors.description?.message}>
              <Controller name="description" control={control} render={({ field }) =>
                <textarea className='w-full bg-gray-100' {...field} />
              } />
            </FormItem>
            </div>
          <div className="mt-6">
            <Button title={ 'Modifier une bank'} type="submit" variant="solid" disabled={ contrat.completed} loading={isSubmitting}>
              {t('common.edit') || 'Modifier' }
            </Button>
          </div>
        </form>
    </div>
  </div>
</div>
    </>
   
  );
}

export default EditContrat;
