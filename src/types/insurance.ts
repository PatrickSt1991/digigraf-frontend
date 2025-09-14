export interface InsuranceCompany {
    id: string;
    status: 'active' | 'inactive' | 'deactivated';
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
    mailboxname?: string;
    mailboxaddress?: string;
    billingAddress?: boolean;
    billingType: 'Opdrachtgever' | 'Opdrachtgever & Vereniging' | 'Vereniging';
}

export interface InsuranceEntry {
    insuranceCompanyId: string;
    policyNumber: string;
    premium?: number;
}