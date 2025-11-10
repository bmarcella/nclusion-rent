
import { Request } from "./components/forms/Request";

export function ViewAddRequestBase() {
  return (
    <div>
      <Request />
    </div>
  )
}

const ViewAddRequest = () => {
  return <ViewAddRequestBase />;
}

export default ViewAddRequest
