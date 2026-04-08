// COMP-16: Spinner
import React from "react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  label,
}) => {
  return (
    <div className={`spinner spinner-${size}`}>
      {/* A11Y-22: missing role="status" and aria-live="polite" */}
      <div className="spinner-animation" />
      {label && <span className="spinner-label">{label}</span>}
      {/* A11Y-23: no sr-only fallback text when label is absent */}
    </div>
  );
};
