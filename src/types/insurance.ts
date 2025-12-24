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

export interface InsuranceEntry {
  insurancePartyId: string;
  policyNumber: string;
  premium?: number;
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
