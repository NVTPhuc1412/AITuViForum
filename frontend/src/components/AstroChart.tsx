import React from 'react';

interface AstroChartProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * A 12-palace natal chart diagram: outer ring of twelve cells around a merged
 * center block, with diagonal ties in the four corner palaces — the recurring
 * shape of every Tử Vi chart, used here as the forum's visual mark.
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
        d="M50 1.5V50M150 1.5V50M50 150V198.5M150 150V198.5M1.5 50H50M1.5 150H50M150 50H198.5M150 150H198.5"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      <rect x="50" y="50" width="100" height="100" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
      <path
        d="M2 2L50 50M198 2L150 50M2 198L50 150M198 198L150 150"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.6"
      />
      <circle cx="25" cy="100" r="4.5" fill="currentColor" className={animated ? 'animate-star-pulse' : ''} />
      <circle cx="100" cy="25" r="3.4" fill="currentColor" opacity="0.7" />
      <circle cx="175" cy="100" r="3.4" fill="currentColor" opacity="0.5" />
      <circle cx="100" cy="175" r="4" fill="currentColor" opacity="0.6" />
    </svg>
  );
};
