import React from 'react';
import { TutorialStep } from './TutorialOverlay';

/**
 * Tutorial steps for the main game interface
 * Used by the TutorialOverlay component
 */
export const gameTutorialSteps: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Welcome to the Wasteland',
    content: (
      <div className="space-y-2">
        <p>
          Welcome to Ashes of Time. Your goal is simple: survive as many days as possible 
          in this harsh post-apocalyptic world.
        </p>
        <p className="text-olive text-sm">
          This tutorial will guide you through the basic mechanics of the game.
        </p>
      </div>
    ),
    position: 'center',
  },
  {
    id: 'resources',
    title: 'Resource Management',
    content: (
      <div className="space-y-2">
        <p>
          Keep an eye on your <span className="text-rust font-bold">Food</span> and{' '}
          <span className="text-cyan-500 font-bold">Water</span> supplies. Each survivor 
          consumes 1 of each per day.
        </p>
        <p className="text-olive text-sm">
          If either resource reaches zero, it's game over!
        </p>
      </div>
    ),
    targetElement: '.resource-display',
    position: 'right',
  },
  {
    id: 'survivors',
    title: 'Your Survivors',
    content: (
      <div className="space-y-2">
        <p>
          Monitor the <span className="text-red-500 font-bold">Health</span> and{' '}
          <span className="text-orange-500 font-bold">Status Effects</span> of your survivors.
        </p>
        <p className="text-olive text-sm">
          Status effects can provide bonuses or penalties. Some can be dangerous if left untreated.
        </p>
      </div>
    ),
    targetElement: '.survivor-display',
    position: 'right',
  },
  {
    id: 'events',
    title: 'Daily Events',
    content: (
      <div className="space-y-2">
        <p>
          Each day brings a new <span className="font-bold">Event</span>. Read the situation 
          carefully before making your choice.
        </p>
        <p className="text-olive text-sm">
          Your decisions have consequences and will affect your resources and survivors.
        </p>
      </div>
    ),
    targetElement: '.event-display',
    position: 'left',
  },
  {
    id: 'choices',
    title: 'Making Choices',
    content: (
      <div className="space-y-2">
        <p>
          Choose from available options. Each choice has different costs and outcomes.
        </p>
        <p className="text-olive text-sm">
          Look for resource costs shown as icons. Some choices may also have hidden effects!
        </p>
      </div>
    ),
    targetElement: '.choice-list',
    position: 'top',
  },
  {
    id: 'actions',
    title: 'Daily Actions',
    content: (
      <div className="space-y-2">
        <p>
          You can perform one <span className="text-rust font-bold">Hunting</span> or one{' '}
          <span className="text-cyan-500 font-bold">Gathering</span> action per day.
        </p>
        <p className="text-olive text-sm">
          These actions cost health but provide resources. Choose the right survivor for the job!
        </p>
      </div>
    ),
    targetElement: '.player-actions',
    position: 'top',
  },
  {
    id: 'companions',
    title: 'Companions',
    content: (
      <div className="space-y-2">
        <p>
          Survivors may find <span className="font-bold">Companions</span> during events. These provide 
          special bonuses such as increased hunting yield or healing.
        </p>
        <p className="text-olive text-sm">
          Companions create a bond with their survivor, but also increase their resource consumption!
        </p>
      </div>
    ),
    position: 'center',
  },
  {
    id: 'final',
    title: 'Good Luck, Survivor',
    content: (
      <div className="space-y-2">
        <p>
          You now know the basics of survival in the wasteland. Make wise choices, 
          manage your resources carefully, and protect your survivors.
        </p>
        <p className="text-rust font-semibold">
          Remember: Every decision matters in Ashes of Time.
        </p>
      </div>
    ),
    position: 'center',
  },
]; 