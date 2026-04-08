// COMP-13: Tabs
import React, { useState } from "react";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  // A11Y-17: missing proper ARIA tab pattern (role="tablist", "tab", "tabpanel")
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="tabs">
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* A11Y-18: no aria-selected, no arrow key navigation */}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
};
