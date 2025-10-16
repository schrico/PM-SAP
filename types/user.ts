export type UserRole = "employee" | "admin" | "pm";


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  C_user: string;
  TE_user: string;
}