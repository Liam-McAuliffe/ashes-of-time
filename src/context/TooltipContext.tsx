import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * Interface for the TooltipContext
 * 
 * @interface TooltipContextType
 * @property {(content: React.ReactNode, x: number, y: number) => void} showTooltip - Function to show a tooltip
 * @property {() => void} hideTooltip - Function to hide the current tooltip
 * @property {React.ReactNode} content - The content of the current tooltip
 * @property {{ x: number; y: number } | null} position - Position of the tooltip or null if hidden
 */
type TooltipContextType = {
  showTooltip: (content: React.ReactNode, x: number, y: number) => void;
  hideTooltip: () => void;
  content: React.ReactNode;
  position: { x: number; y: number } | null;
};

/**
 * Context for the centralized tooltip system
 * 
 * @type {React.Context<TooltipContextType | null>}
 */
const TooltipContext = createContext<TooltipContextType | null>(null);

/**
 * Hook to access the tooltip context in components
 * 
 * @returns {TooltipContextType} The tooltip context value
 * @throws {Error} If used outside of a TooltipProvider
 */
export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};

/**
 * Provider component for the tooltip system
 * 
 * Manages the state and logic for showing and hiding tooltips
 * throughout the application.
 * 
 * @param {{ children: React.ReactNode }} props - Provider props
 * @returns {React.ReactElement} Provider component with children
 */
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Shows a tooltip with the given content at the specified position
   * 
   * Includes debouncing to prevent tooltips from appearing too quickly
   * during rapid mouse movements.
   * 
   * @param {React.ReactNode} content - Content to show in the tooltip
   * @param {number} x - X coordinate position
   * @param {number} y - Y coordinate position
   */
  const showTooltip = useCallback((content: React.ReactNode, x: number, y: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setContent(content);
      setPosition({ x, y });
    }, 200); // Debounce tooltip appearance
  }, []);

  /**
   * Hides the currently displayed tooltip
   * 
   * Clears any pending show tooltip timeouts and resets the state.
   */
  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setContent(null);
    setPosition(null);
  }, []);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip, content, position }}>
      {children}
    </TooltipContext.Provider>
  );
};

/**
 * Component that renders the actual tooltip content
 * 
 * Should be rendered once at the application root level. The tooltip
 * will appear when content and position are set in the context.
 * 
 * Implements boundary detection to keep tooltips on screen.
 * 
 * @returns {React.ReactElement | null} The tooltip content or null if hidden
 */
export const TooltipContent: React.FC = () => {
  const { content, position } = useTooltip();
  const tooltipRef = useRef<HTMLDivElement>(null);

  if (!content || !position) return null;

  // We need a useLayoutEffect to measure the tooltip and adjust position,
  // but we'll keep this simplified approach for now that should work in most cases
  // Calculate safe positioning to keep tooltip on screen
  let tooltipX = position.x;
  let tooltipY = position.y + 10; // Add a little offset from the trigger

  // Use current window dimensions to ensure tooltip stays within viewport
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  
  // Approximate tooltip size - we'd ideally measure this with useLayoutEffect
  const estimatedWidth = 200; // px, estimated tooltip width
  const estimatedHeight = 50; // px, estimated tooltip height
  
  // Keep tooltip within horizontal bounds
  const rightEdge = tooltipX + estimatedWidth/2;
  const leftEdge = tooltipX - estimatedWidth/2;
  
  if (rightEdge > windowWidth - 10) {
    // Too far right - push it left
    tooltipX = windowWidth - 10 - estimatedWidth/2;
  } else if (leftEdge < 10) {
    // Too far left - push it right
    tooltipX = 10 + estimatedWidth/2;
  }
  
  // Keep tooltip within vertical bounds
  if (tooltipY + estimatedHeight > windowHeight - 10) {
    // If it would go off the bottom, show it above the element instead
    tooltipY = position.y - estimatedHeight - 5;
  }

  return (
    <div
      ref={tooltipRef}
      className="z-50 fixed rounded bg-charcoal/90 px-2.5 py-1.5 text-sm text-stone shadow-md backdrop-blur-sm max-w-xs"
      style={{
        top: tooltipY,
        left: tooltipX,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}
    >
      {content}
    </div>
  );
}; 