
import BankForm from "./components/BankForm";

export const  AddBankBase = () => {
    return (
      <>
       <h4 className="mb-4">Ajouter Bank</h4>
       <BankForm />
      </>
    )
  }
  
  const AddBank = () => {
      return <AddBankBase />
  }
  
  export default AddBank;