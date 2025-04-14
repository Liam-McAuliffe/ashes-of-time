import React from 'react';

function GameOverScreen({ day, message }) {
  const survivedDays = day > 0 ? day - 1 : 0;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-gray-100 text-gray-800 font-mono">
      <div className="w-full max-w-lg items-center justify-between flex flex-col text-center p-8 bg-white rounded-lg shadow-lg border border-gray-300 space-y-6">
        <h1 className="text-5xl font-bold text-red-700">Game Over</h1>

        <p className="text-xl text-gray-700">
          You survived for {survivedDays} day{survivedDays !== 1 ? 's' : ''}.
        </p>

        <p className="text-lg p-4 border border-red-300 rounded bg-red-50 text-red-800 italic max-w-md">
          {message || 'The journey ends here.'}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-150 ease-in-out shadow hover:shadow-md"
        >
          Restart
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4">Ashes of Time</p>
    </main>
  );
}

export default GameOverScreen;
