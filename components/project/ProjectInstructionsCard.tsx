"use client";

import { useState } from "react";
import { FileText, ClipboardList, ChevronDown, ChevronRight } from "lucide-react";
import { stripHtml } from "@/utils/formatters";
import type { SapInstructionEntry } from "@/types/project";

interface ProjectInstructionsCardProps {
  instructions: string | null | undefined;
  sapInstructions?: SapInstructionEntry[] | null;
}

/** Deduplicate and clean SAP instructions at render time (handles legacy DB data with HTML) */
function cleanSapInstructions(entries: SapInstructionEntry[]): { short: string; long: string; slsLang?: string }[] {
  const seen = new Set<string>();
  const cleaned: { short: string; long: string; slsLang?: string }[] = [];

  for (const entry of entries) {
    const rawShort = entry.instructionShort || "";
    const rawLong = entry.instructionLong || entry.text || "";

    const short = stripHtml(rawShort);
    const long = stripHtml(rawLong);

    const dedupKey = (long || short).toLowerCase();
    if (!dedupKey || seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    cleaned.push({ short, long, slsLang: entry.slsLang });
  }

  return cleaned;
}

export function ProjectInstructionsCard({
  instructions,
  sapInstructions,
}: ProjectInstructionsCardProps) {
  const hasInstructions = instructions && instructions.trim() !== "";
  const hasSapInstructions = sapInstructions && sapInstructions.length > 0;

  if (!hasInstructions && !hasSapInstructions) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-gray-900 dark:text-white mb-4 text-xl font-semibold">
          Instructions
        </h2>
        <p className="text-gray-500 dark:text-gray-400 italic">
          Sem descrição fornecida
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SAP Instructions first */}
      {hasSapInstructions && (
        <SapInstructionsSection entries={sapInstructions!} />
      )}

      {/* Custom Instructions below */}
      {hasInstructions && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-gray-900 dark:text-white text-xl font-semibold">
              Instructions
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {instructions}
          </p>
        </div>
      )}
    </div>
  );
}

function SapInstructionsSection({ entries }: { entries: SapInstructionEntry[] }) {
  const cleaned = cleanSapInstructions(entries);

  if (cleaned.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-gray-900 dark:text-white text-xl font-semibold">
            SAP Instructions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            (read-only)
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {cleaned.map((entry, i) => (
          <CollapsibleInstruction key={i} short={entry.short} long={entry.long} slsLang={entry.slsLang} />
        ))}
      </div>
    </div>
  );
}

function CollapsibleInstruction({ short, long }: { short: string; long: string; slsLang?: string }) {
  const [expanded, setExpanded] = useState(false);
  const fullText = long || short;
  const isLong = fullText.length > 80;

  // Short text: show directly, no dropdown
  if (!isLong) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 break-words" style={{ overflowWrap: "anywhere" }}>
          {fullText}
        </p>
      </div>
    );
  }

  // Long text: show short as title, dropdown reveals long
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-2 p-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {expanded ?
          <ChevronDown className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
        : <ChevronRight className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
        }
        <span className="text-sm text-gray-700 dark:text-gray-300 break-words" style={{ overflowWrap: "anywhere" }}>
          {short || fullText.slice(0, 80) + "..."}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line break-words" style={{ overflowWrap: "anywhere" }}>
            {fullText}
          </p>
        </div>
      )}
    </div>
  );
}
