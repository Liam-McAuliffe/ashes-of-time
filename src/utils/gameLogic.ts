import { Survivor, HuntResult, GatherResult, SurvivorChange } from '../types/game';

export const calculateDailyConsumption = (survivors: Survivor[]) => {
  const livingCount = survivors.filter(s => s.health > 0).length;
  return {
    foodConsumed: livingCount,
    waterConsumed: livingCount
  };
};

export const checkGameOver = (
  food: number,
  water: number,
  survivors: Survivor[]
): string | null => {
  if (food <= 0) return 'You ran out of food.';
  if (water <= 0) return 'You ran out of water.';
  
  const playerSurvivor = survivors.find(s => s.id === 'player');
  if (!playerSurvivor || playerSurvivor.health <= 0) {
    return 'You did not survive.';
  }

  const livingCount = survivors.filter(s => s.health > 0).length;
  if (livingCount === 0) return 'All survivors have perished.';

  return null;
};

export const applyDailyStatusEffects = (survivors: Survivor[]): Survivor[] => {
  return survivors.map(survivor => {
    let health = survivor.health;
    const newStatuses = [...survivor.statuses];

    // Apply status effects
    if (newStatuses.includes('sick')) {
      health -= 5;
    }
    if (newStatuses.includes('injured')) {
      health -= 3;
    }

    // Remove temporary statuses with a chance
    const statusesToRemove = [];
    newStatuses.forEach(status => {
      if (status === 'injured' && Math.random() < 0.3) {
        statusesToRemove.push(status);
      }
      if (status === 'sick' && Math.random() < 0.2) {
        statusesToRemove.push(status);
      }
    });

    return {
      ...survivor,
      health: Math.max(0, health),
      statuses: newStatuses.filter(s => !statusesToRemove.includes(s))
    };
  });
};

export const applySurvivorChanges = (
  survivors: Survivor[],
  changes?: SurvivorChange[]
): Survivor[] => {
  if (!changes || changes.length === 0) return survivors;

  return survivors.map(survivor => {
    const change = changes.find(c => c.id === survivor.id);
    if (!change) return survivor;

    const newHealth = change.health !== undefined 
      ? Math.max(0, survivor.health + change.health)
      : survivor.health;

    const newStatuses = [...survivor.statuses];
    if (change.statuses?.add) {
      change.statuses.add.forEach(status => {
        if (!newStatuses.includes(status)) {
          newStatuses.push(status);
        }
      });
    }
    if (change.statuses?.remove) {
      change.statuses.remove.forEach(status => {
        const index = newStatuses.indexOf(status);
        if (index !== -1) {
          newStatuses.splice(index, 1);
        }
      });
    }

    return {
      ...survivor,
      health: newHealth,
      statuses: newStatuses,
      companion: change.companion || survivor.companion
    };
  });
};

export const calculateHuntSuccessOutcome = (hunter: Survivor): HuntResult => {
  const baseFood = Math.floor(Math.random() * 3) + 2; // 2-4 food
  const bonusFood = hunter.companion?.bonuses?.hunting || 0;
  const totalFood = baseFood + bonusFood;

  return {
    success: true,
    foodGained: totalFood,
    survivorId: hunter.id,
    outcomeText: `${hunter.name} successfully hunted and found ${totalFood} food!${bonusFood > 0 ? ` (Companion bonus: +${bonusFood})` : ''}`
  };
};

export const calculateHuntFailureOutcome = (hunter: Survivor): HuntResult => {
  const healthLost = Math.floor(Math.random() * 10) + 5; // 5-15 health loss
  const statusGained = Math.random() < 0.3 ? 'injured' : undefined;

  return {
    success: false,
    foodGained: 0,
    survivorId: hunter.id,
    healthLost,
    statusGained,
    outcomeText: `${hunter.name} failed to catch anything and got ${statusGained || 'tired'} (-${healthLost} health)`
  };
};

export const calculateGatherWaterOutcome = (gatherer: Survivor): GatherResult => {
  const success = Math.random() > 0.3; // 70% success rate
  
  if (success) {
    const baseWater = Math.floor(Math.random() * 3) + 2; // 2-4 water
    const bonusWater = gatherer.companion?.bonuses?.gathering || 0;
    const totalWater = baseWater + bonusWater;

    return {
      success: true,
      waterGained: totalWater,
      survivorId: gatherer.id,
      outcomeText: `${gatherer.name} found ${totalWater} water!${bonusWater > 0 ? ` (Companion bonus: +${bonusWater})` : ''}`
    };
  }

  const healthLost = Math.floor(Math.random() * 5) + 3; // 3-8 health loss

  return {
    success: false,
    waterGained: 0,
    survivorId: gatherer.id,
    healthLost,
    outcomeText: `${gatherer.name} couldn't find any water and got exhausted (-${healthLost} health)`
  };
}; 