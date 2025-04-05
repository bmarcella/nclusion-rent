import { BankStep } from "@/views/Entity";
import TableBank from "./components/TableBank";

export const ShowNeedApprovalBankBase= () => {
  return (
    <div>
       <h4>{"Banks besoin d'approbations"}</h4>
       <TableBank step={ 'NEED_APPROVAL' as BankStep}/>
    </div>
  );
}


const ShowNeedApprovalBank = () => {
    return <ShowNeedApprovalBankBase />
}

export default ShowNeedApprovalBank;