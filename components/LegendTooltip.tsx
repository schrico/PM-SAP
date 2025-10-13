"use client";

import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  legendaLinguagens,
  legendaSistemas,
  legendaStatus,
  languageColors,
  sistemaColors,
} from "@/types/colors";

export function LegendTooltip() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <HelpCircle className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm space-y-2 bg-gray-100">
        <p className="font-semibold">📘 Linguagens:</p>
        <ul className="list-disc pl-4">
          {Object.entries(legendaLinguagens).map(([pair]) => (
            <li
              key={pair}
              className={languageColors[pair as keyof typeof languageColors]}
            >
              {pair} →{" "}
              {legendaLinguagens[pair as keyof typeof legendaLinguagens]}
            </li>
          ))}
        </ul>
        <hr className="my-1" />
        <p className="font-semibold">📦 Sistema:</p>
        <ul className="list-disc pl-4">
          {Object.entries(legendaSistemas).map(([sistema]) => (
            <li
              key={sistema}
              className={sistemaColors[sistema as keyof typeof sistemaColors]}
            >
              {sistema} →{" "}
              {legendaSistemas[sistema as keyof typeof legendaSistemas]}
            </li>
          ))}
        </ul>
        <hr className="my-1" />
        <p className="font-semibold text-gray-500">
          ✅ Completos → {legendaStatus.complete}
        </p>
      </PopoverContent>
    </Popover>
  );
}
