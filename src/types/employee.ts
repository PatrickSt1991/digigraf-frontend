export interface Employee {
  id: string;
  status: 'active' | 'inactive' | 'deactivated';
  initials: string;
  firstName: string;
  lastName: string;
  tussenvoegsel: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  startDate: string;
  avatar?: string;
}