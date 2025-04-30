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
import { getRegionIds, getRegionsById } from '@/views/Entity/Regions';
import { Bank, Proprio, RenovContract, RenovStep } from '@/views/Entity';
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
    
      const updateContratBank = async (bank : Bank) => {
  
        try {
          setSubmitting(true);
          const banksId = selectedtasks.map((task) => task.id);
          let regionsId = selectedtasks.map((task) => task.id_region);
          regionsId = [...new Set(regionsId)];
          const newData = {
            updatedBy: userId,
            updatedAt: new Date(),
            banksId,
            regionsId,
          };
          const docRef = getContratDoc(contrat.id);
          await updateDoc(docRef, newData);
          setAlert("success");
          setMessage( 'Contrat modifié avec succes' );
          setSelectedTasks([]);
          fetchBanks(contrat.renovStep as RenovStep);
          reset();
        } catch (err) {
          console.error(err);
          setAlert("danger");
          setMessage("Error updating contrat: " + err);
        } finally {
          setSubmitting(false);
        }
      };

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

  // async function updateBanks(banksId: any[],  renovStep: string) {
  //   try {
  //     const data = (renovStep == "renovSteps.comptoire" as RenovStep) ? {
  //     comptoireContratId : "",
  //     renovStep :  "renovSteps.comptoire" as RenovStep,
  //     updatedAt: new Date(),
  //   }  as Partial<Bank> :  
  //   {
  //     peintureContratId : "",
  //     renovStep :  "renovSteps.peiture" as RenovStep ,
  //     updatedAt: new Date(),
  //   } as Partial<Bank>;
  //     const updatePromises = banksId.map((bankId) => {
  //       const bankRef = doc(BankDoc, bankId);
  //       return updateDoc(bankRef,data);
  //     });
  //     await Promise.all(updatePromises);
  //     console.log("Banks updated successfully");
  //   } catch (error) {
  //     console.error("Error updating banks:", error);
  //     throw new Error("Failed to update banks");
  //   }
  // }




  const handleAdd = async (task: Bank) => {
    await setSelectedTasks((prev) => [...prev, task]);
    setBanks((prev) => prev.filter((t) => t.id !== task.id));
    updateContratBank(task);
  };



  const handleRemove = async (task: Bank) => {
    setSelectedTasks((prev) => prev.filter((t) => t.id !== task.id));
    setBanks((prev) => [...prev, task]);
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
     <div className="grid grid-cols-2 md:grid-cols-2 gap-6 w-full rounded p-4 ">
      {/* Left - Form */}
      <div className=" bg-gray-50 dark:bg-gray-700 rounded p-4 shadow" >
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

      {/* Right - Task List */}
      { renovStep && (<div className="grid grid-cols-2 md:grid-cols-2 gap-6 w-full  p-4 ">
       

             {/* Right - Task List */}
             <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow" >
                <div className="flex justify-between items-center mb-4">
                  <h6 className="text-md font-bold">📋 Banks Sélectionées pour {t('bank.'+selectedStep)}</h6>
                </div>

                {/* Task List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {selectedtasks.map((bank) => (
                      <div
                        key={bank.id}
                        className="bg-white p-2 rounded-lg shadow border flex justify-between items-center"
                      >
                        {/* Task content */}
                        <div className="flex-1">
                        <div className="mb-1">
                            <p className="font-semibold">{ bank.bankName }</p>
                            <p className="text-xs text-gray-500">
                              Agent : <UserName userId={bank.createdBy}  />
                            </p>
                            <p className="text-xs text-gray-500">
                              Propriétaire : <UserName userId={bank.landlord}  keyName="id"/>
                            </p>
                          </div>
                          {/* <p className="text-sm mb-1">{task.description}</p> */}
                          <p className="text-xs text-gray-500">
                           Crée {formatRelative(
                              bank.createdAt.toDate?.() || bank.createdAt,
                              new Date(),
                              { locale: fr }
                            )}
                          </p>
                        </div>

                        {/* Plus Button */}
                        { selectedtasks.length > 1 && <button
                          disabled={isSubmitting}
                          onClick={() => handleRemove(bank)} // Replace with your actual handler
                          className="ml-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                          title="Add"
                        >
                          -
                        </button> } 
                      </div>
                    ))}
                </div>
             </div>

    
            <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
              <div className="flex justify-between items-center mb-2">
                  <h6 className="text-md font-bold">📋 Banks Prêt pour {t('bank.'+selectedStep)}</h6>
              </div>
              <div className="flex justify-between items-center mb-2">

                <Input
                  type="text"
                  placeholder="Rechercher bank"
                  className="border rounded text-sm bg-white"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                />
              </div>
                {/* Task List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {banks.filter((bank) =>
                     bank.bankName?.toLowerCase().includes(bankSearch.toLowerCase())
                   ).map((bank) => (
                      <div
                        key={bank.id}
                        className="bg-white p-2 rounded-lg shadow border flex justify-between items-center"
                      >
                        {/* Task content */}
                        <div className="flex-1">
                          <div className="mb-1">
                            <h6 className="font-semibold">{ bank.bankName }</h6>
                            <p className="text-xs text-gray-500">
                              Agent : <UserName userId={bank.createdBy}  />
                            </p>
                            <p className="text-xs text-gray-500">
                              Prop. : <UserName userId={bank.landlord}  keyName="id"/>
                            </p>
                            <p className="text-xs text-gray-500">
                              Regions : { bank.id_region &&  <span  className="text-xs text-gray-500"> { getRegionsById(bank.id_region)?.label } </span>}
                            </p>
                          </div>
                          {/* <p className="text-sm mb-1">{task.description}</p> */}
                          <p className="text-xs text-gray-500">
                           Crée {formatRelative(
                              bank.createdAt.toDate?.() || bank.createdAt,
                              new Date(),
                              { locale: fr }
                            )}
                          </p>
                        </div>

                        {/* Plus Button */}
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleAdd(bank)} // Replace with your actual handler
                          className="ml-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                          title="Add"
                        >
                          +
                        </button>
                      </div>
                    ))}
                </div>
            </div>
      </div>)}
     </div>
    </>
   
  );
}

export default EditContrat;
