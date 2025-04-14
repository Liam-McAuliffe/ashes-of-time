import React from 'react';
import { Droplet, HeartPulse, Users, Target } from 'lucide-react';

const Prologue = ({ setIsStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-2xl p-4 md:p-8 text-stone font-mono space-y-6 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-rust mb-4">
        Ashes of Time
      </h1>

      <div className="space-y-4 text-base md:text-lg leading-relaxed text-stone/90 text-left bg-charcoal/30 p-6 rounded-lg border border-olive">
        <h2 className="text-2xl font-semibold text-rust mb-3 text-center">
          How to Survive
        </h2>
        <p className="flex items-start gap-2">
          <Users size={20} className="text-olive flex-shrink-0 mt-1" />
          <span>
            Welcome to the apocalypse. Your goal is simple:{' '}
            <strong>survive</strong> as many days as possible. You'll need to
            manage your dwindling resources and make tough decisions.
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Droplet size={20} className="text-cyan-500 flex-shrink-0 mt-1" />
          <span>
            Keep an eye on your <strong>Food</strong> and <strong>Water</strong>{' '}
            levels. Each survivor consumes 1 Food and 1 Water per day. Running
            out of either means game over!
          </span>
        </p>
        <p className="flex items-start gap-2">
          <HeartPulse size={20} className="text-red-500 flex-shrink-0 mt-1" />
          <span>
            Monitor your party's <strong>Health</strong> and{' '}
            <strong>Statuses</strong> (like sick or injured). Low health or
            negative statuses can be dangerous. If your health reaches zero,
            it's game over.
          </span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-2xl text-olive flex-shrink-0 mt-0 leading-none">
            ?
          </span>
          <span>
            Each day presents a new <strong>Situation</strong>. Read the event
            text carefully and choose one of the available{' '}
            <strong>Actions</strong>. Your choices will affect your resources,
            survivor health, and potentially lead to new encounters or dangers.
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Target size={20} className="text-emerald-500 flex-shrink-0 mt-1" />
          <span>
            Need food? You can choose to <strong>Go Hunting</strong>. Select a
            survivor to send out, but be prepared for the risks! Success depends
            on a quick reaction in a mini-game. Companions might help improve
            your haul.
          </span>
        </p>
        <p className="text-center italic text-olive mt-4">
          Every decision matters. Good luck.
        </p>
      </div>

      <button
        onClick={() => setIsStarted(true)}
        className="mt-8 px-10 py-3 bg-rust text-stone text-lg font-semibold rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-rust/50 focus:ring-offset-2 focus:ring-offset-charcoal transition-opacity duration-150 ease-in-out shadow-lg hover:shadow-md"
      >
        Begin Survival
      </button>
    </div>
  );
};

export default Prologue;
