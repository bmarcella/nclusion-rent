 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BankDoc } from "@/services/Landlord";
import { getDocs, query, where  } from "firebase/firestore";
import React, { useEffect, useState } from "react";



interface ImageGalleryProps {
  id: string,
}

const BankName: React.FC<ImageGalleryProps> = ({ id }) => {
const [lord, setLord] = useState() as any;
     const getLandlordByUserId = async () => {
        const q = query(BankDoc,  where('id', '==', id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          return { id: doc.id, bankName: doc.data().bankName }; // return first match
        } else {
          return null; // No match found
        }
    };
     useEffect(() => {
        getLandlordByUserId().then((lord: any) => {
                setLord(lord);
        });
        }, [id]);
  return (
    <>
      { lord && <i className=" font-semibold ">{ lord.bankName }</i> }
    </>
  );
};

export default BankName;
