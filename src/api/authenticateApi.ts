import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { AuthResponse, AuthUser } from "../types/auth";



export async function loginUser(
  email: string,
  password: string,
  keepSignedIn: boolean
): Promise<AuthResponse> {
  return apiClient<AuthResponse>(`${endpoints.authentication}/login`, {
    method: "POST",
    credentials: "include",
    body: {
      email,
      password,
      keepSignedIn,
    },
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiClient<AuthUser>(`${endpoints.authentication}/me`, {
    method: "GET",
    credentials: "include",
  });
}

export async function logoutUser(): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`${endpoints.authentication}/logout`, {
    method: "POST",
    credentials: "include",
  });
}