import React, { useState, useEffect } from 'react';
import { GameActionTypes } from '@/actions/gameActions';
import { PawPrint } from 'lucide-react';

const NameCompanionInput = ({ companionInfo, dispatch }) => {
  const [companionName, setCompanionName] = useState(
    companionInfo?.companion?.name || ''
  );

  useEffect(() => {
    setCompanionName(companionInfo?.companion?.name || '');
  }, [companionInfo]);

  const handleNameChange = (event) => {
    setCompanionName(event.target.value);
  };

  const handleConfirmName = (event) => {
    event.preventDefault();
    const finalName = companionName.trim();

    if (!finalName) {
      alert('Companion name cannot be empty!');
      return;
    }

    dispatch({
      type: GameActionTypes.FINISH_NAMING_COMPANION,
      payload: {
        survivorId: companionInfo.survivorId,
        newName: finalName,
      },
    });
  };

  if (!companionInfo || !companionInfo.companion) {
    return <p className="text-olive">Error displaying companion info...</p>;
  }

  const { companion } = companionInfo;

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4 p-4 border border-olive/50 rounded bg-stone text-charcoal font-mono">
      <div className="flex items-center gap-2 text-lg">
        <PawPrint className="text-olive" />
        <span>You found a {companion.type || 'new companion'}!</span>
      </div>
      <p className="text-sm text-olive">What will you name it?</p>
      <form
        onSubmit={handleConfirmName}
        className="w-full md:w-3/4 flex flex-col sm:flex-row items-center gap-3"
      >
        <label htmlFor="companionNameInput" className="sr-only">
          Companion Name
        </label>
        <input
          type="text"
          id="companionNameInput"
          value={companionName}
          onChange={handleNameChange}
          placeholder="Enter name..."
          maxLength={20}
          className="flex-grow px-3 py-2 rounded border border-olive bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-rust/50 focus:border-transparent"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-rust text-stone font-semibold rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-rust/50 focus:ring-offset-2 focus:ring-offset-stone transition-opacity duration-150 ease-in-out shadow"
        >
          Confirm Name
        </button>
      </form>
    </div>
  );
};

export default NameCompanionInput;
