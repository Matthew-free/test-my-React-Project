
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './core/Engine';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [nickname] = useState('GUEST_' + Math.floor(Math.random() * 9999));
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(0);
  const [isDriving, setIsDriving] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const engine = new GameEngine(containerRef.current, nickname, '#FFB800');
    engineRef.current = engine;
    engine.start();

    const uiInterval = setInterval(() => {
      const e = engineRef.current;
      if (!e) return;
      setHealth(e.player.health);
      setAmmo(e.weapon.ammo);
      setIsDriving(e.isDriving);
    }, 100);

    const onPointerLockChange = () => {
      const crosshair = document.getElementById('crosshair');
      if (document.pointerLockElement === document.body) {
        if (crosshair) crosshair.style.display = 'block';
      } else {
        if (crosshair) crosshair.style.display = 'none';
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      clearInterval(uiInterval);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
  }, []);

  const handlePlay = () => {
    if (!engineRef.current) return;
    
    // 1. 브라우저 정책을 위해 즉시 포인터 잠금 요청
    document.body.requestPointerLock();
    
    // 2. 엔진 상태 활성화
    engineRef.current.enterGame();
    setGameStarted(true);
  };

  const handleScreenClick = () => {
    if (gameStarted && document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
    }
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden text-white bg-black"
      onClick={handleScreenClick}
    >
      <div ref={containerRef} className="w-full h-full" />
      
      {!gameStarted ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <h1 className="game-font text-9xl text-outline italic mb-8 uppercase tracking-tighter">
            VECK<span className="text-red-500">.CITY</span>
          </h1>
          <div className="flex flex-col items-center gap-4">
            <p className="text-xl font-bold opacity-70 mb-4 uppercase tracking-widest">Urban Combat Simulator</p>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePlay(); }} 
              className="px-16 py-8 bg-red-600 hover:bg-red-500 text-5xl font-black italic rounded-2xl btn-3d shadow-[0_10px_0_rgb(153,27,27)] border-4 border-white/20 transition-all"
            >
              DEPLOY NOW
            </button>
            <p className="mt-8 text-sm opacity-50 uppercase font-black tracking-widest animate-pulse">Click to spawn & fight</p>
          </div>
        </div>
      ) : (
        <>
          <div className="fixed top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
            <div className={`px-8 py-3 rounded-full border-2 transition-all duration-300 ${
              isDriving ? "bg-red-600/20 border-red-600/50" : "bg-blue-600/20 border-blue-600/50"
            }`}>
              <div className="text-sm font-black italic uppercase tracking-[0.3em] drop-shadow-lg">
                {isDriving ? "VEHICLE OPERATING - [WASD] DRIVE • [E] EXIT" : "ON FOOT - [WASD] MOVE • [E] BOARD CAR"}
              </div>
            </div>
          </div>

          <div className="fixed bottom-8 left-8 bg-black/70 backdrop-blur-md p-6 rounded-2xl border-l-[12px] border-red-600 min-w-[200px] shadow-2xl z-10">
            <div className="text-xs opacity-60 uppercase font-black mb-1 tracking-widest text-red-400">Biological Integrity</div>
            <div className="text-6xl font-black italic tabular-nums">{Math.ceil(health)}%</div>
          </div>

          <div className="fixed bottom-8 right-8 bg-black/70 backdrop-blur-md p-6 rounded-2xl border-r-[12px] border-yellow-500 text-right min-w-[200px] shadow-2xl z-10">
            <div className="text-xs opacity-60 uppercase font-black mb-1 tracking-widest text-yellow-400">Weapon Capacity</div>
            <div className="text-6xl font-black italic tabular-nums">{ammo}</div>
          </div>

          {health < 40 && (
            <div className="fixed inset-0 pointer-events-none ring-[40px] ring-red-900/30 inset-shadow-sm animate-pulse z-0" />
          )}
        </>
      )}
    </div>
  );
};

export default App;
