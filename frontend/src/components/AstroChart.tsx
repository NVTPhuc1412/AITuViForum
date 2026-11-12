import React from 'react';

interface AstroChartProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * A hub-and-spoke index mark: a square seal frame around a central node wired
 * to four corner nodes, standing in for the forum's inverted-index search core.
 */
export const AstroChart: React.FC<AstroChartProps> = ({ size = 28, className = '', animated = false }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="197" height="197" rx="1" stroke="currentColor" strokeOpacity="0.9" strokeWidth="2.5" />
      <path
        d="M100 100L36 36M100 100L164 36M100 100L36 164M100 100L164 164"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      <path
        d="M36 36H164V164H36Z"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.6"
      />
      <circle cx="100" cy="100" r="10" fill="currentColor" className={animated ? 'animate-star-pulse' : ''} />
      <circle cx="36" cy="36" r="5" fill="currentColor" opacity="0.7" />
      <circle cx="164" cy="36" r="5" fill="currentColor" opacity="0.6" />
      <circle cx="36" cy="164" r="5" fill="currentColor" opacity="0.6" />
      <circle cx="164" cy="164" r="5" fill="currentColor" opacity="0.5" />
    </svg>
  );
};
