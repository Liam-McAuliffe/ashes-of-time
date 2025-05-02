'use client';

import React, { useState, useRef, isValidElement, useEffect } from 'react';
import { 
  useFloating, 
  autoUpdate, 
  offset, 
  flip, 
  shift, 
  useHover, 
  useFocus, 
  useDismiss, 
  useRole, 
  useInteractions, 
  useMergeRefs, 
  FloatingPortal, 
  Placement 
} from '@floating-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTooltip } from '../../context/TooltipContext';

// For backward compatibility with existing code
interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Memoize any children to avoid re-renders
const MemoChild = React.memo(({ children }: { children: React.ReactNode }) => 
  <>{children}</>
);

MemoChild.displayName = 'MemoChild';

export function Tooltip({
  children,
  initialOpen = false,
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  children: React.ReactNode;
} & TooltipOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  // Create a context-like structure but with props flowing down instead
  // This maintains API compatibility with existing code
  const contextValue = {
    open,
    setOpen,
    placement,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {/* Use React's memo to prevent unnecessary re-renders of children */}
      <MemoChild>{children}</MemoChild>
    </TooltipContext.Provider>
  );
}

// This context is just for backward compatibility
const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  placement: Placement;
} | null>(null);

const useTooltipContext = () => {
  const context = React.useContext(TooltipContext);
  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip>');
  }
  return context;
};

export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
  const { open, setOpen } = useTooltipContext();
  const childrenRef = (children as any).ref;
  const mergedRef = useMergeRefs([propRef, childrenRef]);
  
  // Using the context-based tooltip for better performance
  const { showTooltip, hideTooltip } = useTooltip();
  const elementRef = useRef<HTMLElement | null>(null);

  const handleRef = (element: HTMLElement | null) => {
    if (typeof mergedRef === 'function') {
      mergedRef(element);
    }
    elementRef.current = element;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      
      // We'll capture the content from the closest TooltipContent and pass it
      const content = document.querySelector('[data-tooltip-content="true"]')?.innerHTML;
      if (content) {
        showTooltip(<div dangerouslySetInnerHTML={{ __html: content }} />, x, y);
      }
      
      setOpen(true);
    }
    if (props.onMouseEnter) {
      props.onMouseEnter(e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    hideTooltip();
    setOpen(false);
    if (props.onMouseLeave) {
      props.onMouseLeave(e);
    }
  };

  if (asChild && isValidElement(children)) {
    return React.cloneElement(
      children,
      {
        ref: handleRef, 
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ...props,
        ...children.props, 
        'data-state': open ? 'open' : 'closed'
      }
    );
  }

  return (
    <span 
      ref={handleRef} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      {...props} 
      data-state={open ? 'open' : 'closed'}
    >
      {children}
    </span>
  );
});

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function TooltipContent({ style, ...props }, propRef) {
  // Hidden div to store content for the optimized tooltip
  return (
    <div 
      style={{ display: 'none' }} 
      ref={propRef} 
      data-tooltip-content="true"
      {...props}
    />
  );
}); 