import { Trophy, ShieldCheck, Gamepad2 } from 'lucide-react';

interface LeaderboardProps {
  highScore: number;
  currentStreak: number;
  username: string;
  mode: 'pick' | 'ban';
}

export default function Leaderboard({ highScore, currentStreak, username, mode }: LeaderboardProps) {
  return (
    <div className="hex-card flex flex-col gap-6 min-w-[250px]">
      <div className="flex items-center justify-between gap-4 border-b border-hex-gold/20 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Trophy className="text-hex-gold w-6 h-6 shrink-0" />
          <h2 className="text-xl truncate">Profil Hextech</h2>
        </div>
        <span className={`text-[10px] uppercase font-display px-2.5 py-1 rounded-sm shrink-0 whitespace-nowrap ${
          mode === 'pick' ? 'bg-hex-gold/10 text-hex-gold border border-hex-gold/30' : 'bg-hex-blue/10 text-hex-blue border border-hex-blue/30'
        }`}>
          {mode} mode
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-black/20 p-3 border-l-2 border-hex-blue">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-hex-blue" />
            <span className="text-sm uppercase opacity-70 whitespace-nowrap">Invocateur&nbsp;:</span>
          </div>
          <span className="font-bold text-hex-blue truncate ml-2">{username}</span>
        </div>

        <div className="flex justify-between items-center bg-black/20 p-3 border-l-2 border-hex-gold">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-hex-gold" />
            <span className="text-sm uppercase opacity-70">Score</span>
          </div>
          <span className="font-bold text-hex-gold">{highScore}</span>
        </div>

        <div className="flex justify-between items-center bg-black/20 p-3 border-l-2 border-hex-gold-light">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-hex-gold-light" />
            <span className="text-sm uppercase opacity-70">Série</span>
          </div>
          <span className="font-bold text-hex-gold-light">{currentStreak}</span>
        </div>
      </div>

      <div className="mt-4 opacity-40 text-[10px] uppercase text-center font-mono">
        Données sauvegardées localement
      </div>
    </div>
  );
}
