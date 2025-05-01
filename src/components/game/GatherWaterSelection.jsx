import React, { useState, useEffect, useCallback } from 'react';
import { Droplet, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { calculateGatherWaterOutcome } from '../../utils/gameLogic';

function GatherWaterSelection({
  survivors,
  onGatherComplete,
  onGatherStart,
  disabled,
}) {
  const [selectedGathererId, setSelectedGathererId] = useState('player');
  const [gamePhase, setGamePhase] = useState('idle');
  const [resultData, setResultData] = useState(null);

  const potentialGatherers = survivors.filter((s) => s.health > 20);

  useEffect(() => {
    const currentSelectionValid = potentialGatherers.some(
      (s) => s.id === selectedGathererId
    );
    if (potentialGatherers.length > 0 && !currentSelectionValid) {
      const playerGatherer = potentialGatherers.find((s) => s.id === 'player');
      setSelectedGathererId(
        playerGatherer ? playerGatherer.id : potentialGatherers[0].id
      );
    } else if (potentialGatherers.length === 0) {
      setSelectedGathererId('player');
    }
  }, [JSON.stringify(potentialGatherers.map((s) => s.id)), selectedGathererId]);

  const handleGatherWater = useCallback(() => {
    if (disabled || !selectedGathererId || gamePhase !== 'idle') return;

    onGatherStart?.();
    setGamePhase('processing');
    setResultData(null);

    const gatherer = potentialGatherers.find(
      (s) => s.id === selectedGathererId
    );

    if (!gatherer) {
      console.error('Selected gatherer not found in potential list.');
      setResultData({ outcomeText: 'Error: Gatherer data missing.' });
      setGamePhase('result');
      setTimeout(() => {
        setGamePhase('idle');
        setResultData(null);
      }, 1500);
      return;
    }

    setTimeout(() => {
      const outcome = calculateGatherWaterOutcome(gatherer);
      setResultData(outcome);
      setGamePhase('result');

      setTimeout(() => {
        onGatherComplete({ gathererId: selectedGathererId, ...outcome });
        setGamePhase('idle');
        setResultData(null);
      }, 1500);
    }, 750);
  }, [
    disabled,
    selectedGathererId,
    gamePhase,
    potentialGatherers,
    onGatherStart,
    onGatherComplete,
  ]);

  if (potentialGatherers.length === 0 && gamePhase === 'idle') {
    return (
      <div className="flex-1 p-3 border border-dashed border-olive/70 rounded bg-stone-light text-center flex items-center justify-center min-h-[150px]">
        <p className="text-sm text-olive italic">
          No one is healthy enough to gather water.
        </p>
      </div>
    );
  }

  const selectedGathererName =
    potentialGatherers.find((s) => s.id === selectedGathererId)?.name ||
    'Select Gatherer';

  return (
    <div className="flex-1 sm:w-[50%] w-full p-3 border border-dashed border-olive/70 rounded bg-stone-light space-y-2 text-center flex flex-col justify-center items-center min-h-[150px]">
      {gamePhase === 'idle' && (
        <>
          <h4 className="font-semibold text-charcoal mb-2">Gather Water?</h4>
          {potentialGatherers.length > 1 && (
            <div className="mb-2">
              <label
                htmlFor="gathererSelect"
                className="text-sm text-olive mr-2"
              >
                Send:
              </label>
              <select
                id="gathererSelect"
                value={selectedGathererId}
                onChange={(e) => setSelectedGathererId(e.target.value)}
                className="px-2 py-1 rounded border border-olive bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-rust/50 text-sm"
                disabled={disabled}
              >
                {potentialGatherers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Health: {s.health})
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={handleGatherWater}
            disabled={disabled || !selectedGathererId}
            className="w-full max-w-xs px-4 py-2 rounded font-medium border border-charcoal/40 bg-cyan-700 text-stone hover:enabled:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:ring-offset-2 focus:ring-offset-stone disabled:bg-olive disabled:opacity-70 disabled:cursor-not-allowed disabled:text-stone/70 transition-colors duration-150 ease-in-out flex items-center justify-center gap-2"
          >
            <Droplet size={16} /> Start Gathering ({selectedGathererName})
          </button>
          <p className="text-xs text-olive italic mt-1">
            Takes a full day. Outcome depends on luck and health.
          </p>
        </>
      )}

      {gamePhase === 'processing' && (
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 size={24} className="text-olive mb-2 animate-spin" />
          <p className="text-lg text-olive">Gathering water...</p>
        </div>
      )}

      {gamePhase === 'result' && resultData && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          {resultData.waterGained > 0 ? (
            <CheckCircle size={32} className="text-emerald-600 mb-2" />
          ) : (
            resultData.waterGained === 0 && (
              <XCircle size={32} className="text-rust mb-2" />
            )
          )}
          <p className="text-sm text-charcoal mt-1">{resultData.outcomeText}</p>
        </div>
      )}
    </div>
  );
}

export default GatherWaterSelection;
