import apiClient from "./apiClient";
import { adminEndpoints } from "./apiConfig";
import {
  AverageScoreDetailItem,
  AverageScoreReportItem,
  CoffinReportItem,
  FollowCarsReportItem,
  FuneralLeaderReportItem,
  OriginCityReportItem,
  OriginReportItem,
  PeriodListItem,
  ReportFilter,
} from "../types";

const buildQueryString = (filter: ReportFilter = {}) => {
  const params = new URLSearchParams();

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const getCoffinReport = (filter: ReportFilter = {}) =>
  apiClient<CoffinReportItem[]>(`${adminEndpoints.reports}/coffins${buildQueryString(filter)}`);

export const getFuneralLeaderReport = (filter: ReportFilter = {}) =>
  apiClient<FuneralLeaderReportItem[]>(`${adminEndpoints.reports}/funeralleaders${buildQueryString(filter)}`);

export const getOriginReport = (filter: ReportFilter = {}) =>
  apiClient<OriginReportItem[]>(`${adminEndpoints.reports}/origins${buildQueryString(filter)}`);

export const getOriginCityReport = (filter: ReportFilter = {}) =>
  apiClient<OriginCityReportItem[]>(`${adminEndpoints.reports}/origins-with-city${buildQueryString(filter)}`);

export const getFollowCarsReport = (filter: ReportFilter = {}) =>
  apiClient<FollowCarsReportItem[]>(`${adminEndpoints.reports}/followcars${buildQueryString(filter)}`);

export const getPeriodListReport = (filter: ReportFilter = {}) =>
  apiClient<PeriodListItem[]>(`${adminEndpoints.reports}/period-list${buildQueryString(filter)}`);

export const getAverageScoresReport = (filter: ReportFilter = {}) =>
  apiClient<AverageScoreReportItem[]>(`${adminEndpoints.reports}/average-scores${buildQueryString(filter)}`);

export const getAverageScoreDetails = (funeralLeader: string, filter: ReportFilter = {}) =>
  apiClient<AverageScoreDetailItem[]>(
    `${adminEndpoints.reports}/average-scores/${encodeURIComponent(funeralLeader)}${buildQueryString(filter)}`
  );
