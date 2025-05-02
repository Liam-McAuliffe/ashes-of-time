import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'pulse' | 'spin' | 'countdown';
  className?: string;
}

/**
 * A themed loading indicator that fits the post-apocalyptic aesthetic
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = 'Loading...',
  size = 'md',
  type = 'spin',
  className = '',
}) => {
  // Determine size based on prop
  const sizeClass = {
    sm: 'text-xs h-5',
    md: 'text-sm h-6',
    lg: 'text-base h-8',
  }[size];

  // Spinner size based on component size
  const spinnerSize = {
    sm: 14,
    md: 18,
    lg: 24,
  }[size];

  // Return different loading indicators based on type
  if (type === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="bg-rust w-2 h-2 rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                y: [0, -4, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        {text && <span className={`text-olive ${sizeClass}`}>{text}</span>}
      </div>
    );
  }

  if (type === 'countdown') {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
        <div className="relative w-10 h-10">
          <motion.div
            className="absolute inset-0 border-2 border-rust rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute inset-0 border-t-2 border-olive rounded-full"
            animate={{ rotate: -360 }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        {text && <span className={`text-olive ${sizeClass} mt-1`}>{text}</span>}
      </div>
    );
  }

  // Default 'spin' type
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className="animate-spin text-rust" size={spinnerSize} />
      {text && <span className={`text-olive ${sizeClass}`}>{text}</span>}
    </div>
  );
};

export default LoadingIndicator; 