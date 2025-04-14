import React from 'react';
import { PawPrint, Skull } from 'lucide-react';

function SurvivorDisplay({ survivors }) {
  if (!survivors || survivors.length === 0) {
    return null;
  }

  return (
    <div className="w-full border border-olive p-4 rounded bg-stone shadow-md text-charcoal">
      <h3 className="font-semibold mb-3 text-lg text-charcoal">
        Party Status:
      </h3>
      <ul className="space-y-1">
        {survivors.map((survivor) => (
          <li
            key={survivor.id}
            className="flex justify-between items-center border-b border-olive/50 py-1.5 last:border-b-0"
          >
            <div className="flex items-center flex-wrap mr-2">
              {survivor.health <= 0 && (
                <Skull
                  size={14}
                  className="text-olive opacity-70 mr-1.5 flex-shrink-0"
                  aria-label="Deceased"
                />
              )}
              <span
                className={`mr-2 ${
                  survivor.health <= 0
                    ? 'line-through text-olive opacity-70'
                    : 'text-charcoal'
                }`}
              >
                {survivor.name} (Health: {survivor.health})
              </span>
              {survivor.statuses.length > 0 && (
                <span className="text-xs text-rust font-medium mr-2 whitespace-nowrap">
                  [{survivor.statuses.join(', ')}]
                </span>
              )}
            </div>
            {survivor.companion && survivor.health > 0 && (
              <span
                className="text-xs text-rust ml-auto flex items-center flex-shrink-0 pl-2"
                title={`Companion: ${survivor.companion.name} (${survivor.companion.type})`}
              >
                <PawPrint size={14} className="inline mr-1" />
                {survivor.companion.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SurvivorDisplay;
