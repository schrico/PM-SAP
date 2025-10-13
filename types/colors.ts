// types/colors.ts

export type LinguagemPair = "DE→BR" | "ENG→BR" | "ENG→PT" | "BR→ENG";
export type Sistema = "XTM" | "STM" | "LAT";

// Cores de fonte para cada par de linguagens
export const languageColors: Record<LinguagemPair, string> = {
  "DE→BR": "text-black",
  "ENG→BR": "text-blue-600",
  "ENG→PT": "text-green-600",
  "BR→ENG": "text-red-600",
};

// Cores de fundo dos sistemas
export const sistemaColors: Record<Sistema, string> = {
  XTM: "bg-green-100",
  STM: "bg-yellow-100",
  LAT: "bg-orange-100",
};

// Cor para projetos completados
export const completedColor = "bg-gray-500 text-white";

// Tipos para legendas dinâmicas
export const legendaLinguagens: Record<LinguagemPair, string> = {
  "DE→BR": "Preto",
  "ENG→BR": "Azul",
  "ENG→PT": "Verde",
  "BR→ENG": "Vermelho",
};

export const legendaSistemas: Record<Sistema, string> = {
  XTM: "Verde",
  STM: "Amarelo",
  LAT: "Laranja",
};

export const legendaStatus: Record<"complete" | "active", string> = {
  complete: "Cinzento",
  active: "Normal",
};
