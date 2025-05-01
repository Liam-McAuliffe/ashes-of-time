import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Prologue from '../Prologue';

describe('Prologue Component', () => {
  test('renders the title and instructions', () => {
    const mockSetIsStarted = jest.fn();
    render(<Prologue setIsStarted={mockSetIsStarted} />);
    
    // Check for title
    expect(screen.getByText('Ashes of Time')).toBeInTheDocument();
    
    // Check for instruction sections
    expect(screen.getByText('How to Survive')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to the apocalypse/i)).toBeInTheDocument();
    expect(screen.getByText(/Keep an eye on your/i)).toBeInTheDocument();
    expect(screen.getByText(/Monitor your party's/i)).toBeInTheDocument();
    
    // Check for start button
    const startButton = screen.getByText('Begin Survival');
    expect(startButton).toBeInTheDocument();
  });

  test('clicking the button calls setIsStarted', () => {
    const mockSetIsStarted = jest.fn();
    render(<Prologue setIsStarted={mockSetIsStarted} />);
    
    const startButton = screen.getByText('Begin Survival');
    fireEvent.click(startButton);
    
    expect(mockSetIsStarted).toHaveBeenCalledWith(true);
    expect(mockSetIsStarted).toHaveBeenCalledTimes(1);
  });
}); 