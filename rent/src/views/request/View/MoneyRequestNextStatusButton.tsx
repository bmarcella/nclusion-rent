/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { getNextNode } from "../entities/AuthRequest";
import { IRequest } from "../entities/IRequest";
import { Button, Card } from "@/components/ui";
import StatusPopup from "./StatusPopup";


interface Props {
  request: IRequest;
  onNextStatus: (nextStatus: string, step: boolean) => void | Promise<void>;
}

export default function MoneyRequestNextStatusButton({
  request,
  onNextStatus,
}: Props) {
  const currentStatus = (request as any)?.status ?? (request as any)?.state ?? "";

  const { t } = useTranslation();
  // Compute next step (if any)
  const nextStep = getNextNode(currentStatus, t)

   const handleClick = async () => {
    if (!nextStep) return;
    await onNextStatus(nextStep.value, true);
   };

   
   const yes  = async  (data: string) => {
     await onNextStatus(data, false);       
   }
  return (
    <Card className="grid grid-cols-1 gap-4"> 
      {nextStep ? (<>
          {  <StatusPopup Ok={yes} id={"rejected"} title={"Voulez-vous vraiment rejetter ceci ?"} btnText = {"Rejetté"} ></StatusPopup> }
          { <StatusPopup Ok={yes} id={"canceled"} title={"Voulez-vous vraiment annuller ceci ?"} btnText = {"Annullé"} ></StatusPopup> }
            <Button variant="solid" className="ml-2 mr-2 col-end-1 col-span-2"  onClick={handleClick}>
                Approuvé
            </Button>  
      </>
      ) : (
        <div className="text-xs text-muted-foreground">
          This request is already at the final step.
        </div>
      )}
      
    </Card>
  );
}
