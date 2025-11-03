export interface LicenseInfo {
  plan: string;
  isValid: boolean;
  currentUsers: number;
  maxUsers: number;
  canAddUsers: boolean;
  expiresAt?: string;
  features?: string[];
  message?: string;
}
