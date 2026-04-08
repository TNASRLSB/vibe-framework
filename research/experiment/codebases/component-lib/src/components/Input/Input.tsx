// COMP-04: Input
import React from "react";

export interface InputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  // A11Y-07: label exists as prop but not linked via htmlFor/id
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  value,
  onChange,
  placeholder,
  label,
  error,
}) => {
  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "input-error" : ""}
      />
      {error && <span className="error-text">{error}</span>}
      {/* A11Y-08: error not linked to input via aria-describedby */}
    </div>
  );
};
