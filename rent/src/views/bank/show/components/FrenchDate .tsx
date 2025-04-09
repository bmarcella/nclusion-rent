
const FrenchDate = ({ dateString, y = 0 }: { dateString: string; y?: number }) => {
  const date = new Date(dateString);

  // Add y years if y > 0
  if (y > 0) {
    date.setFullYear(date.getFullYear() + y);
  }

  const formatted = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return <span>{formatted}</span>;
};

export default FrenchDate;
