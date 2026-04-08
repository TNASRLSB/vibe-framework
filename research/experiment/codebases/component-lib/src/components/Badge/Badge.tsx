// COMP-10: Badge
import React from "react";

export interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
}) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};
