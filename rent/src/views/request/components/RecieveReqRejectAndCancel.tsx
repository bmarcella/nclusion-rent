import ShowReq from './ShowReq'
export default function RecieveReqRejectAndCancel() {
  return (
    <ShowReq  forMe={true} transition={true} rejected={true} ></ShowReq> 
  )
}
