export interface InsuranceCompany {
    id: string;
    status: 'active' | 'inactive';
    name: string;
    herkomst: boolean;
    insurance: boolean;
    membership: boolean;
    package: boolean;
    correspondanceType: 'mailbox' | 'address';
    address?: string;
    houseNumber?: string;
    houseNumberSuffix?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
    mailboxname?: string;
    mailboxaddress?: string;
    billingAddress?: boolean;
    billingType: | 'Opdrachtgever' | 'Opdrachtgever & Derde partij' | 'Derde partij'
}

export type InsuranceEntry = {
  id?: string;
  dossierId?: string;
  insurancePartyId: string;
  policyNumber: string;
  premium?: number;
};

export type InsuranceParty = {
  id: string;
  name: string;
  isInsurance?: boolean;
};

export type PolicyGroup = {
  insurancePartyId: string;
  insurancePartyName: string;
  policies: Array<{
    policyNumber: string;
    premium?: number;
  }>;
  totalPremium: number;
};

export type InsuranceGroup = { companyName: string; insurances: Insurance[] };

export interface Insurance {
  id: string;
  companyName: string;
  policyNumber?: string;
  amount: number;
}
/* ===================== INSURANCE ===================== */

export type CorrespondenceType = 'address' | 'mailbox';

export type BillingType =
  | 'Opdrachtgever'
  | 'Opdrachtgever & Derde partij'
  | 'Derde partij';

export interface InsurancePartyDto {
  id?: string;

  // Core
  name: string;
  isActive: boolean;

  // Type flags
  isInsurance: boolean;
  isAssociation: boolean;
  hasMembership: boolean;
  hasPackage: boolean;
  isHerkomst: boolean;

  // Correspondence
  correspondenceType: CorrespondenceType;

  address: string;
  houseNumber: string;
  houseNumberSuffix: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;

  // Mailbox
  mailboxname: string;
  mailboxaddress: string;

  // Billing
  billingType: BillingType;
}

export interface InsurancePolicyDto {
  id?: string;

  overledeneId: string;
  insurancePartyId: string;

  policyNumber: string;
  premium?: number;
}
