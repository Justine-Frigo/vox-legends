import React, { useState, useEffect, useCallback } from 'react';
import { CHAMPIONS, Champion } from '../data/champions';
import AudioPlayer from './AudioPlayer';
import Autocomplete from './Autocomplete';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, CheckCircle2, XCircle, Info } from 'lucide-react';

interface GameScreenProps {
  onScoreUpdate: (score: number) => void;
  mode: 'pick' | 'ban';
}

export default function GameScreen({ onScoreUpdate, mode }: GameScreenProps) {
  const [currentChampion, setCurrentChampion] = useState<Champion | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'neutral' } | null>(null);
  const [streak, setStreak] = useState(0);
  const [isNextLoading, setIsNextLoading] = useState(false);

  const selectRandomChampion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * CHAMPIONS.length);
    setCurrentChampion(CHAMPIONS[randomIndex]);
    setAttempts(0);
    setMessage(null);
    setIsNextLoading(false);
  }, []);

  useEffect(() => {
    selectRandomChampion();
  }, [selectRandomChampion, mode]); // Reset when mode changes

  const handleGuess = (guess: string) => {
    if (!currentChampion || message?.type === 'success' || isNextLoading) return;

    if (guess.toLowerCase() === currentChampion.name.toLowerCase()) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      onScoreUpdate(newStreak);
      setMessage({ text: "Bien joué ! C'est effectivement " + currentChampion.name, type: 'success' });
      
      setIsNextLoading(true);
      setTimeout(() => {
        selectRandomChampion();
      }, 2000);
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      
      if (nextAttempts >= 3) {
        setMessage({ text: `Perdu ! C'était ${currentChampion.name}. Prochain champion...`, type: 'error' });
        setStreak(0);
        onScoreUpdate(0); // Reset streak in parent if needed, but currentStreak is session-based
        setIsNextLoading(true);
        setTimeout(() => {
          selectRandomChampion();
        }, 2500);
      } else {
        setMessage({ text: `Mauvaise réponse ! Réessaie (${3 - nextAttempts} restants)`, type: 'error' });
      }
    }
  };

  const handleSkip = () => {
    if (isNextLoading) return;

    setMessage({ text: `Dommage, c'était ${currentChampion?.name}`, type: 'neutral' });
    setStreak(0);
    onScoreUpdate(0);
    setIsNextLoading(true);
    setTimeout(() => {
      selectRandomChampion();
    }, 1500);
  };

  if (!currentChampion) return null;

  const voType = mode === 'pick' ? 'champion-choose-vo' : 'champion-ban-vo';
  const transitionMessage = isNextLoading ? message : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <motion.div 
        key={`${currentChampion.name}-${mode}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="hex-card relative flex flex-col items-center gap-10 py-12"
      >
        <AnimatePresence>
          {isNextLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-hex-dark/75 backdrop-blur-[2px]"
            >
              <div className="relative h-24 w-24">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-hex-gold/60"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-4 rotate-45 border border-hex-blue/70"
                  animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-8 rotate-45 border border-hex-gold"
                  animate={{ rotate: [45, 225] }}
                  transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                />
              </div>

              <div className="text-center">
                {transitionMessage && (
                  <div
                    className={`mb-4 flex items-center gap-3 border px-4 py-3 ${
                      transitionMessage.type === 'success'
                        ? 'border-hex-blue/60 bg-hex-blue/15 text-hex-blue'
                        : transitionMessage.type === 'error'
                        ? 'border-red-500/70 bg-red-500/15 text-red-300'
                        : 'border-hex-gold/70 bg-hex-gold/15 text-hex-gold-light'
                    }`}
                  >
                    {transitionMessage.type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                    {transitionMessage.type === 'error' && <XCircle className="h-5 w-5 shrink-0" />}
                    {transitionMessage.type === 'neutral' && <Info className="h-5 w-5 shrink-0" />}
                    <p className="text-sm font-medium">{transitionMessage.text}</p>
                  </div>
                )}

                <p className="text-xs uppercase tracking-[0.35em] text-hex-gold/80 font-display">Transition</p>
                <p className="mt-1 text-sm text-hex-gold-light">Invocation du prochain champion...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AudioPlayer 
          disabled={isNextLoading}
          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/fr_fr/v1/${voType}/${currentChampion.id}.ogg`} 
        />

        <div className="w-full max-w-sm space-y-4">
          <Autocomplete onSelect={handleGuess} disabled={isNextLoading} />
          
          <div className="flex gap-2">
            <button 
              onClick={handleSkip}
              disabled={isNextLoading}
              className="hex-button flex-1 flex items-center justify-center gap-2 py-3 border-hex-gold/30 opacity-60 hover:opacity-100"
            >
              <SkipForward className="w-4 h-4" /> Passer
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {message && !isNextLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-3 px-6 py-3 border ${
                message.type === 'success' ? 'bg-hex-blue/10 border-hex-blue text-hex-blue' : 
                message.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 
                'bg-hex-gold/10 border-hex-gold text-hex-gold'
              }`}
            >
              {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {message.type === 'error' && <XCircle className="w-5 h-5" />}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex justify-center gap-4">
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            className={`w-3 h-3 rotate-45 border transition-all duration-500 ${
              attempts >= step ? 'bg-red-500/50 border-red-500' : 'border-hex-gold/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
