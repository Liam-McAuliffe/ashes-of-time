import React, { useState, useEffect, useRef, useCallback } from 'react';

interface GatherWaterMiniGameProps {
  onComplete: (success: boolean) => void;
  difficulty?: number; // Affects pressure rise speed, green zone size
}

const GatherWaterMiniGame: React.FC<GatherWaterMiniGameProps> = ({
  onComplete,
  difficulty = 1,
}) => {
  const [isPumping, setIsPumping] = useState(false);
  const [pressure, setPressure] = useState(0); // 0 to 100 (or higher for overshoot)
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const pumpIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressureRef = useRef(0); // Track pressure value for access in event listeners

  // --- Game Parameters (Adjust based on difficulty later) ---
  const maxPressure = 100;
  const pressureIncreaseRate = 70 / difficulty; // Increased base rate from 50 to 70
  const greenZone = { min: 70, max: 85 }; // Narrowed green zone (was 65-85)
  const burstZone = 100;

  // Keep pressureRef in sync with pressure state
  useEffect(() => {
    pressureRef.current = pressure;
  }, [pressure]);

  // --- Pressure Logic (Wrapped in useCallback) ---
  const stopPumping = useCallback(() => {
    if (!isPumping && pumpIntervalRef.current === null) return;

    setIsPumping(false);
    setIsComplete(true);
    
    if (pumpIntervalRef.current) {
      clearInterval(pumpIntervalRef.current);
      pumpIntervalRef.current = null;
    }

    const currentPressure = pressureRef.current;

    let success = false;
    if (currentPressure >= burstZone) {
      setResultMessage('Burst! No water gathered.');
    } else if (currentPressure >= greenZone.min && currentPressure <= greenZone.max) {
      const waterGained = 5;
      setResultMessage(`Success! +${waterGained} Water`);
      success = true;
    } else if (currentPressure < greenZone.min && currentPressure > 0) {
      setResultMessage('Too weak... Gathered little.');
    } else {
      setResultMessage('Pump not used.');
    }

    // Small delay before calling onComplete
    setTimeout(() => {
      onComplete(success);
    }, 1200); // Show message for 1.2 seconds
    
  }, [isPumping, greenZone, burstZone, onComplete]);

  const startPumping = useCallback(() => {
    if (isComplete || isPumping) return;
    
    setIsPumping(true);
    setResultMessage(null);

    // Use a consistent interval for all control methods
    pumpIntervalRef.current = setInterval(() => {
      setPressure((prevPressure) => {
        const newPressure = prevPressure + (pressureIncreaseRate / 20);
        pressureRef.current = newPressure; // Update ref immediately for event handlers
        
        if (newPressure >= burstZone + 10) {
          // Handle burst case
          stopPumping();
        }
        
        return newPressure;
      });
    }, 50);
  }, [isComplete, isPumping, pressureIncreaseRate, burstZone, stopPumping]);

  // --- Key Press Listener Effect ---
  useEffect(() => {
    let isSpaceDown = false; // Track if space is currently held

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === ' ' || event.code === 'Space') && !isSpaceDown && !isComplete) {
        event.preventDefault();
        isSpaceDown = true;
        startPumping();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if ((event.key === ' ' || event.code === 'Space') && isSpaceDown) {
        event.preventDefault();
        isSpaceDown = false;
        stopPumping();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // Ensure pumping stops if component unmounts while space is held
      if (isSpaceDown && pumpIntervalRef.current) {
        stopPumping();
      }
    };
  }, [startPumping, stopPumping, isComplete]);

  // --- Cleanup interval on unmount Effect ---
  useEffect(() => {
    return () => {
      if (pumpIntervalRef.current) {
        clearInterval(pumpIntervalRef.current);
      }
    };
  }, []);

  // --- Render Logic ---
  const pressurePercent = Math.min(100, (pressure / maxPressure) * 100);
  const greenZoneTop = (1 - (greenZone.max / maxPressure)) * 100;
  const greenZoneHeight = ((greenZone.max - greenZone.min) / maxPressure) * 100;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm focus:outline-none"
    >
      {/* Result Message Area */}
      <div className="h-10 mb-2 flex items-center justify-center">
        {resultMessage && (
          <p className={`text-xl font-bold ${resultMessage.toLowerCase().includes('success') ? 'text-green-500' : 'text-red-500'}`}>
            {resultMessage}
          </p>
        )}
      </div>

      {/* Pressure Meter */}
      <div className="w-16 h-64 bg-gray-700 rounded border-2 border-olive/50 relative overflow-hidden mb-4">
        {/* Green Zone */}
        <div 
          className="absolute left-0 w-full bg-green-500/30" 
          style={{ top: `${greenZoneTop}%`, height: `${greenZoneHeight}%` }}
        ></div>
        {/* Burst Zone (Top part) */}
        <div 
          className="absolute left-0 top-0 w-full h-[10%] bg-red-500/30"
        ></div>
        {/* Pressure Indicator */}
        <div 
          className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-50 ease-linear"
          style={{ height: `${pressurePercent}%` }}
        ></div>
        {/* Target lines */}
        <div className="absolute w-full border-t border-green-400/50" style={{bottom: `${(greenZone.min/maxPressure)*100}%`}}></div>
        <div className="absolute w-full border-t border-green-400/50" style={{bottom: `${(greenZone.max/maxPressure)*100}%`}}></div>
      </div>

      {/* Pump Button */}
      <button 
        className={`px-6 py-3 rounded font-semibold text-stone shadow-md transition-colors ${isPumping ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} ${isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
        // Start events
        onMouseDown={startPumping}
        onTouchStart={(e) => { e.preventDefault(); startPumping(); }}
        // Stop events
        onMouseUp={stopPumping}
        onMouseLeave={() => isPumping && stopPumping()}
        onTouchEnd={(e) => { e.preventDefault(); stopPumping(); }}
        disabled={isComplete}
      >
        {isPumping ? 'Pumping...' : (isComplete ? 'Done' : 'Hold to Pump')}
      </button>

      {/* Instructions (Hidden when complete) */}
      <div className="h-10 mt-2 flex items-center justify-center">
        {!isComplete && (
          <p className="text-stone text-lg animate-pulse">
            Hold Pump & Release in Green Zone!
          </p>
        )}
      </div>
    </div>
  );
};

export default GatherWaterMiniGame;