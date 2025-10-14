// /types/project.ts
export type Sistema = "B0X" | "XTM" | "SSE" | "STM" | "B0T" | "SSH" | "LAT";
export type Status = "complete" | "active";
export type Linguagem = "BR" | "ENG" | "PT" | "DE";

export interface Project {
  id: number;
  name: string;
  sistema: Sistema;
  deadline: string;
  words: number | null;
  lines: number | null;
  status: Status;
  language_in: Linguagem;
  language_out: Linguagem;
  instructions?: string | null;
  pago?: boolean | null;
  faturado?: boolean | null;
  created_at?: string;
  updated_at?: string;
  short?: boolean;
}