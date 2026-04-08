// COMP-12: Avatar
import React from "react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  initials?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  initials,
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || ""}
        // A11Y-16: alt defaults to empty string for meaningful image
        className={`avatar avatar-${size}`}
      />
    );
  }
  return (
    <div className={`avatar avatar-${size} avatar-initials`}>
      {initials || "?"}
    </div>
  );
};
