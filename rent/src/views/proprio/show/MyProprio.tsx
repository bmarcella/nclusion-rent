import { useSessionUser } from "@/store/authStore";
import ShowProprio from "./ShowProprio";

  
  export function MyProprioBase() {
   const { userId } = useSessionUser((state) => state.user);
    return (<>
         { userId &&  <ShowProprio name="Mes Entités" isUser={userId || undefined}></ShowProprio> }
    </>);
  }
  
  const MyProprio = () => {
    return <MyProprioBase />;
  };
  
  export default MyProprio;
  