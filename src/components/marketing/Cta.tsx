"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import LightPillar from "@/components/LightPillar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaActionBase {
  /** Text or other accessible content displayed inside the action. */
  label: React.ReactNode;
  /** Optional accessible name when the visible label is not sufficient. */
  ariaLabel?: string;
  className?: string;
}

export interface CtaLinkAction extends CtaActionBase {
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  disabled?: boolean;
  onClick?: never;
}

export interface CtaButtonAction extends CtaActionBase {
  href?: never;
  target?: never;
  rel?: never;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export type CtaAction = CtaLinkAction | CtaButtonAction;

export interface CtaProps {
  heading: React.ReactNode;
  description?: React.ReactNode;
  primaryAction: CtaAction;
  secondaryAction?: CtaAction;
  visual?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  visualClassName?: string;
  /** Sets the heading level used by the section. */
  headingAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const actionClassName =
  "min-h-11 px-5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]";

function renderAction(
  action: CtaAction,
  variant: React.ComponentProps<typeof Button>["variant"],
) {
  const { label, href, disabled, ariaLabel, className } = action;
  const commonProps = {
    "aria-label": ariaLabel,
    className: cn(actionClassName, className),
  };

  if (href) {
    const rel =
      action.rel ??
      (action.target === "_blank" ? "noopener noreferrer" : undefined);

    return (
      <Button asChild variant={variant} {...commonProps}>
        <a
          href={disabled ? undefined : href}
          target={action.target}
          rel={rel}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
        >
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={action.onClick}
      disabled={disabled}
      {...commonProps}
    >
      {label}
    </Button>
  );
}

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Cta({
  heading,
  description,
  primaryAction,
  secondaryAction,
  visual,
  className,
  contentClassName,
  visualClassName,
  headingAs = "h2",
}: CtaProps) {
  const Heading = headingAs;
  const headingId = React.useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "w-full px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
        className,
      )}
    >
      {/* Outer Card with Scroll View Trigger */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative isolate mx-auto grid w-full max-w-7xl items-center gap-10 overflow-hidden rounded-3xl border border-violet-500/20 bg-slate-950 p-6 shadow-2xl shadow-violet-950/20 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:gap-16 lg:p-16"
      >
        {/* Animated Background Light Pillar & Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-75"
        >
          <LightPillar
            topColor="#8b5cf6"
            bottomColor="#ec4899"
            intensity={0.8}
            rotationSpeed={0.25}
            interactive={false}
            glowAmount={0.003}
            pillarWidth={3}
            pillarHeight={0.4}
            noiseIntensity={0.35}
            mixBlendMode="screen"
            quality="medium"
          />
        </div>

        {/* Pulsing Ambient Glow */}
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl"
        />

        {/* Content Container */}
        <div className={cn("relative z-10 max-w-2xl", contentClassName)}>
          <motion.div variants={itemVariants}>
            <Heading
              id={headingId}
              className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              {heading}
            </Heading>
          </motion.div>

          {description ? (
            <motion.div
              variants={itemVariants}
              className="mt-4 max-w-xl text-pretty text-base leading-7 text-slate-300 sm:text-lg"
            >
              {description}
            </motion.div>
          ) : null}

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            {renderAction(primaryAction, "default")}
            {secondaryAction ? renderAction(secondaryAction, "outline") : null}
          </motion.div>
        </div>

        {/* Floating Visual Container */}
        {visual ? (
          <motion.div
            variants={itemVariants}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={cn(
              "relative z-10 flex min-h-48 items-center justify-center lg:min-h-64",
              visualClassName,
            )}
          >
            {visual}
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}

export default Cta;
