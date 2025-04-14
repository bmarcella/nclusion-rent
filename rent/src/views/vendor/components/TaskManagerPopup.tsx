/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Select, DatePicker, Input, Button } from '@/components/ui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { addDoc, getDocs, updateDoc, doc, where, orderBy, query, DocumentData, Query, QueryConstraint, startAfter, Timestamp } from 'firebase/firestore';
import {  useEffect, useState } from 'react';
import { Landlord, taskCollection } from '@/services/Landlord';
import { useSessionUser } from '@/store/authStore';
import { getRegionIds } from '@/views/Entity/Regions';
import { BankTask, Proprio } from '@/views/Entity';
import { convertToSelectOptions } from '../../bank/add/components/InfoBank';
import { formatRelative } from 'date-fns/formatRelative';
import { fr } from 'date-fns/locale';
import BankName from '@/views/bank/show/components/BankName';


const schema = z.object({
  taskName: z.string().min(1, 'Required'),
  assignee: z.string().min(1, 'Required'),
  montant_total: z.number().min(1, 'Required'),
  montant_initial: z.number().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  state: z.enum(['pending', 'in-progress', 'completed']),
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
      taskName: '',
      assignee: '',
      description: '',
      startDate: '',
      endDate: '',
      state: 'pending',
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
    try {
      setSubmitting(true);
      const docRef = await addDoc(taskCollection, data);
      await updateDoc(docRef, { id: docRef.id });
      reset();
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateTaskState = async (id: string, state: TaskForm['state']) => {
    const taskRef = doc(taskCollection, id);
    await updateDoc(taskRef, { state });
    fetchTasks();
  };

  const handleAdd = async (task: BankTask) => {
    setSelectedTasks((prev) => [...prev, task]);
  };

  const handleRemove = async (task: BankTask) => {
    setSelectedTasks((prev) => prev.filter((t) => t.id !== task.id));
  };


  useEffect(() => {
    fetchLandlords();
    fetchTasks();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-6 w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
      {/* Left - Form */}
      <div>
        <form onSubmit={handleSubmit(onSubmitTask)}>
          <div className="grid grid-cols-2 gap-4">
  

            <FormItem label="Assignee" invalid={!!errors.assignee} errorMessage={errors.assignee?.message}>
              <Controller name="assignee" control={control} render={({ field }) =>
                <Select
                  placeholder="Select assignee"
                  options={landlordsOptions}
                  value={field.value ? { value: field.value, label: field.value } : null}
                  onChange={(option) => field.onChange(option?.value)}
                />
              } />
            </FormItem>

            <FormItem label="Montant Total" invalid={!!errors.montant_total} errorMessage={errors.montant_total?.message}>
              <Controller name="montant_total" control={control} render={({ field }) =>
                <Input
              {...field}
              placeholder="Montant total"
             
            />
              } />
            </FormItem>

            <FormItem label="Montant versé" invalid={!!errors.montant_initial} errorMessage={errors.montant_initial?.message}>
              <Controller name="montant_initial" control={control} render={({ field }) =>
                <Input
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
            <Button type="submit" variant="solid" loading={isSubmitting}>
              {t('common.add') || 'Submit'}
            </Button>
          </div>
        </form>
      </div>

      {/* Right - Task List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">📋 Travaux Disponibles</h3>

        </div>

     {/* Task List */}
     <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-4 rounded-lg shadow border flex justify-between items-center"
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
  );
}

export default TaskManagerPopup;
