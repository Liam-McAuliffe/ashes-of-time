import { 
  AnyInventoryItem, 
  WeaponItem, 
  ToolItem, 
  MedicalItem, 
  ClothingItem, 
  FoodItem, 
  ResourceItem, 
  EquipmentItem 
} from '../types/inventory';

/**
 * Medical items
 */
export const MEDICAL_ITEMS: Record<string, MedicalItem> = {
  bandage: {
    id: 'bandage',
    name: 'Bandage',
    description: 'A simple cloth bandage. Stops bleeding and provides minor healing.',
    weight: 0.1,
    stackable: true,
    maxStack: 10,
    category: 'medical',
    rarity: 'common',
    consumable: true,
    healAmount: 10,
    cureStatus: ['Injured (Bleeding)'],
    useEffects: [
      {
        type: 'heal',
        value: 10,
        target: 'ally',
        description: 'Heals 10 health points'
      },
      {
        type: 'cure',
        status: 'Injured (Bleeding)',
        target: 'ally',
        description: 'Stops bleeding'
      }
    ],
    tags: ['healing', 'bleed', 'wound'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'cloth': 2 },
      requiredTools: ['scissors']
    }
  },
  
  antibiotics: {
    id: 'antibiotics',
    name: 'Antibiotics',
    description: 'Medication to treat infections. Rare and valuable in the wasteland.',
    weight: 0.2,
    stackable: true,
    maxStack: 5,
    category: 'medical',
    rarity: 'rare',
    consumable: true,
    cureStatus: ['Infected Wound', 'Fever'],
    useEffects: [
      {
        type: 'cure',
        status: 'Infected Wound',
        target: 'ally',
        description: 'Treats infected wounds'
      },
      {
        type: 'cure',
        status: 'Fever',
        target: 'ally',
        description: 'Reduces fever'
      }
    ],
    tags: ['medicine', 'infection', 'disease'],
    craftable: false
  },
  
  painkillers: {
    id: 'painkillers',
    name: 'Painkillers',
    description: 'Reduces pain temporarily and provides a small healing effect.',
    weight: 0.1,
    stackable: true,
    maxStack: 8,
    category: 'medical',
    rarity: 'uncommon',
    consumable: true,
    healAmount: 5,
    useEffects: [
      {
        type: 'heal',
        value: 5,
        target: 'ally',
        description: 'Heals 5 health points'
      },
      {
        type: 'buff',
        duration: 1,
        description: 'Temporarily ignores status penalties'
      }
    ],
    tags: ['medicine', 'pain', 'relief'],
    craftable: false
  },
  
  medkit: {
    id: 'medkit',
    name: 'Medical Kit',
    description: 'A comprehensive kit for treating serious injuries. Contains sterilized tools and supplies.',
    weight: 1.5,
    stackable: false,
    maxStack: 1,
    category: 'medical',
    rarity: 'rare',
    consumable: true,
    healAmount: 30,
    cureStatus: ['Injured (Bleeding)', 'Infected Wound'],
    useEffects: [
      {
        type: 'heal',
        value: 30,
        target: 'ally',
        description: 'Heals 30 health points'
      },
      {
        type: 'cure',
        status: 'Injured (Bleeding)',
        target: 'ally',
        description: 'Stops bleeding'
      },
      {
        type: 'cure',
        status: 'Infected Wound',
        target: 'ally',
        description: 'Cleans and treats infections'
      }
    ],
    tags: ['healing', 'surgery', 'emergency'],
    craftable: true,
    craftingRequirements: {
      requiredItems: { 'bandage': 3, 'antibiotics': 1 },
      requiredResources: { 'cloth': 2, 'alcohol': 1 },
      requiredTools: ['scissors']
    }
  },
  
  herbs: {
    id: 'herbs',
    name: 'Medicinal Herbs',
    description: 'Wild herbs with mild medicinal properties. Can be used for basic healing or crafting.',
    weight: 0.2,
    stackable: true,
    maxStack: 15,
    category: 'medical',
    rarity: 'common',
    consumable: true,
    healAmount: 3,
    useEffects: [
      {
        type: 'heal',
        value: 3,
        target: 'ally',
        description: 'Heals 3 health points'
      }
    ],
    tags: ['natural', 'healing', 'crafting'],
    craftable: false
  }
};

