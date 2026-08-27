"use client";

import { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";

interface AmbientAudioContextType {
  isPlaying: boolean;
  isReady: boolean;
  toggle: () => void;
  start: () => void;
}

const AmbientAudioContext = createContext<AmbientAudioContextType>({
  isPlaying: false,
  isReady: false,
  toggle: () => {},
  start: () => {},
});

export function useAmbientAudio() {
  return useContext(AmbientAudioContext);
}

function createAmbientSound(ctx: AudioContext, master: GainNode) {
  const sr = ctx.sampleRate;
  const len = 4 * sr;

  // ── River / flowing water ──────────────────────────────────
  // Layer 1: deep brown-noise river bed
  const riverBuf = ctx.createBuffer(1, len, sr);
  const river = riverBuf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    river[i] = last * 4;
  }
  const riverSrc = ctx.createBufferSource();
  riverSrc.buffer = riverBuf;
  riverSrc.loop = true;
  const riverLP = ctx.createBiquadFilter();
  riverLP.type = "lowpass";
  riverLP.frequency.value = 600;
  riverLP.Q.value = 0.7;
  const riverG = ctx.createGain();
  riverG.gain.value = 0.7;
  riverSrc.connect(riverLP).connect(riverG).connect(master);
  riverSrc.start();

  // Layer 2: mid-frequency stream / rapids
  const streamBuf = ctx.createBuffer(1, len, sr);
  const stream = streamBuf.getChannelData(0);
  let sLast = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    sLast = (sLast + 0.04 * w) / 1.04;
    stream[i] = sLast * 2.5;
  }
  const streamSrc = ctx.createBufferSource();
  streamSrc.buffer = streamBuf;
  streamSrc.loop = true;
  const streamBP = ctx.createBiquadFilter();
  streamBP.type = "bandpass";
  streamBP.frequency.value = 1800;
  streamBP.Q.value = 0.4;
  const streamG = ctx.createGain();
  streamG.gain.value = 0.25;
  streamSrc.connect(streamBP).connect(streamG).connect(master);
  streamSrc.start();

  // Layer 3: high shimmer — water surface sparkle
  const shimmerBuf = ctx.createBuffer(1, len, sr);
  const shimmer = shimmerBuf.getChannelData(0);
  let shLast = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    shLast = (shLast + 0.08 * w) / 1.08;
    shimmer[i] = shLast * 1.5;
  }
  const shimmerSrc = ctx.createBufferSource();
  shimmerSrc.buffer = shimmerBuf;
  shimmerSrc.loop = true;
  const shimmerHP = ctx.createBiquadFilter();
  shimmerHP.type = "highpass";
  shimmerHP.frequency.value = 4000;
  shimmerHP.Q.value = 0.3;
  const shimmerG = ctx.createGain();
  shimmerG.gain.value = 0.08;
  shimmerSrc.connect(shimmerHP).connect(shimmerG).connect(master);
  shimmerSrc.start();

  // LFO — slow wave lapping
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.12;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.15;
  lfo.connect(lfoG).connect(riverG.gain);
  lfo.start();

  // Second LFO — different period
  const lfo2 = ctx.createOscillator();
  lfo2.type = "sine";
  lfo2.frequency.value = 0.07;
  const lfo2G = ctx.createGain();
  lfo2G.gain.value = 0.08;
  lfo2.connect(lfo2G).connect(streamG.gain);
  lfo2.start();

  // ── Rustling leaves / wind through trees ───────────────────
  const leafBuf = ctx.createBuffer(1, len, sr);
  const leaf = leafBuf.getChannelData(0);
  let lLast = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    lLast = (lLast + 0.06 * w) / 1.06;
    leaf[i] = lLast * 2;
  }
  const leafSrc = ctx.createBufferSource();
  leafSrc.buffer = leafBuf;
  leafSrc.loop = true;
  const leafBP = ctx.createBiquadFilter();
  leafBP.type = "bandpass";
  leafBP.frequency.value = 3200;
  leafBP.Q.value = 1.2;
  const leafG = ctx.createGain();
  leafG.gain.value = 0.12;
  leafSrc.connect(leafBP).connect(leafG).connect(master);
  leafSrc.start();

  // Leaf wind modulation
  const leafLfo = ctx.createOscillator();
  leafLfo.type = "sine";
  leafLfo.frequency.value = 0.2;
  const leafLfoG = ctx.createGain();
  leafLfoG.gain.value = 0.06;
  leafLfo.connect(leafLfoG).connect(leafG.gain);
  leafLfo.start();

  // ── Birds — varied species, realistic patterns ─────────────
  const birdSpecies = [
    { freq: 2800, dur: 0.12, vol: 0.06, sweeps: 2 },
    { freq: 3400, dur: 0.08, vol: 0.05, sweeps: 3 },
    { freq: 2200, dur: 0.18, vol: 0.04, sweeps: 1 },
    { freq: 4200, dur: 0.06, vol: 0.045, sweeps: 4 },
    { freq: 1800, dur: 0.25, vol: 0.035, sweeps: 1 },
  ];

  function chirp(species: typeof birdSpecies[0]) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";

    const baseF = species.freq;
    osc.frequency.setValueAtTime(baseF, now);

    // Build a little phrase
    for (let s = 0; s < species.sweeps; s++) {
      const t = now + s * (species.dur + 0.04);
      const endF = baseF * (0.85 + Math.random() * 0.3);
      osc.frequency.setValueAtTime(baseF * (0.95 + Math.random() * 0.1), t);
      osc.frequency.exponentialRampToValueAtTime(endF, t + species.dur);
      g.gain.setValueAtTime(species.vol, t);
      g.gain.linearRampToValueAtTime(species.vol * 0.3, t + species.dur * 0.5);
      g.gain.linearRampToValueAtTime(species.vol, t + species.dur);
    }

    const totalDur = species.sweeps * (species.dur + 0.04) + 0.1;
    g.gain.setValueAtTime(species.vol, now + totalDur - 0.1);
    g.gain.linearRampToValueAtTime(0, now + totalDur);

    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + totalDur + 0.1);
  }

  function scheduleBird() {
    const delay = 2 + Math.random() * 5;
    setTimeout(() => {
      if (ctx.state === "closed") return;
      const sp = birdSpecies[Math.floor(Math.random() * birdSpecies.length)];
      chirp(sp);
      // Sometimes a second bird answers
      if (Math.random() < 0.35) {
        setTimeout(() => {
          if (ctx.state === "closed") return;
          const sp2 = birdSpecies[Math.floor(Math.random() * birdSpecies.length)];
          chirp(sp2);
        }, 200 + Math.random() * 600);
      }
      scheduleBird();
    }, delay * 1000);
  }
  scheduleBird();

  // ── Occasional temple bell ─────────────────────────────────
  function scheduleBell() {
    const delay = 25 + Math.random() * 45;
    setTimeout(() => {
      if (ctx.state === "closed") return;
      const now = ctx.currentTime;

      // Fundamental
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = 440;
      // Overtone
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 880;

      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0, now);
      g1.gain.linearRampToValueAtTime(0.03, now + 0.05);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 4);

      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, now);
      g2.gain.linearRampToValueAtTime(0.015, now + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc1.connect(g1).connect(master);
      osc2.connect(g2).connect(master);
      osc1.start(now);
      osc1.stop(now + 4.5);
      osc2.start(now);
      osc2.stop(now + 3);

      scheduleBell();
    }, delay * 1000);
  }
  scheduleBell();
}

export function AmbientAudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const start = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.resume().then(() => setIsPlaying(true));
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.4;
    master.connect(ctx.destination);
    masterRef.current = master;

    createAmbientSound(ctx, master);
    setIsReady(true);
    ctx.resume().then(() => setIsPlaying(true));
  }, []);

  const toggle = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    if (isPlaying) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setIsPlaying(false);
    } else {
      ctx.resume().then(() => {
        master.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.4);
        setIsPlaying(true);
      });
    }
  }, [isPlaying]);

  return (
    <AmbientAudioContext.Provider value={{ isPlaying, isReady, toggle, start }}>
      {children}
    </AmbientAudioContext.Provider>
  );
}
