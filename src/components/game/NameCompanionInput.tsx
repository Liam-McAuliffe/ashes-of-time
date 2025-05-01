import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks';
import { finishNamingCompanion } from '../../store/slices/gameSlice';
import { PawPrint } from 'lucide-react';

interface NameCompanionInputProps {
  companionToNameInfo: {
    survivorId: string;
    companion: {
      type: string;
      name: string;
    };
  } | null;
}

const NameCompanionInput: React.FC<NameCompanionInputProps> = ({ companionToNameInfo }) => {
  const dispatch = useAppDispatch();
  const [companionName, setCompanionName] = useState(companionToNameInfo?.companion?.name || '');

  useEffect(() => {
    setCompanionName(companionToNameInfo?.companion?.name || '');
  }, [companionToNameInfo]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanionName(event.target.value);
  };

  const handleConfirmName = (event: React.FormEvent) => {
    event.preventDefault();
    const finalName = companionName.trim();

    if (!finalName) {
      alert('Companion name cannot be empty!');
      return;
    }

    if (!companionToNameInfo) return;

    dispatch(finishNamingCompanion({
      survivorId: companionToNameInfo.survivorId,
      newName: finalName
    }));
  };

  if (!companionToNameInfo || !companionToNameInfo.companion) {
    return <p className="text-olive">Error displaying companion info...</p>;
  }

  const { companion } = companionToNameInfo;

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