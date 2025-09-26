// src/components/floating-doc.tsx
import React from "react";

export interface FloatingDocItem {
  title: string;
  icon: React.ReactElement;
  href: string;
}

export interface FloatingDocProps {
  items: FloatingDocItem[];
  mobileClassName?: string;
  desktopClassName?: string;
}

export const FloatingDoc: React.FC<FloatingDocProps> = ({
  items,
  mobileClassName,
  desktopClassName,
}) => {
  return (
    <div className={`floating-doc ${desktopClassName || ""} ${mobileClassName || ""}`}>
      {items.map((item) => (
        <a key={item.title} href={item.href} className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded">
          {item.icon}
          <span>{item.title}</span>
        </a>
      ))}
    </div>
  );
};
