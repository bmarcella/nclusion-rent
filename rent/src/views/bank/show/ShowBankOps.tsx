import TableBank from "./components/TableBank";

export const ShowBankOpsBase= () => {
  return (
    <div>
       <h4>Banks Operationelles</h4>
       <TableBank  isAgent={true} />
    </div>
  );
}


const ShowBankOps = () => {
    return <ShowBankOpsBase />
}

export default ShowBankOps;