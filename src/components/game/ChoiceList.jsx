import React from 'react';

function ChoiceList({
  choices,
  onChoiceSelected,
  isLoading,
  currentFood,
  currentWater,
}) {
  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-4 space-y-3">
      <h3 className="text-lg font-semibold text-olive mb-2 text-center">
        What will you do?
      </h3>
      {choices.map((choice) => {
        const foodCost = choice.cost?.food || 0;
        const waterCost = choice.cost?.water || 0;
        const canAfford = currentFood >= foodCost && currentWater >= waterCost;
        const isDisabled = isLoading || !canAfford;

        return (
          <button
            key={choice.id}
            onClick={() => !isDisabled && onChoiceSelected(choice)}
            disabled={isDisabled}
            className={`
              w-full px-4 py-3 rounded font-medium border text-left
              transition-colors duration-150 ease-in-out
              ${
                isDisabled
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-500 opacity-60'
                  : 'bg-rust text-stone hover:bg-rust/90 border-rust/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rust/50 focus:ring-offset-2 focus:ring-offset-stone'
              }
            `}
          >
            <p className="font-bold">{choice.text}</p>
            {(foodCost > 0 || waterCost > 0) && (
              <p className="text-xs mt-1 opacity-90">
                Cost: {foodCost > 0 ? `${foodCost} Food` : ''}
                {foodCost > 0 && waterCost > 0 ? ', ' : ''}
                {waterCost > 0 ? `${waterCost} Water` : ''}
                {!canAfford && (
                  <span className="ml-2 font-semibold text-red-200">
                    (Cannot Afford)
                  </span>
                )}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ChoiceList;
