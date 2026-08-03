import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const soundCues = {
  click: [{ frequency: 920, duration: 0.045, gain: 0.03, type: 'square' }],
  select: [{ frequency: 680, duration: 0.05, gain: 0.03, type: 'triangle' }],
  move: [
    { frequency: 340, duration: 0.05, gain: 0.025, type: 'triangle' },
    { frequency: 520, duration: 0.055, delay: 0.035, gain: 0.02, type: 'triangle' },
  ],
  jump: [
    { frequency: 420, duration: 0.055, gain: 0.03, type: 'sine' },
    { frequency: 760, duration: 0.065, delay: 0.04, gain: 0.028, type: 'sine' },
  ],
  hit: [
    { frequency: 180, duration: 0.09, gain: 0.06, type: 'sawtooth' },
    { frequency: 110, duration: 0.08, delay: 0.03, gain: 0.05, type: 'square' },
  ],
  score: [
    { frequency: 523.25, duration: 0.09, gain: 0.04, type: 'triangle' },
    { frequency: 659.25, duration: 0.09, delay: 0.08, gain: 0.045, type: 'triangle' },
    { frequency: 783.99, duration: 0.14, delay: 0.16, gain: 0.055, type: 'triangle' },
  ],
  claim: [
    { frequency: 523.25, duration: 0.06, gain: 0.035, type: 'sine' },
    { frequency: 783.99, duration: 0.08, delay: 0.05, gain: 0.045, type: 'triangle' },
    { frequency: 987.77, duration: 0.08, delay: 0.11, gain: 0.03, type: 'sine' },
  ],
  support: [
    { frequency: 392, duration: 0.08, gain: 0.035, type: 'triangle' },
    { frequency: 523.25, duration: 0.1, delay: 0.07, gain: 0.04, type: 'triangle' },
  ],
  matchStart: [
    { frequency: 392, duration: 0.09, gain: 0.03, type: 'triangle' },
    { frequency: 523.25, duration: 0.09, delay: 0.08, gain: 0.035, type: 'triangle' },
    { frequency: 659.25, duration: 0.12, delay: 0.16, gain: 0.04, type: 'triangle' },
  ],
  matchEnd: [
    { frequency: 392, duration: 0.11, gain: 0.045, type: 'square' },
    { frequency: 277.18, duration: 0.12, delay: 0.08, gain: 0.035, type: 'square' },
  ],
  confirm: [
    { frequency: 659.25, duration: 0.07, gain: 0.035, type: 'triangle' },
    { frequency: 830.61, duration: 0.1, delay: 0.06, gain: 0.04, type: 'triangle' },
  ],
  cancel: [{ frequency: 220, duration: 0.09, gain: 0.04, type: 'sawtooth' }],
  exit: [
    { frequency: 330, duration: 0.08, gain: 0.035, type: 'triangle' },
    { frequency: 196, duration: 0.14, delay: 0.08, gain: 0.045, type: 'square' },
  ],
};

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(() => localStorage.getItem('appSoundMuted') === 'true');
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const masterGain = audioContext.createGain();
    masterGain.gain.value = muted ? 0 : 0.85;
    masterGain.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    masterGainRef.current = masterGain;

    return () => {
      audioContext.close().catch(() => {});
      audioContextRef.current = null;
      masterGainRef.current = null;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('appSoundMuted', muted.toString());
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = muted ? 0 : 0.85;
    }
  }, [muted]);

  const toggleMute = () => setMuted((prev) => !prev);

  const ensureAudioContext = async () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return null;
    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch {
        return null;
      }
    }
    return audioContext;
  };

  const scheduleTone = (audioContext, cue, startOffset = 0) => {
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();

    oscillator.type = cue.type || 'sine';
    oscillator.frequency.setValueAtTime(cue.frequency, audioContext.currentTime + startOffset);

    const startTime = audioContext.currentTime + startOffset;
    const attack = cue.attack ?? 0.01;
    const release = cue.release ?? 0.06;
    const volume = cue.gain ?? 0.03;
    const sustain = cue.duration ?? 0.08;

    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.linearRampToValueAtTime(volume, startTime + attack);
    envelope.gain.linearRampToValueAtTime(0.0001, startTime + attack + sustain + release);

    oscillator.connect(envelope);
    envelope.connect(masterGainRef.current || audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + attack + sustain + release + 0.02);
  };

  const playSound = async (type, options = {}) => {
    if (muted) return;
    const audioContext = await ensureAudioContext();
    if (!audioContext) return;

    const cue = soundCues[type];
    if (!cue) return;

    cue.forEach((note) => {
      scheduleTone(audioContext, {
        ...note,
        frequency: options.frequency || note.frequency,
        gain: options.volume || note.gain,
      }, note.delay || 0);
    });
  };

  const value = useMemo(() => ({ muted, toggleMute, playSound }), [muted]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
}