/**
 * Weapon items
 */
export const WEAPON_ITEMS: Record<string, WeaponItem> = {
  huntingRifle: {
    id: 'huntingRifle',
    name: 'Hunting Rifle',
    description: 'A reliable long-range firearm ideal for hunting.',
    weight: 4.5,
    stackable: false,
    maxStack: 1,
    category: 'weapon',
    rarity: 'uncommon',
    consumable: false,
    damage: 25,
    range: 'long',
    durability: 80,
    maxDurability: 100,
    accuracy: 0.85,
    useEffects: [
      {
        type: 'damage',
        value: 25,
        description: 'Deals 25 damage'
      }
    ],
    tags: ['firearm', 'hunting', 'long-range'],
    craftable: false
  },
  
  makeShiftAxe: {
    id: 'makeShiftAxe',
    name: 'Makeshift Axe',
    description: 'A crude but effective weapon and tool. Can be used for woodcutting or self-defense.',
    weight: 2.0,
    stackable: false,
    maxStack: 1,
    category: 'weapon',
    rarity: 'common',
    consumable: false,
    damage: 15,
    range: 'melee',
    durability: 50,
    maxDurability: 50,
    accuracy: 0.9,
    useEffects: [
      {
        type: 'damage',
        value: 15,
        description: 'Deals 15 damage'
      }
    ],
    tags: ['melee', 'tool', 'crafted'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'wood': 1, 'scrap': 3 },
      requiredTools: ['tools']
    }
  },
  
  revolver: {
    id: 'revolver',
    name: 'Revolver',
    description: 'A six-shot revolver. Reliable and powerful at close range.',
    weight: 1.2,
    stackable: false,
    maxStack: 1,
    category: 'weapon',
    rarity: 'uncommon',
    consumable: false,
    damage: 20,
    range: 'medium',
    durability: 70,
    maxDurability: 100,
    accuracy: 0.75,
    useEffects: [
      {
        type: 'damage',
        value: 20,
        description: 'Deals 20 damage'
      }
    ],
    tags: ['firearm', 'pistol', 'combat'],
    craftable: false
  },
  
  knife: {
    id: 'knife',
    name: 'Survival Knife',
    description: 'A versatile tool and weapon. Useful for cutting, skinning, and self-defense.',
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    category: 'weapon',
    rarity: 'common',
    consumable: false,
    damage: 8,
    range: 'melee',
    durability: 60,
    maxDurability: 60,
    accuracy: 0.95,
    useEffects: [
      {
        type: 'damage',
        value: 8,
        description: 'Deals 8 damage'
      }
    ],
    tags: ['melee', 'tool', 'versatile'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'scrap': 4 },
      requiredTools: ['tools']
    }
  }
};

/**
 * Tool items
 */
