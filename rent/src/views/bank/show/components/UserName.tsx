 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LandlordDoc } from "@/services/Landlord";
import { getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";



interface ImageGalleryProps {
  userId: string;
}

const UserName: React.FC<ImageGalleryProps> = ({ userId }) => {
const [lord, setLord] = useState() as any;
     const getLandlordByUserId = async (userId: string) => {
        const q = query(LandlordDoc, where('id_user', '==', userId));
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
      { lord &&  <i className=" font-semibold ">{ lord.fullName }</i>}
    </>
  );
};

export default UserName;
