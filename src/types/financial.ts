export type FinancialQuery = {
   q?: string;
  status?: string 
};

export interface FinancialRowDto {
  id?: string;
  uitvaartNummer: string;
  dossierId?: string;

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