import { Survivor, HuntResult, GatherResult, SurvivorChange, StatusEffect } from '../types/game';

// Define status categories for coloring
const positiveStatuses: StatusEffect[] = ['Hopeful', 'Companion Bond'];
const negativeStatuses: StatusEffect[] = [
  'Dehydrated', 'Malnourished', 'Injured (Bleeding)', 'Exhausted', 'Fever', 
  'Infected Wound', 'Hypothermia', 'Heatstroke', 'Poisoned', 'Broken Limb', 
  'Cold', 'Sick', 'Scared'
];

// Export the helper function
export const getStatusColor = (status: StatusEffect): string => {
  if (positiveStatuses.includes(status)) return 'bg-green-600/70 text-green-100';
  if (negativeStatuses.includes(status)) return 'bg-red-700/70 text-red-100';
  return 'bg-gray-500/70 text-gray-100'; // Default/neutral
};

export function checkGameOver(
  food: number,
  water: number,
  survivors: Survivor[]
): string | null {
  if (food <= 0) return 'You ran out of food!';
  if (water <= 0) return 'You ran out of water!';
  
  const livingCount = survivors.filter((s) => s.health > 0).length;
  if (livingCount === 0) return 'All survivors have perished.';

  return null;
}

export function applyDailyStatusEffects(survivors: Survivor[]): Survivor[] {
  return survivors.map((survivor) => {
    if (survivor.health <= 0) return survivor; // Skip dead survivors

    let newHealth = survivor.health;
    let currentStatuses = [...survivor.statuses]; // Work with a copy
    let maxHealth = 100;

    // Apply passive HP changes from statuses
    if (currentStatuses.includes('Malnourished')) newHealth -= 2;
    if (currentStatuses.includes('Injured (Bleeding)')) newHealth -= 3; // Passive bleed
    if (currentStatuses.includes('Fever')) {
        newHealth -= 4;
        maxHealth = 85; // Reduce max health temporarily
    }
    if (currentStatuses.includes('Infected Wound')) newHealth -= 5;
    if (currentStatuses.includes('Hypothermia')) newHealth -= 3; 
    if (currentStatuses.includes('Heatstroke')) newHealth -= 3;
    if (currentStatuses.includes('Poisoned')) newHealth -= 4;
    if (currentStatuses.includes('Sick')) newHealth -= 2;
    
    // Positive effects
    if (currentStatuses.includes('Companion Bond') && survivor.companion) newHealth += 5;
    
    // Apply companion healing bonus (additive with bond)
    if (survivor.companion?.bonuses?.healing_rate) {
      newHealth += survivor.companion.bonuses.healing_rate;
    }

    // Clamp health between 0 and current maxHealth
    newHealth = Math.max(0, Math.min(maxHealth, newHealth));

    // Note: Status removal is now primarily handled by explicit removeStatus actions
    // We could add logic here for statuses wearing off naturally over time if desired later.
    
    return {
      ...survivor,
      health: newHealth,
      statuses: currentStatuses, // Return the potentially modified statuses
    };
  });
}

