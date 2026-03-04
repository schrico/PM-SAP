import type { SapInstructionEntry } from "@/types/project";

interface InstructionsPreviewInput {
  instructions?: string | null;
  sapInstructions?: SapInstructionEntry[] | null;
}

interface InstructionsPreviewResult {
  displayText: string;
  hasAnyInstructions: boolean;
}

export function getInstructionsPreview({
  instructions,
  sapInstructions,
}: InstructionsPreviewInput): InstructionsPreviewResult {
  const hasManualInstructions = !!instructions && instructions.trim() !== "";
  const hasSapInstructions = !!sapInstructions && sapInstructions.length > 0;

  if (hasManualInstructions) {
    return {
      displayText: instructions,
      hasAnyInstructions: true,
    };
  }

  if (hasSapInstructions) {
    return {
      displayText: "SAP instructions",
      hasAnyInstructions: true,
    };
  }

  return {
    displayText: "No instructions",
    hasAnyInstructions: false,
  };
}
