import RequestForm from "./components/RequestForm";


export function ViewAddRequestBase() {
  return (
    <div>
        <RequestForm/>
    </div>
  )
}

const ViewAddRequest = () =>{
 return <ViewAddRequestBase/>;
}

export default ViewAddRequest
