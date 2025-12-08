import { useParams } from "react-router-dom";
import PrintRequest from "./View/PrintRequest";
import { useEffect, useState } from "react";
import { IRequest } from "./entities/IRequest";
import { getRequestById } from "@/services/firebase/BankService";

export function ShowPrintRequestBase() {
  const { reqId } = useParams();
  const [req, setReq] = useState<IRequest>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchReq = async () => {
      setLoading(true);
      const result = await getRequestById(reqId!);
      setReq(result);
      setLoading(false);
    };
    if (reqId) fetchReq();
  }, [reqId]);

  return (
    <>
      {req && <PrintRequest request={req} />}
    </>
  )
}

function ShowPrintRequest() {
  return <ShowPrintRequestBase />;
}

export default ShowPrintRequest;