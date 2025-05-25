import { CHARACTERS } from '../config/characters.js';

export class SaveManager {
  constructor(game) {
    this.game = game;
  }

  save() {
    try {
      const saveData = {
        money: this.game.state.money,
        clickOwned: this.game.state.clickOwned,
        passiveOwned: this.game.state.passiveOwned,
        soundEnabled: this.game.state.soundEnabled,
        totalClicks: this.game.state.totalClicks,
        bestStreak: this.game.state.bestStreak,
        achievements: this.game.state.achievements,
        currentVisualTheme: this.game.state.currentVisualTheme,
        currentSoundTheme: this.game.state.currentSoundTheme,
        nextUpgradeCost: this.game.state.nextUpgradeCost,
        currentCharacterId: this.game.state.currentCharacterId,
        unlockedCharacters: this.game.state.unlockedCharacters,
        achievedMilestones: this.game.state.achievedMilestones,
        // Prestige data
        prestigeLevel: this.game.state.prestigeLevel,
        ascensionPoints: this.game.state.ascensionPoints,
        prestigeMultiplier: this.game.state.prestigeMultiplier,
        lifetimeEarnings: this.game.state.lifetimeEarnings,
        exponentialGrowthRate: this.game.state.exponentialGrowthRate
      };
      localStorage.setItem('arabtalianClickerSave', JSON.stringify(saveData));
    } catch (error) {
      console.warn('Failed to save game:', error);
    }
  }

  load() {
    try {
      const savedData = localStorage.getItem('arabtalianClickerSave');
      if (savedData) {
        const data = JSON.parse(savedData);
        
        if (data.money !== undefined) this.game.state.money = data.money;
        if (data.clickOwned) this.game.state.clickOwned = data.clickOwned;
        if (data.passiveOwned) this.game.state.passiveOwned = data.passiveOwned;
        if (data.soundEnabled !== undefined) this.game.state.soundEnabled = data.soundEnabled;
        if (data.totalClicks !== undefined) this.game.state.totalClicks = data.totalClicks;
        if (data.bestStreak !== undefined) this.game.state.bestStreak = data.bestStreak;
        if (data.achievements) this.game.state.achievements = data.achievements;
        if (data.currentVisualTheme) this.game.state.currentVisualTheme = data.currentVisualTheme;
        if (data.currentSoundTheme) this.game.state.currentSoundTheme = data.currentSoundTheme;
        if (data.nextUpgradeCost !== undefined) this.game.state.nextUpgradeCost = data.nextUpgradeCost;
        
        // Restore character data
        if (data.currentCharacterId) {
          this.game.state.currentCharacterId = data.currentCharacterId;
        }
        
        if (data.unlockedCharacters) {
          // Mark characters as unlocked
          data.unlockedCharacters.forEach(charId => {
            const character = CHARACTERS.find(c => c.id === charId);
            if (character) {
              character.unlocked = true;
            }
          });
          this.game.state.unlockedCharacters = data.unlockedCharacters;
        }
        
        if (data.achievedMilestones) {
          this.game.state.achievedMilestones = data.achievedMilestones;
        }
        
        // Load prestige data
        if (data.prestigeLevel !== undefined) this.game.state.prestigeLevel = data.prestigeLevel;
        if (data.ascensionPoints !== undefined) this.game.state.ascensionPoints = data.ascensionPoints;
        if (data.prestigeMultiplier !== undefined) this.game.state.prestigeMultiplier = data.prestigeMultiplier;
        if (data.lifetimeEarnings !== undefined) this.game.state.lifetimeEarnings = data.lifetimeEarnings;
        if (data.exponentialGrowthRate !== undefined) this.game.state.exponentialGrowthRate = data.exponentialGrowthRate;
        
        this.game.upgradeManager.recalculateStats();
      }
    } catch (error) {
      console.warn('Failed to load game:', error);
    }
  }
}