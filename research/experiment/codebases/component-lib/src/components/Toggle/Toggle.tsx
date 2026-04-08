// COMP-08: Toggle
import React from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  // A11Y-10: uses div instead of proper switch role
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
}) => {
  return (
    <div className="toggle-group" onClick={() => onChange(!checked)}>
      {/* A11Y-11: not keyboard accessible (div with onClick, no onKeyDown) */}
      <div className={`toggle-track ${checked ? "active" : ""}`}>
        <div className="toggle-thumb" />
      </div>
      {label && <span>{label}</span>}
    </div>
  );
};
