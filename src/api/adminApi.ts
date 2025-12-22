import { adminEndpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { AdminEmployee } from "../types";

export async function getEmployees(): Promise<AdminEmployee[]> {
    return apiClient<AdminEmployee[]>(adminEndpoints.employees, {
        method: 'GET',
    });
}