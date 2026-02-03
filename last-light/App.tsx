
import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { GameState, KeyConfig } from './types';
import { DEFAULT_KEY_CONFIG } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  
  // Load keys from storage or use defaults
  const [keyBindings, setKeyBindings] = useState<KeyConfig>(() => {
    const saved = localStorage.getItem('last_light_keys');
    return saved ? JSON.parse(saved) : DEFAULT_KEY_CONFIG;
  });

  // Save keys whenever they change
  useEffect(() => {
    localStorage.setItem('last_light_keys', JSON.stringify(keyBindings));
  }, [keyBindings]);

  // High-level stats passed from the canvas loop to the UI
  const [stats, setStats] = useState({
    battery: 100,
    keysFound: 0,
    totalKeys: 12,
    soundLevel: 0,
    message: '',
  });

  const handleStart = () => setGameState('PLAYING');
  const handleRestart = () => setGameState('PLAYING'); // Logic handled in canvas mount

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      {/* Visual Effects Layer */}
      {/* Reduced intensity from opacity-30 to opacity-20 (approx 70%) */}
      <div className="scanlines mix-blend-overlay opacity-20 pointer-events-none w-full h-full absolute inset-0 z-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_100%)] pointer-events-none z-40" />

      {/* Main Game Container */}
      <div className="relative w-full max-w-[1280px] aspect-video bg-black shadow-2xl border border-slate-900 overflow-hidden">
        
        {/* Game Canvas is always mounted but logic pauses based on prop */}
        <GameCanvas 
          gameState={gameState} 
          setGameState={setGameState}
          onStatsUpdate={setStats}
          keyBindings={keyBindings}
        />

        {/* UI Layer sits on top of Canvas */}
        <UIOverlay 
          gameState={gameState} 
          stats={stats} 
          onStart={handleStart}
          onRestart={handleRestart}
          keyBindings={keyBindings}
          setKeyBindings={setKeyBindings}
        />
      </div>
    </div>
  );
}
