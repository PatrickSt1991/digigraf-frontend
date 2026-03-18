export type ReportTab =
  | "coffins"
  | "funeralLeaders"
  | "origins"
  | "originCity"
  | "followCars"
  | "periodList"
  | "averageScores";

export type ReportViewMode = "chart" | "table";

export type ReportFilter = {
  funeralNumberFrom?: string;
  funeralNumberTo?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CoffinReportItem = {
  code: string;
  description: string;
  count: number;
  percentage: number;
};

export type FuneralLeaderReportItem = {
  funeralLeader: string;
  count: number;
};

export type OriginReportItem = {
  origin: string;
  count: number;
};

export type OriginCityReportItem = {
  origin: string;
  city: string;
  label: string;
  count: number;
};

export type FollowCarsReportItem = {
  followCars: string;
  count: number;
};

export type PeriodListItem = {
  dossierId: string;
  funeralNumber: string;
  funeralLeader: string;
  deceasedName: string;
  origin: string;
  coffin: string;
  followCars: string;
  funeralDate: string;
  customerScore: string;
};

export type AverageScoreReportItem = {
  funeralLeader: string;
  reviewCount: number;
  averageScore: number;
};

export type AverageScoreDetailItem = {
  dossierId: string;
  funeralNumber: string;
  funeralDate: string;
  customerScore: string;
  deceasedName: string;
};