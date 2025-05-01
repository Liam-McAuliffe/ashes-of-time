import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface EventDisplayProps {
  text: string;
  isLoading: boolean;
  error: string | null;
  lastOutcome: string;
}

const EventDisplay: React.FC<EventDisplayProps> = ({
  text,
  isLoading,
  error,
  lastOutcome,
}) => {
  return (
    <div className="space-y-4 bg-stone/10 border border-olive/30 p-4 rounded-lg">
      {lastOutcome && (
        <div className="pb-3 border-b border-olive/20">
          <p className="text-xs uppercase text-olive font-semibold mb-1">Previously:</p>
          <p className="text-sm text-olive/90 italic">{lastOutcome}</p>
        </div>
      )}
      <div className="min-h-[80px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-olive">
            <Loader2 className="animate-spin mr-2" size={18} />
            <span>Sleeping through the night...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-600">
            <AlertTriangle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <p className="text-charcoal text-base leading-relaxed font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventDisplay; 