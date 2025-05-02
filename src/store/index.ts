import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from './storage';
import gameReducer from './slices/gameSlice';
import inventoryReducer from './slices/inventorySlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['game']
};

const persistedReducer = persistReducer(persistConfig, gameReducer);

/**
 * Configure the Redux store with all reducers
 */
export const store = configureStore({
  reducer: {
    game: persistedReducer,
    inventory: inventoryReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 