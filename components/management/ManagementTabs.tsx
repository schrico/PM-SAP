"use client";

type ProjectStatus = "all" | "ready" | "inProgress" | "unclaimed";

interface Tab {
  id: ProjectStatus;
  label: string;
  count: number;
}

interface ManagementTabsProps {
  tabs: Tab[];
  activeTab: ProjectStatus;
  onTabChange: (tab: ProjectStatus) => void;
}

export function ManagementTabs({
  tabs,
  activeTab,
  onTabChange,
}: ManagementTabsProps) {
  return (
    <div className="flex gap-8 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-3 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
            activeTab === tab.id ?
              "border-blue-500 text-blue-500"
            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          type="button"
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
