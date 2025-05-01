import { Survivor } from '../../types/game';
import { Heart, Shield } from 'lucide-react';

interface SurvivorDisplayProps {
  survivors: Survivor[];
}

const SurvivorDisplay: React.FC<SurvivorDisplayProps> = ({ survivors }) => {
  return (
    <div className="mt-4 space-y-2">
      {survivors.map((survivor) => (
        <div
          key={survivor.id}
          className="p-3 border border-olive/30 rounded bg-stone/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{survivor.name}</span>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rust" />
                <span className="text-sm">{survivor.health}</span>
              </div>
            </div>
            {survivor.companion && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-olive" />
                <span className="text-sm">{survivor.companion.name}</span>
              </div>
            )}
          </div>
          {survivor.statuses.length > 0 && (
            <div className="mt-1 text-sm text-olive/70">
              {survivor.statuses.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SurvivorDisplay; 