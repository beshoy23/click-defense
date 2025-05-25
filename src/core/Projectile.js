import { GAME_CONFIG, EFFECTS } from '../config/gameConfig.js';

export class Projectile {
  constructor(game, startX, startY, targetX, targetY, damage, piercing = 0, special = {}) {
    this.game = game;
    this.id = `proj_${Date.now()}_${Math.random()}`;
    
    this.x = startX;
    this.y = startY;
    this.damage = damage;
    this.piercing = piercing;
    this.special = special; // { explosive: bool, freeze: bool }
    
    // Calculate velocity
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.vx = (dx / distance) * GAME_CONFIG.PROJECTILE_SPEED;
    this.vy = (dy / distance) * GAME_CONFIG.PROJECTILE_SPEED;
    
    this.enemiesHit = new Set();
    this.element = null;
    
    this.createDOM();
  }
  
  createDOM() {
    this.element = document.createElement('div');
    this.element.className = 'projectile';
    this.element.id = this.id;
    
    if (this.special.explosive) {
      this.element.style.background = 'radial-gradient(circle, #ff0000, #ff6600)';
      this.element.style.boxShadow = '0 0 20px #ff0000';
    } else if (this.special.freeze) {
      this.element.style.background = 'radial-gradient(circle, #00ffff, #0066ff)';
      this.element.style.boxShadow = '0 0 20px #00ffff';
    }
    
    this.updatePosition();
    document.getElementById('game-arena').appendChild(this.element);
  }
  
  update(deltaTime) {
    // Move projectile
    this.x += this.vx * (deltaTime / 1000);
    this.y += this.vy * (deltaTime / 1000);
    this.updatePosition();
    
    // Check bounds
    const arena = document.getElementById('game-arena');
    const rect = arena.getBoundingClientRect();
    
    if (this.x < -50 || this.x > rect.width + 50 || 
        this.y < -50 || this.y > rect.height + 50) {
      this.destroy();
      return;
    }
    
    // Check enemy collisions
    this.checkCollisions();
  }
  
  updatePosition() {
    if (this.element) {
      this.element.style.left = this.x + 'px';
      this.element.style.top = this.y + 'px';
    }
  }
  
  checkCollisions() {
    const enemies = this.game.enemies;
    
    for (const enemy of enemies) {
      if (this.enemiesHit.has(enemy.id)) continue;
      
      const enemyPos = enemy.getPosition();
      const dx = enemyPos.x - this.x;
      const dy = enemyPos.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < GAME_CONFIG.ENEMY_SIZE / 2) {
        // Hit!
        this.enemiesHit.add(enemy.id);
        
        // Apply damage
        const killed = enemy.takeDamage(this.damage);
        
        // Show damage number
        if (EFFECTS.DAMAGE_NUMBERS) {
          this.game.showDamageNumber(enemyPos.x, enemyPos.y, this.damage);
        }
        
        // Apply special effects
        if (this.special.freeze && Math.random() < this.game.tower.freezeChance) {
          enemy.freeze(GAME_CONFIG.FREEZE_DURATION);
        }
        
        if (this.special.explosive) {
          this.explode();
          return;
        }
        
        // Check piercing
        if (this.piercing <= 0 || this.enemiesHit.size > this.piercing) {
          this.destroy();
          return;
        }
      }
    }
  }
  
  explode() {
    // Create explosion effect
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.cssText = `
      position: absolute;
      left: ${this.x}px;
      top: ${this.y}px;
      width: ${GAME_CONFIG.EXPLOSIVE_RADIUS * 2}px;
      height: ${GAME_CONFIG.EXPLOSIVE_RADIUS * 2}px;
      background: radial-gradient(circle, rgba(255,255,0,0.8), rgba(255,0,0,0.4), transparent);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: explode 0.4s ease-out forwards;
      pointer-events: none;
      z-index: 100;
    `;
    
    document.getElementById('game-arena').appendChild(explosion);
    setTimeout(() => explosion.remove(), 400);
    
    // Damage nearby enemies
    const enemies = this.game.enemies;
    for (const enemy of enemies) {
      const enemyPos = enemy.getPosition();
      const dx = enemyPos.x - this.x;
      const dy = enemyPos.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < GAME_CONFIG.EXPLOSIVE_RADIUS) {
        const damageFalloff = 1 - (distance / GAME_CONFIG.EXPLOSIVE_RADIUS);
        const explosiveDamage = Math.ceil(this.damage * 0.5 * damageFalloff);
        enemy.takeDamage(explosiveDamage);
        
        if (EFFECTS.DAMAGE_NUMBERS) {
          this.game.showDamageNumber(enemyPos.x, enemyPos.y, explosiveDamage);
        }
      }
    }
    
    this.destroy();
  }
  
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    this.game.removeProjectile(this);
  }
}