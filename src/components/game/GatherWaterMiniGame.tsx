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
    if (!isPumping && pumpIntervalRef.current === null) return; // Prevent stopping if not pumping

    // Only set to complete and calculate result on the first stop after starting
    if (isPumping) {
      setIsPumping(false);
      setIsComplete(true); // Set complete as soon as stop is triggered
    
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
      } else if (currentPressure > 0) { // Check if pressure is > 0 to avoid "Too weak" on no pump
        setResultMessage('Too weak... Gathered little.');
      } else {
          // This case should ideally not be reached if stopPumping is only called after start
          // but kept for completeness.
        setResultMessage('Pump not used.');
      }

      // Small delay before calling onComplete
      setTimeout(() => {
        onComplete(success);
      }, 1200); // Show message for 1.2 seconds
    }

  }, [isPumping, greenZone, burstZone, onComplete, setResultMessage, setIsComplete]); // Added missing state setters to deps

  const startPumping = useCallback(() => {
    // Only start if not already pumping and not complete
    if (isPumping || isComplete) return;

    setIsPumping(true);
    setResultMessage(null);
    setPressure(0); // Reset pressure on new attempt

    // Use a consistent interval for pressure increase
    pumpIntervalRef.current = setInterval(() => {
      setPressure((prevPressure) => {
        const newPressure = prevPressure + (pressureIncreaseRate / 20);
        pressureRef.current = newPressure; // Update ref immediately for event handlers

        // Automatically stop if burst pressure is reached
        if (newPressure >= burstZone) { // Use burstZone directly for trigger
          stopPumping();
        }

        return newPressure;
      });
    }, 50); // Update pressure every 50ms
  }, [isPumping, isComplete, pressureIncreaseRate, burstZone, stopPumping]);


  // --- Event Listeners (on container) ---
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
        // Only trigger if the target is the main container or a child, not the button itself if it still existed
        // For simplicity, let's just check if the game is not complete.
        if (!isComplete) {
		  event.preventDefault(); // Prevent default behavior
          startPumping();
        }
    };

    const handleMouseUp = (event: MouseEvent) => {
        // Only trigger if the game is not complete and we were pumping
        if (!isComplete && isPumping) {
		  event.preventDefault(); // Prevent default behavior
          stopPumping();
        }
    };
    
    const handleTouchStart = (event: TouchEvent) => {
        if (!isComplete) {
		  event.preventDefault(); // Prevent default scrolling/zooming
		  startPumping();
        }
    };

    const handleTouchEnd = (event: TouchEvent) => {
        if (!isComplete && isPumping) {
		  event.preventDefault(); // Prevent default behavior
		  stopPumping();
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.key === ' ' || event.code === 'Space') && !isComplete) {
            event.preventDefault(); // Prevent default spacebar action (scrolling)
            // Use a ref to track if space is already pressed to avoid starting interval multiple times
            if (!pumpIntervalRef.current) {
                 startPumping();
            }
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        if ((event.key === ' ' || event.code === 'Space') && !isComplete && isPumping) {
            event.preventDefault(); // Prevent default spacebar action
            stopPumping();
        }
    };


    const container = document.getElementById('water-game-container'); // Get the container by ID
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startPumping, stopPumping, isComplete, isPumping]); // Added isPumping and isComplete to dependencies


  // --- Cleanup interval on unmount Effect ---
  useEffect(() => {
    return () => {
      if (pumpIntervalRef.current) {
        clearInterval(pumpIntervalRef.current);
        pumpIntervalRef.current = null; // Clear ref on unmount
      }
    };
  }, []);

  // --- Render Logic ---
  const pressurePercent = Math.min(maxPressure, pressure); // Cap percentage at maxPressure visually
  const pressureFillHeight = (pressurePercent / maxPressure) * 100;

  const greenZoneTop = (1 - (greenZone.max / maxPressure)) * 100;
  const greenZoneHeight = ((greenZone.max - greenZone.min) / maxPressure) * 100;
  const burstZoneHeight = (maxPressure - burstZone) / maxPressure * 100; // Calculate remaining height above burst

  return (
    <div
      id="water-game-container" // Added ID for event listener targeting
      className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm focus:outline-none"
      tabIndex={-1} // Make the div focusable for key events
      // Event listeners are now attached via useEffect
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
          style={{ bottom: `${(greenZone.min/maxPressure)*100}%`, height: `${greenZoneHeight}%` }} // Adjusted to use bottom for positioning
        ></div>
        {/* Burst Zone (Top part) */}
        <div
          className="absolute left-0 top-0 w-full bg-red-500/30"
           style={{ height: `${burstZoneHeight}%` }} // Positioned from top
        ></div>
        {/* Pressure Indicator */}
        <div
          className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-50 ease-linear"
          style={{ height: `${pressureFillHeight}%` }} // Use calculated fill height
        ></div>
        {/* Target lines */}
        <div className="absolute w-full border-t border-green-400/50" style={{bottom: `${(greenZone.min/maxPressure)*100}%`}}></div>
        <div className="absolute w-full border-t border-green-400/50" style={{bottom: `${(greenZone.max/maxPressure)*100}%`}}></div>
      </div>

      {/* Instruction Text (Below Meter) */}
      <div className="h-10 mt-2 flex items-center justify-center">
        {!isComplete && (
          <p className="text-stone text-lg animate-pulse">
            Hold Anywhere (or Space) to Pump! Release in Green Zone!
          </p>
        )}
      </div>
        {/* Removed the explicit button as interaction is now on the container */}
    </div>
  );
};

export default GatherWaterMiniGame;