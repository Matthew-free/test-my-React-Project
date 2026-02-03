
import React, { useState, useEffect, useRef } from 'react';
import { GameState, KeyConfig } from '../types';
import { Battery, Key, Volume2, Settings, X, Keyboard, Heart, MessageCircle, Send } from 'lucide-react';
import { AudioEngine } from '../utils/AudioEngine';
import AIService from '../services/aiService';

interface UIOverlayProps {
  gameState: GameState;
  stats: {
    battery: number;
    keysFound: number;
    totalKeys: number;
    soundLevel: number;
    health: number;
    maxHealth: number;
    message: string;
  };
  onStart: () => void;
  onRestart: () => void;
  keyBindings: KeyConfig;
  setKeyBindings: (config: KeyConfig) => void;
}

const ACTION_LABELS: Record<keyof KeyConfig, string> = {
  MOVE_FORWARD: 'Move Forward',
  MOVE_BACKWARD: 'Move Backward',
  MOVE_LEFT: 'Move Left',
  MOVE_RIGHT: 'Move Right',
  RUN: 'Sprint',
  SNEAK: 'Sneak',
  INTERACT: 'Interact',
  FLASHLIGHT: 'Toggle Camera Light'
};

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  stats, 
  onStart, 
  onRestart,
  keyBindings,
  setKeyBindings
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [rebindingAction, setRebindingAction] = useState<keyof KeyConfig | null>(null);
  const [time, setTime] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', text: string}>>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (gameState === 'PLAYING') {
        interval = setInterval(() => {
            setTime(t => t + 1);
        }, 1000);
    }
    return () => {
        if(interval) clearInterval(interval);
        if(gameState !== 'PLAYING') {
            setTime(0);
            setChatMessages([]);
            setShowChat(false);
        }
    };
  }, [gameState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (showChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showChat]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAIThinking) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsAIThinking(true);

    try {
      const response = await AIService.getInstance().sendMessage(userMessage);
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: '...어둠 속에서 목소리가 사라졌다...' }]);
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimecode = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${hrs}:${mins}:${secs}`;
  };

  const handleStartWithAudio = () => {
      AudioEngine.getInstance().resume();
      onStart();
  };

  useEffect(() => {
    if (!rebindingAction) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (e.key === 'Escape') { setRebindingAction(null); return; }
      setKeyBindings({ ...keyBindings, [rebindingAction]: e.code });
      setRebindingAction(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rebindingAction, keyBindings, setKeyBindings]);

  const formatKey = (code: string) => {
    return code.replace('Key', '').replace('Left', '').replace('Right', '').replace('Control', 'Ctrl');
  };
    
  if (gameState === 'MENU') {
    if (showSettings) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-slate-100 z-[100] p-8 pointer-events-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-2xl relative">
             <button onClick={() => { setShowSettings(false); setRebindingAction(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={32} /></button>
             <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-red-500" style={{ fontFamily: 'Special Elite' }}><Keyboard size={32} /> CONTROLS</h2>
             <div className="grid grid-cols-2 gap-4">
               {(Object.keys(keyBindings) as Array<keyof KeyConfig>).map((action) => (
                 <div key={action} className="flex items-center justify-between bg-black/50 p-3 rounded border border-slate-800">
                   <span className="text-slate-300 font-mono text-sm uppercase">{ACTION_LABELS[action]}</span>
                   <button onClick={() => setRebindingAction(action)} className={`px-4 py-1 rounded font-bold min-w-[100px] text-center transition-colors border ${rebindingAction === action ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'}`}>
                     {rebindingAction === action ? 'PRESS KEY...' : formatKey(keyBindings[action])}
                   </button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      );
    }
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-slate-100 z-[100] pointer-events-auto">
        <h1 className="text-8xl font-bold tracking-widest text-red-600 mb-4 animate-pulse" style={{ fontFamily: 'Special Elite' }}>LAST LIGHT</h1>
        <p className="text-xl mb-8 max-w-md text-center text-slate-400">Find 12 keys to escape. If the ghost catches you, it will pull you back. Find bandages to survive.</p>
        <div className="flex flex-col gap-4 w-64">
             <button onClick={handleStartWithAudio} className="bg-red-900/50 border-2 border-red-600 hover:bg-red-800 text-white py-3 rounded text-xl font-bold transition-all hover:scale-105">ENTER DARKNESS</button>
             <button onClick={() => setShowSettings(true)} className="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 py-2 rounded flex items-center justify-center gap-2"><Settings size={18} /> CONTROLS</button>
        </div>
      </div>
    );
  } else if (gameState === 'GAME_OVER') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[100] pointer-events-auto animate-in fade-in duration-1000">
            <h1 className="text-9xl font-serif text-red-900 tracking-widest opacity-80" style={{ textShadow: '0 0 20px rgba(255,0,0,0.5)' }}>YOU DIED</h1>
            <button onClick={onRestart} className="mt-8 text-slate-400 hover:text-white border-b border-transparent hover:border-white transition-colors text-xl">TRY AGAIN</button>
        </div>
      );
  } else if (gameState === 'VICTORY') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white z-[100] pointer-events-auto animate-in fade-in duration-[2000ms]">
             <h1 className="text-7xl font-bold mb-4 text-red-600" style={{ fontFamily: 'Special Elite' }}>TO BE CONTINUED</h1>
             <p className="text-2xl mb-8 text-slate-400">You jumped into another house...</p>
             <button onClick={onRestart} className="bg-red-900 text-white px-8 py-3 rounded hover:scale-105 transition-transform font-bold">REPLAY</button>
        </div>
      );
  }

  return (
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
         <div className="flex justify-between items-start">
             <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-3 text-red-500 text-2xl drop-shadow-md">
                    <Battery size={32} />
                    <span className="font-mono font-bold">{Math.ceil(stats.battery)}%</span>
                 </div>
                 <div className="flex items-center gap-3 text-yellow-500 text-2xl drop-shadow-md">
                    <Key size={32} />
                    <span className="font-mono font-bold">{stats.keysFound}/{stats.totalKeys}</span>
                 </div>
                 <div className="flex items-center gap-3 text-rose-600 text-2xl drop-shadow-md">
                    <Heart size={32} className={stats.health < 30 ? "animate-pulse" : ""} />
                    <div className="w-40 h-4 bg-slate-900 border border-slate-700 mt-1 relative">
                        <div className="h-full bg-rose-600 transition-all duration-300" style={{ width: `${(stats.health / 100) * 100}%` }} />
                        {stats.maxHealth < 100 && <div className="absolute top-0 right-0 h-full bg-black/50 border-l border-slate-600" style={{ width: `${100 - stats.maxHealth}%` }} />}
                    </div>
                 </div>
             </div>
             
             <div className="flex flex-col items-end gap-2">
                 <div className="text-slate-500 font-mono text-xl">{formatTimecode(time)}</div>
                 <div className="flex items-center gap-2">
                     <Volume2 size={20} className={stats.soundLevel > 0.5 ? "text-red-500" : "text-slate-600"} />
                     <div className="w-32 h-2 bg-slate-900 border border-slate-700">
                         <div className="h-full bg-slate-200 transition-all duration-100" style={{ width: `${Math.min(100, stats.soundLevel * 100)}%` }} />
                     </div>
                 </div>
                 <button 
                   onClick={() => setShowChat(!showChat)} 
                   className="pointer-events-auto mt-2 p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
                   title="AI와 대화하기"
                 >
                   <MessageCircle size={24} className={showChat ? "text-blue-400" : "text-slate-400"} />
                 </button>
             </div>
         </div>

         {/* AI Chat Panel */}
         {showChat && (
           <div className="absolute right-6 top-24 w-96 h-[500px] bg-black/95 border border-slate-700 rounded-lg flex flex-col pointer-events-auto shadow-2xl">
             <div className="flex items-center justify-between p-4 border-b border-slate-700">
               <h3 className="text-red-500 font-bold flex items-center gap-2">
                 <MessageCircle size={20} />
                 어둠 속의 목소리
               </h3>
               <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">
                 <X size={20} />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {chatMessages.length === 0 && (
                 <div className="text-slate-500 text-sm text-center mt-8">
                   어둠 속에서 누군가가 속삭이고 있다...<br/>
                   질문을 해보세요.
                 </div>
               )}
               {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-lg ${
                     msg.role === 'user' 
                       ? 'bg-blue-900/50 border border-blue-700 text-blue-100' 
                       : 'bg-red-900/30 border border-red-900 text-red-100'
                   }`}>
                     <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                   </div>
                 </div>
               ))}
               {isAIThinking && (
                 <div className="flex justify-start">
                   <div className="bg-red-900/30 border border-red-900 text-red-100 p-3 rounded-lg">
                     <p className="text-sm animate-pulse">...</p>
                   </div>
                 </div>
               )}
               <div ref={chatEndRef} />
             </div>
             
             <div className="p-4 border-t border-slate-700">
               <div className="flex gap-2">
                 <input
                   ref={inputRef}
                   type="text"
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyPress={handleKeyPress}
                   placeholder="메시지를 입력하세요..."
                   className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                   disabled={isAIThinking}
                 />
                 <button
                   onClick={handleSendMessage}
                   disabled={!chatInput.trim() || isAIThinking}
                   className="bg-red-900 hover:bg-red-800 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2 rounded transition-colors"
                 >
                   <Send size={20} />
                 </button>
               </div>
             </div>
           </div>
         )}

         {stats.message && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <div className="text-white font-mono text-xl bg-black/50 px-4 py-2 rounded border border-slate-700 animate-pulse">
                     {stats.message}
                 </div>
             </div>
         )}

         <div className="text-slate-600 font-mono text-sm opacity-50">
             {formatKey(keyBindings.FLASHLIGHT)}: LIGHT | {formatKey(keyBindings.INTERACT)}: USE | {formatKey(keyBindings.SNEAK)}: SNEAK
         </div>
      </div>
  );
};
