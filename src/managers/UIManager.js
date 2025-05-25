import { CONFIG } from '../config/constants.js';
import { VISUAL_THEMES } from '../config/themes.js';
import { PASSIVE_UPGRADES } from '../config/upgrades.js';
import { Utils } from '../utils/utils.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.lastIncomeEffectTime = 0;
    this.lastIncomeSound = 0;
  }

  updateAll() {
    this.updateCurrency();
    this.updateMeter();
    this.updateStats();
    this.updateBoostDisplay();
    this.updateChallengeDisplay();
    
    // Only update upgrades if money changed significantly
    if (!this.lastUpgradeUpdate || Math.abs(this.game.state.money - this.lastUpgradeUpdate) > this.game.state.money * 0.1) {
      this.game.upgradeManager.renderClickUpgrades();
      this.game.upgradeManager.renderAutoUpgrades();
      this.game.upgradeManager.updateAutomationStats();
      this.lastUpgradeUpdate = this.game.state.money;
    }
  }

  updateCurrency() {
    Utils.updateElement('money-text', Utils.formatNumber(Math.floor(this.game.state.money)));
    
    // Calculate actual CPS with all multipliers
    const multipliers = this.game.getActiveMultipliers();
    let actualCPS = this.game.state.totalCPS * multipliers.cpsMult * multipliers.incomeMult;
    actualCPS *= this.game.state.globalMultiplier;
    actualCPS *= this.game.state.prestigeMultiplier;
    actualCPS *= Math.pow(this.game.state.exponentialGrowthRate, Math.floor(this.game.state.totalClicks / 100));
    
    Utils.updateElement('rate', `${Utils.formatNumber(actualCPS, 1)} brainrot/sec`);
    
    const currentClickPower = this.game.state.getCurrentClickPower();
    Utils.updateElement('click-power-value', Utils.formatNumber(currentClickPower));
    Utils.updateElement('crit-chance', this.game.state.getEffectiveCritChance());
    Utils.updateElement('meter-boost', this.game.state.getMeterFillRate());
  }

  updateMeter() {
    const meterFill = Utils.getElement('click-meter-fill');
    const clickValue = Utils.getElement('click-value');
    
    meterFill.style.height = `${this.game.state.meterLevel}%`;
    
    if (this.game.state.meterLevel >= 100) {
      Utils.showElement('click-meter-x2');
      Utils.addClass('click-meter', 'full');
      
      // Play character sound
      if (!this.game.state.meterWasFull && this.game.state.soundEnabled) {
        const now = Date.now();
        if (now - this.game.state.lastHimarikoSoundTime > CONFIG.SOUND_COOLDOWN) {
          const characterSound = Utils.getElement('character-sound');
          if (characterSound) {
            characterSound.currentTime = 0;
            characterSound.play().catch(err => console.warn('Could not play character sound:', err));
            this.game.state.lastHimarikoSoundTime = now;
          }
        }
        this.game.state.meterWasFull = true;
        this.game.state.meterFullStartTime = now;
      }
      
      // Check for long sound
      if (this.game.state.meterWasFull && !this.game.state.longSoundPlayed && this.game.state.soundEnabled) {
        if (Date.now() - this.game.state.meterFullStartTime >= CONFIG.HIMARIKO_LONG_DELAY) {
          const characterSound = Utils.getElement('character-sound');
          const characterSoundLong = Utils.getElement('character-sound-long');
          
          if (characterSound) characterSound.pause();
          if (characterSoundLong) {
            characterSoundLong.currentTime = 0;
            characterSoundLong.play().catch(err => console.warn('Could not play long character sound:', err));
          }
          this.game.state.longSoundPlayed = true;
        }
      }
      
      const fullClickValue = this.game.getFullClickValue();
      clickValue.innerText = `+${Utils.formatNumber(fullClickValue * CONFIG.METER_BOOST_MULTIPLIER)}`;
      Utils.addClass('click-value', 'boosted');
    } else {
      Utils.hideElement('click-meter-x2');
      Utils.removeClass('click-meter', 'full');
      this.game.state.meterWasFull = false;
      this.game.state.longSoundPlayed = false;
      
      const characterSoundLong = Utils.getElement('character-sound-long');
      if (characterSoundLong && !characterSoundLong.paused) {
        characterSoundLong.pause();
      }
      
      const fullClickValue = this.game.getFullClickValue();
      clickValue.innerText = `+${Utils.formatNumber(fullClickValue)}`;
      Utils.removeClass('click-value', 'boosted');
    }
  }

  updateStats() {
    Utils.updateElement('total-clicks', Utils.formatNumber(this.game.state.totalClicks));
    Utils.updateElement('best-streak', Utils.formatNumber(this.game.state.bestStreak));
    Utils.updateElement('achievement-count', this.game.state.achievements.length);
    Utils.updateElement('current-theme', VISUAL_THEMES[this.game.state.currentVisualTheme].name);
    
    // Update prestige display
    if (this.game.state.prestigeLevel > 0) {
      Utils.showElement('prestige-display');
      Utils.addClass('prestige-display', 'active');
      Utils.updateElement('prestige-level', this.game.state.prestigeLevel);
      Utils.updateElement('prestige-multiplier', this.game.state.prestigeMultiplier.toFixed(1));
    }
  }

  updateBoostDisplay() {
    const boostDisplay = Utils.getElement('boost-display');
    const boostList = Utils.getElement('boost-list');
    
    if (this.game.state.activeBoosts.length > 0) {
      Utils.showElement('boost-display');
      boostList.innerHTML = '';
      
      const now = Date.now();
      this.game.state.activeBoosts.forEach(boost => {
        const timeLeft = Math.ceil((boost.endTime - now) / 1000);
        if (timeLeft > 0) {
          const div = document.createElement('div');
          div.className = 'boost-item';
          div.textContent = `${boost.name} (${timeLeft}s)`;
          boostList.appendChild(div);
        }
      });
    } else {
      Utils.hideElement('boost-display');
    }
  }

  updateChallengeDisplay() {
    const challengeDisplay = Utils.getElement('challenge-display');
    
    if (this.game.state.currentChallenge) {
      const now = Date.now();
      const timeLeft = Math.ceil((this.game.state.currentChallenge.endTime - now) / 1000);
      
      if (timeLeft > 0) {
        Utils.showElement('challenge-display');
        Utils.updateElement('challenge-text', this.game.state.currentChallenge.desc);
        Utils.updateElement('challenge-progress', 
          `Progress: ${this.game.state.currentChallenge.progress}/${this.game.state.currentChallenge.target} (${timeLeft}s)`
        );
        
        if (this.game.state.currentChallenge.progress >= this.game.state.currentChallenge.target) {
          this.game.state.money += this.game.state.currentChallenge.reward;
          Utils.showNotification(`Challenge completed! +${Utils.formatNumber(this.game.state.currentChallenge.reward)} coins`, 'achievement');
          this.game.state.currentChallenge = null;
        }
      } else {
        Utils.showNotification('Challenge failed!', 'notification');
        this.game.state.currentChallenge = null;
        Utils.hideElement('challenge-display');
      }
    } else {
      Utils.hideElement('challenge-display');
    }
  }

  updateSoundButton() {
    const btn = Utils.getElement('sound-btn');
    btn.textContent = this.game.state.soundEnabled ? '🔊' : '🔇';
    btn.className = this.game.state.soundEnabled ? 'control-btn' : 'control-btn sound-off';
    btn.title = this.game.state.soundEnabled ? 'Disable Sound' : 'Enable Sound';
  }

  applyTheme() {
    const theme = VISUAL_THEMES[this.game.state.currentVisualTheme];
    if (theme) {
      document.body.style.background = theme.bg;
    }
  }

  cycleVisualTheme() {
    const themeKeys = Object.keys(VISUAL_THEMES);
    const currentIndex = themeKeys.indexOf(this.game.state.currentVisualTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    this.game.state.currentVisualTheme = themeKeys[nextIndex];
    
    this.applyTheme();
    Utils.showNotification(`Theme changed to ${VISUAL_THEMES[this.game.state.currentVisualTheme].name}`, 'notification');
  }

  celebrateMilestone(milestone) {
    const celebration = document.createElement('div');
    celebration.className = 'milestone-celebration';
    celebration.innerHTML = `
      <div class="milestone-content">
        <div class="milestone-title">${milestone.message}</div>
        <div class="milestone-stars">⭐⭐⭐</div>
      </div>
    `;
    
    document.body.appendChild(celebration);
    
    // Confetti effect
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 20);
    }
    
    this.game.audioManager.playCelebrationSound();
    
    setTimeout(() => celebration.remove(), 3000);
  }

  showBonusEvent(bonusAmount) {
    const bonusDiv = document.createElement('div');
    bonusDiv.className = 'bonus-event';
    bonusDiv.innerHTML = `
      <div class="bonus-event-content">
        <div class="bonus-event-title">💎 BONUS HIT! 💎</div>
        <div class="bonus-event-amount">+${Utils.formatNumber(bonusAmount)}</div>
      </div>
    `;
    
    document.getElementById('main-area').appendChild(bonusDiv);
    
    this.game.audioManager.playSound(1800, 0.2, 'bonus');
    setTimeout(() => this.game.audioManager.playSound(2000, 0.2, 'bonus'), 100);
    
    setTimeout(() => bonusDiv.remove(), 2000);
  }

  showPerfectTiming() {
    const perfect = document.createElement('div');
    perfect.className = 'perfect-timing';
    perfect.textContent = 'PERFECT!';
    
    const clicker = document.getElementById('clicker-container');
    clicker.appendChild(perfect);
    
    this.game.audioManager.playSound(1200, 0.1, 'perfect');
    
    setTimeout(() => perfect.remove(), 800);
  }

  showStreakBonus(streak, bonus) {
    const streakDiv = document.createElement('div');
    streakDiv.className = 'streak-bonus';
    streakDiv.innerHTML = `
      <div class="streak-number">${streak} STREAK!</div>
      <div class="streak-reward">+${Utils.formatNumber(bonus)}</div>
    `;
    
    document.getElementById('main-area').appendChild(streakDiv);
    
    const baseFreq = 800;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.game.audioManager.playSound(baseFreq + (i * 200), 0.1, 'streak');
      }, i * 50);
    }
    
    setTimeout(() => streakDiv.remove(), 1500);
  }

  showComboMilestone(combo) {
    const milestone = document.createElement('div');
    milestone.className = 'combo-milestone';
    milestone.textContent = `${combo} COMBO!`;
    
    document.getElementById('main-area').appendChild(milestone);
    
    this.game.audioManager.playSound(1000 + (combo * 50), 0.15, 'combo-milestone');
    
    setTimeout(() => milestone.remove(), 1000);
  }

  passiveIncomeEffects(incomePerFrame) {
    const totalBuildings = this.game.state.passiveOwned.reduce((sum, count) => sum + count, 0);
    const throttleTime = Math.min(2000, 500 + (totalBuildings * 50));
    
    if (!this.lastIncomeEffectTime || Date.now() - this.lastIncomeEffectTime > throttleTime) {
      this.lastIncomeEffectTime = Date.now();
      
      if (incomePerFrame > 1) {
        this.createIncomeParticles(incomePerFrame);
      }
      
      if (totalBuildings < 20 || Math.random() < 0.3) {
        this.pulseActiveBuildings();
      }
      
      this.checkIncomeMilestones(incomePerFrame * 60);
      
      if (!this.lastIncomeSound || Date.now() - this.lastIncomeSound > 3000) {
        if (this.game.state.soundEnabled && incomePerFrame > 10) {
          this.lastIncomeSound = Date.now();
          this.game.audioManager.playSound(200 + Math.random() * 100, 0.02, 'ambient');
        }
      }
    }
    
    const rainChance = Math.max(0.005, 0.02 - (totalBuildings * 0.001));
    if (incomePerFrame > 1000 && Math.random() < rainChance) {
      this.createMoneyRain();
    }
  }

  createIncomeParticles(amount) {
    const buildingEls = document.querySelectorAll('#buildings-container .building-display');
    
    const maxParticles = Math.min(3, buildingEls.length);
    const selectedIndices = new Set();
    
    while (selectedIndices.size < maxParticles && selectedIndices.size < buildingEls.length) {
      selectedIndices.add(Math.floor(Math.random() * buildingEls.length));
    }
    
    selectedIndices.forEach(displayIndex => {
      const buildingEl = buildingEls[displayIndex];
      if (!buildingEl) return;
      
      let buildingIndex = -1;
      let currentDisplayIndex = 0;
      
      for (let i = 0; i < PASSIVE_UPGRADES.length; i++) {
        if (this.game.state.passiveOwned[i] > 0) {
          if (currentDisplayIndex === displayIndex) {
            buildingIndex = i;
            break;
          }
          currentDisplayIndex++;
        }
      }
      
      if (buildingIndex >= 0) {
        const upgrade = PASSIVE_UPGRADES[buildingIndex];
        const baseCps = upgrade.baseCps || upgrade.cps || 0;
        const multiplier = upgrade.cpsMultiplier || 1;
        const owned = this.game.state.passiveOwned[buildingIndex];
        const buildingCps = baseCps * Math.pow(multiplier, owned - 1) * owned;
        
        if (buildingCps > 0) {
          const rect = buildingEl.getBoundingClientRect();
          const particle = document.createElement('div');
          particle.className = 'income-particle';
          particle.textContent = `+${Utils.formatNumber(buildingCps / 60)}`;
          particle.style.left = rect.left + rect.width / 2 + 'px';
          particle.style.top = rect.top - 10 + 'px';
          
          const moneyEl = document.getElementById('money-text');
          const moneyRect = moneyEl.getBoundingClientRect();
          const deltaX = moneyRect.left - rect.left;
          particle.style.setProperty('--target-x', deltaX + 'px');
          
          document.body.appendChild(particle);
          setTimeout(() => particle.remove(), 2000);
        }
      }
    });
  }

  pulseActiveBuildings() {
    document.querySelectorAll('#buildings-container .building-display').forEach((el) => {
      el.classList.add('building-pulse');
      setTimeout(() => el.classList.remove('building-pulse'), 500);
    });
  }

  createMoneyRain() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const coin = document.createElement('div');
        coin.className = 'money-rain';
        coin.innerHTML = '💰';
        coin.style.left = Math.random() * window.innerWidth + 'px';
        coin.style.fontSize = (20 + Math.random() * 20) + 'px';
        document.body.appendChild(coin);
        setTimeout(() => coin.remove(), 3000);
      }, i * 200);
    }
  }

  checkIncomeMilestones(cps) {
    const milestones = [
      { amount: 10, message: "10/sec!" },
      { amount: 100, message: "100/sec!" },
      { amount: 1000, message: "1K/sec!" },
      { amount: 10000, message: "10K/sec!" },
      { amount: 100000, message: "100K/sec!" },
      { amount: 1000000, message: "1M/sec!" },
      { amount: 1000000000, message: "1B/sec!" },
      { amount: 1000000000000, message: "1T/sec!" }
    ];
    
    milestones.forEach(milestone => {
      const key = `income_milestone_${milestone.amount}`;
      if (cps >= milestone.amount && !this.game.state.achievedMilestones.includes(key)) {
        this.game.state.achievedMilestones.push(key);
        
        const celebration = document.createElement('div');
        celebration.className = 'income-milestone-celebration';
        celebration.textContent = milestone.message;
        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 2000);
        
        this.game.audioManager.playCelebrationSound();
        
        if (milestone.amount >= 1000000) {
          this.createMoneyRain();
          for (let i = 0; i < 10; i++) {
            setTimeout(() => this.createMoneyRain(), i * 500);
          }
        }
      }
    });
  }
}