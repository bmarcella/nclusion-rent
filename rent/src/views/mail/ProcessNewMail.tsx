/* eslint-disable @typescript-eslint/no-explicit-any */
import { manageAuth } from "@/constants/roles.constant";
import { AuthRequestDoc, Landlord, MailNotificationDoc } from "@/services/Landlord";
import { useSessionUser } from "@/store/authStore";
import {
  query,
  where,
  getDocs,
  CollectionReference,
  DocumentData,
  orderBy,
  Query,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthRequest, RequestTypeEnum } from "../request/entities/AuthRequest";
import { IRequest } from "../request/entities/IRequest";
import { Proprio } from "../Entity";
import { ApiSendMail } from "@/services/MailService";
import MailSender, { LocalBatchEmail, MailData, TypeEmail } from "./MailSender";
import { NewReqEmailTemplate } from "./template/NewRequest";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import Alert from "@/components/ui/Alert";
import { Spinner } from "@/components/ui";
import { ReqApprovedEmailTemplate } from "./template/ReqApprovedEmailTemplate ";
import { ReqPaidEmailTemplate } from "./template/ReqPaidEmailTemplate";
import { ReqRejectedEmailTemplate } from "./template/ReqRejectedEmailTemplate ";
import { ReqStatusChangeEmailTemplate } from "./template/ReqStatusChangeEmailTemplate ";

interface Props {
  type: TypeEmail;
}

interface StatusMapValue {
  label: string;
  subject: string;
  template: string;
}

export const STATUS_MAP = {
  new: { label: "New", subject: "Nouvelle Requête", template: NewReqEmailTemplate },
  approved: { label: "Approved", subject: "Requête Approuvée", template: ReqApprovedEmailTemplate },
  paid: { label: "Paid", subject: "Requête Payée", template: ReqPaidEmailTemplate },
  reject: { label: "Rejected", subject: "Requête Rejettée", template: ReqRejectedEmailTemplate },
  canceled: { label: "Canceled", subject: "Requête Annullée", template: ReqStatusChangeEmailTemplate },
  reminder: { label: "Canceled", subject: "Requête Annullée", template: ReqStatusChangeEmailTemplate },
} as const satisfies Record<Props["type"], StatusMapValue>;

type AlertType = "success" | "info" | "warning" | "error";

const ProcessNewMail = forwardRef<HTMLDivElement, Props>(({ type }, ref) => {
  const { proprio, authority } = useSessionUser((state) => state.user);
  const { t } = useTranslation();

  const [request, setRequest] = useState<IRequest>();

  const [loadingRules, setLoadingRules] = useState(false);

  const hasFetchedRef = useRef(false);
  const sendMail = useRef(false);

  const [message, setMessage] = useTimeOutMessage()
  const [alert, setAlert] = useState("success") as any;
  const [isSubmitting, setSubmitting] = useState(false);

  const init = (data: IRequest) => {
    console.log(data);
    if (data) {
      setRequest(data);
      fetchRule(data);
    } else {
      console.log('No request provided to started fetching rules');
    }
  }


  useImperativeHandle(ref, () => ({
    init
  }));

  const fetchRule = async (request: IRequest) => {

    if (!proprio?.type_person) return;
    if (!authority?.length) return;
    if (!request) return;

    const role = authority[0];
    setLoadingRules(true);
    try {
      const { regions } = await manageAuth(role, proprio, t);
      const regIds = (regions ?? []).map((r) => r.id).filter(Boolean);
      // Firestore: "in" cannot be empty
      const q =
        role === "admin"
          ? query(
            AuthRequestDoc,
            where("status", "==", request.status),
            where("roles", "array-contains", role)
          )
          : regIds.length
            ? query(
              AuthRequestDoc,
              where("status", "==", request.status),
              where("region_id", "in", regIds),
              where("roles", "array-contains", role)
            )
            : null;

      if (!q) return;

      const snapshot = await getDocs(q);

      const objs = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as any) }))
        .filter((rule) =>
          Array.isArray(rule.reqType)
            ? rule.reqType.includes(request.requestType as RequestTypeEnum)
            : false
        ) as AuthRequest[];

      const regionSet = new Set<number>();
      const roleSet = new Set<string>();

      for (const r of objs) {
        if (typeof r.region_id === "number") regionSet.add(r.region_id);
        (r.roles ?? []).forEach((ro) => roleSet.add(ro));
      }

      const nsregions = [...regionSet];
      const nroles = [...roleSet];

      const landlords = await fetchProprio(nsregions, nroles);
      console.log("Fetched landlords for mail:", landlords);

      if (sendMail.current) return; // prevent duplicates
      sendMail.current = true;

      sendMailNotificationToApi({
        type,
        request,
        landlords,
        proprio,
      });

    } finally {
      setLoadingRules(false);
      sendMail.current = false;
    }
  };

  const sendMailNotificationToApi = async (payload: MailData) => {
    try {
      const meta = STATUS_MAP[type];
      const sender = new MailSender(meta.subject, meta.template);
      const res = sender.addData(payload);
      sendMailToApi(res.batches);
      saveEmailNotification(res.batches, payload.request, type);
    } catch (error) {
      console.log(error);
    }

  };

  const saveEmailNotification = async (res: LocalBatchEmail, req: IRequest, type: string) => {
    try {
      const batch = { ...res, createdBy: proprio?.id_user, id_request: req.id, createdAt: new Date(), type }
      const docRef = await addDoc(MailNotificationDoc, batch);
      await updateDoc(docRef, { id: docRef.id });
    } catch (error) {
      console.log(error);
    }
  }

  const sendMailToApi = async (res: LocalBatchEmail) => {
    try {
      ApiSendMail(res).then((apiRes) => {
        console.log("Mail sent successfully:", apiRes);
        setMessage("Requête enregistrée avec succes");
        setAlert("success")
        setTimeout(() => setSubmitting(false), 1000);
      }).catch((error) => {
        console.error("Error sending mail:", error);
      });
    } catch (error) {
      console.log(error);
    }
  };



  const fetchProprio = async (sregion: number[], roles: string[]) => {
    try {
      // Firestore: "array-contains-any" and "in" cannot be empty
      if (!sregion.length || !roles.length) return [];

      const baseQuery: Query<DocumentData> = Landlord as CollectionReference<DocumentData>;
      const q = query(
        baseQuery,
        orderBy("fullName"),
        where("regions", "array-contains-any", sregion),
        where("type_person", "in", roles)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Proprio[];
    } catch (error) {
      console.error("Error fetching landlords:", error);
      return [];
    }
  };

  return (
    <div ref={ref} >
      {loadingRules && <div className="flex justify-center mt-2">
        <Spinner />
      </div>}

      {message && (
        <Alert showIcon className="mb-2 mt-2" type={alert}>
          <span className="break-all">{message}</span>
        </Alert>
      )}
    </div>
  );
});

ProcessNewMail.displayName = "ProcessNewMail";
export default ProcessNewMail;
