/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBankStepsHistory } from '@/services/firebase/BankService';
import { useEffect, useState } from 'react'
import { Avatar, type AvatarProps } from '@/components/ui/Avatar'
import Timeline from '@/components/ui/Timeline';
import { Badge } from '@/components/ui';
import { StepDecision } from '@/views/Entity';
import UserName from './UserName';
import useTranslation from '@/utils/hooks/useTranslation';
import { formatRelative } from 'date-fns/formatRelative';
import { fr } from 'date-fns/locale/fr';
import { stepColorClassMap } from './BankStep';
type TimelineAvatarProps = AvatarProps

const TimelineAvatar = ({ children, ...rest }: TimelineAvatarProps) => {
    return (
        <Avatar {...rest} size={25} shape="circle">
            {children}
        </Avatar>
    )
}

function StepHistory( { bankId } : any) {

    const [ steps, setSteps] = useState([]);
    const { t } = useTranslation();
    useEffect(() => {
        const fetchSteps = async () => {
          const  o = await getBankStepsHistory(bankId);
          setSteps(o);
        }
        fetchSteps()
    });
    const getColor = (step: string )=>{
        const key = step.replace("bankSteps.", "");
          const color = stepColorClassMap[key] || {
            bg: "bg-gray-50",
            text: "text-gray-600",
            ring: "ring-gray-500/10",
          };
         return  `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset  mb-2 ${color.bg} ${color.text} ${color.ring}`
    }
  return (
    <div>  
        <Timeline>
                   { steps.length>0 && steps.map((step: StepDecision)=>{
                    return (
                        <Timeline.Item key={step.id} className="mb-4" media = {
                        <TimelineAvatar className="bg-amber-500">
                           { step.createdBy && <UserName userId={step.createdBy } sub_str={0} /> }
                        </TimelineAvatar>
                        }>
                            <p className="my-1 flex ">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                       { step.createdBy && <UserName userId={step.createdBy }  /> }
                                    </span>
                                    <span className="mx-2"> a changé le statut en </span>
                                    <Badge className={getColor(step?.step)} >
                                    {t('bank.'+step.step)}
                                    </Badge>
                                    
                                    <span className="ml-3 rtl:mr-3">
                                    { (step.createdAt) ?
                                               formatRelative(
                                                  step.createdAt?.toDate?.() || step.createdAt,
                                                  new Date(),
                                                  { locale: fr }
                                                )
                                              : t("non_mentionne")}
                                    </span>
                                </p>
                        </Timeline.Item>
                    )
                   })}
               
               
               
     </Timeline>
                
    </div>
  )
}

export default StepHistory