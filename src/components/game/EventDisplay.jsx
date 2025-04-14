import React from 'react';

function EventDisplay({ lastOutcome, eventText, isLoading, currentChoices }) {
  const showInitialLoading =
    isLoading &&
    !lastOutcome &&
    !currentChoices &&
    !eventText.startsWith('Radio silence');

  return (
    <div className="border border-olive p-4 rounded min-h-[150px] bg-stone shadow-md text-charcoal w-full">
      {lastOutcome && (
        <div className="mb-3 pb-3 border-b border-olive italic text-olive text-sm">
          <p>{lastOutcome}</p>
        </div>
      )}
      <h2 className="font-semibold mb-2 text-lg">Situation:</h2>
      {showInitialLoading ? (
        <p className="text-olive animate-pulse">Determining situation...</p>
      ) : (
        <p className="whitespace-pre-wrap text-base">{eventText}</p>
      )}
    </div>
  );
}

export default EventDisplay;
