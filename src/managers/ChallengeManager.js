import { CONFIG } from '../config/constants.js';
import { CHALLENGE_TYPES } from '../config/achievements.js';

export class ChallengeManager {
  constructor(game) {
    this.game = game;
  }

  startRandom() {
    if (!this.game.state.currentChallenge && Math.random() < CONFIG.CHALLENGE_SPAWN_CHANCE) {
      const challenge = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)];
      this.game.state.currentChallenge = {
        ...challenge,
        progress: 0,
        startTime: Date.now(),
        endTime: Date.now() + challenge.time
      };
    }
  }

  updateProgress(type, value = 1) {
    if (!this.game.state.currentChallenge || this.game.state.currentChallenge.type !== type) {
      return;
    }
    
    if (type === 'combo') {
      this.game.state.currentChallenge.progress = Math.max(this.game.state.currentChallenge.progress, value);
    } else {
      this.game.state.currentChallenge.progress += value;
    }
  }
}