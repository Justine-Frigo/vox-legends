/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import Leaderboard from './components/Leaderboard';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

type GameMode = 'pick' | 'ban';

const getUserStorageKey = (username: string, kind: 'score' | 'streak', mode: GameMode) => {
  const normalizedUsername = encodeURIComponent(username.trim().toLowerCase());
  return `lol-${kind}-${normalizedUsername}-${mode}`;
};

const readUserProgress = (username: string) => {
  const readValue = (kind: 'score' | 'streak', mode: GameMode) => {
    const value = localStorage.getItem(getUserStorageKey(username, kind, mode));
    return value ? Number.parseInt(value, 10) : 0;
  };

  return {
    scores: {
      pick: readValue('score', 'pick'),
      ban: readValue('score', 'ban'),
    },
    streaks: {
      pick: readValue('streak', 'pick'),
      ban: readValue('streak', 'ban'),
    },
  };
};

export default function App() {
  const [user, setUser] = useState<{ 
    username: string; 
    scores: { pick: number; ban: number }; 
  } | null>(null);
  
  const [streaks, setStreaks] = useState({ pick: 0, ban: 0 });
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    const savedMode = localStorage.getItem('lol-game-mode');
    return savedMode === 'ban' ? 'ban' : 'pick';
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('lol-username');
    if (!savedUser) return;

    const progress = readUserProgress(savedUser);
    
    setStreaks(progress.streaks);
    setUser({
      username: savedUser,
      scores: progress.scores,
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('lol-game-mode', gameMode);
  }, [gameMode]);

  const handleStart = (username: string) => {
    const normalizedUsername = username.trim();
    const progress = readUserProgress(normalizedUsername);
    localStorage.setItem('lol-username', normalizedUsername);
    
    setStreaks(progress.streaks);
    setUser({
      username: normalizedUsername,
      scores: progress.scores,
    });
  };

  const handleScoreUpdate = (streak: number) => {
    if (!user) return;

    setStreaks(prev => ({ ...prev, [gameMode]: streak }));
    localStorage.setItem(getUserStorageKey(user.username, 'streak', gameMode), streak.toString());
    
    if (streak > 0) {
      setUser(prev => {
        if (!prev) return null;
        const newScores = {
          ...prev.scores,
          [gameMode]: prev.scores[gameMode] + 1
        };
        localStorage.setItem(getUserStorageKey(prev.username, 'score', gameMode), newScores[gameMode].toString());
        return { ...prev, scores: newScores };
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lol-username');
    setUser(null);
    setStreaks({ pick: 0, ban: 0 });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 left-0 w-64 h-64 border-l-2 border-t-2 border-hex-gold/10 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 border-r-2 border-b-2 border-hex-blue/10 translate-x-1/2 translate-y-1/2 rounded-full pointer-events-none" />

      <header className="px-8 py-6 flex justify-between items-center z-10 border-b border-hex-gold/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-hex-gold rotate-45 flex items-center justify-center">
            <span className="font-display font-bold text-hex-gold -rotate-45">V</span>
          </div>
          <h1 className="text-2xl font-display tracking-[0.2em] text-hex-gold hidden sm:block">VOX <span className="text-hex-gold-light">LEGENDS</span></h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center bg-black/40 border border-hex-gold/20 p-1 rounded-sm">
            <button
              onClick={() => setGameMode('pick')}
              className={`px-3 py-1 text-[10px] uppercase tracking-tighter transition-all font-display ${
                gameMode === 'pick' 
                  ? 'bg-hex-gold text-hex-dark' 
                  : 'text-hex-gold/40 hover:text-hex-gold/70'
              }`}
            >
              Pick
            </button>
            <button
              onClick={() => setGameMode('ban')}
              className={`px-3 py-1 text-[10px] uppercase tracking-tighter transition-all font-display ${
                gameMode === 'ban' 
                  ? 'bg-hex-gold text-hex-dark' 
                  : 'text-hex-gold/40 hover:text-hex-gold/70'
              }`}
            >
              Ban
            </button>
          </div>

          {user && (
            <button 
              onClick={handleLogout}
              className="text-hex-gold/40 hover:text-red-400 transition-colors"
              title="Quitter"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-8 p-6 md:p-10 relative z-10">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WelcomeScreen onStart={handleStart} />
              </motion.div>
            ) : (
              <motion.div 
                key={`${gameMode}-game`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GameScreen 
                  onScoreUpdate={handleScoreUpdate} 
                  mode={gameMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {user && (
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:w-auto"
          >
            <Leaderboard 
              username={user.username} 
              highScore={user.scores[gameMode]} 
              currentStreak={streaks[gameMode]} 
              mode={gameMode}
            />
          </motion.aside>
        )}
      </main>

      <footer className="py-6 text-center text-[10px] uppercase tracking-[0.3em] opacity-30 flex flex-col gap-2">
        <div>League of Legends &bull; Vox Legends &bull; {new Date().getFullYear()}</div>
        <div className="text-[8px] tracking-[0.5em] opacity-70">Créé par Pierre "Golluméo" Mauriello & Justine Frigo</div>
      </footer>
    </div>
  );
}
