 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LandlordDoc } from "@/services/Landlord";
import useTranslation from "@/utils/hooks/useTranslation";
import { getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";



interface ImageGalleryProps {
  userId: string,
  keyName? : string
  sub_str? : number
}

const UserName: React.FC<ImageGalleryProps> = ({ userId, keyName = "id_user", sub_str =-1 }) => {
const [lord, setLord] = useState() as any;
const { t } = useTranslation();
     const getLandlordByUserId = async (userId: string) => {
        const q = query(LandlordDoc, where(keyName, '==', userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          return { id: doc.id, ...doc.data() }; // return first match
        } else {
          return null; // No match found
        }
    };
     useEffect(() => {
        getLandlordByUserId(userId).then((lord: any) => {
                setLord(lord);
        });
        }, [userId]);
  return (
    <>
      { lord && sub_str==-1 && <i className=" font-semibold " title={t(lord.type_person)}>{ lord.fullName }</i>}
      { lord && sub_str==0 && <i className=" font-semibold " title={t(lord.type_person)} >{ lord.fullName.charAt(sub_str) }</i>}
    </>
  );
};

export default UserName;
