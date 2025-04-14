export const calculateGatherWaterOutcome = (gathererSurvivor) => {
  const baseWaterMin = 2;
  const baseWaterMax = 8;
  const healthCostMin = 5;
  const healthCostMax = 15;
  const successChance = 0.8;

  const healthChange = -Math.floor(
    Math.random() * (healthCostMax - healthCostMin + 1) + healthCostMin
  );

  let waterGained = 0;
  let outcomeText = '';

  if (Math.random() < successChance) {
    waterGained = Math.floor(
      Math.random() * (baseWaterMax - baseWaterMin + 1) + baseWaterMin
    );

    if (gathererSurvivor.health > 80) {
      waterGained += 1;
    } else if (gathererSurvivor.health < 40) {
      waterGained = Math.max(0, waterGained - 1);
    }

    waterGained = Math.max(0, waterGained);

    if (waterGained <= 2) {
      outcomeText = `${gathererSurvivor.name} searched hard but found only ${waterGained} water, returning exhausted (Health ${healthChange}).`;
    } else {
      outcomeText = `${gathererSurvivor.name} managed to gather ${waterGained} water, but the effort took its toll (Health ${healthChange}).`;
    }
  } else {
    waterGained = 0;
    outcomeText = `${gathererSurvivor.name} searched everywhere but found no water sources, returning exhausted and thirsty (Health ${healthChange}).`;
  }

  return {
    waterGained,
    healthChange,
    targetSurvivorId: gathererSurvivor.id,
    outcomeText,
  };
};

export const calculateHuntSuccessOutcome = (hunterSurvivor) => {
  const baseFoodGainMin = 5;
  const baseFoodGainMax = 15;
  const healthCostMin = 3;
  const healthCostMax = 10;
  const companionFoodBonusMin = 3;
  const companionFoodBonusMax = 7;

  let foodGained = Math.floor(
    Math.random() * (baseFoodGainMax - baseFoodGainMin + 1) + baseFoodGainMin
  );
  const healthChange = -Math.floor(
    Math.random() * (healthCostMax - healthCostMin + 1) + healthCostMin
  );
  const hasCompanion = hunterSurvivor.companion !== null;

  let outcomeText = '';
  if (hasCompanion) {
    const bonus = Math.floor(
      Math.random() * (companionFoodBonusMax - companionFoodBonusMin + 1) +
        companionFoodBonusMin
    );
    foodGained += bonus;
    outcomeText = `${hunterSurvivor.name} reacted quickly during the hunt with ${hunterSurvivor.companion.name}'s help! They returned tired (Health ${healthChange}) but successful, bringing back ${foodGained} food!`;
  } else {
    outcomeText = `${hunterSurvivor.name} reacted quickly during the hunt! They returned tired (Health ${healthChange}) but managed to find ${foodGained} food.`;
  }

  return { foodGained, healthChange, outcomeText };
};

export const calculateHuntFailureOutcome = (hunterSurvivor) => {
  const healthCostMin = 8;
  const healthCostMax = 18;
  const foodGained = 0;
  const healthChange = -Math.floor(
    Math.random() * (healthCostMax - healthCostMin + 1) + healthCostMin
  );
  const outcomeText = `${hunterSurvivor.name} hesitated during the hunt and the prey escaped. They returned empty-handed and exhausted (Health ${healthChange}).`;

  return { foodGained, healthChange, outcomeText };
};

export const checkGameOver = (food, water, survivors) => {
  const player = survivors.find((s) => s.id === 'player');
  if (food <= 0) return 'You ran out of food!';
  if (water <= 0) return 'You ran out of water!';
  if (player && player.health <= 0) return 'Your health failed!';
  return null;
};

export const applyDailyStatusEffects = (survivors) => {
  return survivors.map((survivor) => {
    if (survivor.health <= 0) return survivor;
    let newHealth = survivor.health;
    const newStatuses = [...survivor.statuses];
    if (newStatuses.includes('bleeding')) newHealth -= 5;
    if (newStatuses.includes('sick')) newHealth -= 3;
    return { ...survivor, health: Math.max(0, newHealth) };
  });
};

export const applySurvivorChanges = (
  currentSurvivors,
  survivorChanges = []
) => {
  let tempSurvivors = JSON.parse(JSON.stringify(currentSurvivors));
  survivorChanges.forEach((change) => {
    let targets = [];
    if (change.target === 'player')
      targets = tempSurvivors.filter((s) => s.id === 'player');
    else if (change.target === 'random') {
      const living = tempSurvivors.filter((s) => s.health > 0);
      if (living.length > 0)
        targets.push(living[Math.floor(Math.random() * living.length)]);
    } else if (change.target === 'all') {
      targets = tempSurvivors.filter((s) => s.health > 0);
    } else if (change.target === 'new') {
      if (tempSurvivors.length < 5) {
        const newSurvivor = {
          id: `survivor_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          name: change.name || 'New Survivor',
          health: change.health || 80,
          statuses: change.statuses || [],
          companion: null,
        };
        tempSurvivors.push(newSurvivor);
      } else {
        console.warn('Attempted to add survivor beyond limit (5).');
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
        } else {
          console.warn(
            `${tempSurvivors[survivorIndex].name} already has a companion.`
          );
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
};

export const calculateDailyConsumption = (survivors) => {
  const livingSurvivorCount = survivors.filter((s) => s.health > 0).length;
  const foodConsumed = livingSurvivorCount * 1;
  const waterConsumed = livingSurvivorCount * 1;
  return { foodConsumed, waterConsumed };
};
