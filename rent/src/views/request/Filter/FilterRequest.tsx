/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker } from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { manageAuth } from "@/constants/roles.constant";
import { Landlord } from "@/services/Landlord";
import { useSessionUser } from "@/store/authStore";
import useTranslation from "@/utils/hooks/useTranslation";
import { Proprio } from "@/views/Entity";
import { convertToSelectOptionsProprio, convertToSelectOptionsRegion, OptionType } from "@/views/report/components/FilterBankWeek";
import { Query, DocumentData, CollectionReference, query, where, getDocs, orderBy } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { requestStatusAll, requestType } from "../entities/AuthRequest";


export interface RequestFilter {
  reqType: string;
  status: string;
  date: {
    start: Date; // pick one; I usually recommend ISO string
    end: Date;
  };
  user: string;          // agent id or username
  regions: number | null;     // region ids/codes
  amount: {
    min: number;
    max: number;
  };
}

interface Props {
  onChange: (data: RequestFilter) => void;
  data: any
};

function FilterRequest({ onChange, data }: Props) {
  const { proprio, authority } = useSessionUser((state) => state.user);
  const { t } = useTranslation();
  const [regions, setRegions] = useState<OptionType[]>([]);
  const [agents, setAgents] = useState<OptionType[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<number | null>();
  const [selectedAgent, setSelectedAgent] = useState<string>() as any;
  const [selectedStatus, setSelectedStatus] = useState<string>() as any;
  const [selectedReqType, setSelectedReqType] = useState<string>() as any;
  const [start, setStart] = useState<Date>() as any;
  const [end, setEnd] = useState<Date>() as any;
  const [min, setMin] = useState<number>() as any;
  const [max, setMax] = useState<number>() as any;
  const statusesOptions = useMemo(() => {
    return [{ label: "All", value: undefined }, ...requestStatusAll(t)];
  }, [t]);

  const reqTypeOptions = useMemo(() => {
    return [{ label: "All", value: undefined }, ...requestType(t)];
  }, [t]);

  useEffect(() => {
    if (!authority?.length) return;
    const fetchData = async () => {
      const { regions } = await manageAuth(authority[0], proprio, t);
      const regs = convertToSelectOptionsRegion(regions) as any;
      regs.unshift({ label: 'All', value: undefined });
      setRegions(regs);
      await fetchProprio();
    };
    fetchData();
  }, [authority, proprio, t]);

  const fetchProprio = async () => {
    try {
      let q: Query<DocumentData>;
      const baseQuery: Query<DocumentData> = Landlord as CollectionReference<DocumentData>;
      q = query(baseQuery, orderBy('fullName'), where('type_person', '==', 'agent_immobilier'));

      if (selectedRegions != 0 && selectedRegions != undefined) {
        q = query(baseQuery, where('regions', 'array-contains', selectedRegions), orderBy('fullName'), where('type_person', '==', 'agent_immobilier'));
        console.log('regions:', selectedRegions);
      }
      const snapshot = await getDocs(q);
      const landlords: Proprio[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Proprio[];
      const a = convertToSelectOptionsProprio(landlords) as any;
      a.unshift({ label: 'All', value: undefined });
      setAgents(a);
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  };
  useEffect(() => {
    onChange({
      reqType: selectedReqType,
      status: selectedStatus,
      date: {
        start,
        end
      },
      user: selectedAgent,
      regions: selectedRegions!,
      amount: {
        min,
        max
      }
    });
  }, [start, end, selectedAgent, selectedRegions, selectedStatus, selectedReqType, min, max]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
        {reqTypeOptions.length > 1 && (
          <Select
            placeholder="Type de requête"
            options={reqTypeOptions}
            onChange={(options: OptionType) => {
              if (!options) {
                setSelectedReqType(undefined)
                return;
              }
              setSelectedReqType(options.value);
            }}
          />
        )}

        {!data?.status && statusesOptions.length != 0 && (
          <Select
            placeholder="Status"
            options={statusesOptions}
            onChange={(options: OptionType) => {
              if (!options) {
                setSelectedStatus(undefined)
                return;
              }
              setSelectedStatus(options.value);
            }}
          />
        )}
        {regions.length > 1 && (
          <Select
            placeholder="Region"
            options={regions}
            onChange={(options: OptionType) => {
              setSelectedAgent(undefined)
              if (!options) {
                setSelectedRegions(null);
                return;
              }
              setSelectedRegions(options.value as number);
            }}
          />
        )}
        {!data.sentByMe && (agents.length > 0) && (
          <Select
            placeholder="Employé"
            options={agents}
            onChange={(options: OptionType) => {
              if (!options || options.value == undefined) {
                setSelectedAgent(undefined);
                return;
              }
              setSelectedAgent(options.value);
            }}
          />
        )}

        <DatePicker placeholder="Date debut" onChange={(date) => {
          setStart(undefined);
          if (!date) {
            setStart(undefined);
            return;
          }
          setStart(new Date(date));
        }} />

        <DatePicker placeholder="Date fin" onChange={(date) => {
          setEnd(undefined);
          if (!date) {
            setEnd(undefined);
            return;
          }
          setEnd(new Date(date));
        }} />

        <Input placeholder="Montant Min " onChange={(date) => {
          setMin(undefined);
          if (!date) {
            setMin(undefined);
            return;
          }
          setMin(Number(date.target.value));
        }} />

        <Input placeholder="Montant Max" onChange={(date) => {
          setMax(undefined);
          if (!date) {
            setMax(undefined);
            return;
          }
          setMax(Number(date.target.value));
        }} />
      </div>

    </>
  )
}

export default FilterRequest

