/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Select, DatePicker, Input, Button } from '@/components/ui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import {  useState } from 'react';
import { taskCollection } from '@/services/Landlord';

const predefinedTasks = ['Construction', 'Comptoire', 'Penture'];
const assignees = ['Alice', 'Bob', 'Charlie', 'Dana'];

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



function TaskManager() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | TaskForm['state']>('all');
  const [isSubmitting, setSubmitting] = useState(false);

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

  const fetchTasks = async () => {
    const snapshot = await getDocs(taskCollection);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTasks(list);
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

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((task) => task.state === filter);
  const completedTasks = tasks.filter((task) => task.state === 'completed').length;
  const allDone = tasks.length > 0 && completedTasks === tasks.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
      {/* Left - Form */}
      <div>
        <form onSubmit={handleSubmit(onSubmitTask)}>
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="Task Name" invalid={!!errors.taskName} errorMessage={errors.taskName?.message}>
              <Controller name="taskName" control={control} render={({ field }) =>
                <Select
                  placeholder="Select a task"
                  options={predefinedTasks.map((item) => ({ value: item, label: item }))}
                  value={field.value ? { value: field.value, label: field.value } : null}
                  onChange={(option) => field.onChange(option?.value)}
                />
              } />
            </FormItem>

            <FormItem label="Assignee" invalid={!!errors.assignee} errorMessage={errors.assignee?.message}>
              <Controller name="assignee" control={control} render={({ field }) =>
                <Select
                  placeholder="Select assignee"
                  options={assignees.map((item) => ({ value: item, label: item }))}
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

            <FormItem label="Status" invalid={!!errors.state} errorMessage={errors.state?.message}>
              <Controller name="state" control={control} render={({ field }) =>
                <Select
                  placeholder="Select status"
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                  value={{ value: field.value, label: field.value.replace('-', ' ') }}
                  onChange={(option) => field.onChange(option?.value)}
                />
              } />
            </FormItem>
          </div>

          <div className="mt-6">
            <Button type="submit" variant="solid" loading={isSubmitting}>
              {t('common.submit') || 'Submit'}
            </Button>
          </div>
        </form>
      </div>

      {/* Right - Task List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">📋 Tasks</h3>
          <Select
            options={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={{ value: filter, label: filter.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) }}
            onChange={(val) => setFilter(val?.value || 'all')}
          />
        </div>

        <div className="text-sm text-gray-700 mb-2">
          {completedTasks} of {tasks.length} completed
          {allDone && <p className="text-green-500 font-medium">✅ All tasks are done!</p>}
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <p className="font-semibold">{task.taskName}</p>
                  <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
                </div>
                <Select
                  className="w-[140px]"
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                  value={{ value: task.state, label: task.state.replace('-', ' ') }}
                  onChange={(val) => updateTaskState(task.id, val?.value)}
                />
              </div>
              <p className="text-sm mb-1">{task.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(task.startDate).toLocaleDateString()} → {new Date(task.endDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TaskManager;