export const TOOL_ITEMS: Record<string, ToolItem> = {
  tools: {
    id: 'tools',
    name: 'Basic Tool Set',
    description: 'A collection of basic tools including a hammer, wrench, and pliers. Essential for crafting.',
    weight: 2.0,
    stackable: false,
    maxStack: 1,
    category: 'tool',
    rarity: 'common',
    consumable: false,
    efficiency: 1.0,
    durability: 100,
    maxDurability: 100,
    toolType: 'general',
    useEffects: [],
    tags: ['crafting', 'repair', 'essential'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'scrap': 8 }
    }
  },
  
  fishingRod: {
    id: 'fishingRod',
    name: 'Fishing Rod',
    description: 'Used to catch fish from bodies of water. A sustainable source of food.',
    weight: 1.5,
    stackable: false,
    maxStack: 1,
    category: 'tool',
    rarity: 'common',
    consumable: false,
    efficiency: 1.0,
    durability: 40,
    maxDurability: 40,
    toolType: 'fishing',
    useEffects: [],
    tags: ['food', 'fishing', 'water'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'wood': 2, 'string': 3 },
      requiredTools: ['knife']
    }
  },
  
  scissors: {
    id: 'scissors',
    name: 'Scissors',
    description: 'Used for cutting cloth, bandages, and other materials.',
    weight: 0.3,
    stackable: false,
    maxStack: 1,
    category: 'tool',
    rarity: 'common',
    consumable: false,
    efficiency: 1.0,
    durability: 30,
    maxDurability: 30,
    toolType: 'cutting',
    useEffects: [],
    tags: ['crafting', 'medical', 'cutting'],
    craftable: false
  },
  
  cookingPot: {
    id: 'cookingPot',
    name: 'Cooking Pot',
    description: 'Allows for cooking food and boiling water to make it safe for drinking.',
    weight: 2.0,
    stackable: false,
    maxStack: 1,
    category: 'tool',
    rarity: 'common',
    consumable: false,
    efficiency: 1.0,
    durability: 50,
    maxDurability: 50,
    toolType: 'cooking',
    useEffects: [],
    tags: ['cooking', 'water', 'food'],
    craftable: false
  },
  
  flashlight: {
    id: 'flashlight',
    name: 'Flashlight',
    description: 'Provides light in dark areas. Requires batteries to function.',
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    category: 'tool',
    rarity: 'common',
    consumable: false,
    efficiency: 1.0,
    durability: 25,
    maxDurability: 25,
    toolType: 'lighting',
    useEffects: [],
    tags: ['light', 'exploration', 'night'],
    craftable: false
  }
};

/**
 * Clothing items
 */
export const CLOTHING_ITEMS: Record<string, ClothingItem> = {
  leatherJacket: {
    id: 'leatherJacket',
    name: 'Leather Jacket',
    description: 'A durable jacket that provides decent protection against physical damage and cold.',
    weight: 2.0,
    stackable: false,
    maxStack: 1,
    category: 'clothing',
    rarity: 'uncommon',
    consumable: false,
    protection: 10,
    insulationCold: 15,
    insulationHeat: -5,
    durability: 80,
    maxDurability: 80,
    slot: 'torso',
    equipEffects: [
      {
        type: 'buff',
        value: 10,
        description: 'Reduces damage taken by 10%'
      },
      {
        type: 'buff',
        description: 'Protects against cold'
      }
    ],
    tags: ['protective', 'cold', 'torso'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'leather': 6 },
      requiredTools: ['scissors', 'tools']
    }
  },
  
  winterBoots: {
    id: 'winterBoots',
    name: 'Winter Boots',
    description: 'Insulated boots that protect against cold and provide grip on slippery surfaces.',
    weight: 1.5,
    stackable: false,
    maxStack: 1,
    category: 'clothing',
    rarity: 'uncommon',
    consumable: false,
    protection: 5,
    insulationCold: 20,
    insulationHeat: -10,
    durability: 70,
    maxDurability: 70,
    slot: 'feet',
    equipEffects: [
      {
        type: 'buff',
        description: 'Prevents slipping on ice or snow'
      },
      {
        type: 'buff',
        description: 'Protects feet from cold'
      }
    ],
    tags: ['cold', 'winter', 'boots'],
    craftable: false
  },
  
  gasMask: {
    id: 'gasMask',
    name: 'Gas Mask',
    description: 'Protects the wearer from airborne toxins and diseases.',
    weight: 1.0,
    stackable: false,
    maxStack: 1,
    category: 'clothing',
    rarity: 'rare',
    consumable: false,
    protection: 5,
    insulationCold: 0,
    insulationHeat: 0,
    durability: 40,
    maxDurability: 40,
    slot: 'head',
    equipEffects: [
      {
        type: 'buff',
        description: 'Prevents respiratory diseases and toxin inhalation'
      }
    ],
    tags: ['toxic', 'head', 'protection'],
    craftable: false
  },
  
  roughGloves: {
    id: 'roughGloves',
    name: 'Rough Work Gloves',
    description: 'Protects hands while working and provides better grip.',
    weight: 0.3,
    stackable: false,
    maxStack: 1,
    category: 'clothing',
    rarity: 'common',
    consumable: false,
    protection: 3,
    insulationCold: 5,
    insulationHeat: 0,
    durability: 30,
    maxDurability: 30,
    slot: 'hands',
    equipEffects: [
      {
        type: 'buff',
        description: 'Improves grip and prevents minor injuries to hands'
      }
    ],
    tags: ['work', 'hands', 'protection'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'leather': 2, 'cloth': 1 },
      requiredTools: ['scissors']
    }
  }
};

