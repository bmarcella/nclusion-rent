
import { ViewAuthRequest } from "./ViewAuthRequest"
import { AddAuthRequest } from "./AddAuthRequest"

export const AuthRequest = () => {
   const newRuleAdd = ()=>{

    }
    return (<>
        <AddAuthRequest newRuleAdd={newRuleAdd}></AddAuthRequest>
        <ViewAuthRequest></ViewAuthRequest>
    </>)
}