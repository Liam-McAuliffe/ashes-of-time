interface GameOverScreenProps {
  message: string;
  day: number;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ message, day }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-charcoal text-olive p-4">
      <h1 className="text-4xl font-bold mb-4">Game Over</h1>
      <p className="text-xl mb-2">You survived {day} days</p>
      <p className="text-lg text-center">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-2 bg-rust text-stone rounded hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
};

export default GameOverScreen; 