export function applySurvivorChanges(
  survivors: Survivor[],
  changes: SurvivorChange[]
): Survivor[] {
  if (!changes || changes.length === 0) return survivors;

  const MAX_SURVIVORS = 5;
  let tempSurvivors = JSON.parse(JSON.stringify(survivors)) as Survivor[]; // Type assertion

  changes.forEach((change) => {
    // Handle adding a new survivor first
    if (change.new === true) {
      if (tempSurvivors.length < MAX_SURVIVORS) {
        const newSurvivor: Survivor = {
          id: `survivor_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          name: change.name || 'Newcomer',
          health: typeof change.health === 'number' ? Math.max(0, Math.min(100, change.health)) : 80,
          // Ensure statuses are correctly typed
          statuses: (change.statuses as StatusEffect[]) || [], 
          companion: change.addCompanion ? { ...change.addCompanion, id: `comp_${Date.now()}` } : null,
        };
        if (typeof change.healthChange === 'number') {
          newSurvivor.health = Math.max(0, Math.min(100, newSurvivor.health + change.healthChange));
        }
        tempSurvivors.push(newSurvivor);
        console.log('Added new survivor:', newSurvivor);
      }
      return; // Skip applying other changes to this 'new' entry
    }

    // --- Existing logic for modifying survivors ---
    let targets: Survivor[] = [];
    
    if (change.target === 'player') {
      targets = tempSurvivors.filter((s) => s.id === 'player');
    } else if (change.target === 'random') {
      const living = tempSurvivors.filter((s) => s.health > 0);
      if (living.length > 0) {
        targets.push(living[Math.floor(Math.random() * living.length)]);
      }
    } else if (change.target === 'all') {
      targets = tempSurvivors.filter((s) => s.health > 0);
    } else {
      targets = tempSurvivors.filter(
        (s) => s.id === change.target || s.name === change.target
      );
    }

    targets.forEach((targetSurvivor) => {
      const survivorIndex = tempSurvivors.findIndex(
        (s) => s.id === targetSurvivor.id
      );
      if (survivorIndex === -1 || tempSurvivors[survivorIndex].health <= 0) return; // Skip dead survivors

      // Apply health change first
      if (typeof change.healthChange === 'number') {
        tempSurvivors[survivorIndex].health += change.healthChange;
      }

      // Apply status changes
      const currentStatuses = tempSurvivors[survivorIndex].statuses;
      let newStatuses = [...currentStatuses];

      if (change.addStatus && !newStatuses.includes(change.addStatus)) {
        // Special handling for Injured (Bleeding) - apply immediate damage
        if (change.addStatus === 'Injured (Bleeding)') {
           tempSurvivors[survivorIndex].health -= 5; // Immediate damage
        }
        newStatuses.push(change.addStatus);
      }

      if (change.removeStatus) {
        if (change.removeStatus === 'all_negative') {
            // Define which statuses are considered negative
            const negativeStatuses: StatusEffect[] = [
                'Dehydrated', 'Malnourished', 'Injured (Bleeding)', 'Exhausted',
                'Fever', 'Infected Wound', 'Hypothermia', 'Heatstroke', 
                'Poisoned', 'Broken Limb', 'Cold', 'Sick', 'Scared'
            ];
            newStatuses = newStatuses.filter(status => !negativeStatuses.includes(status));
        } else {
            newStatuses = newStatuses.filter((status) => status !== change.removeStatus);
        }
      }

      tempSurvivors[survivorIndex].statuses = newStatuses;

      // Clamp health after potential immediate damage from status
      tempSurvivors[survivorIndex].health = Math.max(
        0,
        Math.min(100, tempSurvivors[survivorIndex].health)
      );

      // Handle companions
      if (change.addCompanion && typeof change.addCompanion === 'object') {
        if (tempSurvivors[survivorIndex].companion === null) {
           // Ensure companion gets a unique ID
          const companionId = `comp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
          tempSurvivors[survivorIndex].companion = { ...change.addCompanion, id: companionId };
        }
      }

      if (change.removeCompanion === true) {
        if (tempSurvivors[survivorIndex].companion !== null) {
          tempSurvivors[survivorIndex].companion = null;
        }
      }
    });
  });

  return tempSurvivors;
}

export function calculateDailyConsumption(survivors: Survivor[]): {
  foodConsumed: number;
  waterConsumed: number;
} {
  let totalFoodConsumed = 0;
  let totalWaterConsumed = 0;

  survivors.forEach(survivor => {
    if (survivor.health > 0) { // Only living survivors consume
      let foodRate = 1;
      let waterRate = 1;

      // Apply status effects on consumption rates
      if (survivor.statuses.includes('Dehydrated')) waterRate += 1;
      if (survivor.statuses.includes('Heatstroke')) waterRate += 1;
      // Removed Hypothermia affecting water, as per description
      // Companion Bond doubles consumption for the survivor
      if (survivor.statuses.includes('Companion Bond') && survivor.companion) {
         foodRate *= 2;
         waterRate *= 2;
      }

      totalFoodConsumed += foodRate;
      totalWaterConsumed += waterRate;
    }
  });

  return {
    foodConsumed: Math.max(0, Math.round(totalFoodConsumed)), // Ensure non-negative whole numbers
    waterConsumed: Math.max(0, Math.round(totalWaterConsumed)),
  };
}