/**
 * Food items
 */
export const FOOD_ITEMS: Record<string, FoodItem> = {
  cannedFood: {
    id: 'cannedFood',
    name: 'Canned Food',
    description: 'Preserved food that lasts for years. Safe to eat without preparation.',
    weight: 0.5,
    stackable: true,
    maxStack: 10,
    category: 'food',
    rarity: 'common',
    consumable: true,
    nutrition: 15,
    hydration: 0,
    useEffects: [
      {
        type: 'resource',
        resourceType: 'food',
        value: 15,
        description: 'Provides 15 food'
      }
    ],
    tags: ['food', 'preserved', 'ready'],
    craftable: false
  },
  
  driedMeat: {
    id: 'driedMeat',
    name: 'Dried Meat',
    description: 'Preserved meat that provides good nutrition and lasts for weeks.',
    weight: 0.3,
    stackable: true,
    maxStack: 20,
    category: 'food',
    rarity: 'common',
    consumable: true,
    nutrition: 12,
    hydration: -2,
    spoilRate: 30,
    useEffects: [
      {
        type: 'resource',
        resourceType: 'food',
        value: 12,
        description: 'Provides 12 food'
      },
      {
        type: 'resource',
        resourceType: 'water',
        value: -2,
        description: 'Reduces water by 2 (makes you thirsty)'
      }
    ],
    tags: ['food', 'meat', 'preserved'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'meat': 2, 'salt': 1 }
    }
  },
  
  purifiedWater: {
    id: 'purifiedWater',
    name: 'Purified Water',
    description: 'Clean drinking water, free from contaminants and safe to drink.',
    weight: 0.5,
    stackable: true,
    maxStack: 10,
    category: 'food',
    rarity: 'common',
    consumable: true,
    nutrition: 0,
    hydration: 15,
    useEffects: [
      {
        type: 'resource',
        resourceType: 'water',
        value: 15,
        description: 'Provides 15 water'
      }
    ],
    tags: ['water', 'drink', 'clean'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'dirtyWater': 1 },
      requiredTools: ['cookingPot']
    }
  },
  
  berries: {
    id: 'berries',
    name: 'Wild Berries',
    description: 'Foraged berries. Provides both nutrition and hydration but spoils quickly.',
    weight: 0.2,
    stackable: true,
    maxStack: 15,
    category: 'food',
    rarity: 'common',
    consumable: true,
    nutrition: 5,
    hydration: 3,
    spoilRate: 3,
    useEffects: [
      {
        type: 'resource',
        resourceType: 'food',
        value: 5,
        description: 'Provides 5 food'
      },
      {
        type: 'resource',
        resourceType: 'water',
        value: 3,
        description: 'Provides 3 water'
      }
    ],
    tags: ['food', 'foraged', 'perishable'],
    craftable: false
  }
};

/**
 * Resource items
 */
