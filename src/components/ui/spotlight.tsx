import { cn } from "@/lib/utils";
import * as React from "react";

type SpotlightProps = React.ComponentPropsWithoutRef<"svg"> & {
  /** Softens the beam without requiring callers to define an SVG filter. */
  blur?: number;
};

const Spotlight = React.forwardRef<SVGSVGElement, SpotlightProps>(
  ({ className, fill = "white", blur = 10, style, ...props }, ref) => {
    const filterId = React.useId();

    return (
      <svg
        ref={ref}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-0 h-[42rem] w-[42rem] opacity-0 motion-safe:animate-[spotlight_1.2s_ease-out_0.15s_forwards] motion-reduce:opacity-70",
          className,
        )}
        viewBox="0 0 700 700"
        fill="none"
        style={style}
        {...props}
      >
        <defs>
          <filter id={filterId} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        <path
          d="M86 43C214 155 330 285 365 659C396 375 476 186 646 43H86Z"
          fill={fill}
          filter={`url(#${filterId})`}
        />
      </svg>
    );
  },
);

Spotlight.displayName = "Spotlight";

export { Spotlight };
export default Spotlight;
