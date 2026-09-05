import React, { createContext, useContext, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

interface SoundContextType {
  playOrderChime: () => void;
  playCancelChime: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const playTone = (freq: number, type: OscillatorType, duration: number, delay: number = 0) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      }, delay);
    } catch (e) {
      console.warn('Audio playback not permitted yet (requires user gesture):', e);
    }
  };

  const playOrderChime = () => {
    // 2-tone melodic chime: C5 (523Hz) -> G5 (784Hz)
    playTone(523.25, 'sine', 0.25, 0);
    playTone(783.99, 'triangle', 0.45, 180);
  };

  const playCancelChime = () => {
    // Warning tone
    playTone(392.0, 'sawtooth', 0.35, 0);
  };

  useEffect(() => {
    if (!user || !['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role)) return;

    const socket = getSocket();
    const handleOrderCreated = () => {
      console.log('🔔 [LIVE AUDIO] New order chime triggered!');
      playOrderChime();
    };

    socket.on('ORDER_CREATED', handleOrderCreated);
    return () => {
      socket.off('ORDER_CREATED', handleOrderCreated);
    };
  }, [user]);

  return (
    <SoundContext.Provider value={{ playOrderChime, playCancelChime }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
};
