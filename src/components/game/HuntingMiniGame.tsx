import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { StatusEffect } from '../../types/game'; // Import StatusEffect type

interface HuntingMiniGameProps {
  onComplete: (success: boolean) => void; 
  difficulty?: number; // For future speed/timing adjustments
  actorStatuses?: StatusEffect[]; // Rename playerStatuses to actorStatuses
  actorId: string; // Add actorId
}

const HuntingMiniGame: React.FC<HuntingMiniGameProps> = ({
  onComplete,
  difficulty = 1,
  actorStatuses = [], // Default to empty array
  actorId,
}) => {
  const controls = useAnimationControls();
  const scopeRef = useRef<HTMLDivElement>(null);
  const [missed, setMissed] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null); // Added state for feedback message
  const [isClicked, setIsClicked] = useState(false); // Prevent multiple clicks

  // --- Animation Configuration --- 
  // Adjust base speed/timing based on Malnourished status
  const isMalnourished = actorStatuses.includes('Malnourished');
  const speedMultiplier = isMalnourished ? 1.15 : 1; // Malnourished makes it ~15% harder/faster feel
  
  const pulseDuration = (1.5 / difficulty) / speedMultiplier; // Faster pulse for higher difficulty or malnourished
  const targetScale = 0.3;
  const successWindow = 0.1 / speedMultiplier; // Malnourished reduces the success window slightly

  // --- Click/KeyPress Handling (MOVED UP) ---
  const handleClick = useCallback(() => { 
    if (isClicked) return; 
    setIsClicked(true);
    controls.stop();

    let currentScale = 1; 
    if (scopeRef.current) {
      const style = window.getComputedStyle(scopeRef.current);
      const matrix = style.transform;
      if (matrix && matrix !== 'none') {
        try {
          const matrixValues = matrix.match(/matrix\((.+)\)/)?.[1]?.split(', ');
          if (matrixValues) {
            currentScale = parseFloat(matrixValues[0]); 
          }
        } catch (e) {
          console.error("Error parsing transform matrix:", e);
        }
      }
    }

    // Adjust success threshold slightly if malnourished, requiring more precision
    const adjustedSuccessWindow = isMalnourished ? successWindow * 0.85 : successWindow; 
    const successThreshold = targetScale * (1 + adjustedSuccessWindow);
    const isSuccess = currentScale <= successThreshold;
    
    console.log(`Clicked! Target Scale: ${targetScale.toFixed(2)}, Current Scale: ${currentScale.toFixed(2)}, Success Threshold: ${successThreshold.toFixed(2)}, Malnourished: ${isMalnourished}, Success: ${isSuccess}`);

    if (isSuccess) {
      const foodGained = 5; 
      setResultMessage(`Hit! +${foodGained} Food`);
    } else {
      setMissed(true); 
      setResultMessage('Missed!');
    }
  }, [isClicked, controls, targetScale, successWindow, onComplete, setResultMessage, setMissed, isMalnourished]); // Added isMalnourished to deps

  // --- Effects ---
  // Animation Start Effect
  useEffect(() => {
    controls.start({
      scale: [1, targetScale, 1], 
      transition: {
        duration: pulseDuration,
        ease: "easeInOut",
        repeat: Infinity,
        times: [0, 0.5, 1],
      },
    });
    return () => controls.stop();
  }, [controls, pulseDuration, targetScale]);

  // Result Message -> onComplete Effect
  useEffect(() => {
    if (resultMessage) {
      const timer = setTimeout(() => {
        const success = !resultMessage.toLowerCase().includes('missed');
        onComplete(success);
      }, 1200); 

      return () => clearTimeout(timer);
    }
  }, [resultMessage, onComplete]);

  // KeyDown Listener Effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault(); 
        handleClick(); // Now defined above
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClick]); 

  return (
    <div 
      // Overlay container
      className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm focus:outline-none" 
      tabIndex={-1} // Allow div to be focusable for key events, but not via tab
      onClick={handleClick} // Added onClick back for mobile tap support
    >
      {/* Result Message Area (Above Reticle) */} 
      <div className="h-10 mb-2 flex items-center justify-center"> 
        {resultMessage && (
          <p className={`text-xl font-bold ${resultMessage.includes('Missed') ? 'text-red-500' : 'text-green-500'}`}>
            {resultMessage}
          </p>
        )}
      </div>

      {/* Reticle container */} 
      <div className="relative w-64 h-64 border-2 border-dashed border-olive/50 rounded-full flex items-center justify-center mb-4"> 
      {/* Added mb-4 for spacing */}
        
        {/* Pulsing Scope - Fixed size, centered by parent flex */}
        <motion.div
          ref={scopeRef}
          // Removed w-full h-full, added fixed size slightly smaller than parent
          className={`w-[240px] h-[240px] rounded-full border-2 ${missed ? 'border-red-600 bg-red-500/30' : 'border-rust'} shadow-lg`}
          animate={controls}
          style={{ scale: 1 }} 
        />
        
        {/* Crosshair (static, centered within parent) */} 
        <div className="absolute w-1 h-8 bg-rust/70"></div>
        <div className="absolute w-8 h-1 bg-rust/70"></div>

        {/* MOVED OUT: Instruction Text */} 
        {/* MOVED OUT: Miss Indicator */} 
      </div>

    </div>
  );
};

export default HuntingMiniGame; 