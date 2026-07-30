import { cn } from "@/functions/cs";
import React from "react";

interface WrapperProps {
  children: React.ReactNode;
  className?: string;
}

const Wrapper = ({ children, className }: WrapperProps) => {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 md:px-12", className)}>
      {children}
    </div>
  );
};

export { Wrapper };
export default Wrapper;
