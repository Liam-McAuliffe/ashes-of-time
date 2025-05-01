import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  className = '',
  formatter = (val) => val.toString(),
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let startValue = displayValue;
    const endValue = value;
    const startTime = performance.now();
    const change = endValue - startValue;
    
    if (change === 0) return;
    
    const animateNumber = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      
      if (elapsedTime >= duration) {
        setDisplayValue(endValue);
        return;
      }
      
      const progress = elapsedTime / duration;
      const easedProgress = easeOutCubic(progress);
      const currentValue = startValue + change * easedProgress;
      
      setDisplayValue(currentValue);
      requestAnimationFrame(animateNumber);
    };
    
    requestAnimationFrame(animateNumber);
  }, [value, duration]);
  
  // Easing function for smooth animation
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

  return (
    <span className={`transition-opacity duration-100 ${className} ${value < displayValue ? 'text-red-500' : value > displayValue ? 'text-green-500' : ''}`}>
      {formatter(Math.round(displayValue))}
    </span>
  );
};

export default AnimatedNumber; 