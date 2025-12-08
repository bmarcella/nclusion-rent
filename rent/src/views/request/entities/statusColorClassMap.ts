export const statusColorClassMap: Record<
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
  preApproval: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-500/10",
  },
  regionalApproval: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    ring: "ring-purple-500/10",
  },
  accountantRegionalApproval: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    ring: "ring-indigo-500/10",
  },
  managerGlobalApproval: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    ring: "ring-orange-500/10",
  },
  approved: {
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-500/10",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-500/10",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-500/10",
  }
};