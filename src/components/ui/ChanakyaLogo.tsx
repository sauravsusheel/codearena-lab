import React from 'react';

interface ChanakyaLogoProps {
  variant?: 'full' | 'emblem' | 'compact';
  theme?: 'auto' | 'light' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  height?: number;
}

export function ChanakyaLogo({
  variant = 'full',
  theme = 'auto',
  size = 'md',
  className = '',
  height,
}: ChanakyaLogoProps) {
  const defaultHeights = {
    sm: 30,
    md: 38,
    lg: 52,
  };

  const calculatedHeight = height || defaultHeights[size];

  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <img
          src="/chanakya-emblem.png"
          alt="Chanakya University Symbol"
          style={{ height: `${calculatedHeight}px`, width: `${calculatedHeight}px` }}
          className="object-contain drop-shadow-sm transition-transform group-hover:scale-105"
        />
      </div>
    );
  }

  if (theme === 'white') {
    return (
      <div className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
        <img
          src="/chanakya-logo-white.png"
          alt="Chanakya University"
          style={{ height: `${calculatedHeight}px` }}
          className="w-auto object-contain transition-transform group-hover:scale-105"
        />
      </div>
    );
  }

  if (theme === 'light') {
    return (
      <div className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
        <img
          src="/chanakya-logo-color.png"
          alt="Chanakya University"
          style={{ height: `${calculatedHeight}px` }}
          className="w-auto object-contain transition-transform group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* Light Mode Logo */}
      <img
        src="/chanakya-logo-color.png"
        alt="Chanakya University"
        style={{ height: `${calculatedHeight}px` }}
        className="w-auto object-contain block dark:hidden transition-transform group-hover:scale-105"
      />
      {/* Dark Mode Logo */}
      <img
        src="/chanakya-logo-white.png"
        alt="Chanakya University"
        style={{ height: `${calculatedHeight}px` }}
        className="w-auto object-contain hidden dark:block transition-transform group-hover:scale-105"
      />
    </div>
  );
}
export default ChanakyaLogo;
