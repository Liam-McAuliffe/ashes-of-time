'use client';

import React, { useState, useMemo, createContext, useContext, cloneElement, useRef, isValidElement } from 'react';
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

interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface TooltipContextValue extends TooltipOptions {
  setOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>['refs'];
  context: ReturnType<typeof useFloating>['context'];
  floatingStyles: ReturnType<typeof useFloating>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

const useTooltipContext = () => {
  const context = useContext(TooltipContext);
  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip>');
  }
  return context;
};

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

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: (reference, floating, update) => 
      autoUpdate(reference, floating, update, { animationFrame: true }),
    middleware: [offset(5), flip(), shift({ padding: 8 })],
  });

  const context = data.context;

  const hover = useHover(context, { move: false, delay: { open: 100, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      context, // Ensure context is passed through
    }),
    [open, setOpen, interactions, data, context]
  );

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
}

export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
  const context = useTooltipContext();
  const childrenRef = (children as any).ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      context.getReferenceProps({ ...props, ...children.props, 'data-state': context.open ? 'open' : 'closed', ref })
    );
  }

  return (
    <span ref={ref} {...context.getReferenceProps(props)} data-state={context.open ? 'open' : 'closed'}>
      {children}
    </span>
  );
});

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function TooltipContent({ style, ...props }, propRef) {
  const context = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  // console.log('Floating Styles:', context.floatingStyles); // Keep log for now
  
  // Render directly without Portal or AnimatePresence
  if (!context.open) return null;

  return (
    <div
      ref={ref}
      style={{
        ...context.floatingStyles,
        ...style,
      }}
      {...context.getFloatingProps(props)}
      className="z-50 rounded bg-charcoal/90 px-2.5 py-1.5 text-sm text-stone shadow-md backdrop-blur-sm"
    >
      {props.children}
    </div>
  );
}); 