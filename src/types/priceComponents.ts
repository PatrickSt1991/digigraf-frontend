export interface InsurancePriceComponentDto {
  id?: string;

  omschrijving: string;
  bedrag: number;
  factuurBedrag: number;

  verzekerdAantal: number;


  insurancePartyIds: string[];

  standaardPm: boolean;
  sortOrder: number;

  isActive: boolean;
}