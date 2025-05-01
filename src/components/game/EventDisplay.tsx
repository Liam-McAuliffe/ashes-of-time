import React from 'react';

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
    <div className="mt-6 space-y-4">
      {lastOutcome && (
        <div className="p-4 border border-olive/30 rounded bg-stone/50">
          <p className="text-sm text-olive/70 italic">{lastOutcome}</p>
        </div>
      )}
      <div className="p-4 border border-olive/30 rounded bg-stone/50">
        {isLoading ? (
          <p className="text-olive animate-pulse">Loading...</p>
        ) : error ? (
          <p className="text-rust">{error}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-olive">{text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDisplay; 