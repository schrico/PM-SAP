// types/colors.ts
import { Sistema } from "./project";
export type LinguagemPair = "DE→BR" | "ENG→BR" | "ENG→PT" | "BR→ENG";
export type SistemaAlt = "XTM" | "STM" | "LAT" | "TRADOS" | "short";

export const languageColors: Record<LinguagemPair, string> = {
  "DE→BR": "text-black",
  "ENG→BR": "text-blue-600",
  "ENG→PT": "text-green-600", // melhor visibilidade
  "BR→ENG": "text-red-600",
};

export const sistemaColors: Record<Sistema, string> = {
  XTM: "bg-green-400",
  STM: "bg-yellow-400",
  LAT: "bg-orange-400",
  B0X: "bg-purple-400",
  B0T: "bg-purple-400",
  SSE: "bg-purple-400",
  SSH: "bg-purple-400",
};

export const completedColor = "bg-gray-500"; // cinzento escuro visível

export const legendaLinguagens: Record<LinguagemPair, string> = {
  "DE→BR": "Preto",
  "ENG→BR": "Azul",
  "ENG→PT": "Verde",
  "BR→ENG": "Vermelho",
};

export const legendaSistemas: Record<SistemaAlt, string> = {
  XTM: "Verde",
  STM: "Amarelo",
  LAT: "Laranja",
  TRADOS: "Lilás",
  short: "Branco",
};

export const legendaStatus: Record<"complete" | "active", string> = {
  complete: "Cinzento",
  active: "Normal",
};
