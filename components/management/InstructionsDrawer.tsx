"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileText, ClipboardList, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { stripHtml } from "@/utils/formatters";
import type { SapInstructionEntry } from "@/types/project";

interface InstructionsDrawerProject {
  name: string;
  instructions?: string | null;
  sap_instructions?: SapInstructionEntry[] | null;
}

interface InstructionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: InstructionsDrawerProject | null;
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

export function InstructionsDrawer({
  open,
  onOpenChange,
  project,
}: InstructionsDrawerProps) {
  const [sapExpanded, setSapExpanded] = useState(false);

  if (!project) return null;

  const hasInstructions = project.instructions && project.instructions.trim() !== "";
  const sapInstructions = project.sap_instructions as SapInstructionEntry[] | null;
  const hasSapInstructions = sapInstructions && sapInstructions.length > 0;
  const cleaned = hasSapInstructions ? cleanSapInstructions(sapInstructions!) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{project.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* SAP Instructions first */}
          {cleaned.length > 0 && (
            <div>
              <button
                onClick={() => setSapExpanded(!sapExpanded)}
                className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                type="button"
              >
                {sapExpanded ? (
                  <ChevronDown className="w-4 h-4 text-amber-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                )}
                <FileText className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  SAP Instructions ({cleaned.length})
                </h3>
              </button>

              {sapExpanded && (
                <div className="space-y-2">
                  {cleaned.map((entry, i) => (
                    <CollapsibleSapInstruction key={i} short={entry.short} long={entry.long} slsLang={entry.slsLang} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Composed Instructions below */}
          {hasInstructions && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Instructions
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line break-words overflow-hidden">
                  {project.instructions}
                </p>
              </div>
            </div>
          )}

          {/* No instructions at all */}
          {!hasInstructions && cleaned.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No instructions available
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CollapsibleSapInstruction({ short, long }: { short: string; long: string; slsLang?: string }) {
  const [expanded, setExpanded] = useState(false);
  const fullText = long || short;
  const isLong = fullText.length > 80;

  if (!isLong) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30 p-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 break-words" style={{ overflowWrap: "anywhere" }}>
          {fullText}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-2 p-3 text-left cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
      >
        {expanded ?
          <ChevronDown className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
        : <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
        }
        <span className="text-sm text-gray-700 dark:text-gray-300 break-words" style={{ overflowWrap: "anywhere" }}>
          {short || fullText.slice(0, 80) + "..."}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line break-words" style={{ overflowWrap: "anywhere" }}>
            {fullText}
          </p>
        </div>
      )}
    </div>
  );
}
