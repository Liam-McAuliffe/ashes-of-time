import { useState, useEffect } from 'react';
import { TutorialStep } from '../components/tutorial/TutorialOverlay';

interface UseTutorialProps {
  tutorialId: string; // Unique ID for this tutorial
  steps: TutorialStep[];
  autoShowOnMount?: boolean;
  showOnlyOnce?: boolean;
}

/**
 * Hook for managing tutorial state
 * Handles showing/hiding the tutorial, tracking completion, and persistence
 */
const useTutorial = ({
  tutorialId,
  steps,
  autoShowOnMount = false,
  showOnlyOnce = true,
}: UseTutorialProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const storageKey = `tutorial_completed_${tutorialId}`;

  // Check local storage on mount to see if this tutorial has been completed
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasCompletedTutorial = localStorage.getItem(storageKey) === 'true';
    
    if (autoShowOnMount && (!showOnlyOnce || !hasCompletedTutorial)) {
      // Delay showing the tutorial to allow the UI to render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoShowOnMount, showOnlyOnce, storageKey]);

  // Open the tutorial
  const openTutorial = () => {
    setIsOpen(true);
  };

  // Close the tutorial without marking as completed
  const closeTutorial = () => {
    setIsOpen(false);
  };

  // Mark the tutorial as completed
  const completeTutorial = () => {
    setIsOpen(false);
    
    if (showOnlyOnce && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
  };

  // Reset the tutorial completion status
  const resetTutorial = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  return {
    isOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
    steps
  };
};

export default useTutorial; 