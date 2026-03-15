export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
};

export type AuthResponse = {
  user: AuthUser;
};