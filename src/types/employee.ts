export interface AdminEmployee {
  id: string;
  status: 'active' | 'inactive';
  initials: string;
  firstName: string;
  lastName: string;
  tussenvoegsel?: string;
  fullName: string;
  birthPlace?: string;
  birthDate: string;
  email: string;
  mobile: string;
  role: string;
  startDate: string;
  hasLogin: boolean;
  loginIsActive: boolean | null;
}