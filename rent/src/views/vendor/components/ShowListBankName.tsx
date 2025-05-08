import React, { useEffect, useState } from "react";
import { getFirestore,  getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { getBankDoc } from "@/services/Landlord";

interface ShowListBankNameProps {
  bankIds: string[];
  link?: boolean;
}

interface Bank {
  id: string;
  bankName: string;
}

const ShowListBankName: React.FC<ShowListBankNameProps> = ({ bankIds , link = true }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchBanks = async () => {
      const promises = bankIds.map(async (id) => {
        const docRef = getBankDoc(id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { id, bankName: snap.data().bankName } as Bank;
        }
        return null;
      });

      const results = await Promise.all(promises);
      setBanks(results.filter((b): b is Bank => b !== null)); // filter out nulls
    };

    if (bankIds.length > 0) {
      fetchBanks();
    }
  }, [bankIds, db]);

  if (banks.length === 0) {
    return <p className="text-gray-500 italic">No banks found</p>;
  }

  return (
  <ul className={link ? 'list-decimal pl-5' : 'grid grid-cols-3 gap-2 list-decimal pl-5'}>
  {banks.map((bank) => (
    <li key={bank.id}>
      {link ? (
        <Link
          to={`/bank/${bank.id}`}
          className="text-blue-600 hover:underline"
        >
          {bank.bankName}
        </Link>
      ) : (
        bank.bankName
      )}
    </li>
  ))}
</ul>

  );
};

export default ShowListBankName;
