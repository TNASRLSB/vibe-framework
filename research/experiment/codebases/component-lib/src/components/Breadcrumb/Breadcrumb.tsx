// COMP-14: Breadcrumb
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = "/",
}) => {
  return (
    <nav>
      {/* A11Y-19: missing aria-label="Breadcrumb" on nav */}
      <ol className="breadcrumb">
        {items.map((item, i) => (
          <li key={i} className="breadcrumb-item">
            {item.href ? <a href={item.href}>{item.label}</a> : item.label}
            {i < items.length - 1 && (
              <span className="separator">{separator}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
