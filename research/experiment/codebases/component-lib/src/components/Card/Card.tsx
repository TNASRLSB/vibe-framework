// COMP-02: Card
import React from "react";

export interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  children: React.ReactNode;
  onClick?: () => void;
  // A11Y-02: clickable card without role="button" or keyboard handler
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  image,
  children,
  onClick,
}) => {
  return (
    <div className="card" onClick={onClick}>
      {image && <img src={image} alt="" className="card-image" />}
      {/* A11Y-03: empty alt text on meaningful image */}
      <div className="card-body">
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};
