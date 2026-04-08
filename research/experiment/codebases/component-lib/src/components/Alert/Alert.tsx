// COMP-11: Alert
import React from "react";

export interface AlertProps {
  type: "info" | "success" | "warning" | "error";
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
  // A11Y-14: missing role="alert" or aria-live
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  dismissible = false,
  onDismiss,
  children,
}) => {
  return (
    <div className={`alert alert-${type}`}>
      {title && <strong className="alert-title">{title}</strong>}
      <div className="alert-body">{children}</div>
      {dismissible && (
        <button className="alert-dismiss" onClick={onDismiss}>
          x
          {/* A11Y-15: dismiss button has no aria-label */}
        </button>
      )}
    </div>
  );
};
