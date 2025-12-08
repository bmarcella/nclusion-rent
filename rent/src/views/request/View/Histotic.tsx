/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, type AvatarProps } from '@/components/ui/Avatar'
import Timeline from '@/components/ui/Timeline';
import { IRequest } from "../entities/IRequest"
import { statusColorClassMap } from "../entities/statusColorClassMap";
import UserName from "@/views/bank/show/components/UserName";
import { Badge } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { formatRelative } from 'date-fns/formatRelative';
import { fr } from 'date-fns/locale';
type TimelineAvatarProps = AvatarProps;
const TimelineAvatar = ({ children, ...rest }: TimelineAvatarProps) => {
    return (
        <Avatar {...rest} size={25} shape="circle">
            {children}
        </Avatar>
    )
}
interface Props {
    data : IRequest
} 

function HistoticView({ data } : Props) {
   const { t } = useTranslation();
   const getColor = (step: string )=> {
          const key = step.replace("bankSteps.", "");
            const color = statusColorClassMap[key] || {
              bg: "bg-gray-50",
              text: "text-gray-600",
              ring: "ring-gray-500/10",
            };
           return  `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset  mb-2 ${color.bg} ${color.text} ${color.ring}`
      }  
  return (
    <>
     <Timeline className='mt-4'>
                   { data.historicApproval.length>0 && data.historicApproval.map((step: any, index)=>{
                    return (
                        <Timeline.Item key={index} className="mb-4" media = {
                        <TimelineAvatar className="bg-amber-500">
                           { step.by_who && <UserName userId={step.by_who } sub_str={0} /> }
                        </TimelineAvatar>
                        }>
                            <p className="my-1 flex ">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                       { step.by_who && <UserName userId={step.by_who }  /> }
                                    </span>
                                    <span className="mx-2"> a changé le statut  { step?.status_from && <> de <Badge className={getColor(step?.status_to)} >
                                    {t('bank.'+step.status_from)}
                                    </Badge> </>} en </span>
                                    <Badge className={getColor(step?.status_to)} >
                                    {t('bank.'+step.status_to)}
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
    </>
  )
}

export default HistoticView