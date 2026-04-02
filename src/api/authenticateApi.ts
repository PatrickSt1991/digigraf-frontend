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

export interface SelfRegisterPayload {
  firstName: string;
  lastName: string;
  tussenvoegsel?: string;
  email: string;
  password: string;
  mobile?: string;
  birthDate: string;
}

export async function selfRegisterUser(
  payload: SelfRegisterPayload
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(endpoints.selfRegister, {
    method: "POST",
    body: payload,
  });
}

export async function forgotPassword(
  email: string,
  birthDate: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(endpoints.forgotPassword, {
    method: "POST",
    body: { email, birthDate, newPassword },
  });
}