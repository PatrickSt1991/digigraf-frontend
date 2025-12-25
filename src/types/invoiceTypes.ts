export interface PriceComponent {
  omschrijving: string;
  aantal: number;
  bedrag: number;
}

export interface InvoiceFormData {
  insurancePartyId: string;
  priceComponents: PriceComponent[];
  discountAmount: number;
  subtotal: number;
  total: number;
  isExcelButtonEnabled: boolean;
}
