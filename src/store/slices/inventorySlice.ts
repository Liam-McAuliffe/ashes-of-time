import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  InventoryState, 
  InventoryItemStack, 
  AnyInventoryItem, 
  ItemUseResult,
  WeaponItem,
  ClothingItem,
  ToolItem,
  EquipmentItem
} from '../../types/inventory';
import { getItemById } from '../../data/items';

const BASE_CAPACITY = {
  maxWeight: 15,
  maxSlots: 12,
  currentWeight: 0,
  usedSlots: 0
};

/**
 * Initial inventory state
 */
const initialState: InventoryState = {
  items: [],
  capacity: { ...BASE_CAPACITY },
  equipped: {}
};

/**
 * Calculate inventory capacity with any equipped items that add capacity
 */
const calculateCapacity = (items: InventoryItemStack[], equipped: InventoryState['equipped']) => {
  let capacity = { ...BASE_CAPACITY };
  
  // Check for backpack (increases max slots)
  if (equipped.accessory?.id === 'backpack') {
    capacity.maxSlots += 10;
  }
  
  // Calculate current weight and slots
  capacity.currentWeight = items.reduce((total, stack) => {
    return total + (stack.item.weight * stack.quantity);
  }, 0);
  
  capacity.usedSlots = items.reduce((total, stack) => {
    // Non-stackable items use one slot each
    if (!stack.item.stackable) {
      return total + stack.quantity;
    }
    // Stackable items use one slot per stack
    return total + 1;
  }, 0);
  
  return capacity;
};

/**
 * Check if an item can be added to inventory
 */
const canAddItem = (state: InventoryState, item: AnyInventoryItem, quantity: number = 1): boolean => {
  // Calculate how much weight this would add
  const additionalWeight = item.weight * quantity;
  
  // Check if we have enough weight capacity
  if (state.capacity.currentWeight + additionalWeight > state.capacity.maxWeight) {
    return false;
  }
  
  // For stackable items, check if we can stack with existing items
  if (item.stackable) {
    const existingStack = state.items.find(stack => stack.item.id === item.id);
    if (existingStack) {
      // Check if adding to stack would exceed max stack size
      if (existingStack.quantity + quantity <= item.maxStack) {
        return true;
      }
      
      // Calculate how many would overflow
      const overflow = (existingStack.quantity + quantity) - item.maxStack;
      if (overflow > 0) {
        // Check if we have slots for the overflow
        const newSlotsNeeded = Math.ceil(overflow / item.maxStack);
        if (state.capacity.usedSlots + newSlotsNeeded > state.capacity.maxSlots) {
          return false;
        }
      }
      return true;
    }
  }
  
  // Check if we have enough slot capacity for new items
  const slotsNeeded = item.stackable ? Math.ceil(quantity / item.maxStack) : quantity;
  return state.capacity.usedSlots + slotsNeeded <= state.capacity.maxSlots;
};

