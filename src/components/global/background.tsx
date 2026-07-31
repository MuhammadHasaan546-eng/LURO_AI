import { cn } from "@/lib/utils";
import React from "react";

interface BackgroundProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

const Background = ({ children, className, ...props }: BackgroundProps) => {
  return (
    <div
      className={cn(
        "relative isolate min-h-[calc(100svh-5rem)] w-full overflow-hidden bg-[#12072b] text-white",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[url('/images/bg.svg')] bg-cover bg-[position:50%_42%] bg-no-repeat sm:bg-[position:50%_48%] lg:bg-[length:100%_auto] lg:bg-[position:center_top]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,9,11,0.08)_0%,rgba(9,9,11,0.02)_52%,rgba(9,9,11,0.62)_100%)]"
      />
      {children}
    </div>
  );
};

export default Background;
