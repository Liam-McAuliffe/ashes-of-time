import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface AnimatedTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  type?: 'fade' | 'slide' | 'scale' | 'collapse' | 'blur' | 'apocalyptic';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  className?: string;
  layoutId?: string;
  onExitComplete?: () => void;
}

/**
 * Animated transition component for smooth UI changes
 * Uses framer-motion for animations
 */
const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  isVisible,
  type = 'fade',
  direction = 'up',
  duration = 0.3,
  delay = 0,
  className = '',
  layoutId,
  onExitComplete,
}) => {
  // Animation variants based on type and direction
  const getVariants = (): Variants => {
    // Common animation properties
    const commonProps = {
      transition: { 
        duration, 
        delay,
        ease: type === 'apocalyptic' ? [0.22, 1, 0.36, 1] : 'easeInOut',
      }
    };
    
    // Fade variant
    if (type === 'fade') {
      return {
        hidden: { opacity: 0, ...commonProps },
        visible: { opacity: 1, ...commonProps },
        exit: { opacity: 0, ...commonProps }
      };
    }
    
    // Slide variants
    if (type === 'slide') {
      const offset = 20; // Distance to slide in pixels
      let x = 0;
      let y = 0;
      
      if (direction === 'up') y = offset;
      if (direction === 'down') y = -offset;
      if (direction === 'left') x = offset;
      if (direction === 'right') x = -offset;
      
      return {
        hidden: { opacity: 0, x, y, ...commonProps },
        visible: { opacity: 1, x: 0, y: 0, ...commonProps },
        exit: { opacity: 0, x: -x, y: -y, ...commonProps }
      };
    }
    
    // Scale variant
    if (type === 'scale') {
      return {
        hidden: { opacity: 0, scale: 0.8, ...commonProps },
        visible: { opacity: 1, scale: 1, ...commonProps },
        exit: { opacity: 0, scale: 0.8, ...commonProps }
      };
    }
    
    // Collapse variant (vertical)
    if (type === 'collapse') {
      return {
        hidden: { opacity: 0, height: 0, overflow: 'hidden', ...commonProps },
        visible: { opacity: 1, height: 'auto', overflow: 'hidden', ...commonProps },
        exit: { opacity: 0, height: 0, overflow: 'hidden', ...commonProps }
      };
    }
    
    // Blur variant
    if (type === 'blur') {
      return {
        hidden: { opacity: 0, filter: 'blur(8px)', ...commonProps },
        visible: { opacity: 1, filter: 'blur(0px)', ...commonProps },
        exit: { opacity: 0, filter: 'blur(8px)', ...commonProps }
      };
    }
    
    // Post-apocalyptic themed variant (glitchy, distorted entry)
    if (type === 'apocalyptic') {
      return {
        hidden: { 
          opacity: 0,
          x: Math.random() < 0.5 ? -5 : 5,
          filter: 'blur(2px) contrast(0.8)', 
          ...commonProps 
        },
        visible: { 
          opacity: 1, 
          x: 0,
          filter: 'blur(0px) contrast(1)',
          transition: { 
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
            opacity: { duration: duration * 0.8 },
            filter: { duration: duration * 1.2 },
          }
        },
        exit: { 
          opacity: 0, 
          x: Math.random() < 0.5 ? 3 : -3,
          filter: 'blur(3px) contrast(0.9)', 
          ...commonProps 
        }
      };
    }
    
    // Default to fade
    return {
      hidden: { opacity: 0, ...commonProps },
      visible: { opacity: 1, ...commonProps },
      exit: { opacity: 0, ...commonProps }
    };
  };
  
  const variants = getVariants();
  
  return (
    <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
      {isVisible && (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          layoutId={layoutId}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedTransition; 