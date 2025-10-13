export type UserRole = "employee" | "admin" | "pm";


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}