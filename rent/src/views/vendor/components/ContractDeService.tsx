import React, { useRef, useState } from "react";
import ShowListBankName from "./ShowListBankName";
import useTranslation from "@/utils/hooks/useTranslation";
import { Proprio, RenovContract } from "@/views/Entity";
import { getRegionsById } from "@/views/Entity/Regions";
import n2words from 'n2words';
import { useReactToPrint } from "react-to-print";
import Currency from "@/views/shared/Currency";
import Button from "@/components/ui/Button";
import { BiPrinter } from "react-icons/bi";
interface ContractDeServiceProps {
  contract: RenovContract;
  employee: Proprio;
  proprio: Proprio;
}

function getMonthDiff(startDate: Date, endDate: Date): number {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  const totalMonths = years * 12 + months;

  // Si endDate a un jour supérieur à startDate, on compte le mois courant aussi
  if (endDate.getDate() >= startDate.getDate()) {
    return totalMonths + 1;
  }
  return totalMonths;
}

const formatCurrency = (amount: number) =>
  amount.toLocaleString("fr-HT", {
    style: "currency",
    currency: "HTG",
    minimumFractionDigits: 2,
  });

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("fr-CA");

const ContractDeService: React.FC<ContractDeServiceProps> = ({
  contract,
  employee,
  proprio,
}) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const total = contract?.montant_total;
  const unit = contract.banksId.length > 0 ? total / contract.banksId.length : 0;
  const dure = getMonthDiff(new Date(contract.startDate), new Date(contract.endDate));
  const [pdf, setPdf] = useState(false);

  const print = async () => {
    setPdf(true);
    setTimeout(async () => {
      await reactToPrintFn();
      setPdf(false);
    }, 2000);
  }
  return (

    <>
      <div className="w-full flex justify-end"  >

        <Button loading={pdf} variant="solid" className=" ml-4" icon={<BiPrinter />} onClick={() => {
          print()
        }}>
        </Button>
      </div>
      <div className="max-w-4xl mx-auto bg-white p-8  rounded text-sm leading-relaxed " ref={contentRef}>
        <h1 className="text-center text-lg font-bold mb-6">CONTRAT DE SERVICE</h1>

        <p>
          Entre les soussignés :
          <br />
          <strong>NYLC S.A.</strong>, Société anonyme constituée en vertu des lois haïtiennes, ayant son siège
          Social au no. 11, rue Ogé, Pétion-Ville, Ouest, Haïti, Imposée et patentée respectivement aux Nos :
          000-099-239-4 ; 2107152125, représentées aux fins des présentes par Monsieur <strong>{proprio?.fullName}</strong>,
          en sa qualité de {proprio?.type_person}, ci-après dénommé « L’Employeur », d’une part,
        </p>

        <p className="mt-2">
          Et <strong>{employee.fullName}</strong>, demeurant et domicilié(e) à <em>{employee.address}</em>,
          identifié(e) au NIF : <em>{employee.nif}</em>, ci-après désigné(e) par « L’Employé(e) », d’autre part.
        </p>

        <p className="mt-2 font-semibold">Il a été convenu ce qui suit :</p>

        <h3 className="text-base font-semibold mt-4 uppercase">ARTICLE I - OBJET</h3>
        <p className="mb-2">
          I.1 Le présent Contrat est un contrat de prestation de service ayant pour objet la mission de {' ' + t('bank.' + contract.renovStep)} pour les locaux de nos banques situées dans la zone métropolitaine notamment à :
        </p>

        <ShowListBankName bankIds={contract.banksId} link={false}></ShowListBankName>

        <h3 className="text-base font-semibold mt-2 uppercase">ARTICLE II - DURÉE</h3>
        <p>
          II.1 Le Contrat entre en vigueur en date du <strong>{formatDate(contract.startDate)}</strong>.
          <br />
          II.2 Le Contrat est conclu pour une durée de {(dure) ? n2words(dure, { lang: 'fr' }) : ''} ({dure}) mois de suivis après travaux à compter
          de la date de son entrée en vigueur. Sauf autre indication, cette durée contractuelle et tous les
          autres délais mentionnés dans le Contrat sont calculés en jours calendriers.
          <br />
          II.3 Le prestataire s'engage à réaliser la mission confiée dans les règles de l'art. Pour cela,
          il mobilisera tous les moyens nécessaires, tout en respectant la réglementation en vigueur.
          De son côté, le client doit fournir au prestataire toutes les informations utiles pour
          réaliser sa mission.
        </p>

        <h3 className="text-base font-semibold mt-2 uppercase">ARTICLE III – REMUNERATION ET MODALITÉS DE PAIEMENT</h3>
        <p>III.1 En contrepartie de la réalisation des prestations définies à l’Article premier ci-dessus, le client versera au prestataire :</p>
        <ol className="list-decimal ml-8 mt-2">
          <li>
            La somme forfaitaire de <strong>{<Currency amount={total}></Currency>}</strong>
            {contract.banksId.length > 1 && "(" + unit.toLocaleString() + " Gdes par local)"}, incluant l’achat de tous les outils nécessaires
            pour effectuer son travail.
          </li>
          {contract.transport && <li>
            La somme de <strong>{<Currency amount={contract.transport}></Currency>}</strong> pour les frais de transport.
          </li>}
        </ol>

        <p className="mt-2">
          Les sommes prévues ci-dessus en Gourdes seront payées sous forme de monnaie scripturale,
          Chèque, avant les prestations du prestataire.
        </p>

        <p className="mt-2">
          Fait à <strong>{getRegionsById(contract.regionsId[0]).label}</strong>, en date du <strong>{'..../..../.......'}</strong>, en double original.
        </p>

        <div className="flex justify-between mt-6">
          <div>
            <p className="font-semibold">{employee?.fullName}</p>
            <p className="text-sm">Signature du prestataire</p>
          </div>
          <div style={{ marginBottom: "25px" }}>
            <p className="font-semibold">{proprio?.fullName}</p>
            <p className="text-sm">Signature du client</p>
          </div>

        </div>
      </div>
    </>

  );
};

export default ContractDeService;
