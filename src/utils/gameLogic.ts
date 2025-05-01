import { Survivor, HuntResult, GatherResult, SurvivorChange } from '../types/game';

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
    if (survivor.health <= 0) return survivor;
    let newHealth = survivor.health;
    const newStatuses = [...survivor.statuses];

    // Apply status effects
    if (survivor.statuses.includes('bleeding')) newHealth -= 5;
    if (survivor.statuses.includes('sick')) newHealth -= 3;
    if (survivor.statuses.includes('injured')) newHealth -= 2;
    if (survivor.statuses.includes('fatigued')) newHealth -= 1;

    // Heal if companion has healing bonus
    if (survivor.companion?.bonuses?.healing) {
      newHealth = Math.min(100, newHealth + survivor.companion.bonuses.healing);
    }

    // Remove temporary statuses
    const permanentStatuses = newStatuses.filter(
      (status) => !['sick', 'injured', 'fatigued'].includes(status)
    );

    return {
      ...survivor,
      health: Math.max(0, newHealth),
      statuses: permanentStatuses,
    };
  });
}

export function applySurvivorChanges(
  survivors: Survivor[],
  changes: SurvivorChange[]
): Survivor[] {
  if (!changes || changes.length === 0) return survivors;

  let tempSurvivors = JSON.parse(JSON.stringify(survivors));
  changes.forEach((change) => {
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
    } else if (change.target === 'new') {
      if (tempSurvivors.length < 5) {
        const newSurvivor: Survivor = {
          id: `survivor_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          name: change.name || 'New Survivor',
          health: change.health || 80,
          statuses: change.statuses || [],
          companion: null,
        };
        tempSurvivors.push(newSurvivor);
      }
      return;
    } else {
      targets = tempSurvivors.filter(
        (s) => s.id === change.target || s.name === change.target
      );
    }

    targets.forEach((targetSurvivor) => {
      const survivorIndex = tempSurvivors.findIndex(
        (s) => s.id === targetSurvivor.id
      );
      if (survivorIndex === -1) return;

      if (typeof change.healthChange === 'number') {
        tempSurvivors[survivorIndex].health += change.healthChange;
        tempSurvivors[survivorIndex].health = Math.max(
          0,
          Math.min(100, tempSurvivors[survivorIndex].health)
        );
      }

      if (
        change.addStatus &&
        !tempSurvivors[survivorIndex].statuses.includes(change.addStatus)
      ) {
        tempSurvivors[survivorIndex].statuses.push(change.addStatus);
      }

      if (change.removeStatus) {
        tempSurvivors[survivorIndex].statuses = tempSurvivors[
          survivorIndex
        ].statuses.filter((status) => status !== change.removeStatus);
      }

      if (change.addCompanion && typeof change.addCompanion === 'object') {
        if (tempSurvivors[survivorIndex].companion === null) {
          tempSurvivors[survivorIndex].companion = { ...change.addCompanion };
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
  const livingCount = survivors.filter((s) => s.health > 0).length;
  return {
    foodConsumed: livingCount,
    waterConsumed: livingCount,
  };
}

export function calculateHuntingOutcome(
  hunter: Survivor,
  reactionTimeMs: number
): HuntResult {
  const baseFood = 3;
  const maxFood = 8;
  const minReactionTime = 200;
  const maxReactionTime = 1000;

  // Calculate success based on reaction time
  const normalizedTime = Math.max(
    0,
    Math.min(1, (reactionTimeMs - minReactionTime) / (maxReactionTime - minReactionTime))
  );
  const successFactor = 1 - normalizedTime;

  // Apply companion hunting bonus if any
  const huntingBonus = hunter.companion?.bonuses?.hunting || 0;
  const foodMultiplier = 1 + huntingBonus / 100;

  // Calculate food gained
  let foodGained = Math.round(
    (baseFood + (maxFood - baseFood) * successFactor) * foodMultiplier
  );

  // Determine health impact and outcome text
  let healthChange = 0;
  let outcomeText = '';

  if (successFactor >= 0.8) {
    // Great success
    foodGained += 2;
    outcomeText = `${hunter.name} had an excellent hunt! The timing was perfect.`;
  } else if (successFactor >= 0.5) {
    // Good success
    outcomeText = `${hunter.name} managed to catch some prey.`;
  } else if (successFactor >= 0.2) {
    // Poor success
    healthChange = -5;
    outcomeText = `${hunter.name} barely caught anything and got some scrapes (-5 HP).`;
  } else {
    // Failure
    foodGained = 0;
    healthChange = -10;
    outcomeText = `${hunter.name} failed to catch anything and got hurt in the process (-10 HP).`;
  }

  if (huntingBonus > 0) {
    outcomeText += ` Your companion's hunting expertise helped.`;
  }

  return {
    hunterId: hunter.id,
    foodGained,
    healthChange,
    outcomeText,
  };
}

export function calculateGatherWaterOutcome(
  gatherer: Survivor
): GatherResult {
  const baseWater = 2;
  const maxWater = 6;

  // Random success factor (0 to 1)
  const successFactor = Math.random();

  // Apply companion gathering bonus if any
  const gatheringBonus = gatherer.companion?.bonuses?.gathering || 0;
  const waterMultiplier = 1 + gatheringBonus / 100;

  // Calculate water gained
  let waterGained = Math.round(
    (baseWater + (maxWater - baseWater) * successFactor) * waterMultiplier
  );

  // Determine health impact and outcome text
  let healthChange = 0;
  let outcomeText = '';

  if (successFactor >= 0.8) {
    // Great success
    waterGained += 2;
    outcomeText = `${gatherer.name} found a pristine water source!`;
  } else if (successFactor >= 0.5) {
    // Good success
    outcomeText = `${gatherer.name} gathered some water successfully.`;
  } else if (successFactor >= 0.2) {
    // Poor success
    healthChange = -5;
    outcomeText = `${gatherer.name} found little water and got scratched up (-5 HP).`;
  } else {
    // Failure
    waterGained = 0;
    healthChange = -10;
    outcomeText = `${gatherer.name} found no clean water and got hurt (-10 HP).`;
  }

  if (gatheringBonus > 0) {
    outcomeText += ` Your companion's gathering skills were helpful.`;
  }

  return {
    gathererId: gatherer.id,
    waterGained,
    healthChange,
    outcomeText,
  };
} 