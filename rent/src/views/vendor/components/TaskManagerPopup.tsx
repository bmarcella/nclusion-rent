/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Select, DatePicker, Input, Button, Alert } from '@/components/ui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { addDoc, getDocs, updateDoc, doc, where, orderBy, query, DocumentData, Query, QueryConstraint,  Timestamp } from 'firebase/firestore';
import {  useEffect, useState } from 'react';
import { contractsDoc, Landlord, taskCollection } from '@/services/Landlord';
import { useSessionUser } from '@/store/authStore';
import { getRegionIds } from '@/views/Entity/Regions';
import { BankTask, Proprio, RenovContract } from '@/views/Entity';
import { convertToSelectOptions } from '../../bank/add/components/InfoBank';
import { formatRelative } from 'date-fns/formatRelative';
import { fr } from 'date-fns/locale';
import BankName from '@/views/bank/show/components/BankName';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';


const schema = z.object({
  assignee: z.string().min(1, 'Required'),
  montant_total: z.string().min(1, 'Required'),
  montant_initial: z.string().min(1, 'Required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
});

type TaskForm = z.infer<typeof schema>;

function TaskManagerPopup() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | TaskForm['state']>('all');
  const [isSubmitting, setSubmitting] = useState(false);
  const {  userId,  proprio , authority } = useSessionUser((state) => state.user);
  const [landlordsOptions, setLandlordsOptions] = useState<any  []>([]);
  const [selectedtasks, setSelectedTasks] = useState<any[]>([]);
  const [message, setMessage] = useTimeOutMessage();
  const [alert, setAlert] = useState("success") as any;


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
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      assignee: '',
      description: '',
      startDate: '',
      endDate: '',
    },
  });

   const fetchLandlords = async () => {
          try {
            let q = null;
            const ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
            console.log("Regions: ", ids);
            q = query(Landlord, orderBy("createdAt", "desc"),   where("regions", "array-contains-any", ids),  where("type_person", "==", "vendeur"));
    
            const snapshot = await getDocs(q);
            const landlords: Proprio[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proprio));
            const persons = await convertToSelectOptions(landlords);
            setLandlordsOptions(persons);
          } catch (err) {
            console.error("Error fetching landlords:", err);
          }
    };

  const getQueryDate = (q: Query<DocumentData, DocumentData>)  => {
            
               const filters: QueryConstraint[] = [];
   
               if (regions && regions != 0) {
                   filters.push(where('id_region', '==', regions));
               } else {
                   const ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
                   filters.push(where("id_region", "in", ids))
               }
   
               if (agents) {
                   filters.push(where('createdBy', '==', agents));
               }
   
               if (states) {
                   filters.push(where('state', '==', states));
               }
              
               if (start && end) {
                   const isSameDay =
                   start.toDateString() === end.toDateString();
   
                   if (isSameDay) {
                   const startOfDay = new Date(start);
                   startOfDay.setHours(0, 0, 0, 0);
   
                   const endOfDay = new Date(end);
                   endOfDay.setHours(23, 59, 59, 999);
   
                   filters.push(where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
                   filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
                   } else {
                   filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
                   filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
                   }
               } else {
                   if (start) {
                   filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
                   }
                   if (end) {
                   filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
                   }
               }
               return filters.length > 0 ? query(q, ...filters) : q;
    }
   const fetchTasks = async () => {
            try {
              let q : Query<DocumentData>;
              const ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
                  q = query(taskCollection, orderBy("createdAt", "asc"), where("contratId","==",""), where('id_region', 'in', ids));
                  q = getQueryDate(q);
              const snapshot = await getDocs(q);
              const t: BankTask[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankTask));
              console.log(t);
              setTasks(t);
            } catch (err) {
              console.error("Error fetching landlords:", err);
            }
    };

  const onSubmitTask = async (data: TaskForm) => {
    if (Number(data.montant_initial) > Number(data.montant_total)){
      setAlert("danger");
      setMessage( 'Montant versé doit être inférieur ou egal au montant total' );
      return;
    }
    try {
      setSubmitting(true);
      const contrat = {
        createdBy: userId,
        createdAt: new Date(),
        completed:false,
        completedAt: null,
        validated: false,
        validatedAt: null,
        ...data,
      } ;
      const docRef = await addDoc(contractsDoc, contrat);
     
      updateTaskState(docRef.id);
      await updateDoc(docRef, { id: docRef.id });
      setAlert("success");
      setMessage( 'Contrat crée avec succes' );
      reset();
      fetchTasks();
    } catch (err) {
      console.error(err);
      setAlert("danger");
      setMessage("Error adding landlord");
    } finally {
      setSubmitting(false);
    }
  };


  const updateTaskState = async (taskId: string) => {
      await Promise.all(
        selectedtasks.map(async (task: BankTask) => {
          const taskRef = doc(taskCollection, task.id);
          await updateDoc(taskRef, { 
            contratId: taskId,
            state: 'in-progress'
          } as Partial<BankTask>);
          setSelectedTasks([]);
          fetchTasks();
         })
            );
  };



  const handleAdd = async (task: BankTask) => {
    setSelectedTasks((prev) => [...prev, task]);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const handleRemove = async (task: BankTask) => {
    setSelectedTasks((prev) => prev.filter((t) => t.id !== task.id));
    setTasks((prev) => [...prev, task]);
  };


  useEffect(() => {
    fetchLandlords();
    fetchTasks();
  }, []);

  return (
    <>
     {message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}
     <div className="grid grid-cols-2 md:grid-cols-2 gap-6 w-full rounded p-4 ">
      {/* Left - Form */}
      <div className=" bg-gray-50 dark:bg-gray-700 rounded p-4 shadow" >
        <form onSubmit={handleSubmit(onSubmitTask)}>
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="Assignee" invalid={!!errors.assignee} errorMessage={errors.assignee?.message}>
              <Controller name="assignee" control={control} render={({ field }) =>
                <Select
                  placeholder="Select assignee"
                  options={landlordsOptions}
                  onChange={(option) => field.onChange(option?.value)}
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

            <FormItem label="Start Date" invalid={!!errors.startDate} errorMessage={errors.startDate?.message}>
              <Controller name="startDate" control={control} render={({ field }) =>
                <DatePicker
                  placeholder="Choose start date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                />
              } />
            </FormItem>

            <FormItem label="End Date" invalid={!!errors.endDate} errorMessage={errors.endDate?.message}>
              <Controller name="endDate" control={control} render={({ field }) =>
                <DatePicker
                  placeholder="Choose end date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                />
              } />
            </FormItem>

            <FormItem label="Description" invalid={!!errors.description} errorMessage={errors.description?.message}>
              <Controller name="description" control={control} render={({ field }) =>
                <Input {...field} />
              } />
            </FormItem>
          </div>
          <div className="mt-6">
            <Button title={selectedtasks.length==0 ? 'Selectionner au moins une bank' : 'Ajouter une bank'} type="submit" variant="solid" disabled={selectedtasks.length==0} loading={isSubmitting}>
              {t('common.add') || 'Submit'}
            </Button>
          </div>
        </form>
      </div>

      {/* Right - Task List */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6 w-full  p-4 ">
       

             {/* Right - Task List */}
             <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow" >
                <div className="flex justify-between items-center mb-4">
                  <h6 className="text-md font-bold">📋 Travaux Sélectionés</h6>
                </div>

                {/* Task List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {selectedtasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-2 rounded-lg shadow border flex justify-between items-center"
                      >
                        {/* Task content */}
                        <div className="flex-1">
                          <div className="mb-1">
                            <p className="font-semibold">{t('bank.' + task.taskName)}</p>
                            <p className="text-xs text-gray-500">
                              Bank: <BankName id={task.bankId} />
                            </p>
                          </div>
                          <p className="text-sm mb-1">{task.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatRelative(
                              task.createdAt.toDate?.() || task.createdAt,
                              new Date(),
                              { locale: fr }
                            )}
                          </p>
                        </div>

                        {/* Plus Button */}
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleRemove(task)} // Replace with your actual handler
                          className="ml-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                          title="Add"
                        >
                          -
                        </button>
                      </div>
                    ))}
                </div>
             </div>

    
            <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
              <div className="flex justify-between items-center mb-4">
                  <h6 className="text-md font-bold">📋 Travaux Disponibles</h6>
              </div>
                {/* Task List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-2 rounded-lg shadow border flex justify-between items-center"
                      >
                        {/* Task content */}
                        <div className="flex-1">
                          <div className="mb-1">
                            <p className="font-semibold">{t('bank.' + task.taskName)}</p>
                            <p className="text-xs text-gray-500">
                              Bank: <BankName id={task.bankId} />
                            </p>
                          </div>
                          <p className="text-sm mb-1">{task.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatRelative(
                              task.createdAt.toDate?.() || task.createdAt,
                              new Date(),
                              { locale: fr }
                            )}
                          </p>
                        </div>

                        {/* Plus Button */}
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleAdd(task)} // Replace with your actual handler
                          className="ml-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                          title="Add"
                        >
                          +
                        </button>
                      </div>
                    ))}
                </div>
            </div>
      </div>
     </div>
    </>
   
  );
}

export default TaskManagerPopup;
