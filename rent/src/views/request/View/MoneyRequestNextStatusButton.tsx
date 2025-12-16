/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { AuthRequest, getNextNodeV2 } from "../entities/AuthRequest";
import { IRequest } from "../entities/IRequest";
import { Button, Card, Input } from "@/components/ui";
import StatusPopup from "./StatusPopup";
import { useState } from "react";


interface Props {
  request: IRequest;
  onNextStatus: (nextStatus: string, step: boolean, prevStatus: string, comment?: string) => void | Promise<void>;
  rules:  AuthRequest [],
  action : boolean
}

export default function MoneyRequestNextStatusButton({
  request,
  onNextStatus,
  rules,
  action
}: Props) {
  const currentStatus = String(request.status!);
  const { t } = useTranslation();
  const nextStep = getNextNodeV2(currentStatus as any, t, request?.general?.approvalFlow);
  const [comment, setComment] = useState<string>();
  const [canClick, setCanClick] = useState<boolean>(true);
  const handleClick = async () => {
    if (!nextStep) return;
    setCanClick(false);
    await onNextStatus(nextStep.value, true, currentStatus, comment);
  };
  
  const yes  = async  (data: string) => {
     setCanClick(false);
     await onNextStatus(data, false, currentStatus, comment);       
  }

  return ( <>
      {(rules.length > 0 && rules[0]?.max_amount >= request.amount || action ) && 
        <Card className="grid grid-cols-1 gap-4"> 
            <div className="w-full">
              <div>
                <Input textArea placeholder="Entrer le commentaire ici" onChange={(e)=>{
                    const v = String(e.target.value);
                    setComment(v);
                }}></Input>
              </div>
          </div>
          { nextStep && canClick ? (<>
            {  (request.status != "approved") &&  <StatusPopup Ok={yes} id={"rejected"} title={"Voulez-vous vraiment rejetter ceci ?"} btnText = {"Rejetté"} ></StatusPopup> }
            {  (request.status == "approved") &&  <StatusPopup Ok={yes} id={"cancelled"} title={"Voulez-vous vraiment annuller ceci ?"} btnText = {"Annullé"} ></StatusPopup> }
            {  <Button variant="solid" className="ml-2 mr-2 col-end-1 col-span-2"  onClick={handleClick}>
                  { (request.status != "approved") ?  "Approuvé" : "Livré" }
              </Button> }
        </>
        ) : (
             (<div className="text-xs text-muted-foreground">
               { (canClick )? "This request is already at the final step." : "Processing, please wait..." }
             </div>)
        )}
        </Card> 
      }
  </>
 
  );
}
