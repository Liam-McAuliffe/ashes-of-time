import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { InventoryItemStack, AnyInventoryItem, ItemCategory } from '../../types/inventory';
import { equipItem, unequipItem, useItem } from '../../store/slices/inventorySlice';

/**
 * Get appropriate emoji for each item category
 */
const getCategoryEmoji = (category: ItemCategory): string => {
  switch (category) {
    case 'weapon': return '🗡️';
    case 'tool': return '🔧';
    case 'medical': return '💉';
    case 'food': return '🍗';
    case 'clothing': return '👕';
    case 'resource': return '📦';
    case 'equipment': return '🎒';
    case 'valuable': return '💎';
    case 'document': return '📄';
    default: return '📦';
  }
};

/**
 * Displays the player's inventory items with category filtering
 */
const InventoryDisplay: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Get inventory data from Redux store
  const inventoryState = useSelector((state: RootState) => state.inventory);
  const { items, capacity, equipped } = inventoryState;
  
  const dispatch = useDispatch();
  
  const handleCategoryChange = (category: ItemCategory | 'all') => {
    setSelectedCategory(category);
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(stack => stack.item.category === selectedCategory);

  const getItemRarityClass = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'text-gray-200';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'unique': return 'text-purple-400';
      default: return 'text-gray-200';
    }
  };

  const toggleInventory = () => {
    setIsOpen(!isOpen);
    setSelectedItem(null);
  };
  
  const handleItemClick = (itemId: string) => {
    setSelectedItem(selectedItem === itemId ? null : itemId);
  };
  
  const handleUseItem = (itemId: string) => {
    dispatch(useItem({ itemId }));
    setSelectedItem(null);
  };
  
  const handleEquipItem = (itemId: string) => {
    dispatch(equipItem({ itemId }));
    setSelectedItem(null);
  };
  
  const handleUnequipItem = (slot: keyof typeof equipped) => {
    if (equipped[slot]) {
      dispatch(unequipItem({ slot }));
    }
  };
  
  const isEquippable = (item: AnyInventoryItem) => {
    return ['weapon', 'tool', 'clothing', 'equipment'].includes(item.category);
  };
  
  // Format the weight with 1 decimal place
  const formatWeight = (weight: number) => {
    return Math.round(weight * 10) / 10;
  };

  return (
    <div className="mt-2 bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div 
        className="p-2 bg-gray-700 flex justify-between items-center cursor-pointer"
        onClick={toggleInventory}
      >
        <h3 className="text-amber-300 font-medium">Inventory</h3>
        <div className="text-gray-300 text-sm">
          Weight: {formatWeight(capacity.currentWeight)}/{capacity.maxWeight} | 
          Slots: {capacity.usedSlots}/{capacity.maxSlots}
        </div>
        <span className="text-gray-300">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div className="p-3">
          {/* Category filters */}
          <div className="flex space-x-2 mb-3 overflow-x-auto pb-2">
            <button 
              className={`px-2 py-1 text-xs rounded ${selectedCategory === 'all' ? 'bg-amber-700 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleCategoryChange('all')}
            >
              All
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${selectedCategory === 'weapon' ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleCategoryChange('weapon')}
            >
              Weapons
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${selectedCategory === 'tool' ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleCategoryChange('tool')}
            >
              Tools
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${selectedCategory === 'medical' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleCategoryChange('medical')}
            >
              Medical
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${selectedCategory === 'food' ? 'bg-yellow-700 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleCategoryChange('food')}
            >
              Food
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${selectedCategory === 'clothing' ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleCategoryChange('clothing')}
            >
              Clothing
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${selectedCategory === 'resource' ? 'bg-gray-500 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleCategoryChange('resource')}
            >
              Resources
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${selectedCategory === 'equipment' ? 'bg-indigo-700 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleCategoryChange('equipment')}
            >
              Equipment
            </button>
          </div>

          {/* Equipped items section */}
          <div className="mb-4 bg-gray-900 p-2 rounded">
            <h4 className="text-amber-300 text-sm mb-2">Equipped Items</h4>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {Object.entries(equipped).map(([slot, item]) => 
                item ? (
                  <div key={slot} className="bg-gray-800 p-1.5 rounded flex flex-col items-center relative">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <span className="text-xl">
                        {getCategoryEmoji(item.category)}
                      </span>
                    </div>
                    <span className={`text-center line-clamp-1 mt-1 ${getItemRarityClass(item.rarity)}`}>
                      {item.name}
                    </span>
                    <span className="text-gray-400 uppercase text-[10px] mt-0.5">
                      {slot}
                    </span>
                    <button 
                      className="absolute -top-1 -right-1 bg-red-900 rounded-full w-4 h-4 flex items-center justify-center text-white hover:bg-red-700"
                      onClick={() => handleUnequipItem(slot as any)}
                    >
                      ×
                    </button>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Inventory items display */}
          {filteredItems.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              {selectedCategory === 'all' 
                ? "Your inventory is empty. Search for supplies or craft items."
                : `No ${selectedCategory} items found in your inventory.`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredItems.map((stack) => (
                <div 
                  key={stack.item.id}
                  className={`flex items-start p-2 rounded border ${selectedItem === stack.item.id ? 'bg-gray-700 border-amber-600' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}`}
                  onClick={() => handleItemClick(stack.item.id)}
                >
                  <div className="w-10 h-10 flex-shrink-0 mr-3 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-2xl">
                      {getCategoryEmoji(stack.item.category)}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h4 className={`font-medium ${getItemRarityClass(stack.item.rarity)}`}>
                        {stack.item.name}
                      </h4>
                      {stack.quantity > 1 && (
                        <span className="bg-gray-800 text-gray-300 text-xs px-1.5 rounded">
                          x{stack.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {stack.item.description}
                    </p>
                    
                    {/* Item properties based on category */}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {stack.item.weight > 0 && (
                        <span className="text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">
                          {stack.item.weight} kg
                        </span>
                      )}
                      
                      {stack.item.category === 'weapon' && (
                        <span className="text-xs bg-red-900/50 px-1.5 py-0.5 rounded text-red-300">
                          DMG: {(stack.item as any).damage}
                        </span>
                      )}
                      
                      {stack.item.category === 'food' && (
                        <span className="text-xs bg-yellow-900/50 px-1.5 py-0.5 rounded text-yellow-300">
                          Food: +{(stack.item as any).nutrition}
                        </span>
                      )}
                      
                      {stack.item.consumable && (
                        <span className="text-xs bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-300">
                          Consumable
                        </span>
                      )}
                      
                      {stack.equipped && (
                        <span className="text-xs bg-green-900/50 px-1.5 py-0.5 rounded text-green-300">
                          Equipped
                        </span>
                      )}
                    </div>
                    
                    {/* Action buttons for selected item */}
                    {selectedItem === stack.item.id && (
                      <div className="flex mt-2 space-x-2">
                        {stack.item.useEffects && stack.item.useEffects.length > 0 && (
                          <button 
                            className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                            onClick={() => handleUseItem(stack.item.id)}
                          >
                            Use
                          </button>
                        )}
                        
                        {isEquippable(stack.item) && !stack.equipped && (
                          <button 
                            className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                            onClick={() => handleEquipItem(stack.item.id)}
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryDisplay; 