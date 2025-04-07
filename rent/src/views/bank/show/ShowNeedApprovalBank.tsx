import { BankStep } from "@/views/Entity";
import TableBank from "./components/TableBank";

export const ShowNeedApprovalBankBase= () => {
  return (
    <div>
       <h4>{"Banks besoin de validations "}</h4>
       <TableBank step={ 'bankSteps.needApproval' as BankStep}/>
    </div>
  );
}


const ShowNeedApprovalBank = () => {
    return <ShowNeedApprovalBankBase />
}

export default ShowNeedApprovalBank;