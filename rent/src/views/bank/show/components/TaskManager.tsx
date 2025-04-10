import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { useState } from "react";
import { BsPlus } from "react-icons/bs";
import TaskManagerPopup from "./TaskManagerPopup";




function TaskManager() {
  const [ynOpen, setYnOpen] = useState(false); 

  const openDialogYON = () => { 
      setYnOpen(true);
  }

  const onDialogCloseYON  = () => {
      setYnOpen(false);
  }
  const onOk = () => {

  }
  return (
    <div>
        
             <Button size="sm" className=" m-2 hover:text-blue-800 dark:hover:bg-blue-600 border-0 hover:ring-0"  icon={<BsPlus />} onClick={() => openDialogYON()}>
                          Ajouter contrat rénovation    
             </Button>         

          <Dialog
                isOpen={ynOpen}
                onClose={onDialogCloseYON}
                onRequestClose={onDialogCloseYON}
            >
                <h5 className="mb-4">Ajouter contrat vendeur</h5>
                
              <TaskManagerPopup></TaskManagerPopup>
            </Dialog>
    </div>
  )
}

export default TaskManager;
