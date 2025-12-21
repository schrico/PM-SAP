"use client";

interface ProjectInstructionsCardProps {
  instructions: string | null | undefined;
}

export function ProjectInstructionsCard({
  instructions,
}: ProjectInstructionsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-gray-900 dark:text-white mb-4 text-xl font-semibold">
        Instructions
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        {instructions || "Sem descrição fornecida"}
      </p>
    </div>
  );
}
