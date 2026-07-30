import { cn } from "@/functions/cs";
import { ClassNameValue } from "tailwind-merge";
import React from "react";

const Warpper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("size-full mx-auto max-w-6xl px-4 md:px-12", className)}>
      {children}
    </div>
  );
};

export default Warpper;
