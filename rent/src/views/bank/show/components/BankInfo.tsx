import React from "react";
import { Bank } from "@/views/Entity";
import { useTranslation } from "react-i18next";
import UserName from "./UserName";
import { formatRelative } from "date-fns/formatRelative";
import { fr } from "date-fns/locale/fr";
import {
  FaUniversity,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaShieldAlt,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import Badge from "@/components/ui/Badge";
import StepHistory from "./StepHistory";

interface BankInfoProps {
  bank: Bank;
}

const BankInfo: React.FC<BankInfoProps> = ({ bank }) => {
  const { t } = useTranslation();

  if (!bank) {
    return (
      <h4 className="text-2xl font-bold mb-4 text-red-600 flex items-center gap-2">
        <FaExclamationCircle />
        {t("bank_not_found") || "Banque non trouvée"}
      </h4>
    );
  }

  const getText = (value?: string | number | null) =>
    value ?? t("non_mentionne");

  const renderTranslatedArray = (array?: string[], prefix?: string) =>
    array?.length
      ? array.map((key) => t(`${prefix}.${key.split(".")[1]}`)).join(", ")
      : t("non_mentionne");

  const renderTranslated = (key?: string, prefix?: string) =>
    key ? t(`${prefix}.${key.split(".")[1]}`) : t("non_mentionne");

  return (
    <div className="p-6 space-y-6 bg-white rounded shadow">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-2 text-blue-700">
        <FaUniversity />
        {getText(bank.bankName)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-500" />
            <strong>{t("bank.city")}: </strong> {getText(bank.city)}
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-500" />
            <strong>{t("bank.addresse")}: </strong> {getText(bank.addresse)}
          </p>
          <p className="flex items-center gap-2">
            <FaUser className="text-gray-500" />
            <strong>{t("bank.landlord")}: </strong>
            <UserName userId={bank.landlord} keyName="id" />
          </p>
          <p>
            <strong>{t("bank.reference")}: </strong>
            {getText(bank.reference)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <FaUser className="text-gray-500" />
            <strong>{t("bank.createdBy")}: </strong>
            <UserName userId={bank.createdBy} />
          </p>
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <strong>{t("bank.date")}: </strong>
            {bank.createdAt
              ? formatRelative(
                  bank.createdAt.toDate?.() || bank.createdAt,
                  new Date(),
                  { locale: fr }
                )
              : t("non_mentionne")}
          </p>
          <p className="flex items-center gap-2">
            <FaMoneyBillWave className="text-green-600" />
            <strong>{t("bank.rentCost")}: </strong> HTG { new Intl.NumberFormat('fr-FR').format(Number(bank.rentCost)) }
          </p>
          <p className="flex items-center gap-2">
            <FaShieldAlt className="text-indigo-600" />
            <strong>{t("bank.urgency")}: </strong> {bank.urgency ? t("yes") : t("no")}
          </p>
        </div>
      </div>

      <hr className="my-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
      <div className="space-y-2">
      {bank.demoDetails && (
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <FaInfoCircle /> {t("bank.internetProviders.label")}
            </h3>
            <p>
              <strong>{t("bank.internetProviders.label")}: </strong>
              {renderTranslatedArray(bank.demoDetails.internetService, "bank.internetProviders")}
            </p>
            <p>
              <strong>{t("bank.lotteryCompetitions.label")}: </strong>
              {renderTranslated(bank.demoDetails.lotteryCompetition, "bank.lotteryCompetitions")}
            </p>
            <p>
              <strong>{t("bank.bankEntrances.label")}: </strong>
              {renderTranslatedArray(bank.demoDetails.bankEntrance, "bank.bankEntrances")}
            </p>
            <p>
              <strong>{t("bank.populationInAreas.label")}: </strong>
              {renderTranslated(bank.demoDetails.populationInArea, "bank.populationInAreas")}
            </p>
            <p>
              <strong>{t("bank.expectedRevenue.label")}: </strong>
              {renderTranslated(bank.demoDetails.expectedRevenue, "bank.expectedRevenue")}
            </p>
            <p>
              <strong>{t("bank.buildingStabilities.label")}: </strong>
              {renderTranslated(bank.demoDetails.buildingStability, "bank.buildingStabilities")}
            </p>
          </div>
        )}

        {bank.securityDetails && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <FaShieldAlt /> {t("bank.currentSecurities.label")}
            </h3>
            <p>
              <strong>{t("bank.areaStabilities.label")}: </strong>
              {renderTranslated(bank.securityDetails.areaStability, "bank.areaStabilities")}
            </p>
            <p>
              <strong>{t("bank.openHours.label")}: </strong>
              {renderTranslated(bank.securityDetails.openHour, "bank.openHours")}
            </p>
            <p>
              <strong>{t("bank.closeHours.label")}: </strong>
              {renderTranslated(bank.securityDetails.closeHour, "bank.closeHours")}
            </p>
            <p>
              <strong>{t("bank.currentSecurities.label")}: </strong>
              {renderTranslatedArray(bank.securityDetails.currentSecurity, "bank.currentSecurities")}
            </p>
          </div>
        )}

        {bank.renovationDetails && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">{t("bank.title.renov")}</h3>
            <p>
              <strong>{t("bank.currentSecurities.label")}: </strong>
              {renderTranslatedArray(bank.renovationDetails.neededSecurity, "bank.currentSecurities")}
            </p>
            <p>
              <strong>{t("bank.majorRenovations.label")}: </strong>
              {renderTranslatedArray(bank.renovationDetails.majorRenovation, "bank.majorRenovations")}
            </p>
            <p>
              <strong>{t("bank.minorRenovations.label")}: </strong>
              {renderTranslatedArray(bank.renovationDetails.minorRenovation, "bank.minorRenovations")}
            </p>
          </div>
        )}

        {bank.finalDecision && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">
              {t("bank.finalDecisionStatuses.label")}
            </h3>
            <p>
              <strong>{t("bank.finalDecisionStatuses.label")}: </strong>
              {renderTranslated(bank.finalDecision.status, "bank.finalDecisionStatuses")}
            </p>
            <p>
              <strong>{t("bank.reason_why")}: </strong>
              {getText(bank.finalDecision.reason_why)}
            </p>
          </div>
        )}
      </div>
      <div className="space-y-2">

      <div className="max-w-[700px]">
           <StepHistory bankId={bank.id} />
      </div>

      </div>
      
    </div>
    </div>
  );
};

export default BankInfo;
