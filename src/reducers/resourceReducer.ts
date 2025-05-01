import { GameState } from '../types/game';
import { calculateDailyConsumption } from '../utils/gameLogic';

export const handleResourceChanges = (
  state: GameState,
  foodEffect: number = 0,
  waterEffect: number = 0,
  applyDailyConsumption: boolean = false
): { food: number; water: number; foodChange: number; waterChange: number } => {
  const { food: startingFood, water: startingWater, survivors } = state;

  // Apply effects
  let tempFood = Math.max(0, startingFood + foodEffect);
  let tempWater = Math.max(0, startingWater + waterEffect);

  // Apply daily consumption if needed
  if (applyDailyConsumption) {
    const { foodConsumed, waterConsumed } = calculateDailyConsumption(survivors);
    tempFood = Math.max(0, tempFood - foodConsumed);
    tempWater = Math.max(0, tempWater - waterConsumed);
  }

  // Calculate changes for UI display
  const foodChange = tempFood - startingFood;
  const waterChange = tempWater - startingWater;

  return {
    food: tempFood,
    water: tempWater,
    foodChange,
    waterChange,
  };
}; 