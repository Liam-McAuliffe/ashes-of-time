import React, { useState } from 'react';
import { 
  SaveMetadata, 
  DifficultyLevel, 
  DIFFICULTY_PRESETS 
} from '../../services/saveManager';
import { useSaveManager } from '../../hooks/useSaveManager';
import { HardDrive, Save, FileUp, FileDown, Edit2, Trash2, X, Info, AlertTriangle, Bookmark } from 'lucide-react';

interface SaveSlotProps {
  save: SaveMetadata;
  onLoad: (slot: number) => void;
  onSave: (slot: number, name: string) => void;
  onDelete: (slot: number) => void;
  onRename: (slot: number, newName: string) => void;
}

/**
 * Component that displays an individual save slot
 */
const SaveSlot: React.FC<SaveSlotProps> = ({ save, onLoad, onSave, onDelete, onRename }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(save.name);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRename = () => {
    if (newName.trim()) {
      onRename(save.slot, newName.trim());
      setIsRenaming(false);
    }
  };

  return (
    <div className="bg-stone-800/80 backdrop-blur-sm rounded-md p-3 border border-amber-900/40 hover:border-amber-700/60 transition-all">
      {showConfirmDelete ? (
        <div className="flex flex-col space-y-2">
          <div className="text-red-300 font-medium flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Confirm Delete?
          </div>
          <p className="text-stone-300 text-sm">This cannot be undone.</p>
          <div className="flex space-x-2 pt-1">
            <button 
              onClick={() => onDelete(save.slot)}
              className="bg-red-700/80 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium text-stone-100"
            >
              Delete
            </button>
            <button 
              onClick={() => setShowConfirmDelete(false)}
              className="bg-stone-700/60 hover:bg-stone-600/80 px-3 py-1 rounded text-sm font-medium text-stone-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : isRenaming ? (
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-2 py-1 bg-stone-700 text-stone-100 rounded border border-amber-800/50 focus:outline-none focus:border-amber-600"
            autoFocus
          />
          <div className="flex space-x-2">
            <button 
              onClick={handleRename}
              className="bg-amber-700/60 hover:bg-amber-700/80 px-3 py-1 rounded text-sm font-medium text-stone-100"
            >
              Save
            </button>
            <button 
              onClick={() => setIsRenaming(false)}
              className="bg-stone-700/60 hover:bg-stone-600/80 px-3 py-1 rounded text-sm font-medium text-stone-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <Bookmark className="w-4 h-4 mr-2 text-amber-500" />
              <h4 className="font-semibold text-amber-100">{save.name}</h4>
            </div>
            <span className="text-xs text-stone-400">Slot {save.slot}</span>
          </div>
          
          <div className="text-xs text-stone-300 mb-3 flex flex-col space-y-1">
            <div className="flex justify-between">
              <span>Day {save.day}</span>
              <span className="text-amber-500/90">{save.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span>Resources: {save.food}F / {save.water}W</span>
              <span>{save.survivors} Survivors</span>
            </div>
            <div className="text-stone-400 text-xs">
              {formatDate(save.timestamp)}
            </div>
          </div>
          
          <div className="flex space-x-1 justify-between">
            <button 
              onClick={() => onLoad(save.slot)}
              className="flex-1 flex items-center justify-center bg-blue-700/70 hover:bg-blue-600/80 px-2 py-1 rounded text-xs font-medium text-stone-100"
            >
              <FileDown className="w-3 h-3 mr-1" />
              Load
            </button>
            <button 
              onClick={() => onSave(save.slot, save.name)}
              className="flex-1 flex items-center justify-center bg-amber-700/70 hover:bg-amber-600/80 px-2 py-1 rounded text-xs font-medium text-stone-100"
            >
              <Save className="w-3 h-3 mr-1" />
              Overwrite
            </button>
            <button 
              onClick={() => setIsRenaming(true)}
              className="flex items-center justify-center bg-stone-700/50 hover:bg-stone-600/70 px-2 py-1 rounded text-xs font-medium text-stone-200"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center justify-center bg-stone-700/50 hover:bg-red-700/70 px-2 py-1 rounded text-xs font-medium text-stone-200"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

interface SaveManagerPanelProps {
  onClose: () => void;
}

/**
 * Panel component that manages saves and game settings
 */
const SaveManagerPanel: React.FC<SaveManagerPanelProps> = ({ onClose }) => {
  const {
    saves,
    saveToSlot,
    loadFromSlot,
    deleteSaveSlot,
    renameSaveSlot,
    refreshSaves,
    hasSaves,
    isLoading,
    errorMessage
  } = useSaveManager();
  
  const [activeTab, setActiveTab] = useState<'saves' | 'settings'>('saves');
  const [newSaveName, setNewSaveName] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('normal');
  
  // Find the next available slot
  const getNextAvailableSlot = () => {
    // Slots are 1-10, find the first unused slot
    for (let i = 1; i <= 10; i++) {
      if (!saves.some(save => save.slot === i)) {
        return i;
      }
    }
    // If all slots are used, return slot 1 (will overwrite)
    return 1;
  };
  
  const handleSaveGame = (slot: number, name: string) => {
    const saveName = name || `Day Save - ${new Date().toLocaleDateString()}`;
    saveToSlot(slot, saveName);
  };
  
  const handleCreateNewSave = () => {
    const slot = getNextAvailableSlot();
    handleSaveGame(slot, newSaveName);
    setNewSaveName('');
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-stone-900/90 border border-amber-900/60 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b border-amber-900/40 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-amber-100 flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-amber-400" />
            Survival Archives
          </h2>
          <button 
            onClick={onClose}
            className="bg-stone-800/60 hover:bg-stone-700 rounded-full p-1 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b border-amber-900/30 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'saves' 
                ? 'text-amber-400 border-b-2 border-amber-500/70' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
            onClick={() => setActiveTab('saves')}
          >
            Saves
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'text-amber-400 border-b-2 border-amber-500/70' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center p-6">
            <div className="animate-pulse text-amber-500">Loading...</div>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-900/40 border border-red-800 text-red-200 p-3 rounded mb-4 flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 text-red-400" />
            <p>{errorMessage}</p>
          </div>
        )}
        
        {activeTab === 'saves' && (
          <>
            <div className="flex items-center mb-4 space-x-2">
              <input
                type="text"
                placeholder="New save name..."
                value={newSaveName}
                onChange={(e) => setNewSaveName(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-800 border border-amber-900/40 rounded text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-700"
              />
              <button
                onClick={handleCreateNewSave}
                disabled={isLoading}
                className="flex items-center bg-amber-700/80 hover:bg-amber-600 text-stone-100 font-medium px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileUp className="w-4 h-4 mr-2" />
                Save Game
              </button>
            </div>
            
            {!hasSaves ? (
              <div className="text-center p-6 border border-dashed border-amber-900/30 rounded-md bg-stone-800/50">
                <Info className="w-8 h-8 text-amber-600/70 mx-auto mb-2" />
                <p className="text-stone-400">No saved games found.</p>
                <p className="text-stone-500 text-sm mt-1">Create your first save to see it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {saves.filter(save => save.slot !== 0).map(save => (
                  <SaveSlot
                    key={save.slot}
                    save={save}
                    onLoad={loadFromSlot}
                    onSave={handleSaveGame}
                    onDelete={deleteSaveSlot}
                    onRename={renameSaveSlot}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-amber-200 font-medium mb-3">Difficulty Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`p-3 rounded-md ${
                      selectedDifficulty === level 
                        ? 'bg-amber-800/70 border-2 border-amber-600/80 text-amber-100' 
                        : 'bg-stone-800/70 border border-amber-900/30 hover:border-amber-800/50 text-stone-300'
                    }`}
                  >
                    <div className="font-medium capitalize mb-1">{level}</div>
                    <div className="text-xs">
                      {level === 'easy' && "For those who want to focus on story"}
                      {level === 'normal' && "Balanced survival experience"}
                      {level === 'hard' && "Resources are scarce, dangers plenty"}
                      {level === 'apocalypse' && "True post-apocalyptic nightmare"}
                      {level === 'custom' && "Customize your own difficulty"}
                    </div>
                  </button>
                ))}
              </div>
              
              {selectedDifficulty === 'custom' && (
                <div className="mt-4 border border-amber-900/30 rounded-md p-3 bg-stone-800/50">
                  <p className="text-stone-400 text-sm mb-2">Custom difficulty options will be available in a future update.</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-amber-200 font-medium mb-3">Auto-Save Settings</h3>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="autoSave"
                  className="h-4 w-4 rounded border-amber-900/60 text-amber-600 focus:ring-amber-600/50 bg-stone-800"
                />
                <label htmlFor="autoSave" className="text-stone-300">Enable auto-save</label>
              </div>
              <p className="text-stone-500 text-sm">Auto-save happens every 5 minutes and when you end your day.</p>
            </div>
            
            <div>
              <h3 className="text-amber-200 font-medium mb-3">Audio Settings</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-stone-300 text-sm">Music Volume</label>
                    <span className="text-stone-400 text-sm">50%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-stone-300 text-sm">Sound Effects</label>
                    <span className="text-stone-400 text-sm">70%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="70"
                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 pt-3 border-t border-amber-900/30 flex justify-between">
          <button
            onClick={refreshSaves}
            className="text-stone-400 hover:text-stone-200 text-sm flex items-center"
          >
            <HardDrive className="w-4 h-4 mr-1" />
            Refresh
          </button>
          
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveManagerPanel; 