import TableBank from "./components/TableBank";

export const ShowBankBase= () => {
  return (
    <div>
       <h4>Mes Banks</h4>
       <TableBank />
    </div>
  );
}


const ShowBank = () => {
    return <ShowBankBase />
}

export default ShowBank;