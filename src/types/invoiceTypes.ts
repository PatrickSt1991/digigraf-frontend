export type InsurancePolicyRow = {
  id: string;
  policyNumber: string;
  premium: number;  
}

export interface PriceComponent {
  omschrijving: string;
  aantal: number;
  bedrag: number;
}

export interface InvoiceFormData {
  insurancePartyId: string;
  selectedVerzekeraar?: string;
  selectedVerzekeraarId: string;
  priceComponents: PriceComponent[];
  insurancePolicies?: InsurancePolicyRow[];
  discountAmount: number;
  subtotal: number;
  total: number;
  isExcelButtonEnabled: boolean;
  invoiceDate: string;
}