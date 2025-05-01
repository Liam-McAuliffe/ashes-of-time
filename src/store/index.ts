import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from './storage';
import gameReducer from './slices/gameSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['game']
};

const persistedReducer = persistReducer(persistConfig, gameReducer);

export const store = configureStore({
  reducer: {
    game: persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 