// Redefine result interfaces to exclude healthChange
interface SimplifiedHuntResult {
  hunterId: string;
  foodGained: number;
  outcomeText: string;
}

interface SimplifiedGatherResult {
  gathererId: string;
  waterGained: number;
  outcomeText: string;
}

export function calculateHuntingOutcome(
  hunter: Survivor,
  reactionTimeMs: number
): SimplifiedHuntResult { // Updated return type
  const baseFood = 3;
  const maxFood = 8;
  const minReactionTime = 200;
  const maxReactionTime = 1000;

  const normalizedTime = Math.max(
    0,
    Math.min(1, (reactionTimeMs - minReactionTime) / (maxReactionTime - minReactionTime))
  );
  const successFactor = 1 - normalizedTime;

  // Apply companion hunting bonus if any
  const huntingBonus = hunter.companion?.bonuses?.hunting_yield || 0; // Use hunting_yield
  const foodMultiplier = 1 + huntingBonus / 100; // Assuming bonus is stored as percentage (e.g., 20 for 20%)

  let foodGained = Math.round(
    (baseFood + (maxFood - baseFood) * successFactor) * foodMultiplier
  );

  // Determine outcome text based on success
  let outcomeText = '';

  if (successFactor >= 0.8) {
    foodGained += 2;
    outcomeText = `${hunter.name} had an excellent hunt! The timing was perfect. Gained ${foodGained} food.`;
  } else if (successFactor >= 0.5) {
    outcomeText = `${hunter.name} managed to catch some prey. Gained ${foodGained} food.`;
  } else if (successFactor >= 0.2) {
    outcomeText = `${hunter.name} barely caught anything, only finding ${foodGained} food.`;
  } else {
    foodGained = 0; // Ensure 0 food on complete failure
    outcomeText = `${hunter.name} failed to catch anything useful.`;
  }

  if (huntingBonus > 0) {
    outcomeText += ` Your companion's expertise yielded more food.`; // Adjusted text slightly
  }

  return {
    hunterId: hunter.id,
    foodGained,
    outcomeText,
  };
}

export function calculateGatherWaterOutcome(
  gatherer: Survivor
): SimplifiedGatherResult { // Updated return type
  const baseWater = 2;
  const maxWater = 6;
  const successFactor = Math.random();

  // Apply companion gathering bonus if any
  // For now, let's assume gathering_success_chance affects the random factor
  const gatheringBonusChance = gatherer.companion?.bonuses?.gathering_success_chance || 0; 
  const clampedSuccessFactor = Math.min(1, successFactor * (1 + gatheringBonusChance / 100)); // Increase chance of higher random number
  // Clamp successFactor just in case

  // Consider if there should be a yield bonus too? For now, just success chance.
  const waterMultiplier = 1; // No yield multiplier for now

  let waterGained = Math.round(
    (baseWater + (maxWater - baseWater) * clampedSuccessFactor) * waterMultiplier
  );

  // Determine outcome text based on success
  let outcomeText = '';

  if (successFactor >= 0.8) {
    waterGained += 2;
    outcomeText = `${gatherer.name} found a pristine water source! Gathered ${waterGained} water.`;
  } else if (successFactor >= 0.5) {
    outcomeText = `${gatherer.name} gathered some water successfully. Gathered ${waterGained} water.`;
  } else if (successFactor >= 0.2) {
    outcomeText = `${gatherer.name} found little water, only managing ${waterGained}.`;
  } else {
    waterGained = 0; // Ensure 0 water on complete failure
    outcomeText = `${gatherer.name} found no clean water sources nearby.`;
  }

  if (gatheringBonusChance > 0) {
    outcomeText += ` Your companion helped find a better spot.`; // Adjusted text slightly
  }

  return {
    gathererId: gatherer.id,
    waterGained,
    outcomeText,
  };
} 