export const RESOURCE_ITEMS: Record<string, ResourceItem> = {
  wood: {
    id: 'wood',
    name: 'Wood',
    description: 'Basic building material and fuel source.',
    weight: 1.0,
    stackable: true,
    maxStack: 30,
    category: 'resource',
    rarity: 'common',
    consumable: false,
    resourceType: 'wood',
    tags: ['building', 'fuel', 'crafting'],
    craftable: false
  },
  
  scrap: {
    id: 'scrap',
    name: 'Scrap Metal',
    description: 'Salvaged metal pieces useful for crafting tools and weapons.',
    weight: 0.8,
    stackable: true,
    maxStack: 30,
    category: 'resource',
    rarity: 'common',
    consumable: false,
    resourceType: 'scrap',
    tags: ['metal', 'crafting', 'repair'],
    craftable: false
  },
  
  cloth: {
    id: 'cloth',
    name: 'Cloth',
    description: 'Fabric scraps useful for crafting clothing and medical supplies.',
    weight: 0.2,
    stackable: true,
    maxStack: 50,
    category: 'resource',
    rarity: 'common',
    consumable: false,
    resourceType: 'cloth',
    tags: ['fabric', 'crafting', 'medical'],
    craftable: false
  },
  
  leather: {
    id: 'leather',
    name: 'Leather',
    description: 'Tanned animal hide used for crafting durable clothing and equipment.',
    weight: 0.5,
    stackable: true,
    maxStack: 20,
    category: 'resource',
    rarity: 'uncommon',
    consumable: false,
    resourceType: 'leather',
    tags: ['crafting', 'clothing', 'protection'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'rawHide': 1, 'salt': 1 },
      requiredTools: ['knife']
    }
  },
  
  fuel: {
    id: 'fuel',
    name: 'Fuel',
    description: 'Refined fuel for vehicles and generators.',
    weight: 0.8,
    stackable: true,
    maxStack: 20,
    category: 'resource',
    rarity: 'uncommon',
    consumable: false,
    resourceType: 'fuel',
    tags: ['energy', 'vehicle', 'generator'],
    craftable: false
  },
  
  dirtyWater: {
    id: 'dirtyWater',
    name: 'Dirty Water',
    description: 'Contaminated water that needs to be purified before drinking.',
    weight: 0.5,
    stackable: true,
    maxStack: 10,
    category: 'resource',
    rarity: 'common',
    consumable: true,
    resourceType: 'dirtyWater',
    useEffects: [
      {
        type: 'resource',
        resourceType: 'water',
        value: 5,
        description: 'Provides 5 water'
      },
      {
        type: 'buff',
        description: 'Risk of illness from contamination',
        status: 'Sick'
      }
    ],
    tags: ['water', 'unclean', 'risky'],
    craftable: false
  },
  
  salt: {
    id: 'salt',
    name: 'Salt',
    description: 'Used for food preservation and crafting.',
    weight: 0.1,
    stackable: true,
    maxStack: 20,
    category: 'resource',
    rarity: 'common',
    consumable: false,
    resourceType: 'salt',
    tags: ['preservative', 'crafting', 'cooking'],
    craftable: false
  },
  
  rawHide: {
    id: 'rawHide',
    name: 'Raw Hide',
    description: 'Untreated animal skin that can be processed into leather.',
    weight: 1.0,
    stackable: true,
    maxStack: 10,
    category: 'resource',
    rarity: 'common',
    consumable: false,
    resourceType: 'rawHide',
    spoilRate: 2,
    tags: ['animal', 'untreated', 'crafting'],
    craftable: false
  },
  
  string: {
    id: 'string',
    name: 'String',
    description: 'Useful for crafting and repairs.',
    weight: 0.1,
    stackable: true,
    maxStack: 30,
    category: 'resource',
    rarity: 'common',
    consumable: false,
    resourceType: 'string',
    tags: ['crafting', 'binding', 'repair'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'cloth': 1 }
    }
  },
  
  meat: {
    id: 'meat',
    name: 'Raw Meat',
    description: 'Uncooked meat from hunted animals. Should be cooked before eating.',
    weight: 0.5,
    stackable: true,
    maxStack: 15,
    category: 'resource',
    rarity: 'common',
    consumable: true,
    resourceType: 'meat',
    spoilRate: 1,
    useEffects: [
      {
        type: 'resource',
        resourceType: 'food',
        value: 6,
        description: 'Provides 6 food'
      },
      {
        type: 'buff',
        description: 'Risk of food poisoning',
        status: 'Sick'
      }
    ],
    tags: ['food', 'uncooked', 'animal'],
    craftable: false
  },
  
  alcohol: {
    id: 'alcohol',
    name: 'Alcohol',
    description: 'Used for disinfection and crafting medical supplies.',
    weight: 0.5,
    stackable: true,
    maxStack: 5,
    category: 'resource',
    rarity: 'uncommon',
    consumable: true,
    resourceType: 'alcohol',
    useEffects: [
      {
        type: 'resource',
        resourceType: 'water',
        value: -5,
        description: 'Dehydrates by 5'
      },
      {
        type: 'buff',
        description: 'Temporarily reduces pain but impairs judgment',
        duration: 1
      }
    ],
    tags: ['medical', 'disinfectant', 'crafting'],
    craftable: false
  }
};

