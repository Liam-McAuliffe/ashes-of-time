'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { TooltipProvider, TooltipContent } from '../context/TooltipContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TooltipProvider>
          {children}
          <TooltipContent />
        </TooltipProvider>
      </PersistGate>
    </Provider>
  );
} 