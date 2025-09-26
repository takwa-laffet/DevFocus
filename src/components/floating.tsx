// src/components/floating.tsx
import React from "react";
import { FloatingDoc, FloatingDocItem } from "./floating-doc";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
} from "@tabler/icons-react";

export const Floating: React.FC = () => {
  const links: FloatingDocItem[] = [
    { title: "Home", icon: <IconHome />, href: "#" },
    { title: "Products", icon: <IconTerminal2 />, href: "#" },
    { title: "Components", icon: <IconNewSection />, href: "#" },
    { title: "Changelog", icon: <IconExchange />, href: "#" },
    { title: "Twitter", icon: <IconBrandX />, href: "#" },
    { title: "GitHub", icon: <IconBrandGithub />, href: "#" },
  ];

  return (
    <div className="h-[6rem] flex items-center justify-center w-full">
      <FloatingDoc items={links} mobileClassName="translate-y-20" />
    </div>
  );
};
