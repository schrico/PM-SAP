// /types/project.ts
export type Status = "complete" | "active" | "cancelled" /* | "pending" */;

export interface Project {
  id: number;
  name: string;
  pm_id: string | null;
  interim_deadline: string | null;
  initial_deadline: string | null;
  final_deadline: string | null;
  translator: string | null;
  system: string;
  words: number | null;
  lines: number | null;
  status: Status;
  language_in: string;
  language_out: string;
  instructions?: string | null;
  pago?: boolean | null;
  faturado?: boolean | null;
  created_at?: string;
  updated_at?: string;
  short?: boolean;

}