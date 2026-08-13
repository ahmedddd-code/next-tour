import { useCallback, useEffect, useRef, useState } from 'react';

export function ScreamerPage() {
  const audioRef = useRef<AudioContext | null>(null);
  const [soundBlocked, setSoundBlocked] = useState(false);

  const scream = useCallback(async () => {
    if (audioRef.current) return;
    const AudioEngine = window.AudioContext ?? window.webkitAudioContext;
    const context = new AudioEngine();
    audioRef.current = context;
    try {
      await context.resume();
      const now = context.currentTime;
      const master = context.createGain();
      const distortion = context.createWaveShaper();
      distortion.curve = new Float32Array(2048).map((_, index) => {
        const x = index * 2 / 2047 - 1;
        return (Math.PI + 120) * x / (Math.PI + 120 * Math.abs(x));
      });
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.75, now + 0.025);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 3.1);
      distortion.connect(master).connect(context.destination);

      [86, 117, 173, 246].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index % 2 ? 'sawtooth' : 'square';
        oscillator.frequency.setValueAtTime(frequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * (2.8 + index * .25), now + 1.4);
        gain.gain.setValueAtTime(.16, now);
        gain.gain.exponentialRampToValueAtTime(.001, now + 2.8);
        oscillator.connect(gain).connect(distortion);
        oscillator.start(now + index * .012);
        oscillator.stop(now + 3);
      });

      const noiseLength = Math.floor(context.sampleRate * 3);
      const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate);
      const samples = noiseBuffer.getChannelData(0);
      for (let index = 0; index < samples.length; index++) samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
      const noise = context.createBufferSource();
      const filter = context.createBiquadFilter();
      noise.buffer = noiseBuffer;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(2800, now + 1.2);
      filter.Q.value = 1.4;
      noise.connect(filter).connect(distortion);
      noise.start(now);
      setSoundBlocked(false);
    } catch {
      audioRef.current = null;
      setSoundBlocked(true);
    }
  }, []);

  useEffect(() => {
    document.title = 'НЕ ОГЛЯДЫВАЙСЯ';
    void scream();
    const retry = () => void scream();
    window.addEventListener('pointerdown', retry, { once: true });
    return () => { window.removeEventListener('pointerdown', retry); void audioRef.current?.close(); };
  }, [scream]);

  return <main onClick={() => void scream()} className="screamer-screen" aria-label="Скример с изображением Криштиану Роналду">
    <img src="/images/ronaldo-4k.jpg" alt="Криштиану Роналду" className="screamer-face"/>
    <div className="screamer-flash"/>
    <p className="screamer-message">НЕ ОГЛЯДЫВАЙСЯ</p>
    {soundBlocked && <button className="screamer-sound" onClick={() => void scream()}>НАЖМИ, ЧТОБЫ ВКЛЮЧИТЬ ЗВУК</button>}
  </main>;
}

declare global {
  interface Window { webkitAudioContext: typeof AudioContext }
}
