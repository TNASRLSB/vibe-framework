// COMP-07: Radio
import React from "react";

export interface RadioProps {
  name: string;
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

export const Radio: React.FC<RadioProps> = ({
  name,
  value,
  selectedValue,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className="radio-group">
      <input
        type="radio"
        name={name}
        value={value}
        checked={value === selectedValue}
        onChange={() => onChange(value)}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
};
