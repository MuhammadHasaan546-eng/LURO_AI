'use client';

import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type Colors = {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  color6: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
  color11: string;
  color12: string;
  color13: string;
  color14: string;
  color15: string;
  color16: string;
  color17: string;
};

type ColorKey = keyof Colors;

type Layer = {
  className: string;
  colors: readonly [ColorKey, ColorKey, ColorKey, ColorKey];
  center: readonly [string, string];
  radius: string;
  duration: number;
  x: [number, number, number];
  y: [number, number, number];
  scale: [number, number, number];
};

const LAYERS: readonly Layer[] = [
  {
    className: 'absolute inset-x-[-8%] top-[-18%] h-[92%] opacity-70',
    colors: ['color2', 'color3', 'color4', 'color1'],
    center: ['32%', '42%'],
    radius: '72%',
    duration: 22,
    x: [0, 18, 0],
    y: [0, -8, 0],
    scale: [1, 1.035, 1],
  },
  {
    className: 'absolute inset-x-[-12%] bottom-[-24%] h-[100%] opacity-55',
    colors: ['color7', 'color8', 'color9', 'color5'],
    center: ['68%', '58%'],
    radius: '68%',
    duration: 28,
    x: [0, -22, 0],
    y: [0, 10, 0],
    scale: [1.03, 1, 1.03],
  },
  {
    className: 'absolute inset-x-[5%] top-[12%] h-[76%] opacity-35',
    colors: ['color11', 'color14', 'color16', 'color10'],
    center: ['50%', '48%'],
    radius: '62%',
    duration: 34,
    x: [-10, 14, -10],
    y: [5, -6, 5],
    scale: [0.98, 1.025, 0.98],
  },
];

type GradientLayerProps = {
  colors: Colors;
  layer: Layer;
  index: number;
  reduceMotion: boolean;
  active: boolean;
};

function GradientLayer({
  colors,
  layer,
  index,
  reduceMotion,
  active,
}: GradientLayerProps) {
  const instanceId = useId().replace(/:/g, '');
  const gradientId = `liquid-gradient-${instanceId}-${index}`;

  return (
    <motion.div
      className={layer.className}
      animate={
        reduceMotion || !active
          ? { x: 0, y: 0, scale: 1 }
          : { x: layer.x, y: layer.y, scale: layer.scale }
      }
      transition={
        reduceMotion || !active
          ? { duration: 0 }
          : {
              duration: layer.duration,
              ease: 'easeInOut',
              repeat: Number.POSITIVE_INFINITY,
            }
      }
    >
      <svg
        aria-hidden='true'
        className='h-full w-full'
        preserveAspectRatio='none'
        viewBox='0 0 1030 280'
      >
        <rect width='1030' height='280' fill={`url(#${gradientId})`} />
        <defs>
          <radialGradient
            id={gradientId}
            cx={layer.center[0]}
            cy={layer.center[1]}
            r={layer.radius}
          >
            <stop offset='0%' stopColor={colors[layer.colors[0]]} />
            <stop offset='34%' stopColor={colors[layer.colors[1]]} />
            <stop offset='68%' stopColor={colors[layer.colors[2]]} />
            <stop offset='100%' stopColor={colors[layer.colors[3]]} stopOpacity='0' />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

type LiquidProps = {
  colors: Colors;
  active?: boolean;
};

export function Liquid({ colors, active = true }: LiquidProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div aria-hidden='true' className='absolute inset-0 overflow-hidden'>
      {LAYERS.map((layer, index) => (
        <GradientLayer
          key={index}
          colors={colors}
          layer={layer}
          index={index}
          reduceMotion={reduceMotion}
          active={active}
        />
      ))}
    </div>
  );
}
