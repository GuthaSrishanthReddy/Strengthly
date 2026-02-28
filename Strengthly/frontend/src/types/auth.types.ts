export type UserRole = "USER" | "TRAINER";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
