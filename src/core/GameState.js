import { CONFIG } from '../config/constants.js';

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    // Core resources
    this.money = CONFIG.INITIAL_MONEY;
    this.baseClickPower = CONFIG.INITIAL_CLICK_POWER;
    this.clickMultiplier = 1;
    this.criticalChance = 0;
    this.meterFillBonus = 0;
    this.totalCPS = 0;
    
    // Exponential growth system
    this.prestigeLevel = 0;
    this.prestigeMultiplier = 1;
    this.lifetimeEarnings = 0;
    this.globalMultiplier = 1;
    this.ascensionPoints = 0;
    this.exponentialGrowthRate = 1.15;
    
    // Click mechanics
    this.clickStreak = 0;
    this.lastClickTime = 0;
    this.meterLevel = 0;
    
    // Statistics
    this.totalClicks = 0;
    this.bestStreak = 0;
    
    // Combo system
    this.comboMultiplier = 1;
    this.comboCount = 0;
    this.lastComboTime = 0;
    
    // Special states
    this.goldenClickActive = false;
    this.activeBoosts = [];
    this.currentChallenge = null;
    this.achievements = [];
    
    // Upgrades owned
    this.clickOwned = [];
    this.passiveOwned = [];
    
    // Upgrade system
    this.nextUpgradeCost = CONFIG.INITIAL_UPGRADE_COST;
    this.pendingUpgrade = false;
    this.lastUpgradeTime = Date.now();
    
    // Sound state
    this.soundEnabled = true;
    this.currentSoundTheme = 'default';
    this.currentVisualTheme = 'default';
    
    // Meter sound tracking
    this.meterWasFull = false;
    this.lastHimarikoSoundTime = 0;
    this.meterFullStartTime = 0;
    this.longSoundPlayed = false;
    
    // Character system
    this.currentCharacterId = 'himariko';
    this.unlockedCharacters = ['himariko'];
    
    // Milestones tracking
    this.achievedMilestones = [];
  }

  getCurrentClickPower() {
    return Math.floor(this.baseClickPower * (1 + this.clickMultiplier));
  }

  getEffectiveCritChance() {
    return Math.min(CONFIG.MAX_CRIT_CHANCE, this.criticalChance);
  }

  getMeterFillRate() {
    return CONFIG.METER_FILL_BASE + this.meterFillBonus;
  }
}