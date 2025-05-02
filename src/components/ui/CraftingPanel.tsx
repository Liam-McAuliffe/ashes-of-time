import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { loadGameState } from '../../store/slices/gameSlice';
import { CRAFTING_RECIPES, craftItem, isRecipeAvailable, hasEnoughResources, calculateCraftingSuccessChance } from '../../services/craftingSystem';
import { Wrench, AlertCircle, Check, X, ChevronRight, HelpCircle } from 'lucide-react';

interface CraftingPanelProps {
  onClose: () => void;
}

/**
 * Panel component for the crafting system
 */
const CraftingPanel: React.FC<CraftingPanelProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [craftingResult, setCraftingResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Filter recipes based on availability
  const availableRecipes = useMemo(() => {
    return CRAFTING_RECIPES.filter(recipe => isRecipeAvailable(recipe, gameState));
  }, [gameState]);
  
  // Get unique categories from available recipes
  const categories = useMemo(() => {
    const categorySet = new Set(availableRecipes.map(recipe => recipe.category));
    return Array.from(categorySet);
  }, [availableRecipes]);
  
  // Get selected recipe details
  const recipeDetails = useMemo(() => {
    if (!selectedRecipe) return null;
    return CRAFTING_RECIPES.find(recipe => recipe.id === selectedRecipe);
  }, [selectedRecipe]);
  
  // Calculate success chance for the selected recipe
  const successChance = useMemo(() => {
    if (!recipeDetails) return 0;
    return calculateCraftingSuccessChance(recipeDetails, gameState);
  }, [recipeDetails, gameState]);
  
  // Check if player has enough resources for selected recipe
  const hasResources = useMemo(() => {
    if (!recipeDetails) return false;
    return hasEnoughResources(recipeDetails, gameState.resources);
  }, [recipeDetails, gameState.resources]);
  
  // Handle crafting attempt
  const handleCraft = () => {
    if (!selectedRecipe) return;
    
    const result = craftItem(selectedRecipe, gameState);
    setCraftingResult({
      success: result.success,
      message: result.message
    });
    
    // Update game state if crafting was attempted
    dispatch(loadGameState(result.updatedState));
    
    // Clear result after 3 seconds
    setTimeout(() => {
      setCraftingResult(null);
    }, 3000);
  };
  
  // Capitalize first letter of a string
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-stone-900/90 border border-amber-900/60 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b border-amber-900/40 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-amber-100 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-amber-400" />
            Crafting Workshop
          </h2>
          <button 
            onClick={onClose}
            className="bg-stone-800/60 hover:bg-stone-700 rounded-full p-1 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {craftingResult && (
          <div className={`mb-4 p-3 rounded-md flex items-center ${
            craftingResult.success 
              ? 'bg-green-900/30 border border-green-800/60 text-green-200' 
              : 'bg-red-900/30 border border-red-800/60 text-red-200'
          }`}>
            {craftingResult.success 
              ? <Check className="w-5 h-5 mr-2 text-green-400" /> 
              : <AlertCircle className="w-5 h-5 mr-2 text-red-400" />}
            <p>{craftingResult.message}</p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Categories */}
          <div className="md:w-1/4">
            <h3 className="text-amber-200 font-medium mb-2">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedRecipe(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center ${
                    selectedCategory === category
                      ? 'bg-amber-800/50 text-amber-100'
                      : 'bg-stone-800/50 text-stone-300 hover:bg-stone-700/50'
                  }`}
                >
                  <span className="capitalize">{category}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Recipe List */}
          <div className="md:w-1/3 border-l border-amber-900/30 pl-4">
            {selectedCategory ? (
              <>
                <h3 className="text-amber-200 font-medium mb-2 capitalize">{selectedCategory} Recipes</h3>
                <div className="space-y-1">
                  {availableRecipes
                    .filter(recipe => recipe.category === selectedCategory)
                    .map(recipe => (
                      <button
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe.id)}
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          selectedRecipe === recipe.id
                            ? 'bg-amber-800/50 text-amber-100'
                            : 'bg-stone-800/50 text-stone-300 hover:bg-stone-700/50'
                        }`}
                      >
                        {recipe.name}
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-stone-500">
                <HelpCircle className="w-8 h-8 mb-2" />
                <p>Select a category</p>
              </div>
            )}
          </div>
          
          {/* Recipe Details */}
          <div className="md:w-5/12 border-l border-amber-900/30 pl-4">
            {recipeDetails ? (
              <div>
                <h3 className="text-amber-200 font-medium mb-1">{recipeDetails.name}</h3>
                <p className="text-stone-400 text-sm mb-3">{recipeDetails.description}</p>
                
                <div className="space-y-4">
                  {/* Required Resources */}
                  <div>
                    <h4 className="text-stone-300 text-sm mb-1">Required Resources:</h4>
                    <div className="bg-stone-800/70 rounded-md p-2">
                      {Object.entries(recipeDetails.ingredients).map(([resource, amount]) => (
                        <div key={resource} className="flex justify-between text-sm">
                          <span className="capitalize">{resource}</span>
                          <span className={
                            gameState.resources[resource as keyof typeof gameState.resources] >= amount
                              ? 'text-green-400'
                              : 'text-red-400'
                          }>
                            {amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Produces */}
                  <div>
                    <h4 className="text-stone-300 text-sm mb-1">Produces:</h4>
                    <div className="bg-stone-800/70 rounded-md p-2">
                      {Object.entries(recipeDetails.products).map(([product, amount]) => (
                        <div key={product} className="flex justify-between text-sm">
                          <span className="capitalize">
                            {product.endsWith('Capacity') 
                              ? `${product.replace('Capacity', '')} capacity`
                              : product}
                          </span>
                          <span className="text-amber-400">{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Success Chance */}
                  <div>
                    <h4 className="text-stone-300 text-sm mb-1">Success Chance:</h4>
                    <div className="bg-stone-800/70 rounded-md p-2">
                      <div className="flex justify-between items-center">
                        <div className="w-full bg-stone-700 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              successChance > 0.7 ? 'bg-green-600' :
                              successChance > 0.4 ? 'bg-amber-500' : 'bg-red-600'
                            }`}
                            style={{ width: `${successChance * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm ${
                          successChance > 0.7 ? 'text-green-400' :
                          successChance > 0.4 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {Math.round(successChance * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Craft Button */}
                  <button
                    onClick={handleCraft}
                    disabled={!hasResources}
                    className={`w-full py-2 rounded-md font-medium ${
                      hasResources
                        ? 'bg-amber-700 hover:bg-amber-600 text-stone-100'
                        : 'bg-stone-700/50 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    {hasResources ? 'Craft Item' : 'Not Enough Resources'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-stone-500">
                <Wrench className="w-8 h-8 mb-2" />
                <p>Select a recipe to craft</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftingPanel; 