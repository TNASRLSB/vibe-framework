// COMP-09: Tooltip
import React, { useState } from "react";

export interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  // A11Y-12: tooltip not accessible via keyboard (only hover)
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  children,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`tooltip tooltip-${position}`}>
          {/* A11Y-13: missing role="tooltip" and aria-describedby */}
          {content}
        </div>
      )}
    </div>
  );
};
