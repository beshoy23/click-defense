import { GAME_CONFIG, ENEMY_TYPES } from '../config/gameConfig.js';
import { Tower } from './Tower.js';
import { Enemy } from './Enemy.js';
import { AudioManager } from '../managers/AudioManager.js';
import { UIManager } from '../managers/UIManager.js';
import { UpgradeManager } from '../managers/UpgradeManager.js';
import { Utils } from '../utils/utils.js';

export class TowerDefenseGame {
  constructor() {
    // Game state
    this.money = 0;
    this.wave = 1;
    this.enemiesSpawned = 0;
    this.enemiesInWave = GAME_CONFIG.ENEMIES_PER_WAVE;
    this.towerHealth = 3;
    this.isPlaying = true;
    this.isPaused = false;
    this.lastFrameTime = Date.now();
    
    // Game objects
    this.tower = new Tower(this);
    this.enemies = [];
    this.projectiles = [];
    
    // Managers
    this.audioManager = new AudioManager(this);
    this.uiManager = new UIManager(this);
    this.upgradeManager = new UpgradeManager(this);
    
    // Timers
    this.lastSpawnTime = 0;
    this.waveStartTime = Date.now();
    
    this.init();
  }
  
  init() {
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize UI
    this.uiManager.updateAll();
    this.upgradeManager.renderUpgrades();
    
    // Start game loop
    this.gameLoop();
    
    // Start first wave
    this.startWave();
  }
  
  setupEventListeners() {
    // Click to shoot
    const arena = document.getElementById('game-arena');
    arena.addEventListener('click', (e) => {
      if (!this.isPlaying || this.isPaused) return;
      
      const rect = arena.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      this.tower.handleClick(clickX, clickY);
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      }
    });
    
    // Control buttons
    document.getElementById('sound-btn').onclick = () => this.audioManager.toggleSound();
    document.getElementById('pause-btn').onclick = () => this.togglePause();
    
