import { useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { fetchEvent } from '../store/slices/gameSlice';
import { RootState } from '../store';

export function useEventFetcher() {
  const dispatch = useAppDispatch();
  
  // Select individual state pieces
  const isLoading = useAppSelector((state: RootState) => state.game.isLoading);
  const isGameOver = useAppSelector((state: RootState) => state.game.isGameOver);
  const isNamingCompanion = useAppSelector((state: RootState) => state.game.isNamingCompanion);
  const day = useAppSelector((state: RootState) => state.game.day);

  useEffect(() => {
    if (isLoading && !isGameOver && !isNamingCompanion) {
      console.log(`useEventFetcher: isLoading is true (Day ${day}), dispatching fetchEvent...`);
      dispatch(fetchEvent());
    }
  }, [isLoading, isGameOver, isNamingCompanion, day, dispatch]);

  // Explicitly return null, although hooks don't strictly need to return.
  return null;
} 