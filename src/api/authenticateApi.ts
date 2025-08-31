import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { AuthResponse } from "../types";


export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return apiClient<AuthResponse>(`${endpoints.authentication}/login`, {
    method: "POST",
    body: { email, password },
  });
}