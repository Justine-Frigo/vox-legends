import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Settings } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (username: string) => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [username, setUsername] = useState(localStorage.getItem('lol-username') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('lol-username', username.trim());
      onStart(username.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hex-card text-center gap-8 flex flex-col"
      >
        <div className="space-y-2">
          <h1 className="text-4xl text-hex-gold tracking-widest uppercase">Vox Legends</h1>
          <p className="text-hex-gold-light/60 italic">Maîtrisez les voix de la Faille</p>
        </div>

        <div className="flex justify-center">
            <div className="w-20 h-20 border-2 border-hex-gold rotate-45 flex items-center justify-center p-2">
                <Gamepad2 className="w-10 h-10 text-hex-gold -rotate-45" />
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-xs uppercase tracking-widest text-hex-gold/60 ml-1">Nom d'Invocateur</label>
            <input 
              type="text" 
              className="hex-input w-full"
              placeholder="Ex: Faker"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="hex-button w-full py-4 text-lg">
            Que la partie commence
          </button>
        </form>
      </motion.div>
    </div>
  );
}
