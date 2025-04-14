import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Target,
  Timer,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  calculateHuntSuccessOutcome,
  calculateHuntFailureOutcome,
} from '@/utils/gameLogic';

function HuntSelection({ survivors, onHuntComplete, onHuntStart, disabled }) {
  const [selectedHunterId, setSelectedHunterId] = useState('player');
  const [gamePhase, setGamePhase] = useState('idle');
  const [resultData, setResultData] = useState(null);
  const qteTimeoutRef = useRef(null);
  const waitTimeoutRef = useRef(null);
  const keydownListenerRef = useRef(null);
  const gamePhaseRef = useRef('idle');

  const QTE_WAIT_MIN = 1500;
  const QTE_WAIT_MAX = 3500;
  const QTE_DURATION = 1000;
  const QTE_KEY = ' ';

  const potentialHunters = survivors.filter((s) => s.health > 20);

  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    const currentSelectionValid = potentialHunters.some(
      (s) => s.id === selectedHunterId
    );
    if (potentialHunters.length > 0 && !currentSelectionValid) {
      const playerHunter = potentialHunters.find((s) => s.id === 'player');
      setSelectedHunterId(
        playerHunter ? playerHunter.id : potentialHunters[0].id
      );
    } else if (potentialHunters.length === 0) {
      setSelectedHunterId('player');
    }
  }, [JSON.stringify(potentialHunters.map((s) => s.id)), selectedHunterId]);

  useEffect(() => {
    const qteTimeout = qteTimeoutRef.current;
    const waitTimeout = waitTimeoutRef.current;
    const keydownListener = keydownListenerRef.current;

    return () => {
      clearTimeout(qteTimeout);
      clearTimeout(waitTimeout);
      if (keydownListener) {
        window.removeEventListener('keydown', keydownListener);
      }
    };
  }, []);

  const handleQTE = useCallback(
    (success) => {
      setGamePhase('result');
      if (keydownListenerRef.current) {
        window.removeEventListener('keydown', keydownListenerRef.current);
        keydownListenerRef.current = null;
      }
      clearTimeout(qteTimeoutRef.current);

      const hunter = survivors.find((s) => s.id === selectedHunterId);
      if (!hunter) {
        console.error('Hunter not found in handleQTE');
        return;
      }

      let outcome;
      if (success) {
        outcome = calculateHuntSuccessOutcome(hunter);
      } else {
        outcome = calculateHuntFailureOutcome(hunter);
      }

      setResultData(outcome);

      setTimeout(() => {
        onHuntComplete({ hunterId: selectedHunterId, ...outcome });

        setTimeout(() => {
          setGamePhase('idle');
          setResultData(null);
        }, 500);
      }, 1500);
    },
    [selectedHunterId, survivors, onHuntComplete]
  );

  const startHuntMiniGame = () => {
    if (disabled || !selectedHunterId || gamePhase !== 'idle') return;

    if (onHuntStart) {
      onHuntStart();
    }

    setGamePhase('waiting');
    setResultData(null);

    const waitTime =
      Math.random() * (QTE_WAIT_MAX - QTE_WAIT_MIN) + QTE_WAIT_MIN;

    clearTimeout(waitTimeoutRef.current);
    waitTimeoutRef.current = setTimeout(() => {
      setGamePhase('active');

      if (keydownListenerRef.current) {
        window.removeEventListener('keydown', keydownListenerRef.current);
      }

      keydownListenerRef.current = (event) => {
        if (event.key === QTE_KEY) {
          event.preventDefault();
          handleQTE(true);
        }
      };
      window.addEventListener('keydown', keydownListenerRef.current);

      clearTimeout(qteTimeoutRef.current);
      qteTimeoutRef.current = setTimeout(() => {
        if (gamePhaseRef.current === 'active') {
          handleQTE(false);
        }
      }, QTE_DURATION);
    }, waitTime);
  };

  if (potentialHunters.length === 0 && gamePhase === 'idle') {
    return (
      <div className="w-full md:w-3/4 mt-4 p-3 border border-dashed border-olive/70 rounded bg-stone-light text-center">
        <p className="text-sm text-olive italic">
          No one is healthy enough to hunt.
        </p>
      </div>
    );
  }

  const selectedHunterName =
    potentialHunters.find((s) => s.id === selectedHunterId)?.name ||
    'Select Hunter';

  return (
    <div className="sm:w-[50%] w-full  px-4 border border-dashed border-olive/70 rounded bg-stone-light space-y-3 text-center min-h-[150px] flex flex-col justify-center items-center">
      {gamePhase === 'idle' && (
        <>
          <h4 className="font-semibold text-charcoal mb-2">Go Hunting?</h4>
          {potentialHunters.length > 1 && (
            <div className="mb-2">
              <label htmlFor="hunterSelect" className="text-sm text-olive mr-2">
                Send:
              </label>
              <select
                id="hunterSelect"
                value={selectedHunterId}
                onChange={(e) => setSelectedHunterId(e.target.value)}
                className="px-2 py-1 rounded border border-olive bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-rust/50 text-sm"
                disabled={disabled}
              >
                {potentialHunters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Health: {s.health})
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={startHuntMiniGame}
            disabled={disabled || !selectedHunterId}
            className={`
              w-full max-w-xs px-4 py-2 rounded font-medium border border-charcoal/40
              bg-emerald-700 text-stone hover:enabled:bg-emerald-600
              focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2 focus:ring-offset-stone
              disabled:bg-olive disabled:opacity-70 disabled:cursor-not-allowed disabled:text-stone/70
              transition-colors duration-150 ease-in-out flex items-center justify-center gap-2
            `}
          >
            <Target size={16} />
            Start Hunt ({selectedHunterName})
          </button>
          <p className="text-xs text-olive italic mt-1">
            Takes a full day. Be ready to react!
          </p>
        </>
      )}

      {gamePhase === 'waiting' && (
        <div className="flex flex-col items-center animate-pulse">
          <Timer size={24} className="text-olive mb-2" />
          <p className="text-lg text-olive">Tracking prey...</p>
        </div>
      )}

      {gamePhase === 'active' && (
        <div
          className="flex flex-col items-center text-center w-full cursor-pointer"
          onClick={() => handleQTE(true)}
        >
          <AlertTriangle size={32} className="text-rust mb-2 animate-ping" />
          <p className="text-2xl font-bold text-rust animate-pulse">
            PRESS [SPACE] OR TAP SCREEN NOW!
          </p>
          <div className="w-full h-2 bg-gray-300 rounded mt-3 overflow-hidden">
            <div
              className="h-full bg-rust animate-qte-timer"
              style={{ animationDuration: `${QTE_DURATION}ms` }}
            ></div>
          </div>
          <style>{`
                @keyframes qte-timer {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-qte-timer {
                    animation: qte-timer linear forwards;
                }
            `}</style>
        </div>
      )}

      {gamePhase === 'result' && resultData && (
        <div className="flex flex-col items-center text-center">
          {resultData.foodGained > 0 ? (
            <CheckCircle size={32} className="text-emerald-600 mb-2" />
          ) : (
            <XCircle size={32} className="text-rust mb-2" />
          )}
          <p
            className={`text-lg font-semibold ${
              resultData.foodGained > 0 ? 'text-emerald-700' : 'text-rust'
            }`}
          >
            {resultData.foodGained > 0 ? 'Success!' : 'Failed!'}
          </p>
          <p className="text-sm text-charcoal mt-1">{resultData.outcomeText}</p>
        </div>
      )}
    </div>
  );
}

export default HuntSelection;
