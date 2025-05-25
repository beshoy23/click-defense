import { CONFIG, MUSICAL_NOTES } from '../config/constants.js';
import { SOUND_THEMES } from '../config/themes.js';
import { Utils } from '../utils/utils.js';

export class AudioManager {
  constructor(game) {
    this.game = game;
    this.audioContext = null;
    this.soundCooldown = {};
    this.backgroundMusic = null;
    this.currentMelodyIndex = 0;
  }

  initAudio() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Audio not supported:', error);
      }
    }
  }

  playSound(frequency, duration, type = 'click') {
    if (!this.game.state.soundEnabled || !this.audioContext) return;
    
    const now = Date.now();
    const cooldownKey = type;
    const minInterval = type === 'click' ? 30 : 100;
    
    if (this.soundCooldown[cooldownKey] && now - this.soundCooldown[cooldownKey] < minInterval) {
      return;
    }
    this.soundCooldown[cooldownKey] = now;
    
    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      const safeFrequency = Math.max(200, Math.min(frequency, 2000));
      oscillator.frequency.setValueAtTime(safeFrequency, this.audioContext.currentTime);
      oscillator.type = type === 'purchase' ? 'sine' : 'square';
      
      let volume = type === 'purchase' ? 0.15 : type === 'critical' ? 0.12 : 0.08;
      if (safeFrequency > 1000) {
        volume *= 0.7;
      }
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.warn('Sound error:', error);
    }
  }

  playMusicalClick() {
    if (!this.game.state.soundEnabled) return;
    
    // Initialize audio on first click if needed
    if (!this.audioContext) {
      this.initAudio();
    }
    
    if (!this.audioContext) return;
    
    const theme = SOUND_THEMES[this.game.state.currentSoundTheme];
    let frequency;
    
    if (this.game.state.currentSoundTheme === 'piano') {
      frequency = MUSICAL_NOTES[this.currentMelodyIndex % MUSICAL_NOTES.length];
      this.currentMelodyIndex++;
    } else {
      frequency = theme.clickBase + (Math.random() * 100 - 50);
    }
    
    this.playSound(frequency, 0.1, 'click');
  }

  playPurchaseSound() {
    if (!this.game.state.soundEnabled) return;
    
    // Initialize audio on first use if needed
    if (!this.audioContext) {
      this.initAudio();
    }
    
    if (!this.audioContext) return;
    
    const theme = SOUND_THEMES[this.game.state.currentSoundTheme];
    
    setTimeout(() => this.playSound(theme.purchaseBase, 0.15, 'purchase'), 0);
    setTimeout(() => this.playSound(theme.purchaseBase * 1.25, 0.15, 'purchase'), 100);
    setTimeout(() => this.playSound(theme.purchaseBase * 1.5, 0.2, 'purchase'), 200);
  }

  playCelebrationSound() {
    if (!this.game.state.soundEnabled) return;
    
    // Initialize audio on first use if needed
    if (!this.audioContext) {
      this.initAudio();
    }
    
    if (!this.audioContext) return;
    
    const notes = [523, 659, 784, 1047]; // C, E, G, High C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.3, 'celebration');
      }, i * 100);
    });
  }

  toggleSound() {
    this.game.state.soundEnabled = !this.game.state.soundEnabled;
    this.game.uiManager.updateSoundButton();
    
    if (this.game.state.soundEnabled && !this.audioContext) {
      this.initAudio();
    }
  }

  toggleMusic() {
    const musicBtn = Utils.getElement('music-btn');
    
    if (this.backgroundMusic) {
      this.stopBackgroundMusic();
      musicBtn.textContent = '🔇';
    } else {
      if (!this.audioContext) {
        this.initAudio();
      }
      this.startBackgroundMusic();
      musicBtn.textContent = '🎵';
    }
  }

  startBackgroundMusic() {
    if (!this.game.state.soundEnabled || !this.audioContext || this.backgroundMusic) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
      
      oscillator.start();
      this.backgroundMusic = { oscillator, gainNode };
      
      const fadeLoop = () => {
        if (!this.backgroundMusic) return;
        gainNode.gain.exponentialRampToValueAtTime(0.05, this.audioContext.currentTime + 5);
        setTimeout(() => {
          if (this.backgroundMusic) {
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3);
            setTimeout(fadeLoop, 8000);
          }
        }, 5000);
      };
      fadeLoop();
      
    } catch (error) {
      console.warn('Background music error:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.oscillator.stop();
        this.backgroundMusic.oscillator.disconnect();
        this.backgroundMusic.gainNode.disconnect();
      } catch (error) {
        console.warn('Error stopping music:', error);
      }
      this.backgroundMusic = null;
    }
  }

  cycleSoundTheme() {
    const themeKeys = Object.keys(SOUND_THEMES);
    const currentIndex = themeKeys.indexOf(this.game.state.currentSoundTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    this.game.state.currentSoundTheme = themeKeys[nextIndex];
    
    Utils.showNotification(`Sound theme changed to ${SOUND_THEMES[this.game.state.currentSoundTheme].name}`, 'notification');
  }
}