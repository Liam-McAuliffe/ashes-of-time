import { StatusEffect } from './game';

/**
 * Item category types
 */
export type ItemCategory = 
  | 'weapon'      // For combat and hunting
  | 'tool'        // For survival tasks
  | 'medical'     // For healing and treating status effects  
  | 'clothing'    // For environmental protection
  | 'food'        // For consumption
  | 'resource'    // Raw materials for crafting
  | 'equipment'   // Permanent useful items
  | 'valuable'    // Trading items
  | 'document';   // Information/story items

/**
 * Item rarity levels
 */
export type ItemRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'unique';

/**
 * Effect that an item can have when used or equipped
 */
export interface ItemEffect {
  type: 'heal' | 'cure' | 'buff' | 'resource' | 'damage' | 'special';
  value?: number;
  duration?: number;
  target?: 'self' | 'ally' | 'all';
  status?: StatusEffect;
  resourceType?: string;
  description: string;
}

/**
 * Base item interface
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  weight: number;         // Weight in units (affects carry capacity)
  stackable: boolean;     // Can items stack
  maxStack: number;       // Maximum stack size if stackable
  category: ItemCategory;
  rarity: ItemRarity;
  consumable: boolean;    // Is the item consumed on use
  useEffects?: ItemEffect[]; // Effects when used
  equipEffects?: ItemEffect[]; // Effects when equipped
  tags: string[];         // For filtering/grouping
  imageUrl?: string;      // Visual representation
  craftable: boolean;     // Can be crafted
  craftingRequirements?: {
    requiredItems: { [itemId: string]: number };
    requiredResources: { [resourceType: string]: number };
    requiredTools?: string[];
  };
}

/**
 * Weapon item with additional properties
 */
export interface WeaponItem extends InventoryItem {
  category: 'weapon';
  damage: number;
  range: 'melee' | 'short' | 'medium' | 'long';
  durability: number;
  maxDurability: number;
  accuracy: number;      // 0-1 value affecting accuracy
}

/**
 * Tool item with additional properties
 */
export interface ToolItem extends InventoryItem {
  category: 'tool';
  efficiency: number;    // Affects resource gathering
  durability: number;
  maxDurability: number;
  toolType: string;      // For crafting requirements
}

/**
 * Medical item with additional properties
 */
export interface MedicalItem extends InventoryItem {
  category: 'medical';
  healAmount?: number;
  cureStatus?: StatusEffect[];
  preventStatus?: StatusEffect[];
}

/**
 * Clothing item with additional properties
 */
export interface ClothingItem extends InventoryItem {
  category: 'clothing';
  protection: number;    // Damage reduction
  insulationCold: number; // Cold protection
  insulationHeat: number; // Heat protection
  durability: number;
  maxDurability: number;
  slot: 'head' | 'torso' | 'legs' | 'feet' | 'hands' | 'accessory';
}

/**
 * Food item with additional properties
 */
export interface FoodItem extends InventoryItem {
  category: 'food';
  nutrition: number;     // How much food it provides
  hydration: number;     // How much water it provides
  spoilRate?: number;    // How quickly it spoils (days)
  cookable?: boolean;    // Can be cooked for better effects
}

/**
 * Resource item with additional properties
 */
export interface ResourceItem extends InventoryItem {
  category: 'resource';
  resourceType: string;  // Type of resource (wood, metal, etc.)
  quality?: number;      // Quality affects crafting results
}

/**
 * Equipment item with additional properties
 */
export interface EquipmentItem extends InventoryItem {
  category: 'equipment';
  equipSlot?: string;
  durability?: number;
  maxDurability?: number;
  passive?: ItemEffect[];
}

/**
 * Union type of all item types
 */
export type AnyInventoryItem = 
  | InventoryItem
  | WeaponItem
  | ToolItem
  | MedicalItem
  | ClothingItem
  | FoodItem
  | ResourceItem
  | EquipmentItem;

/**
 * Represents a stack of items in the inventory
 */
export interface InventoryItemStack {
  item: AnyInventoryItem;
  quantity: number;
  equipped?: boolean;
}

/**
 * Inventory capacity constraints
 */
export interface InventoryCapacity {
  maxWeight: number;
  maxSlots: number;
  currentWeight: number;
  usedSlots: number;
}

/**
 * Complete inventory state
 */
export interface InventoryState {
  items: InventoryItemStack[];
  capacity: InventoryCapacity;
  equipped: {
    weapon?: WeaponItem;
    head?: ClothingItem;
    torso?: ClothingItem;
    legs?: ClothingItem;
    feet?: ClothingItem;
    hands?: ClothingItem;
    accessory?: ClothingItem | EquipmentItem;
    tool?: ToolItem;
  };
}

/**
 * Result of using an item
 */
export interface ItemUseResult {
  success: boolean;
  message: string;
  effectsApplied: ItemEffect[];
  consumed: boolean;
} 