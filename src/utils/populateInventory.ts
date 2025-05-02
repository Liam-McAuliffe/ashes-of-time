import { addItem, equipItem } from '../store/slices/inventorySlice';
import { AppDispatch } from '../store';

/**
 * Populates the inventory with some initial items for testing
 * 
 * @param dispatch Redux dispatch function
 */
export const populateInventoryWithItems = (dispatch: AppDispatch) => {
  // Add some medical items
  dispatch(addItem({ itemId: 'bandage', quantity: 5 }));
  dispatch(addItem({ itemId: 'painkillers', quantity: 3 }));
  
  // Add some weapons
  dispatch(addItem({ itemId: 'knife', quantity: 1 }));
  dispatch(addItem({ itemId: 'huntingRifle', quantity: 1 }));
  
  // Add some food and water
  dispatch(addItem({ itemId: 'cannedFood', quantity: 4 }));
  dispatch(addItem({ itemId: 'purifiedWater', quantity: 3 }));
  
  // Add some resources
  dispatch(addItem({ itemId: 'wood', quantity: 10 }));
  dispatch(addItem({ itemId: 'scrap', quantity: 8 }));
  dispatch(addItem({ itemId: 'cloth', quantity: 5 }));
  
  // Add some equipment
  dispatch(addItem({ itemId: 'backpack', quantity: 1 }));
  dispatch(addItem({ itemId: 'leatherJacket', quantity: 1 }));
  
  // Equip some items
  dispatch(equipItem({ itemId: 'knife' }));
  dispatch(equipItem({ itemId: 'leatherJacket' }));
  dispatch(equipItem({ itemId: 'backpack' }));
}; 