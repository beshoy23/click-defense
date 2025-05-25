import { CONFIG } from '../config/constants.js';
import { CLICK_UPGRADES, PASSIVE_UPGRADES, BOOST_TYPES } from '../config/upgrades.js';
import { CHARACTERS } from '../config/characters.js';
import { Utils } from '../utils/utils.js';

export class UpgradeManager {
  constructor(game) {
    this.game = game;
  }

  initializePanel() {
    this.renderClickUpgrades();
    this.renderAutoUpgrades();
    this.renderBuildingsDisplay();
  }

  switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update containers
    document.querySelectorAll('.upgrade-container').forEach(container => {
      container.classList.toggle('active', container.id === `${tab}-upgrades`);
    });
    
    // Update stats display
    if (tab === 'auto') {
      this.updateAutomationStats();
    }
  }

  renderClickUpgrades() {
    const container = document.getElementById('click-upgrades');
    container.innerHTML = '';
    
    CLICK_UPGRADES.forEach((upgrade, index) => {
      const cost = this.getClickUpgradeCost(index);
      const owned = this.game.state.clickOwned[index] || 0;
      const affordable = this.game.state.money >= cost;
      
      const upgradeEl = document.createElement('div');
      upgradeEl.className = `upgrade-item ${affordable ? 'affordable' : 'locked'}`;
      
      const progress = Math.min(100, (this.game.state.money / cost) * 100);
      
      upgradeEl.innerHTML = `
        <div class="upgrade-header">
          <div class="upgrade-icon">${upgrade.icon}</div>
          <div class="upgrade-info">
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-effect">${upgrade.description}</div>
            <div class="upgrade-cost">Cost: ${Utils.formatNumber(cost)}</div>
          </div>
        </div>
        ${owned > 0 ? `<div class="upgrade-owned">${owned}</div>` : ''}
        <div class="upgrade-progress">
          <div class="upgrade-progress-fill" style="width: ${progress}%"></div>
        </div>
      `;
      
      if (affordable) {
        upgradeEl.onclick = () => this.buyClickUpgrade(index);
      }
      
      container.appendChild(upgradeEl);
    });
  }

  renderAutoUpgrades() {
    const container = document.getElementById('auto-upgrades');
    container.innerHTML = '';
    
    // Add milestone if no automation yet
    if (this.game.state.totalCPS === 0) {
      const milestone = document.createElement('div');
      milestone.className = 'automation-milestone';
      milestone.innerHTML = `
        <div class="milestone-title">🎯 First Step to Automation</div>
        <div class="milestone-desc">Buy your first Auto Clicker to start earning while idle!</div>
      `;
      container.appendChild(milestone);
    }
    
    PASSIVE_UPGRADES.forEach((upgrade, index) => {
      const cost = this.getPassiveUpgradeCost(index);
      const owned = this.game.state.passiveOwned[index] || 0;
      const affordable = this.game.state.money >= cost;
      
      const upgradeEl = document.createElement('div');
      upgradeEl.className = `upgrade-item ${affordable ? 'affordable' : 'locked'} ${owned > 0 ? 'owned' : ''}`;
      
      const progress = Math.min(100, (this.game.state.money / cost) * 100);
      
      // Calculate CPS for this building
      const baseCps = upgrade.baseCps || upgrade.cps || 0;
      const multiplier = upgrade.cpsMultiplier || 1;
      const nextCps = owned > 0 ? baseCps * Math.pow(multiplier, owned) : baseCps;
      
      // Add specific icon classes for animations
      const iconClasses = {
        'Auto Clicker': 'auto-clicker-icon',
        'Pasta Factory': 'pasta-factory-icon',
        'Kebab Stand': 'kebab-icon'
      };
      const iconClass = iconClasses[upgrade.name] || '';
      
      upgradeEl.innerHTML = `
        <div class="upgrade-header">
          <div class="upgrade-icon ${iconClass}">${upgrade.icon}</div>
          <div class="upgrade-info">
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-effect">${upgrade.description}</div>
            <div class="upgrade-effect" style="color: var(--success);">+${Utils.formatNumber(nextCps)} /sec</div>
            <div class="upgrade-cost">Cost: ${Utils.formatNumber(cost)}</div>
          </div>
        </div>
        ${owned > 0 ? `<div class="upgrade-owned">${owned}</div>` : ''}
        <div class="upgrade-progress">
          <div class="upgrade-progress-fill" style="width: ${progress}%"></div>
        </div>
      `;
      
      if (affordable) {
        upgradeEl.onclick = () => this.buyPassiveUpgrade(index);
      }
      
      container.appendChild(upgradeEl);
    });
  }

  renderBuildingsDisplay() {
    const container = document.getElementById('buildings-container');
    container.innerHTML = '';
    
    PASSIVE_UPGRADES.forEach((upgrade, index) => {
      const owned = this.game.state.passiveOwned[index] || 0;
      if (owned > 0) {
        const buildingEl = document.createElement('div');
        buildingEl.className = 'building-display';
        
        // Calculate production
        const baseCps = upgrade.baseCps || upgrade.cps || 0;
        const multiplier = upgrade.cpsMultiplier || 1;
        const buildingCps = baseCps * Math.pow(multiplier, owned - 1) * owned;
        
        // Icon classes
        const iconClasses = {
          'Auto Clicker': 'auto-clicker-icon',
          'Pasta Factory': 'pasta-factory-icon',
          'Kebab Stand': 'kebab-icon',
          'Pizza Empire': 'pizza-icon',
          'Food Truck Fleet': 'truck-icon'
        };
        const iconClass = iconClasses[upgrade.name] || '';
        
        buildingEl.innerHTML = `
          <div class="building-icon ${iconClass}">${upgrade.icon}</div>
          <div class="building-count">${owned}</div>
          <div class="building-production">${Utils.formatNumber(buildingCps)}/s</div>
        `;
        
        container.appendChild(buildingEl);
      }
    });
  }

  buyClickUpgrade(index) {
    const cost = this.getClickUpgradeCost(index);
    if (this.game.state.money >= cost) {
      this.game.state.money -= cost;
      if (!this.game.state.clickOwned[index]) {
        this.game.state.clickOwned[index] = 0;
      }
      this.game.state.clickOwned[index]++;
      this.recalculateStats();
      this.game.audioManager.playPurchaseSound();
      this.game.saveManager.save();
      this.game.uiManager.updateAll();
      this.renderClickUpgrades();
      this.game.achievementManager.check();
    }
  }

  buyPassiveUpgrade(index) {
    const cost = this.getPassiveUpgradeCost(index);
    if (this.game.state.money >= cost) {
      this.game.state.money -= cost;
      if (!this.game.state.passiveOwned[index]) {
        this.game.state.passiveOwned[index] = 0;
      }
      this.game.state.passiveOwned[index]++;
      this.recalculateStats();
      this.game.audioManager.playPurchaseSound();
      this.game.saveManager.save();
      this.game.uiManager.updateAll();
      this.renderAutoUpgrades();
      this.renderBuildingsDisplay();
      this.updateAutomationStats();
      this.game.achievementManager.check();
      
      // Show milestone messages
      if (this.game.state.totalCPS > 0 && this.game.state.passiveOwned.reduce((a, b) => a + b, 0) === 1) {
        Utils.showNotification('🎉 Automation begins! You now earn money while idle!', 'achievement');
      }
    }
  }

  getClickUpgradeCost(index) {
    const upgrade = CLICK_UPGRADES[index];
    const ownedCount = this.game.state.clickOwned[index] || 0;
    const costMultiplier = 1.3 + (index * 0.05);
    return Math.ceil(upgrade.baseCost * Math.pow(costMultiplier, ownedCount));
  }

  getPassiveUpgradeCost(index) {
    const upgrade = PASSIVE_UPGRADES[index];
    const ownedCount = this.game.state.passiveOwned[index] || 0;
    const costMultiplier = upgrade.cpsMultiplier || 1.15;
    return Math.ceil(upgrade.baseCost * Math.pow(costMultiplier, ownedCount));
  }

  updateAutomationStats() {
    const actualCPS = this.calculateActualCPS();
    document.getElementById('panel-cps').textContent = `${Utils.formatNumber(actualCPS)} /sec`;
    
    if (!this.game.sessionStartEarnings) {
      this.game.sessionStartEarnings = this.game.state.lifetimeEarnings;
    }
    const sessionEarnings = this.game.state.lifetimeEarnings - this.game.sessionStartEarnings;
    document.getElementById('session-earnings').textContent = Utils.formatNumber(sessionEarnings);
  }

  calculateActualCPS() {
    const multipliers = this.game.getActiveMultipliers();
    let actualCPS = this.game.state.totalCPS * multipliers.cpsMult * multipliers.incomeMult;
    actualCPS *= this.game.state.globalMultiplier;
    actualCPS *= this.game.state.prestigeMultiplier;
    actualCPS *= Math.pow(this.game.state.exponentialGrowthRate, Math.floor(this.game.state.totalClicks / 100));
    return actualCPS;
  }

  recalculateStats() {
    // Reset to base values
    this.game.state.baseClickPower = 1;
    this.game.state.clickMultiplier = 1;
    this.game.state.criticalChance = 0;
    this.game.state.meterFillBonus = 0;
    
    // Apply character bonuses
    const character = this.game.characterManager.getCurrentCharacter();
    if (character && character.bonus) {
      if (character.bonus.clickBonus) {
        this.game.state.baseClickPower += character.bonus.clickBonus;
      }
      if (character.bonus.critChance) {
        this.game.state.criticalChance += character.bonus.critChance;
      }
      if (character.bonus.meterBonus) {
        this.game.state.meterFillBonus += character.bonus.meterBonus;
      }
    }
    
    // Apply click upgrades
    CLICK_UPGRADES.forEach((upgrade, index) => {
      const count = this.game.state.clickOwned[index] || 0;
      if (count > 0) {
        if (upgrade.clickBonus) {
          this.game.state.baseClickPower += upgrade.clickBonus * count;
        }
        if (upgrade.multiplier) {
          this.game.state.clickMultiplier += upgrade.multiplier * count;
        }
        if (upgrade.critChance) {
          this.game.state.criticalChance += upgrade.critChance * count;
        }
        if (upgrade.meterBonus) {
          this.game.state.meterFillBonus += upgrade.meterBonus * count;
        }
        if (upgrade.expMultiplier) {
          this.game.state.exponentialGrowthRate += upgrade.expMultiplier * count;
        }
      }
    });
    
    // Calculate passive income with exponential scaling
    this.game.state.totalCPS = 0;
    PASSIVE_UPGRADES.forEach((upgrade, index) => {
      const count = this.game.state.passiveOwned[index] || 0;
      if (count > 0) {
        const baseCps = upgrade.baseCps || upgrade.cps || 0;
        const multiplier = upgrade.cpsMultiplier || 1;
        const buildingCps = baseCps * Math.pow(multiplier, count - 1) * count;
        this.game.state.totalCPS += buildingCps;
      }
    });
  }

  updateUpgradeProgress() {
    const progressContainer = Utils.getElement('upgrade-progress-container');
    const progressFill = Utils.getElement('upgrade-progress-fill');
    const progressText = Utils.getElement('upgrade-progress-text');
    
    if (this.game.state.pendingUpgrade || this.game.state.money < 10) {
      Utils.hideElement('upgrade-progress-container');
      return;
    }
    
    Utils.showElement('upgrade-progress-container');
    
    const progress = Math.min(100, (this.game.state.money / this.game.state.nextUpgradeCost) * 100);
    progressFill.style.width = progress + '%';
    progressText.textContent = `${Math.floor(progress)}%`;
    
    if (progress >= 100 && !this.game.state.pendingUpgrade) {
      this.game.state.pendingUpgrade = true;
      this.showUpgradeChoices();
    }
  }

  getRandomUpgrades(count = CONFIG.UPGRADE_CHOICES_COUNT) {
    const allUpgrades = [];
    
    // Add click upgrades
    CLICK_UPGRADES.forEach((upgrade, index) => {
      const cost = this.getClickUpgradeCost(index);
      if (cost <= this.game.state.money * 1.5) {
        allUpgrades.push({
          type: 'click',
          index: index,
          upgrade: upgrade,
          cost: cost,
          owned: this.game.state.clickOwned[index] || 0
        });
      }
    });
    
    // Add passive upgrades
    PASSIVE_UPGRADES.forEach((upgrade, index) => {
      const cost = this.getPassiveUpgradeCost(index);
      if (cost <= this.game.state.money * 1.5) {
        allUpgrades.push({
          type: 'passive',
          index: index,
          upgrade: upgrade,
          cost: cost,
          owned: this.game.state.passiveOwned[index] || 0
        });
      }
    });
    
    // Add boost options
    BOOST_TYPES.forEach((boost, index) => {
      if (boost.cost <= this.game.state.money * 1.2) {
        allUpgrades.push({
          type: 'boost',
          index: index,
          upgrade: {
            name: boost.name,
            description: `${boost.effect === 'income' ? boost.multiplier + 'x Income' : 
                          boost.effect === 'click' ? boost.multiplier + 'x Click Power' :
                          boost.effect === 'cps' ? boost.multiplier + 'x CPS' :
                          'Golden Click Rain'} for ${boost.duration/1000}s`,
            icon: boost.icon
          },
          cost: boost.cost,
          owned: 0,
          boost: boost
        });
      }
    });
    
    const shuffled = Utils.shuffle(allUpgrades);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  showUpgradeChoices() {
    const overlay = Utils.getElement('upgrade-modal-overlay');
    const choicesContainer = Utils.getElement('upgrade-choices');
    
    const choices = this.getRandomUpgrades();
    
    if (choices.length === 0) {
      this.game.state.pendingUpgrade = false;
      return;
    }
    
    choicesContainer.innerHTML = '';
    
    choices.forEach(choice => {
      const div = document.createElement('div');
      div.className = 'upgrade-choice';
      
      div.innerHTML = `
        <div class="upgrade-choice-icon">${choice.upgrade.icon}</div>
        <div class="upgrade-choice-name">${choice.upgrade.name}</div>
        <div class="upgrade-choice-effect">${choice.upgrade.description || ''}</div>
        <div class="upgrade-choice-cost">Cost: ${Utils.formatNumber(choice.cost)} coins</div>
        ${choice.owned > 0 ? `<div style="color: #666; font-size: 11px;">Owned: ${choice.owned}</div>` : ''}
      `;
      
      div.onclick = null;
      choicesContainer.appendChild(div);
    });
    
    overlay.style.display = 'block';
    
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
        this.game.state.pendingUpgrade = false;
      }
    };
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        overlay.style.display = 'none';
        this.game.state.pendingUpgrade = false;
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    setTimeout(() => {
      const choiceDivs = choicesContainer.querySelectorAll('.upgrade-choice');
      choiceDivs.forEach((div, index) => {
        setTimeout(() => {
          div.classList.add('ready');
          div.onclick = () => this.selectUpgrade(choices[index]);
        }, index * 100);
      });
    }, 800);
    
    this.game.audioManager.playSound(1500, 0.2, 'upgrade');
  }

  selectUpgrade(choice) {
    if (this.game.state.money >= choice.cost) {
      this.game.state.money -= choice.cost;
      
      if (choice.type === 'click') {
        if (!this.game.state.clickOwned[choice.index]) {
          this.game.state.clickOwned[choice.index] = 0;
        }
        this.game.state.clickOwned[choice.index]++;
      } else if (choice.type === 'passive') {
        if (!this.game.state.passiveOwned[choice.index]) {
          this.game.state.passiveOwned[choice.index] = 0;
        }
        this.game.state.passiveOwned[choice.index]++;
      } else if (choice.type === 'boost') {
        this.activateBoost(choice.index);
      }
      
      this.recalculateStats();
      this.game.audioManager.playPurchaseSound();
      this.game.saveManager.save();
      
      Utils.showNotification(`Purchased ${choice.upgrade.name}!`, 'achievement');
      Utils.hideElement('upgrade-modal-overlay');
      
      this.game.state.pendingUpgrade = false;
      this.game.state.lastUpgradeTime = Date.now();
      this.game.state.nextUpgradeCost = Math.ceil(this.game.state.nextUpgradeCost * CONFIG.UPGRADE_COST_MULTIPLIER);
      
      this.game.achievementManager.check();
    }
  }

  activateBoost(index) {
    const boost = BOOST_TYPES[index];
    const boostData = {
      ...boost,
      startTime: Date.now(),
      endTime: Date.now() + boost.duration
    };
    
    this.game.state.activeBoosts.push(boostData);
    
    if (boost.effect === 'golden') {
      this.game.state.goldenClickActive = true;
      Utils.showElement('golden-click-indicator');
      setTimeout(() => {
        this.game.state.goldenClickActive = false;
        Utils.hideElement('golden-click-indicator');
      }, boost.duration);
    }
  }
}