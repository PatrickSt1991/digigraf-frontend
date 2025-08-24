export const calculateAge = (birthDate: string, deathDate?: string): number => {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  const reference = deathDate ? new Date(deathDate) : new Date();

  // Check if dates are valid
  if (isNaN(birth.getTime()) || isNaN(reference.getTime())) {
    return 0;
  }

  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
    age--;
  }

  return Math.max(0, age); // Never negative
};