import { manageAuth } from "@/constants/roles.constant";
import { AuthRequestDoc } from "@/services/Landlord";
import { useSessionUser } from "@/store/authStore";
import { query, where, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthRequest, RequestTypeEnum } from "../request/entities/AuthRequest";
import { IRequest } from "../request/entities/IRequest";
import { Button } from "@/components/ui";

interface Props {
    data: IRequest
}

const ProcessNewMail = ({ data }: Props) => {
    const { userId, proprio, authority } = useSessionUser((state) => state.user);
    const [request, setRequest] = useState<IRequest>(data);
    const [rules, setRules] = useState<AuthRequest[] | undefined>([]) as any;
    const [loadingRules, seLoadingRules] = useState<boolean>(false);
    const { t } = useTranslation();

    useEffect(() => {
        let canceled = false;
        const run = async () => {
            await fetchRule();
            if (canceled) return;
        }
        run();
        return () => {
            canceled = true;
        };
    }, [request.requestType, request.status]);


    const fetchRule = async () => {
        if (!proprio?.type_person) return; // avoid undefined in query
        seLoadingRules(true);
        const role = authority![0];
        const { regions } = await manageAuth(authority![0], proprio, t);
        const reg = regions.map((r) => r.id);
        const q = (role == 'admin') ? query(
            AuthRequestDoc,
            where("status", "==", request.status),
            where("roles", "array-contains", role),
        ) : query(
            AuthRequestDoc,
            where("status", "==", request.status),
            where("region_id", "in", reg),
            where("roles", "array-contains", role),
        )
        const snapshot = await getDocs(q);
        seLoadingRules(false);
        const objs = snapshot.docs
            .map((docSnap) => {
                const data = docSnap.data() as any;
                return { id: docSnap.id, ...data };
            })
            .filter((rule) =>
                Array.isArray(rule.reqType)
                    ? rule.reqType.includes(request.requestType as RequestTypeEnum)
                    : false
            );
        setRules(objs);
    };

    return (<>
        <Button onClick={() => {

        }}>

        </Button>
    </>)

}

export default ProcessNewMail;