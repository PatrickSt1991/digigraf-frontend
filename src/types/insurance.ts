export interface InsuranceCompany {
    id: string;
    name: string;
}

export interface InsuranceEntry {
    insuranceCompanyId: string;
    policyNumber: string;
    premium?: number;
}