/**
 * Equipment items
 */
export const EQUIPMENT_ITEMS: Record<string, EquipmentItem> = {
  backpack: {
    id: 'backpack',
    name: 'Tactical Backpack',
    description: 'Increases carrying capacity and improves organization of supplies.',
    weight: 1.0,
    stackable: false,
    maxStack: 1,
    category: 'equipment',
    rarity: 'uncommon',
    consumable: false,
    equipSlot: 'accessory',
    durability: 100,
    maxDurability: 100,
    equipEffects: [
      {
        type: 'special',
        description: 'Increases inventory capacity by 10 slots'
      }
    ],
    tags: ['storage', 'capacity', 'essential'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'cloth': 5, 'string': 3 },
      requiredTools: ['scissors']
    }
  },
  
  sleepingBag: {
    id: 'sleepingBag',
    name: 'Sleeping Bag',
    description: 'Provides warmth and comfort during rest, improving sleep quality.',
    weight: 1.5,
    stackable: false,
    maxStack: 1,
    category: 'equipment',
    rarity: 'common',
    consumable: false,
    durability: 50,
    maxDurability: 50,
    equipEffects: [
      {
        type: 'buff',
        description: 'Improves rest quality and cold protection while sleeping'
      }
    ],
    tags: ['rest', 'sleep', 'cold'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'cloth': 8 },
      requiredTools: ['scissors']
    }
  },
  
  compass: {
    id: 'compass',
    name: 'Compass',
    description: 'Helps with navigation and prevents getting lost.',
    weight: 0.2,
    stackable: false,
    maxStack: 1,
    category: 'equipment',
    rarity: 'uncommon',
    consumable: false,
    equipSlot: 'accessory',
    equipEffects: [
      {
        type: 'special',
        description: 'Prevents getting lost during exploration'
      }
    ],
    tags: ['navigation', 'exploration', 'tool'],
    craftable: false
  },
  
  firstAidKit: {
    id: 'firstAidKit',
    name: 'First Aid Kit',
    description: 'Contains basic medical supplies. Allows for treating injuries more effectively.',
    weight: 1.0,
    stackable: false,
    maxStack: 1,
    category: 'equipment',
    rarity: 'uncommon',
    consumable: false,
    durability: 5,
    maxDurability: 5,
    equipEffects: [
      {
        type: 'special',
        description: 'Improves efficiency of healing items by 25%'
      }
    ],
    tags: ['medical', 'emergency', 'essential'],
    craftable: true,
    craftingRequirements: {
      requiredItems: { 'bandage': 3 },
      requiredResources: { 'cloth': 3, 'alcohol': 1 },
      requiredTools: ['scissors']
    }
  },
  
  waterFilter: {
    id: 'waterFilter',
    name: 'Water Filter',
    description: 'Purifies water more efficiently than boiling.',
    weight: 1.0,
    stackable: false,
    maxStack: 1,
    category: 'equipment',
    rarity: 'uncommon',
    consumable: false,
    durability: 15,
    maxDurability: 15,
    equipEffects: [
      {
        type: 'special',
        description: 'Allows purifying dirty water without boiling'
      }
    ],
    tags: ['water', 'purification', 'survival'],
    craftable: true,
    craftingRequirements: {
      requiredResources: { 'cloth': 2, 'scrap': 3, 'wood': 1 },
      requiredTools: ['tools']
    }
  }
};

/**
 * Get all items combined into a single map
 */
export const getAllItems = (): Record<string, AnyInventoryItem> => {
  return {
    ...MEDICAL_ITEMS,
    ...WEAPON_ITEMS,
    ...TOOL_ITEMS,
    ...CLOTHING_ITEMS,
    ...FOOD_ITEMS,
    ...RESOURCE_ITEMS,
    ...EQUIPMENT_ITEMS
  };
};

/**
 * Get an item by ID
 */
export const getItemById = (id: string): AnyInventoryItem | undefined => {
  return getAllItems()[id];
}; 