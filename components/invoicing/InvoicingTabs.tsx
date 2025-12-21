"use client";

type TabType = "all" | "toBeInvoiced" | "toBePaid";

interface Tab {
  id: TabType;
  label: string;
  count: number;
}

interface InvoicingTabsProps {
  tabs: Tab[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function InvoicingTabs({
  tabs,
  activeTab,
  onTabChange,
}: InvoicingTabsProps) {
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

