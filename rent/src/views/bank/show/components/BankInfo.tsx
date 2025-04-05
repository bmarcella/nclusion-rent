import { Bank } from "@/views/Entity";
import React from "react";
import { useTranslation } from "react-i18next";
import UserName from "./UserName";

interface BankInfoProps {
  bank: Bank;
}

const BankInfo: React.FC<BankInfoProps> = ({ bank }) => {
  const { t } = useTranslation();
  if (!bank) return <h4 className="text-2xl font-bold mb-4 text-red"> Bank non trouvé </h4>;
  return (
    (<div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{bank.bankName}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>{t("bank.city")}: </strong>{bank.city}</p>
          <p><strong>{t("bank.addresse")}: </strong>{bank.addresse}</p>
          <p><strong>{t("bank.landlord")}: </strong>{bank.landlord}</p>
          <p><strong>{t("bank.reference")}: </strong>{bank.reference || t("none")}</p>
        </div>

        <div>
          <p><strong>{t("bank.createdBy")}: </strong><UserName userId={bank.createdBy} ></UserName></p>
          <p><strong>{t("bank.date")}: </strong>{bank.createdAt?.toString()}</p>
          <p><strong>{t("bank.rentCost")}: </strong>{bank.rentCost} HTG</p>
          <p><strong>{t("bank.urgency")}: </strong>{bank.urgency ? t("yes") : t("no")}</p>
        </div>
      </div>

      <hr className="my-4" />

      {bank.demoDetails && (
        <div>
          <h3 className="text-xl font-semibold mb-2">{t("bank.internetProviders.label")}</h3>
          <p><strong>{t("bank.internetProviders.label")}: </strong>{bank.demoDetails.internetService?.map((key) => t(`bank.internetProviders.${key.split('.')[1]}`)).join(", ")}</p>
          <p><strong>{t("bank.lotteryCompetitions.label")}: </strong>{t(`bank.lotteryCompetitions.${bank.demoDetails.lotteryCompetition?.split('.')[1]}`)}</p>
          <p><strong>{t("bank.bankEntrances.label")}: </strong>{bank.demoDetails.bankEntrance?.map((key) => t(`bank.bankEntrances.${key.split('.')[1]}`)).join(", ")}</p>
          <p><strong>{t("bank.populationInAreas.label")}: </strong>{t(`bank.populationInAreas.${bank.demoDetails.populationInArea?.split('.')[1]}`)}</p>
          <p><strong>{t("bank.expectedRevenue.label")}: </strong>{t(`bank.expectedRevenue.${bank.demoDetails.expectedRevenue?.split('.')[1]}`)}</p>
          <p><strong>{t("bank.buildingStabilities.label")}: </strong>{t(`bank.buildingStabilities.${bank.demoDetails.buildingStability?.split('.')[1]}`)}</p>
        </div>
      )}

      {bank.securityDetails && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">{t("bank.currentSecurities.label")}</h3>
          <p><strong>{t("bank.areaStabilities.label")}: </strong>{t(`bank.areaStabilities.${bank.securityDetails.areaStability?.split('.')[1]}`)}</p>
          <p><strong>{t("bank.openHours.label")}: </strong>{t(`bank.openHours.${bank.securityDetails.openHour?.split('.')[1]}`)}</p>
          <p><strong>{t("bank.closeHours.label")}: </strong>{t(`bank.closeHours.${bank.securityDetails.closeHour?.split('.')[1]}`)}</p>
          <p><strong>{t("bank.currentSecurities.label")}: </strong>{bank.securityDetails.currentSecurity?.map((key) => t(`bank.currentSecurities.${key.split('.')[1]}`)).join(", ")}</p>
        </div>
      )}

      {bank.renovationDetails && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">{t("bank.renovationDetails")}</h3>
          <p><strong>{t("bank.currentSecurities.label")}: </strong>{bank.renovationDetails.neededSecurity?.map((key) => t(`bank.currentSecurities.${key.split('.')[1]}`)).join(", ")}</p>
          <p><strong>{t("bank.majorRenovations.label")}: </strong>{bank.renovationDetails.majorRenovation?.map((key) => t(`bank.majorRenovations.${key.split('.')[1]}`)).join(", ")}</p>
          <p><strong>{t("bank.minorRenovations.label")}: </strong>{bank.renovationDetails.minorRenovation?.map((key) => t(`bank.minorRenovations.${key.split('.')[1]}`)).join(", ")}</p>
        </div>
      )}

      {bank.finalDecision && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">{t("bank.finalDecisionStatuses.label")}</h3>
          <p><strong>{t("bank.finalDecisionStatuses.label")}: </strong>{t(`bank.finalDecisionStatuses.${bank.finalDecision.status?.split('.')[1]}`)}</p>
          <p><strong>{t("bank.reason_why")}: </strong>{bank.finalDecision.reason_why}</p>
        </div>
      )}
    </div>)
  );
};

export default BankInfo;