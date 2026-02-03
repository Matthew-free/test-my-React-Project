
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windNode: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private lastBreathTime: number = 0;

  private static instance: AudioEngine;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5; // Master volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    } else if (!this.ctx) {
      this.init();
    }
  }

  // --- SYNTHESIS HELPERS ---

  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- AMBIENCE ---

  public startWind() {
    if (!this.ctx || !this.masterGain) return;
    if (this.windNode) return; // Already playing

    const noiseBuffer = this.createNoiseBuffer();
    this.windNode = this.ctx.createBufferSource();
    this.windNode.buffer = noiseBuffer;
    this.windNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Low rumble wind
    filter.Q.value = 1;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.05;

    // Modulate gain for "gusts"
    const gainOsc = this.ctx.createOscillator();
    gainOsc.frequency.value = 0.1; // Slow gusts
    const gainOscAmp = this.ctx.createGain();
    gainOscAmp.gain.value = 0.02;
    gainOsc.connect(gainOscAmp);
    gainOscAmp.connect(this.windGain.gain);
    gainOsc.start();

    this.windNode.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    this.windNode.start();
  }

  public stopWind() {
    if (this.windNode) {
      this.windNode.stop();
      this.windNode = null;
    }
  }

  // --- SFX ---

  public playCrow() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    // Roughness
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 30;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.6);
    lfo.stop(t + 0.6);
  }

  public playCarCooling() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Random metallic ticks
    const count = 3 + Math.floor(Math.random() * 3);
    for(let i=0; i<count; i++) {
        const time = t + Math.random() * 2;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 2000 + Math.random() * 500;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.1);
    }
  }

  public playFlashlightRoll() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // "Clatter"
    const times = [0, 0.2, 0.35, 0.45];
    times.forEach((offset, idx) => {
        const time = t + offset;
        const buffer = this.createNoiseBuffer();
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600 - (idx * 100);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2 / (idx + 1), time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        source.start(time);
    });
    
    // Final "Thud"
    setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        const t2 = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(80, t2);
        osc.frequency.exponentialRampToValueAtTime(40, t2 + 0.1);
        
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.3, t2);
        g.gain.exponentialRampToValueAtTime(0.001, t2 + 0.2);
        
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t2);
        osc.stop(t2 + 0.2);
    }, 600);
  }

  public playBell() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Fundamental + Harmonics
    [220, 440, 660, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.frequency.value = freq;
      // Slight detune for horror vibe
      osc.detune.value = Math.random() * 20 - 10;
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1 / (i + 1), t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 4.0);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 4.0);
    });
  }

  public playBreathing() {
      if (!this.ctx || !this.masterGain) return;
      const now = Date.now();
      if (now - this.lastBreathTime < 2500) return;
      this.lastBreathTime = now;

      const t = this.ctx.currentTime;
      const buffer = this.createNoiseBuffer();
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 1.0);
      gain.gain.linearRampToValueAtTime(0, t + 2.0);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(t);
      source.stop(t + 2.5);
  }

  public playFootstep(surface: 'DIRT' | 'WOOD' | 'WATER', volume: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const buffer = this.createNoiseBuffer();
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    
    if (surface === 'DIRT') filter.frequency.value = 200;
    else if (surface === 'WOOD') filter.frequency.value = 800;
    else if (surface === 'WATER') {
        filter.frequency.value = 1000;
        filter.Q.value = 5; // Resonant for water
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15 * volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(t);
    source.stop(t + 0.1);
  }

  public playGhostFootstep(intensity: 'SOFT' | 'NORMAL' | 'HEAVY') {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      const buffer = this.createNoiseBuffer();
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      
      let volume = 0.1;
      let duration = 0.1;

      if (intensity === 'SOFT') {
          filter.frequency.value = 150;
          volume = 0.05;
      } else if (intensity === 'NORMAL') {
          filter.frequency.value = 300;
          volume = 0.15;
      } else { // HEAVY
          filter.frequency.value = 500;
          volume = 0.4;
          duration = 0.15;
          // Add a thud sub-oscillator
          const sub = this.ctx.createOscillator();
          sub.frequency.value = 60;
          const subGain = this.ctx.createGain();
          subGain.gain.setValueAtTime(0.2, t);
          subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
          sub.connect(subGain);
          subGain.connect(this.masterGain);
          sub.start(t);
          sub.stop(t + duration);
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(t);
      source.stop(t + duration);
  }

  public playJumpScare() {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1500, t);
      osc.frequency.linearRampToValueAtTime(400, t + 0.3);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      const noise = this.createNoiseBuffer();
      const nSrc = this.ctx.createBufferSource();
      nSrc.buffer = noise;
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'bandpass';
      nFilter.frequency.value = 2000;
      nFilter.Q.value = 5;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.8, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      
      nSrc.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.4);
      nSrc.start(t);
      nSrc.stop(t + 0.5);
  }

  public playClick(on: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(on ? 1200 : 800, t);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playBuzz(duration: number = 0.5) {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 50 + Math.random() * 10; 

      const noise = this.createNoiseBuffer();
      const nSrc = this.ctx.createBufferSource();
      nSrc.buffer = noise;
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'highpass';
      nFilter.frequency.value = 2000;
      const nGain = this.ctx.createGain();
      nGain.gain.value = 0.05;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0.08, t + duration * 0.2);
      gain.gain.linearRampToValueAtTime(0.02, t + duration * 0.5);
      gain.gain.linearRampToValueAtTime(0, t + duration);

      osc.connect(gain);
      
      nSrc.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(gain);

      gain.connect(this.masterGain);
      
      osc.start(t);
      osc.stop(t + duration);
      nSrc.start(t);
      nSrc.stop(t + duration);
  }

  public playDrone() {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.frequency.value = 60;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.5);
      gain.gain.linearRampToValueAtTime(0, t + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 2.0);
  }

  public playItemDrop() {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      
      const buffer = this.createNoiseBuffer();
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(t);
  }

  public playSwing() {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      // Woosh noise
      const buffer = this.createNoiseBuffer();
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.linearRampToValueAtTime(1000, t + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(t);
      source.stop(t+0.2);
  }

  public playHit() {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      // Thud
      const osc = this.ctx.createOscillator();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.15);
  }
}
