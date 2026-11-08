// src/lib/chimeSound.js
// Synthesizes a warm, realistic two-tone "Ding Dong" doorbell chime using Web Audio API

export function playDoorbellChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Helper to play a chime tone with soft harmonics
    function playTone(freq, startTime, duration = 1.2, gainLevel = 0.3) {
      // Primary Oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Warm harmonic overtone
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(freq * 2.76, startTime); // Bell-like partial
      harmonicGain.gain.setValueAtTime(gainLevel * 0.25, startTime);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6);

      // Volume envelope (gentle attack, smooth bell decay)
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      harmonic.connect(harmonicGain);
      gain.connect(ctx.destination);
      harmonicGain.connect(ctx.destination);

      osc.start(startTime);
      harmonic.start(startTime);
      osc.stop(startTime + duration);
      harmonic.stop(startTime + duration);
    }

    // Tone 1: "DING" (D5 - 587.33 Hz)
    playTone(587.33, now, 1.4, 0.4);

    // Tone 2: "DONG" (A4 - 440.00 Hz) slightly after
    playTone(440.0, now + 0.38, 1.6, 0.35);

  } catch (err) {
    console.warn('Could not synthesize chime audio:', err.message);
  }
}
