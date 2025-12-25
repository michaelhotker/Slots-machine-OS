// Sound Manager for Slot Machine
// Enhanced Web Audio API synthesized casino sounds - exciting and dynamic!

class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.6;
    this.audioContext = null;
    this.initialized = false;
    this.masterGain = null;
    
    // Bind methods
    this.init = this.init.bind(this);
  }

  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master gain for overall volume
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
      
      // Create reverb for depth
      this.createReverb();
      
      this.initialized = true;
      console.log('🔊 Sound Manager initialized with enhanced audio');
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  // Create simple reverb effect
  async createReverb() {
    if (!this.audioContext) return;
    
    this.convolver = this.audioContext.createConvolver();
    
    // Create impulse response for reverb
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 0.5; // 0.5 second reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    this.convolver.buffer = impulse;
    
    // Wet/dry mix
    this.reverbGain = this.audioContext.createGain();
    this.reverbGain.gain.value = 0.2;
    this.convolver.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  createOscillator(type = 'sine') {
    if (!this.audioContext) return null;
    const osc = this.audioContext.createOscillator();
    osc.type = type;
    return osc;
  }

  createGain(volume = 1) {
    if (!this.audioContext) return null;
    const gain = this.audioContext.createGain();
    gain.gain.value = volume * this.volume;
    return gain;
  }

  // Create filter for effects
  createFilter(type = 'lowpass', frequency = 1000) {
    if (!this.audioContext) return null;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 1;
    return filter;
  }

  // Play a rich layered tone
  playTone(frequency, duration, type = 'sine', volume = 0.3, useReverb = false) {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.createOscillator(type);
    const gain = this.createGain(volume);
    
    if (!osc || !gain) return;

    const now = this.audioContext.currentTime;
    
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    
    if (useReverb && this.convolver) {
      gain.connect(this.convolver);
    }
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Play chord (multiple notes at once)
  playChord(frequencies, duration, type = 'sine', volume = 0.2, useReverb = true) {
    frequencies.forEach(freq => {
      this.playTone(freq, duration, type, volume / frequencies.length, useReverb);
    });
  }

  // Play arpeggio
  playArpeggio(frequencies, noteLength = 0.1, volume = 0.3) {
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, noteLength * 1.5, 'sine', volume, true);
      }, i * noteLength * 1000);
    });
  }

  // === EXCITING SLOT MACHINE SOUNDS ===

  // Click sound - punchy button press
  click() {
    if (!this.enabled) return;
    const now = this.audioContext.currentTime;
    
    // Punchy click with multiple layers
    this.playTone(1200, 0.04, 'square', 0.25);
    this.playTone(800, 0.06, 'triangle', 0.2);
    setTimeout(() => this.playTone(400, 0.03, 'sine', 0.15), 20);
  }

  // SPIN - Exciting whoosh with energy buildup
  spin() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Whoosh sweep up
    const osc1 = this.createOscillator('sawtooth');
    const osc2 = this.createOscillator('square');
    const filter = this.createFilter('lowpass', 2000);
    const gain = this.createGain(0.2);
    
    if (!osc1 || !osc2 || !filter || !gain) return;

    // Rising frequency sweep
    osc1.frequency.setValueAtTime(80, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.4);
    
    osc2.frequency.setValueAtTime(60, now);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.4);
    
    // Filter sweep for excitement
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.3);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    if (this.convolver) gain.connect(this.convolver);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);

    // Add sparkle effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(2000 + Math.random() * 2000, 0.05, 'sine', 0.1);
      }, 100 + i * 60);
    }
  }

  // Reel tick - mechanical clicking
  reelSpin() {
    if (!this.enabled) return;
    this.playTone(300 + Math.random() * 100, 0.02, 'square', 0.08);
    this.playTone(150, 0.015, 'triangle', 0.05);
  }

  // REEL STOP - Heavy satisfying THUNK with massive impact
  reelStop() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // === LAYER 1: Sub-bass impact (feel the thump) ===
    const subBass = this.createOscillator('sine');
    const subGain = this.createGain(0.7);
    if (subBass && subGain) {
      subBass.frequency.setValueAtTime(80, now);
      subBass.frequency.exponentialRampToValueAtTime(25, now + 0.2);
      subGain.gain.setValueAtTime(0.7 * this.volume, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      subBass.connect(subGain);
      subGain.connect(this.masterGain);
      subBass.start(now);
      subBass.stop(now + 0.25);
    }
    
    // === LAYER 2: Mid punch (the body) ===
    const midPunch = this.createOscillator('triangle');
    const midGain = this.createGain(0.5);
    if (midPunch && midGain) {
      midPunch.frequency.setValueAtTime(250, now);
      midPunch.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      midGain.gain.setValueAtTime(0.5 * this.volume, now);
      midGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      midPunch.connect(midGain);
      midGain.connect(this.masterGain);
      midPunch.start(now);
      midPunch.stop(now + 0.18);
    }
    
    // === LAYER 3: High transient click (the snap) ===
    const click = this.createOscillator('square');
    const clickGain = this.createGain(0.4);
    if (click && clickGain) {
      click.frequency.setValueAtTime(1500, now);
      click.frequency.exponentialRampToValueAtTime(300, now + 0.03);
      clickGain.gain.setValueAtTime(0.4 * this.volume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      click.connect(clickGain);
      clickGain.connect(this.masterGain);
      click.start(now);
      click.stop(now + 0.05);
    }
    
    // === LAYER 4: Noise burst for texture ===
    const noiseLength = 0.04;
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * noiseLength, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseBuffer.length, 3);
    }
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.createGain(0.25);
    const noiseFilter = this.createFilter('lowpass', 3000);
    if (noiseSource && noiseGain && noiseFilter) {
      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noiseSource.start(now);
    }
    
    // === LAYER 5: Mechanical clunk (delayed) ===
    setTimeout(() => {
      this.playTone(400, 0.04, 'square', 0.35);
      this.playTone(800, 0.03, 'triangle', 0.25);
    }, 15);
    
    // === LAYER 6: Metal ring resonance ===
    setTimeout(() => {
      const ring1 = this.createOscillator('sine');
      const ring2 = this.createOscillator('sine');
      const ringGain = this.createGain(0.15);
      if (ring1 && ring2 && ringGain) {
        const ringNow = this.audioContext.currentTime;
        ring1.frequency.setValueAtTime(600, ringNow);
        ring2.frequency.setValueAtTime(900, ringNow);
        ringGain.gain.setValueAtTime(0.15 * this.volume, ringNow);
        ringGain.gain.exponentialRampToValueAtTime(0.001, ringNow + 0.2);
        ring1.connect(ringGain);
        ring2.connect(ringGain);
        ringGain.connect(this.masterGain);
        if (this.convolver) ringGain.connect(this.convolver);
        ring1.start(ringNow);
        ring2.start(ringNow);
        ring1.stop(ringNow + 0.2);
        ring2.stop(ringNow + 0.2);
      }
    }, 40);
    
    // === LAYER 7: Secondary thump (weight settling) ===
    setTimeout(() => {
      this.playTone(100, 0.08, 'sine', 0.2);
      this.playTone(50, 0.1, 'triangle', 0.15);
    }, 60);
  }

  // WIN - Exciting ascending celebration
  win() {
    if (!this.enabled) return;
    
    // Bright ascending arpeggio
    const notes = [523, 659, 784, 1047, 1319];
    this.playArpeggio(notes, 0.08, 0.35);
    
    // Sparkle overlay
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          this.playTone(2000 + Math.random() * 2000, 0.08, 'sine', 0.15, true);
        }, i * 40);
      }
    }, 200);
    
    // Victory chord
    setTimeout(() => {
      this.playChord([1047, 1319, 1568], 0.4, 'sine', 0.3, true);
    }, 400);
  }

  // BIG WIN - Triumphant fanfare celebration!
  bigWin() {
    if (!this.enabled) return;
    
    // Dramatic intro
    this.playChord([261, 329, 392], 0.15, 'sawtooth', 0.25);
    
    // Ascending fanfare
    setTimeout(() => {
      const fanfare = [523, 659, 784, 880, 1047];
      fanfare.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.2, 'square', 0.3);
          this.playTone(freq * 2, 0.15, 'sine', 0.2, true);
        }, i * 100);
      });
    }, 150);
    
    // Triumphant chord
    setTimeout(() => {
      this.playChord([1047, 1319, 1568, 2093], 0.6, 'sine', 0.4, true);
      this.playChord([523, 659, 784, 1047], 0.6, 'triangle', 0.2);
    }, 700);
    
    // Celebration sparkles
    setTimeout(() => {
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          this.playTone(1500 + Math.random() * 3000, 0.1, 'sine', 0.12, true);
        }, i * 50);
      }
    }, 800);
    
    // Second fanfare
    setTimeout(() => {
      this.playArpeggio([587, 740, 880, 1175, 1480], 0.1, 0.35);
    }, 1200);
    
    // Final triumphant note
    setTimeout(() => {
      this.playChord([1175, 1480, 1760], 0.8, 'sine', 0.35, true);
    }, 1700);
  }

  // MEGA WIN - Epic orchestral celebration!
  megaWin() {
    if (!this.enabled) return;
    
    // Dramatic drum roll buildup
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        this.playTone(80 + i * 5, 0.05, 'triangle', 0.15 + i * 0.01);
        this.playTone(100 + i * 10, 0.04, 'square', 0.1);
      }, i * 40);
    }
    
    // Explosion!
    setTimeout(() => {
      // Impact
      this.playTone(60, 0.3, 'sawtooth', 0.4);
      this.playChord([262, 330, 392, 523], 0.2, 'square', 0.35);
      
      // Shimmer
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          this.playTone(2000 + Math.random() * 4000, 0.15, 'sine', 0.1, true);
        }, i * 30);
      }
    }, 800);
    
    // Epic ascending scale
    setTimeout(() => {
      const scale = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568];
      scale.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.15, 'sawtooth', 0.25);
          this.playTone(freq * 0.5, 0.15, 'sine', 0.15);
        }, i * 60);
      });
    }, 1000);
    
    // Big fanfare
    setTimeout(() => this.bigWin(), 1800);
    
    // Extra celebration
    setTimeout(() => {
      // Coin shower sound
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          this.playTone(3000 + Math.random() * 3000, 0.06, 'sine', 0.08);
        }, i * 40);
      }
    }, 3000);
  }

  // JACKPOT - Ultimate celebration explosion!
  jackpot() {
    if (!this.enabled) return;
    
    // Suspenseful buildup
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const freq = 100 + i * 50;
        this.playTone(freq, 0.1, 'sawtooth', 0.15 + i * 0.02);
        this.playTone(freq * 1.5, 0.08, 'square', 0.1);
      }, i * 80);
    }
    
    // EXPLOSION!
    setTimeout(() => {
      // Massive impact
      this.playTone(40, 0.5, 'sawtooth', 0.5);
      this.playChord([262, 330, 392, 523, 659], 0.3, 'square', 0.4);
      
      // Fireworks!
      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          this.playTone(1000 + Math.random() * 5000, 0.2, 'sine', 0.12, true);
        }, i * 25);
      }
    }, 1200);
    
    // Mega win sequence
    setTimeout(() => this.megaWin(), 1500);
    
    // Extended celebration
    setTimeout(() => {
      // Victory fanfare
      const victory = [1047, 1319, 1568, 2093, 2637];
      victory.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.4, 'sine', 0.3, true);
          this.playTone(freq / 2, 0.4, 'triangle', 0.2);
        }, i * 150);
      });
    }, 4500);
    
    // Final flourish
    setTimeout(() => {
      this.playChord([2093, 2637, 3136, 3951], 1.5, 'sine', 0.4, true);
      
      // Coin rain
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          this.playTone(2500 + Math.random() * 4000, 0.08, 'sine', 0.06);
        }, i * 30);
      }
    }, 5500);
  }

  // COIN INSERT - Satisfying metallic ding
  coin() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Metallic ring
    const frequencies = [2800, 3500, 4200];
    frequencies.forEach((freq, i) => {
      const osc = this.createOscillator('sine');
      const gain = this.createGain(0.25);
      
      if (!osc || !gain) return;
      
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      if (this.convolver) gain.connect(this.convolver);
      
      osc.start(now + i * 0.02);
      osc.stop(now + 0.3);
    });

    // Coin drop sound
    setTimeout(() => {
      this.playTone(1800, 0.05, 'sine', 0.2);
      this.playTone(2400, 0.08, 'sine', 0.15, true);
    }, 80);
    
    // Second ring
    setTimeout(() => {
      this.playTone(3200, 0.15, 'sine', 0.2, true);
    }, 150);
  }

  // CASH OUT - Exciting coin waterfall!
  cashOut() {
    if (!this.enabled) return;
    
    // Ka-ching intro
    this.playTone(1500, 0.1, 'sine', 0.3);
    this.playTone(2000, 0.1, 'sine', 0.25);
    
    // Coin waterfall
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const freq = 2000 + Math.random() * 3000;
        this.playTone(freq, 0.1, 'sine', 0.12 + Math.random() * 0.08, true);
        
        // Occasional louder coins
        if (Math.random() > 0.7) {
          this.playTone(freq * 0.8, 0.08, 'triangle', 0.1);
        }
      }, i * 50 + Math.random() * 30);
    }
    
    // Register sound
    setTimeout(() => {
      this.playChord([800, 1000, 1200], 0.2, 'square', 0.2);
    }, 200);
    
    // Final celebratory notes
    setTimeout(() => {
      this.playArpeggio([1047, 1319, 1568, 2093], 0.1, 0.25);
    }, 1200);
  }

  // SCATTER - Magical shimmer effect
  scatter() {
    if (!this.enabled) return;
    
    // Magical ascending shimmer
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.playTone(800 + i * 200, 0.25, 'sine', 0.2, true);
        this.playTone(1200 + i * 300, 0.2, 'triangle', 0.1);
      }, i * 60);
    }
    
    // Sparkle burst
    setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          this.playTone(2000 + Math.random() * 3000, 0.15, 'sine', 0.12, true);
        }, i * 30);
      }
    }, 300);
    
    // Magical chord
    setTimeout(() => {
      this.playChord([1047, 1319, 1568, 2093], 0.5, 'sine', 0.25, true);
    }, 500);
  }

  // ANTICIPATION - Tension building (disabled for WA compliance but kept for reference)
  anticipation() {
    // WA EGM Compliance: Near-miss/anticipation effects disabled
    // This function intentionally does nothing
  }

  // Bonus feature sound
  bonus() {
    if (!this.enabled) return;
    
    // Dramatic intro hit - big impact sound
    this.playTone(80, 0.3, 'triangle', 0.5);
    this.playTone(160, 0.25, 'square', 0.4);
    this.playChord([200, 300, 400], 0.3, 'sawtooth', 0.3);
    
    // Rising arpeggio
    setTimeout(() => {
      const notes = [262, 330, 392, 523, 659, 784, 1047, 1319];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.12, 'sawtooth', 0.3);
          this.playTone(freq * 1.5, 0.1, 'sine', 0.2, true);
        }, i * 60);
      });
    }, 150);
    
    // Cymbal swell
    setTimeout(() => {
      if (!this.audioContext) return;
      const bufferSize = this.audioContext.sampleRate * 0.5;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3000;
      const noiseGain = this.createGain(0.2);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start();
    }, 100);
    
    // Epic fanfare chord progression
    setTimeout(() => {
      this.playChord([523, 659, 784], 0.4, 'sine', 0.35, true);
    }, 700);
    
    setTimeout(() => {
      this.playChord([659, 784, 988], 0.4, 'sine', 0.35, true);
    }, 1000);
    
    setTimeout(() => {
      // Final triumphant chord
      this.playChord([784, 988, 1175, 1568], 0.8, 'sine', 0.45, true);
      this.playTone(196, 0.6, 'triangle', 0.4); // Bass note
    }, 1300);
    
    // Victory bells
    setTimeout(() => {
      const bells = [1568, 1976, 2349];
      bells.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.4, 'sine', 0.25, true);
        }, i * 150);
      });
    }, 1800);
  }

  // Generic play method
  play(soundName) {
    if (!this.enabled) return;
    
    if (!this.initialized) {
      this.init();
    }
    
    switch(soundName) {
      case 'click': this.click(); break;
      case 'spin': this.spin(); break;
      case 'reelSpin': this.reelSpin(); break;
      case 'reelStop': this.reelStop(); break;
      case 'win': this.win(); break;
      case 'bigWin': this.bigWin(); break;
      case 'megaWin': this.megaWin(); break;
      case 'jackpot': this.jackpot(); break;
      case 'coin': this.coin(); break;
      case 'cashOut': this.cashOut(); break;
      case 'scatter': this.scatter(); break;
      case 'bonus': this.bonus(); break;
      case 'anticipation': this.anticipation(); break;
      default:
        console.log(`Unknown sound: ${soundName}`);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  mute() {
    this.enabled = false;
  }

  unmute() {
    this.enabled = true;
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.SoundManager = SoundManager;
  window.soundManager = new SoundManager();
}
