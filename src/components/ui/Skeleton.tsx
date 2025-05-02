import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton component for loading states
 * Provides a placeholder while content is loading
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  animation = 'pulse',
  width,
  height,
}) => {
  // Base classes for shape variants
  const variantClasses = {
    text: 'rounded h-4',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
    circular: 'rounded-full',
  };

  // Animation classes
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden after:absolute after:inset-0 after:translate-x-[-100%] after:animate-wave after:bg-gradient-to-r after:from-transparent after:via-olive/10 after:to-transparent',
    none: '',
  };

  // Combine classes for final styles
  const classes = `
    bg-olive/20 
    ${variantClasses[variant]} 
    ${animationClasses[animation]} 
    ${className}
  `;

  // Inline styles for width and height
  const styles: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return <div className={classes} style={styles} aria-hidden="true" />;
};

export default Skeleton; 