export interface FinancialRowDto {
  id?: string;
  uitvaartNummer: string;

  kostenbegrotingDatum?: string;
  hasKostenbegroting?: boolean;
  canCreateInvoice?: boolean;
  canOpenOpdrachtgeverInvoice?: boolean;
  canOpenHerkomstInvoice?: boolean;

  leverancier?: string;
  werknemer?: string;
  bedrag?: number;

  provisie?: number;
  datumUitbetaald?: string;
  uitbetaald?: boolean;
}