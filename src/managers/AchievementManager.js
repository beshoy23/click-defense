import { ACHIEVEMENTS } from '../config/achievements.js';
import { Utils } from '../utils/utils.js';

export class AchievementManager {
  constructor(game) {
    this.game = game;
  }

  check() {
    const stats = {
      totalClicks: this.game.state.totalClicks,
      bestStreak: this.game.state.bestStreak,
      criticalChance: this.game.state.criticalChance,
      money: this.game.state.money
    };

    ACHIEVEMENTS.forEach(achievement => {
      if (!this.game.state.achievements.includes(achievement.id) && achievement.condition(stats)) {
        this.game.state.achievements.push(achievement.id);
        this.game.state.money += achievement.reward;
        Utils.showNotification(
          `Achievement: ${achievement.name}! +${Utils.formatNumber(achievement.reward)} coins`, 
          'achievement'
        );
      }
    });
  }
}