/**
 * Inventory management slice
 */
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    /**
     * Add an item to inventory
     */
    addItem: (state, action: PayloadAction<{ itemId: string, quantity?: number }>) => {
      const { itemId, quantity = 1 } = action.payload;
      const item = getItemById(itemId);
      
      if (!item || quantity <= 0) return;
      
      if (!canAddItem(state, item, quantity)) {
        console.log('Cannot add item, inventory full');
        return;
      }
      
      // If the item is stackable, try to add to existing stack
      if (item.stackable) {
        const existingStackIndex = state.items.findIndex(stack => stack.item.id === item.id);
        
        if (existingStackIndex !== -1) {
          const existingStack = state.items[existingStackIndex];
          const canAddAmount = Math.min(quantity, item.maxStack - existingStack.quantity);
          
          if (canAddAmount > 0) {
            state.items[existingStackIndex].quantity += canAddAmount;
            
            // If we still have more to add after filling this stack
            const remaining = quantity - canAddAmount;
            if (remaining > 0) {
              // Create a new stack for the remaining items instead of recursive call
              const newStack = {
                item,
                quantity: Math.min(remaining, item.maxStack)
              };
              state.items.push(newStack);
              
              // If we still have more after creating a new stack
              const secondRemaining = remaining - newStack.quantity;
              if (secondRemaining > 0) {
                // Create additional stacks as needed
                const additionalStacks = Math.ceil(secondRemaining / item.maxStack);
                for (let i = 0; i < additionalStacks; i++) {
                  const stackSize = Math.min(secondRemaining - (i * item.maxStack), item.maxStack);
                  if (stackSize > 0) {
                    state.items.push({
                      item,
                      quantity: stackSize
                    });
                  }
                }
              }
            }
            
            // Update capacity
            state.capacity = calculateCapacity(state.items, state.equipped);
            return;
          }
        }
      }
      
      // If we got here, we need to create a new stack
      state.items.push({
        item,
        quantity: Math.min(quantity, item.stackable ? item.maxStack : 1)
      });
      
      // If we have more to add (for stackable items)
      if (item.stackable && quantity > item.maxStack) {
        // Create additional stacks as needed
        const remaining = quantity - item.maxStack;
        const additionalStacks = Math.ceil(remaining / item.maxStack);
        for (let i = 0; i < additionalStacks; i++) {
          const stackSize = Math.min(remaining - (i * item.maxStack), item.maxStack);
          if (stackSize > 0) {
            state.items.push({
              item,
              quantity: stackSize
            });
          }
        }
      }
      
      // Update capacity
      state.capacity = calculateCapacity(state.items, state.equipped);
    },
    
    /**
     * Remove an item from inventory
     */
    removeItem: (state, action: PayloadAction<{ itemId: string, quantity?: number }>) => {
      const { itemId, quantity = 1 } = action.payload;
      
      const itemIndex = state.items.findIndex(stack => stack.item.id === itemId);
      if (itemIndex === -1) return;
      
      const stack = state.items[itemIndex];
      
      // If we're removing all or more than exists, remove the whole stack
      if (quantity >= stack.quantity) {
        state.items.splice(itemIndex, 1);
      } else {
        // Otherwise reduce the quantity
        state.items[itemIndex].quantity -= quantity;
      }
      
      // Update capacity
      state.capacity = calculateCapacity(state.items, state.equipped);
    },
    
    /**
     * Use an item (consume/apply effects)
     */
    useItem: (state, action: PayloadAction<{ itemId: string }>) => {
      const { itemId } = action.payload;
      
      const itemIndex = state.items.findIndex(stack => stack.item.id === itemId);
      if (itemIndex === -1) {
        return; // Item not found
      }
      
      const stack = state.items[itemIndex];
      const item = stack.item;
      
      // If the item is consumable, reduce quantity by 1
      if (item.consumable) {
        if (stack.quantity <= 1) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity -= 1;
        }
      }
      
      // Update capacity
      state.capacity = calculateCapacity(state.items, state.equipped);
    },
    
    /**
     * Equip an item in the appropriate slot
     */
    equipItem: (state, action: PayloadAction<{ itemId: string }>) => {
      const { itemId } = action.payload;
      
      const itemIndex = state.items.findIndex(stack => stack.item.id === itemId);
      if (itemIndex === -1) return;
      
      const stack = state.items[itemIndex];
      const item = stack.item;
      
      // Determine the slot based on item category and properties
      let slot: keyof InventoryState['equipped'] | null = null;
      
      switch (item.category) {
        case 'weapon':
          slot = 'weapon';
          break;
        case 'tool':
          slot = 'tool';
          break;
        case 'clothing':
          slot = (item as ClothingItem).slot;
          break;
        case 'equipment':
          if ((item as EquipmentItem).equipSlot === 'accessory') {
            slot = 'accessory';
          }
          break;
        default:
          // Not equippable
          return;
      }
      
      if (!slot) return;
      
      // Unequip any currently equipped item in that slot
      if (state.equipped[slot]) {
        // Mark previous item as not equipped
        const prevEquippedIndex = state.items.findIndex(s => 
          s.item.id === (state.equipped[slot] as AnyInventoryItem).id
        );
        
        if (prevEquippedIndex !== -1) {
          state.items[prevEquippedIndex].equipped = false;
        }
      }
      
      // Equip the new item
      (state.equipped as any)[slot] = item as any;
      state.items[itemIndex].equipped = true;
      
      // Update capacity in case we equipped something that changes capacity
      state.capacity = calculateCapacity(state.items, state.equipped);
    },
    
    /**
     * Unequip an item from a slot
     */
    unequipItem: (state, action: PayloadAction<{ slot: keyof InventoryState['equipped'] }>) => {
      const { slot } = action.payload;
      
      if (!state.equipped[slot]) return;
      
      // Find the item in inventory and mark as not equipped
      const itemIndex = state.items.findIndex(s => 
        s.item.id === (state.equipped[slot] as AnyInventoryItem).id
      );
      
      if (itemIndex !== -1) {
        state.items[itemIndex].equipped = false;
      }
      
      // Remove from equipped slot
      (state.equipped as any)[slot] = undefined;
      
      // Update capacity
      state.capacity = calculateCapacity(state.items, state.equipped);
    },
    
    /**
     * Reset inventory to initial state
     */
    resetInventory: () => initialState
  }
});

export const { 
  addItem, 
  removeItem, 
  useItem, 
  equipItem, 
  unequipItem, 
  resetInventory 
} = inventorySlice.actions;

export default inventorySlice.reducer; 