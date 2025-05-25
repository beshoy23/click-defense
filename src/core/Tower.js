import { GAME_CONFIG, TOWER_UPGRADES, ABILITY_UPGRADES } from '../config/gameConfig.js';
import { Projectile } from './Projectile.js';

export class Tower {
  constructor(game) {
    this.game = game;
    
    // Base stats
    this.damage = GAME_CONFIG.INITIAL_DAMAGE;
    this.fireRate = GAME_CONFIG.INITIAL_FIRE_RATE;
    this.range = GAME_CONFIG.INITIAL_RANGE;
    
    // Upgrades
    this.upgradeLevels = {};
    TOWER_UPGRADES.forEach(upgrade => {
      this.upgradeLevels[upgrade.id] = 0;
    });
    ABILITY_UPGRADES.forEach(upgrade => {
      this.upgradeLevels[upgrade.id] = 0;
    });
    
    // Abilities
    this.piercing = 0;
    this.multishot = 1;
    this.explosive = false;
    this.freezeChance = 0;
    this.autoCollect = false;
    
    // Position
    this.element = document.getElementById('tower');
    const arena = document.getElementById('game-arena');
    const rect = arena.getBoundingClientRect();
    this.x = rect.width / 2;
    this.y = rect.height / 2;
    
    // Shooting
    this.lastShotTime = 0;
    this.canShoot = true;
  }
  
  handleClick(clickX, clickY) {
    const now = Date.now();
    const cooldown = 1000 / this.fireRate;
    
    if (now - this.lastShotTime < cooldown) {
      return; // Still on cooldown
    }
    
    this.lastShotTime = now;
    this.shoot(clickX, clickY);
    
    // Animate tower
    this.element.classList.add('shooting');
    setTimeout(() => this.element.classList.remove('shooting'), 100);
  }
  
  shoot(targetX, targetY) {
    // Find nearest enemy if not clicking on one
    const nearestEnemy = this.findNearestEnemy();
    if (nearestEnemy) {
      const enemyPos = nearestEnemy.getPosition();
      targetX = enemyPos.x;
      targetY = enemyPos.y;
    }
    
    // Multishot
    if (this.multishot > 1) {
      const angleStep = GAME_CONFIG.MULTISHOT_ANGLE;
      const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);
      
      for (let i = 0; i < this.multishot; i++) {
        const offset = (i - (this.multishot - 1) / 2) * angleStep;
        const angle = baseAngle + (offset * Math.PI / 180);
        
        const newTargetX = this.x + Math.cos(angle) * 1000;
        const newTargetY = this.y + Math.sin(angle) * 1000;
        
        this.createProjectile(newTargetX, newTargetY);
      }
    } else {
      this.createProjectile(targetX, targetY);
    }
    
    // Play shoot sound
    this.game.audioManager.playShootSound();
  }
  
  createProjectile(targetX, targetY) {
    const special = {
      explosive: this.explosive,
      freeze: this.freezeChance > 0
    };
    
    new Projectile(
      this.game,
      this.x,
      this.y,
      targetX,
      targetY,
      this.damage,
      this.piercing,
      special
    );
  }
  
  findNearestEnemy() {
    let nearest = null;
    let minDistance = this.range;
    
    for (const enemy of this.game.enemies) {
      const enemyPos = enemy.getPosition();
      const dx = enemyPos.x - this.x;
      const dy = enemyPos.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }
    
    return nearest;
  }
  
  upgrade(upgradeId) {
    // Find upgrade in both lists
    let upgradeData = TOWER_UPGRADES.find(u => u.id === upgradeId) || 
                     ABILITY_UPGRADES.find(u => u.id === upgradeId);
    
    if (!upgradeData) return false;
    
    const currentLevel = this.upgradeLevels[upgradeId] || 0;
    if (upgradeData.maxLevel && currentLevel >= upgradeData.maxLevel) {
      return false; // Max level reached
    }
    
    const cost = this.getUpgradeCost(upgradeData, currentLevel);
    if (this.game.money < cost) {
      return false; // Can't afford
    }
    
    // Purchase upgrade
    this.game.money -= cost;
    this.upgradeLevels[upgradeId] = currentLevel + 1;
    
    // Apply effects
    this.applyUpgrade(upgradeData);
    
    return true;
  }
  
  applyUpgrade(upgrade) {
    const effect = upgrade.effect;
    
    if (effect.damage) this.damage += effect.damage;
    if (effect.fireRate) this.fireRate += effect.fireRate;
    if (effect.range) this.range += effect.range;
    if (effect.piercing) this.piercing += effect.piercing;
    if (effect.shots) this.multishot = effect.shots;
    if (effect.explosive) this.explosive = true;
    if (effect.freezeChance) this.freezeChance += effect.freezeChance;
    if (effect.autoCollect) this.autoCollect = true;
  }
  
  getUpgradeCost(upgrade, currentLevel) {
    return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
  }
  
  update(deltaTime) {
    // Auto-collect coins if enabled
    if (this.autoCollect) {
      const coins = document.querySelectorAll('.coin-drop');
      coins.forEach(coin => {
        const rect = coin.getBoundingClientRect();
        const arenaRect = document.getElementById('game-arena').getBoundingClientRect();
        const coinX = rect.left - arenaRect.left + rect.width / 2;
        const coinY = rect.top - arenaRect.top + rect.height / 2;
        
        const dx = this.x - coinX;
        const dy = this.y - coinY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) { // Auto-collect range
          coin.style.transition = 'all 0.3s ease-out';
          coin.style.left = this.x + 'px';
          coin.style.top = this.y + 'px';
          coin.style.transform = 'scale(0)';
          
          setTimeout(() => {
            this.game.collectCoin(parseInt(coin.dataset.value));
            coin.remove();
          }, 300);
        }
      });
    }
  }
}