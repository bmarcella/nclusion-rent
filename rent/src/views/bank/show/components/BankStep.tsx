import React from "react";
import { useTranslation } from "@/utils/hooks/useTranslation";

const stepColorClassMap: Record<
  string,
  {
    bg: string;
    text: string;
    ring: string;
  }
> = {
  rejected: {
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-500/10",
  },
  needApproval: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-500/10",
  },
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    ring: "ring-yellow-500/10",
  },
  needApprobation: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    ring: "ring-purple-500/10",
  },
  needAprobation: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    ring: "ring-indigo-500/10",
  },
  needContract: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    ring: "ring-orange-500/10",
  },
  needRenovation: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    ring: "ring-gray-500/10",
  },
  readyToUse: {
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-500/10",
  },
};

interface BankStepBadgeProps {
  step: string;
}

const BankStepBadge: React.FC<BankStepBadgeProps> = ({ step }) => {
  const { t } = useTranslation();

  const key = step.replace("bankSteps.", "");
  const color = stepColorClassMap[key] || {
    bg: "bg-gray-50",
    text: "text-gray-600",
    ring: "ring-gray-500/10",
  };

  return (
    <div
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${color.bg} ${color.text} ${color.ring}`}
    >
      {t(`bank.${step}`)}
    </div>
  );
};

export default BankStepBadge;
