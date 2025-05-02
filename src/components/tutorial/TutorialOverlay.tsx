import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Radio } from 'lucide-react';

export interface TutorialStep {
  id: string;
  title: string;
  content: React.ReactNode;
  targetElement?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * Tutorial overlay component that provides step-by-step guidance
 * Highlights specific elements and displays information
 */
const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ 
    top: 0, 
    left: 0, 
    width: 0, 
    height: 0 
  });

  const currentStep = steps[currentStepIndex];

  // Position the highlight around the target element
  useEffect(() => {
    if (!isOpen || !currentStep.targetElement) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStep.targetElement || '');
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        
        setHighlightPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updatePosition();
    
    // Recompute position on resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isOpen, currentStep]);

  // Handle navigation between steps
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Determine instruction box position based on target element position
  const getInstructionBoxPosition = () => {
    if (!currentStep.targetElement || currentStep.position === 'center') {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)' 
      };
    }

    const margin = 20; // Distance from highlighted element
    const safeMargin = 20; // Minimum distance from viewport edge
    
    switch (currentStep.position || 'bottom') {
      case 'top':
        // For 'top' position, check if there's enough space
        const spaceAbove = highlightPosition.top;
        if (spaceAbove < 150) { // Not enough space above, move to bottom
          return {
            top: `${highlightPosition.top + highlightPosition.height + margin}px`,
            left: `${highlightPosition.left + highlightPosition.width / 2}px`,
            transform: 'translateX(-50%)',
          };
        }
        return {
          top: `${Math.max(safeMargin, highlightPosition.top - margin - 120)}px`, // 120px is approximate box height
          left: `${highlightPosition.left + highlightPosition.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'right':
        return {
          left: `${highlightPosition.left + highlightPosition.width + margin}px`,
          top: `${highlightPosition.top + highlightPosition.height / 2}px`,
          transform: 'translateY(-50%)',
        };
      case 'bottom':
        return {
          top: `${highlightPosition.top + highlightPosition.height + margin}px`,
          left: `${highlightPosition.left + highlightPosition.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          right: `calc(100vw - ${highlightPosition.left - margin}px)`,
          top: `${highlightPosition.top + highlightPosition.height / 2}px`,
          transform: 'translateY(-50%)',
        };
      default:
        return { 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        };
    }
  };

  if (!isOpen) return null;

  // Create the dimensions for our four overlay parts that create the cutout effect
  const overlayParts = currentStep.targetElement ? [
    // Top overlay
    {
      top: 0,
      left: 0,
      width: "100%",
      height: `${highlightPosition.top}px`,
    },
    // Right overlay
    {
      top: `${highlightPosition.top}px`,
      left: `${highlightPosition.left + highlightPosition.width}px`,
      width: `calc(100% - ${highlightPosition.left + highlightPosition.width}px)`,
      height: `${highlightPosition.height}px`,
    },
    // Bottom overlay
    {
      top: `${highlightPosition.top + highlightPosition.height}px`,
      left: 0,
      width: "100%",
      height: `calc(100% - ${highlightPosition.top + highlightPosition.height}px)`,
    },
    // Left overlay
    {
      top: `${highlightPosition.top}px`,
      left: 0,
      width: `${highlightPosition.left}px`,
      height: `${highlightPosition.height}px`,
    },
  ] : [];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 
        Instead of one big overlay with a cutout, we'll create four overlay parts 
        that surround the highlighted element without covering it
      */}
      {currentStep.targetElement ? (
        // Split overlays to create the cutout effect
        overlayParts.map((part, index) => (
          <div
            key={`overlay-part-${index}`}
            className="absolute bg-black/70 backdrop-blur-sm pointer-events-auto"
            style={part}
          />
        ))
      ) : (
        // Full screen overlay when no target element
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto" />
      )}
      
      {/* Highlight border */}
      {currentStep.targetElement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute border-2 border-rust rounded-sm pointer-events-none z-[52]"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
          }}
        />
      )}

      {/* Instruction box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 20 }}
        className="absolute z-[53] w-80 max-w-[calc(100vw-40px)] bg-charcoal border-2 border-rust rounded-md shadow-lg p-4 pointer-events-auto"
        style={getInstructionBoxPosition()}
      >
        {/* Radio static effect in top-left */}
        <div className="absolute -top-3 -left-3 flex items-center justify-center">
          <Radio className="text-olive w-6 h-6" />
          <motion.div 
            className="absolute inset-0 bg-rust rounded-full"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        </div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-olive hover:text-stone transition-colors"
          aria-label="Close tutorial"
        >
          <X size={16} />
        </button>

        {/* Step indicator */}
        <div className="flex items-center text-xs text-olive mb-1">
          <div className="flex-1">SURVIVAL GUIDE {currentStepIndex + 1}/{steps.length}</div>
        </div>

        {/* Step title */}
        <h3 className="text-rust text-lg font-bold mb-2">{currentStep.title}</h3>
        
        {/* Step content */}
        <div className="text-stone mb-4">
          {currentStep.content}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-1">
          <button
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
            className={`flex items-center text-sm ${
              currentStepIndex === 0 ? 'text-olive/40 cursor-not-allowed' : 'text-olive hover:text-stone'
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>

          <button
            onClick={goToNextStep}
            className="flex items-center text-rust hover:text-stone text-sm font-semibold"
          >
            {currentStepIndex < steps.length - 1 ? 'Next' : 'Finish'}
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorialOverlay; 