    // Upgrade tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => this.upgradeManager.switchTab(btn.dataset.tab);
    });
  }
  
  gameLoop() {
    const update = () => {
      const now = Date.now();
      const deltaTime = now - this.lastFrameTime;
      this.lastFrameTime = now;
      
      if (this.isPlaying && !this.isPaused) {
        // Update game objects
        this.update(deltaTime);
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Check wave completion
        this.checkWaveComplete();
      }
      
      requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }
  
  update(deltaTime) {
    // Update tower
    this.tower.update(deltaTime);
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update(deltaTime);
    }
    
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.projectiles[i].update(deltaTime);
    }
    
    // Update UI
    this.uiManager.updateAll();
  }
  
  spawnEnemies() {
    if (this.enemiesSpawned >= this.enemiesInWave) return;
    
    const now = Date.now();
    const spawnDelay = (GAME_CONFIG.ENEMY_SPAWN_RATE * 1000) / Math.sqrt(this.wave);
    
    if (now - this.lastSpawnTime > spawnDelay) {
      this.lastSpawnTime = now;
      this.enemiesSpawned++;
      
      // Choose enemy type
      let type = 'basic';
      const rand = Math.random();
      
      for (const enemyType of ENEMY_TYPES) {
        if (enemyType.spawnChance && rand < enemyType.spawnChance) {
          type = enemyType.id;
          break;
        }
      }
      
      const enemy = new Enemy(this, type, this.wave);
      this.enemies.push(enemy);
    }
  }
  
  checkWaveComplete() {
    if (this.enemiesSpawned >= this.enemiesInWave && this.enemies.length === 0) {
      this.completeWave();
    }
  }
  
  completeWave() {
    // Wave bonus
    const waveBonus = this.wave * 10;
    this.money += waveBonus;
    
    Utils.showNotification(`Wave ${this.wave} Complete! +${waveBonus} coins`, 'success');
    
    // Next wave
    this.wave++;
    this.startWave();
  }
  
  startWave() {
    this.enemiesSpawned = 0;
    this.enemiesInWave = GAME_CONFIG.ENEMIES_PER_WAVE + Math.floor(this.wave * 2);
    this.waveStartTime = Date.now();
    
    this.uiManager.updateWave();
    Utils.showNotification(`Wave ${this.wave} Starting!`, 'warning');
  }
  
  takeDamage() {
    this.towerHealth--;
    
    // Screen shake
    Utils.shakeScreen('heavy');
    
    // Flash effect
    const arena = document.getElementById('game-arena');
    arena.style.animation = 'flash 0.2s';
    setTimeout(() => arena.style.animation = '', 200);
    
    if (this.towerHealth <= 0) {
      this.gameOver();
    } else {
      Utils.showNotification(`Tower damaged! ${this.towerHealth} HP left`, 'danger');
    }
  }
  
  gameOver() {
    this.isPlaying = false;
    
    // Show game over screen
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('waves-survived').textContent = this.wave - 1;
    document.getElementById('coins-earned').textContent = this.money;
    
    // Clear enemies
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];
  }
  
  restart() {
    // Reset game state
    this.money = 0;
    this.wave = 1;
    this.enemiesSpawned = 0;
    this.towerHealth = 3;
    this.isPlaying = true;
    this.isPaused = false;
    
    // Reset tower
    this.tower = new Tower(this);
    
    // Clear objects
    this.enemies.forEach(enemy => enemy.destroy());
    this.projectiles.forEach(proj => proj.destroy());
    this.enemies = [];
    this.projectiles = [];
    
    // Clear coins
    document.querySelectorAll('.coin-drop').forEach(coin => coin.remove());
    
    // Hide game over
    document.getElementById('game-over').style.display = 'none';
    
    // Update UI
    this.uiManager.updateAll();
    this.upgradeManager.renderUpgrades();
    
    // Start new game
    this.startWave();
  }
  
  togglePause() {
    this.isPaused = !this.isPaused;
    document.getElementById('pause-btn').textContent = this.isPaused ? '▶️' : '⏸️';
    
    if (this.isPaused) {
      Utils.showNotification('Game Paused', 'info');
    }
  }
  
  spawnCoin(x, y, value) {
    const coin = document.createElement('div');
    coin.className = 'coin-drop';
    coin.innerHTML = '🪙';
    coin.style.left = x + 'px';
    coin.style.top = y + 'px';
    coin.dataset.value = value;
    
    // Click to collect
    coin.onclick = () => {
      this.collectCoin(value);
      coin.style.transition = 'all 0.2s ease-out';
      coin.style.transform = 'scale(0)';
      setTimeout(() => coin.remove(), 200);
    };
    
    document.getElementById('game-arena').appendChild(coin);
    
    // Auto-remove after time
    setTimeout(() => {
      if (coin.parentNode) {
        coin.style.opacity = '0';
        setTimeout(() => coin.remove(), 500);
      }
    }, GAME_CONFIG.COIN_LIFETIME);
  }
  
  collectCoin(value) {
    this.money += value;
    this.audioManager.playCoinSound();
  }
  
  showDamageNumber(x, y, damage) {
    const dmg = document.createElement('div');
    dmg.className = 'damage-number';
    dmg.textContent = damage;
    dmg.style.left = x + 'px';
    dmg.style.top = y + 'px';
    
    document.getElementById('game-arena').appendChild(dmg);
    setTimeout(() => dmg.remove(), 1000);
  }
  
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }
  
  removeProjectile(projectile) {
    const index = this.projectiles.indexOf(projectile);
    if (index > -1) {
      this.projectiles.splice(index, 1);
    }
  }
}

// Add explosion animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes explode {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  }
  
  @keyframes flash {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(255,0,0,0.3); }
  }
`;
document.head.appendChild(style);

// Start game when DOM loads
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new TowerDefenseGame();
  });
}