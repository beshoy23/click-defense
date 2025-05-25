import { GAME_CONFIG, ENEMY_TYPES } from '../config/gameConfig.js';

export class Enemy {
  constructor(game, type = 'basic', waveNumber = 1) {
    this.game = game;
    this.type = ENEMY_TYPES.find(t => t.id === type) || ENEMY_TYPES[0];
    this.id = `enemy_${Date.now()}_${Math.random()}`;
    
    // Calculate stats based on wave
    const waveMultiplier = Math.pow(GAME_CONFIG.WAVE_MULTIPLIER, waveNumber - 1);
    this.maxHealth = GAME_CONFIG.INITIAL_ENEMY_HEALTH * this.type.healthMultiplier * waveMultiplier;
    this.health = this.maxHealth;
    this.speed = GAME_CONFIG.INITIAL_ENEMY_SPEED * this.type.speedMultiplier * waveMultiplier;
    this.coinValue = GAME_CONFIG.COINS_PER_ENEMY * this.type.coinMultiplier * Math.ceil(waveNumber / 5);
    
    // Position - spawn from random edge
    this.spawnFromEdge();
    
    // Status
    this.frozen = false;
    this.freezeEndTime = 0;
    this.element = null;
    
    this.createDOM();
  }
  
  spawnFromEdge() {
    const arena = document.getElementById('game-arena');
    const rect = arena.getBoundingClientRect();
    const side = Math.floor(Math.random() * 4);
    
    switch(side) {
      case 0: // top
        this.x = Math.random() * rect.width;
        this.y = -GAME_CONFIG.ENEMY_SIZE;
        break;
      case 1: // right
        this.x = rect.width + GAME_CONFIG.ENEMY_SIZE;
        this.y = Math.random() * rect.height;
        break;
      case 2: // bottom
        this.x = Math.random() * rect.width;
        this.y = rect.height + GAME_CONFIG.ENEMY_SIZE;
        break;
      case 3: // left
        this.x = -GAME_CONFIG.ENEMY_SIZE;
        this.y = Math.random() * rect.height;
        break;
    }
  }
  
  createDOM() {
    this.element = document.createElement('div');
    this.element.className = 'enemy';
    this.element.id = this.id;
    this.element.style.background = `radial-gradient(circle, ${this.type.color}, ${this.darkenColor(this.type.color)})`;
    this.element.style.width = GAME_CONFIG.ENEMY_SIZE + 'px';
    this.element.style.height = GAME_CONFIG.ENEMY_SIZE + 'px';
    this.updatePosition();
    
    document.getElementById('game-arena').appendChild(this.element);
  }
  
  update(deltaTime) {
    if (this.frozen && Date.now() < this.freezeEndTime) {
      return;
    } else if (this.frozen) {
      this.frozen = false;
      this.element.style.filter = '';
    }
    
    // Move towards tower
    const arena = document.getElementById('game-arena');
    const rect = arena.getBoundingClientRect();
    const towerX = rect.width / 2;
    const towerY = rect.height / 2;
    
    const dx = towerX - this.x;
    const dy = towerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const moveDistance = this.speed * (deltaTime / 1000);
      this.x += (dx / distance) * moveDistance;
      this.y += (dy / distance) * moveDistance;
      this.updatePosition();
    }
    
    // Check if reached tower
    if (distance < 40) {
      this.game.takeDamage();
      this.destroy();
    }
  }
  
  updatePosition() {
    if (this.element) {
      this.element.style.left = this.x + 'px';
      this.element.style.top = this.y + 'px';
    }
  }
  
  takeDamage(damage) {
    this.health -= damage;
    
    if (this.element) {
      this.element.classList.add('hit');
      setTimeout(() => this.element.classList.remove('hit'), 200);
    }
    
    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }
  
  freeze(duration) {
    this.frozen = true;
    this.freezeEndTime = Date.now() + duration;
    if (this.element) {
      this.element.style.filter = 'hue-rotate(180deg) brightness(1.5)';
    }
  }
  
  die() {
    // Drop coins
    if (Math.random() < GAME_CONFIG.COIN_DROP_CHANCE) {
      this.game.spawnCoin(this.x, this.y, this.coinValue);
    }
    
    // Death animation
    if (this.element) {
      this.element.style.transition = 'all 0.3s ease-out';
      this.element.style.transform = 'scale(0) rotate(180deg)';
      this.element.style.opacity = '0';
    }
    
    setTimeout(() => this.destroy(), 300);
  }
  
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    this.game.removeEnemy(this);
  }
  
  getPosition() {
    return { x: this.x + GAME_CONFIG.ENEMY_SIZE / 2, y: this.y + GAME_CONFIG.ENEMY_SIZE / 2 };
  }
  
  darkenColor(color) {
    // Simple color darkening
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `#${Math.floor(r * 0.7).toString(16).padStart(2, '0')}${Math.floor(g * 0.7).toString(16).padStart(2, '0')}${Math.floor(b * 0.7).toString(16).padStart(2, '0')}`;
  }
}