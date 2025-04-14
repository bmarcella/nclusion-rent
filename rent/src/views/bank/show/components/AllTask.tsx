/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Select } from '@/components/ui';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { getDocs, where, orderBy, query, updateDoc } from 'firebase/firestore';
import {  useEffect, useState } from 'react';
import { getBankTask, taskCollection } from '@/services/Landlord';
import { BankTask } from '@/views/Entity';



interface  Props {
  bankId: string;
  genTasks?: ()=> void;
}

function AllTask ( { bankId, genTasks }: Props) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
   const fetchTasks = async () => {
          try {
            setIsLoading(true);
            const q = query(taskCollection, orderBy("index", "asc"),   where("bankId", "==", bankId));
            const snapshot = await getDocs(q);
            const t: BankTask[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankTask));
            setIsLoading(false);
            setTasks(t);
          } catch (err) {
            setIsLoading(false);
            console.error("Error fetching landlords:", err);
          }
    };

  const updateTaskState = async (taskId: string, state: string) => {
    try {
      const taskRef = getBankTask(taskId);
      await   updateDoc(taskRef, { state });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, state } : task))
      );
    } catch (error) {
      console.error("Error updating task state:", error);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">

      {/* Right - Task List */}
      <div>

      { tasks.length>0 && ( <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <p className="font-semibold">{t('bank.'+task.taskName)}</p>
                  {/* <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p> */}
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
              { task.description &&  <p className="text-sm mb-1">{task.description}</p>}
          
            </div>
          ))}
        </div> ) }
        { tasks.length == 0 && !isLoading && (<div className="flex flex-col items-center justify-center h-full">
          <p className="text-center text-gray-500">No tasks available</p>
           <Button className='mt-6' loading={isLoading} variant="outline" onClick={async () => {
              setIsLoading(true);
              if(genTasks) await genTasks();
              setIsLoading(false);
              fetchTasks();
            }}>
              Générer les travaux 
           </Button>
          </div>)}
      </div>
    </div>
  );
}

export default AllTask;
