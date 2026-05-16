import { Play, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
  onEnded?: () => void;
  disabled?: boolean;
}

export default function AudioPlayer({ src, onEnded, disabled = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.load();
    setIsPlaying(false);
    setAudioError(false);
  }, [src]);

  useEffect(() => {
    if (!disabled || !audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  }, [disabled]);

  const togglePlay = () => {
    if (disabled) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e: unknown) => {
            if (e instanceof DOMException && e.name === 'AbortError') {
              return;
            }
            setAudioError(true);
            setIsPlaying(false);
          });
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <audio 
        ref={audioRef} 
        src={src} 
        preload="auto"
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setAudioError(true);
        }}
      />
      
      <button 
        onClick={togglePlay}
        disabled={disabled}
        className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          disabled
            ? 'border-hex-gold/30 bg-hex-gold/5 opacity-45 cursor-not-allowed'
            : isPlaying 
            ? 'border-hex-blue bg-hex-blue/20 shadow-[0_0_20px_rgba(10,200,185,0.4)]' 
            : 'border-hex-gold bg-hex-gold/10 hover:bg-hex-gold/20'
        }`}
        id="play-button"
      >
        {isPlaying ? (
          <Volume2 className="w-10 h-10 text-hex-blue animate-pulse" />
        ) : (
          <Play className="w-10 h-10 text-hex-gold fill-hex-gold" />
        )}
      </button>
      
      <span className="text-xs uppercase tracking-tighter text-hex-gold opacity-60">
        {disabled
          ? 'Chargement du prochain champion...'
          : audioError
          ? 'Réplique indisponible pour ce champion'
          : isPlaying
          ? 'Lecture en cours...'
          : 'Écouter la réplique'}
      </span>
    </div>
  );
}
