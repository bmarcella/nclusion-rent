import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React from 'react';

interface StepDateRangeProps {
  start: Date;
  end: Date;
}

export const StepDateRange: React.FC<StepDateRangeProps> = ({ start, end }) => {
  if (!start || !end) {
    return null;
  }
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  const dayStart = format(start, 'd', { locale: fr });
  const monthStart = format(start, 'MMMM', { locale: fr });
  const dayEnd = format(end, 'd', { locale: fr });
  const monthEnd = format(end, 'MMMM', { locale: fr });
  const yearEnd = format(end, 'yyyy', { locale: fr });

  let display = `du ${dayStart} au ${dayEnd} ${monthEnd} ${yearEnd}`;

  if (sameMonth && sameYear) {
    display = `du ${dayStart} au ${dayEnd} ${monthEnd} ${yearEnd}`;
  } else if (!sameMonth && sameYear) {
    display = `du ${dayStart} ${monthStart} au ${dayEnd} ${monthEnd} ${yearEnd}`;
  } else {
    display = `du ${dayStart} ${monthStart} ${format(start, 'yyyy', { locale: fr })} au ${dayEnd} ${monthEnd} ${yearEnd}`;
  }

  return (
    <div className="min-w-[160px]">
      <div className="font-medium">{display}</div>
    </div>
  );
};
