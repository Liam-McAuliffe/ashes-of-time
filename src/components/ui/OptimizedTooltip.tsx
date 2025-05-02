import React, { useCallback, useRef } from 'react';
import { useTooltip } from '../../context/TooltipContext';

/**
 * Props for the OptimizedTooltip component
 * 
 * @interface TooltipProps
 * @property {React.ReactNode} content - Content to display in the tooltip
 * @property {React.ReactElement} children - Child element that triggers the tooltip
 * @property {string} [className] - Optional CSS class for additional styling
 * @property {boolean} [showOnDisabled=false] - Whether to show tooltip on disabled elements
 */
type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement;
  className?: string;
  showOnDisabled?: boolean;
};

/**
 * Performance-optimized tooltip component using React Context
 * 
 * This component uses a centralized context-based approach to tooltips
 * that minimizes re-renders and improves performance. It shows a tooltip
 * when hovering over the child element.
 * 
 * @param {TooltipProps} props - The component props
 * @returns {React.ReactElement} The wrapped child element with tooltip functionality
 * 
 * @example
 * <OptimizedTooltip content="This is a tooltip">
 *   <button>Hover me</button>
 * </OptimizedTooltip>
 */
const OptimizedTooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  className = '',
  showOnDisabled = false 
}) => {
  const { showTooltip, hideTooltip } = useTooltip();
  const childRef = useRef<HTMLElement>(null);

  /**
   * Handler for mouse enter event that shows the tooltip
   * using the positioned child element
   */
  const handleMouseEnter = useCallback(() => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const topY = rect.top;

      // If element is disabled and showOnDisabled is false, don't show tooltip
      if (childRef.current.hasAttribute('disabled') && !showOnDisabled) {
        return;
      }
      
      showTooltip(content, centerX, topY);
    }
  }, [content, showTooltip, showOnDisabled]);

  /**
   * Handler for mouse leave event that hides the tooltip
   */
  const handleMouseLeave = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  // Clone the child element and add our event handlers
  const childWithProps = React.cloneElement(children, {
    ref: childRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      // Preserve the original onMouseEnter if it exists
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      // Preserve the original onMouseLeave if it exists
      children.props.onMouseLeave?.(e);
    },
    className: `${children.props.className || ''} ${className}`.trim(),
  });

  return childWithProps;
};

export default OptimizedTooltip; 