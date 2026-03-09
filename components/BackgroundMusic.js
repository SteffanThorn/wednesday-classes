'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // 30% default volume
  const audioRef = useRef(null);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedPlaying = localStorage.getItem('bgMusicPlaying');
    const savedVolume = localStorage.getItem('bgMusicVolume');
    
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
    
    // Don't autoplay - wait for user interaction
    if (savedPlaying === 'true') {
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log('Autoplay prevented:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume]);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem('bgMusicPlaying', newState.toString());
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('bgMusicVolume', newVolume.toString());
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-glow-cyan/30 rounded-full px-4 py-3 shadow-lg">
      <audio
        ref={audioRef}
        src="/background-music.mp3"
        loop
        preload="metadata"
      />
      
      <button
        onClick={togglePlay}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-glow-cyan/20 hover:bg-glow-cyan/30 transition-colors"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-glow-cyan" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {isPlaying && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-glow-cyan/20 rounded-lg appearance-none cursor-pointer accent-glow-cyan"
            aria-label="Volume control"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
