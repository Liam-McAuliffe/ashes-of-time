import React from 'react';
import { Droplet, HeartPulse, Users, Target, BookOpen } from 'lucide-react';
import Image from 'next/image';

interface PrologueProps {
  onStartGame: () => void;
}

const Prologue: React.FC<PrologueProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-charcoal p-4 md:p-8 text-stone font-mono space-y-8 animate-fade-in">
      <div className="flex items-center justify-center gap-4 mb-4">
        <Image 
          src="/ashes-logo.webp" 
          alt="Ashes of Time" 
          width={100}
          height={100} 
          className="drop-shadow-lg"
        />
        <h1 className="text-5xl md:text-6xl font-bold text-rust tracking-wider">
          Ashes of Time
        </h1>
      </div>

      <div className="w-full max-w-2xl space-y-4 text-base md:text-lg leading-relaxed text-stone/90 text-left bg-black/20 p-6 rounded-lg border border-olive/50 shadow-lg">
        <h2 className="text-2xl font-semibold text-rust mb-4 text-center">
          How to Survive
        </h2>
        <p className="flex items-start gap-3">
          <Users size={20} className="text-olive flex-shrink-0 mt-1" />
          <span>
            Welcome to the apocalypse. Your goal is simple:{' '}
            <strong className="text-stone">survive</strong> as many days as possible. Manage resources, make tough decisions.
          </span>
        </p>
        <p className="flex items-start gap-3">
          <Droplet size={20} className="text-cyan-400 flex-shrink-0 mt-1" />
          <span>
            Watch your <strong className="text-stone">Food</strong> and <strong className="text-stone">Water</strong>. Each survivor uses 1 of each daily. Running out means game over!
          </span>
        </p>
        <p className="flex items-start gap-3">
          <HeartPulse size={20} className="text-red-500 flex-shrink-0 mt-1" />
          <span>
            Monitor <strong className="text-stone">Health</strong> & <strong className="text-stone">Statuses</strong> (sick, injured). Low health or bad statuses are dangerous.
          </span>
        </p>
        <p className="flex items-start gap-3">
          <span className="text-2xl text-olive flex-shrink-0 mt-0 leading-none w-[20px] text-center">
            ?
          </span>
          <span>
            Each day brings a new <strong className="text-stone">Situation</strong>. Read carefully, choose your <strong className="text-stone">Action</strong>. Choices have consequences.
          </span>
        </p>
        <p className="flex items-start gap-3">
          <Target size={20} className="text-emerald-400 flex-shrink-0 mt-1" />
          <span>
            Need food? <strong className="text-stone">Go Hunting</strong> (mini-game). Select a survivor, but beware the risks! Companions might help.
          </span>
        </p>
        <p className="text-center italic text-olive/80 mt-5">
          Every decision matters. Good luck.
        </p>
      </div>

      <button
        onClick={onStartGame}
        className="mt-6 px-12 py-3 bg-rust text-charcoal text-xl font-bold rounded-md hover:bg-rust/90 focus:outline-none focus:ring-2 focus:ring-rust/50 focus:ring-offset-2 focus:ring-offset-charcoal transition-all duration-150 ease-in-out shadow-xl hover:shadow-lg transform hover:scale-105"
      >
        Begin Survival
      </button>
    </div>
  );
};

export default Prologue; 