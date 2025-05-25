import * as Phaser from '../../../node_modules/phaser/dist/phaser.esm.js';
import { Tower } from '../entities/Tower.js';
import { Enemy } from '../entities/Enemy.js';
import { Arrow } from '../entities/Arrow.js';
import { WaveManager } from '../systems/WaveManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Reset all game state
        this.enemies = [];
        this.arrows = [];
        this.gold = 100;
        this.lives = 20;
        this.wave = 0;
        this.isPlaying = false;
        this.gameStarted = false;
        this.betweenWaves = false;
        
        // Isometric settings
        this.tileWidth = 64;
        this.tileHeight = 32;
        this.mapWidth = 16;
        this.mapHeight = 16;
        
        // Camera offset to center the isometric world
        this.worldOffsetX = this.cameras.main.width / 2;
        this.worldOffsetY = 200;
    }

    create() {
        console.log('GameScene created');
        
        // Set up isometric world
        this.createIsometricWorld();
        
        // Create tower at center of map
        const towerGridX = Math.floor(this.mapWidth / 2);
        const towerGridY = Math.floor(this.mapHeight / 2);
        const towerPos = this.gridToIso(towerGridX, towerGridY);
        
        this.tower = new Tower(this, towerPos.x, towerPos.y);
        this.towerGridPos = { x: towerGridX, y: towerGridY };
        
        console.log(`Tower created at grid (${towerGridX}, ${towerGridY}) -> iso (${towerPos.x}, ${towerPos.y})`);
        
        // Initialize wave manager
        this.waveManager = new WaveManager(this);
        
        // Setup input
        this.setupInput();
        
        // Update UI with initial values
        this.updateUI();
        
        // Add start game overlay
        this.createStartScreen();
    }

    // Convert grid coordinates to isometric screen coordinates
    gridToIso(gridX, gridY) {
        const isoX = (gridX - gridY) * (this.tileWidth / 2) + this.worldOffsetX;
        const isoY = (gridX + gridY) * (this.tileHeight / 2) + this.worldOffsetY;
        return { x: isoX, y: isoY };
    }

    // Convert screen coordinates to grid coordinates
    screenToGrid(screenX, screenY) {
        // Adjust for world offset
        const x = screenX - this.worldOffsetX;
        const y = screenY - this.worldOffsetY;
        
        // Convert to grid
        const gridX = (x / (this.tileWidth / 2) + y / (this.tileHeight / 2)) / 2;
        const gridY = (y / (this.tileHeight / 2) - x / (this.tileWidth / 2)) / 2;
        
        return { x: Math.floor(gridX), y: Math.floor(gridY) };
    }

    createIsometricWorld() {
        // Create background
        const graphics = this.add.graphics();
        graphics.fillStyle(0x1a1a2e, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Create isometric tile grid
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const isoPos = this.gridToIso(x, y);
                
                const tile = this.add.image(isoPos.x, isoPos.y, 'tile');
                
                // Set depth based on isometric ordering (back to front, left to right)
                tile.setDepth((y + x) * 10);
                
                // Make edge tiles slightly darker
                if (x === 0 || y === 0 || x === this.mapWidth - 1 || y === this.mapHeight - 1) {
                    tile.setTint(0xcccccc);
                }
            }
        }
        
        // Add grid lines for better depth perception
        this.drawIsometricGrid();
    }

    drawIsometricGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x444444, 0.3);
        
        // Draw horizontal lines (along X axis)
        for (let y = 0; y <= this.mapHeight; y++) {
            const start = this.gridToIso(0, y);
            const end = this.gridToIso(this.mapWidth, y);
            graphics.lineBetween(start.x, start.y, end.x, end.y);
        }
        
        // Draw vertical lines (along Y axis)
        for (let x = 0; x <= this.mapWidth; x++) {
            const start = this.gridToIso(x, 0);
            const end = this.gridToIso(x, this.mapHeight);
            graphics.lineBetween(start.x, start.y, end.x, end.y);
        }
        
        graphics.setDepth(5);
    }

    createStartScreen() {
        // Create semi-transparent overlay
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setDepth(4000);
        
        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            'ISOMETRIC TOWER DEFENSE',
            {
                fontSize: '48px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        title.setOrigin(0.5, 0.5);
        title.setDepth(4001);
        
        // Add instructions
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Click to shoot • Press A for auto-fire',
            {
                fontSize: '20px',
                fill: '#cccccc',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        instructions.setOrigin(0.5, 0.5);
        instructions.setDepth(4001);
        
        // Add start button
        const startButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            'CLICK TO START',
            {
                fontSize: '32px',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        startButton.setOrigin(0.5, 0.5);
        startButton.setDepth(4001);
        startButton.setInteractive();
        
        // Pulse animation for start button
        this.tweens.add({
            targets: startButton,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Start game on click
        startButton.once('pointerdown', () => {
            overlay.destroy();
            title.destroy();
            instructions.destroy();
            startButton.destroy();
            this.startGame();
        });
    }

    startGame() {
        console.log('Starting game');
        this.isPlaying = true;
        this.gameStarted = true;
        this.wave = 1;
        
        // Mark wave as in progress to prevent instant completion
        this.waveManager.waveInProgress = true;
        
        // Start first wave after a short delay
        this.time.delayedCall(1500, () => {
            console.log('Starting first wave');
            this.waveManager.startWave(this.wave);
        });
    }

    setupInput() {
        // Click to shoot
        this.input.on('pointerdown', (pointer) => {
            if (!this.isPlaying || !this.gameStarted) return;
            
            const nearestEnemy = this.findNearestEnemy(this.tower.x, this.tower.y);
            if (nearestEnemy) {
                this.tower.shoot(nearestEnemy);
            }
        });
        
        // Press 'A' to toggle auto-fire
        this.input.keyboard.on('keydown-A', () => {
            if (!this.isPlaying || !this.gameStarted) return;
            
            console.log(`Toggling autoFire from ${this.tower.autoFire} to ${!this.tower.autoFire}`);
            this.tower.autoFire = !this.tower.autoFire;
            const status = this.tower.autoFire ? 'ON' : 'OFF';
            
            // Show auto-fire status
            const text = this.add.text(
                this.cameras.main.width / 2,
                100,
                `Auto-Fire: ${status}`,
                {
                    fontSize: '24px',
                    fill: this.tower.autoFire ? '#00ff00' : '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            );
            text.setOrigin(0.5, 0.5);
            text.setDepth(4000);
            
            // Fade out text
            this.tweens.add({
                targets: text,
                alpha: 0,
                duration: 2000,
                onComplete: () => text.destroy()
            });
        });
    }

    update(time, delta) {
        if (!this.isPlaying || !this.gameStarted) return;
        
        // Update tower
        if (this.tower) {
            this.tower.update(time, delta);
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy || !enemy.active) {
                console.log(`Removing inactive enemy at index ${i}, enemy exists: ${!!enemy}, active: ${enemy?.active}`);
                if (enemy) {
                    console.log(`Enemy details - health: ${enemy.health}, position: (${enemy.x}, ${enemy.y})`);
                }
                this.enemies.splice(i, 1);
                continue;
            }
            
            enemy.update(time, delta);
            
            // Check if enemy reached the tower using actual ground position
            const distance = Phaser.Math.Distance.Between(
                enemy.actualX, enemy.actualY,
                this.tower.x, this.tower.y
            );
            
            if (distance < 40) {
                console.log(`Enemy reached tower at distance ${distance}`);
                this.loseLife();
                enemy.destroy();
                this.enemies.splice(i, 1);
            }
        }
        
        // Update arrows
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            if (!arrow || !arrow.active) {
                this.arrows.splice(i, 1);
                continue;
            }
            
            arrow.update(time, delta);
        }
        
        // Check wave completion
        if (this.gameStarted && this.waveManager && !this.betweenWaves) {
            // Log current state for debugging
            if (this.waveManager.enemiesSpawned > 0 && this.enemies.length === 0) {
                console.log(`Wave check: spawned=${this.waveManager.enemiesSpawned}, enemies=${this.enemies.length}, complete=${this.waveManager.isWaveComplete()}, inProgress=${this.waveManager.waveInProgress}`);
            }
            
            // Check if all enemies from the wave have been spawned and defeated
            if (this.waveManager.enemiesSpawned >= this.waveManager.enemiesInWave && 
                this.enemies.length === 0 && 
                this.waveManager.enemiesSpawned > 0) {
                
                console.log(`Wave ${this.wave} completed! All ${this.waveManager.enemiesSpawned} enemies defeated`);
                this.wave++;
                this.goldReward(50);
                this.updateUI();
                
                // Prevent multiple wave starts
                this.betweenWaves = true;
                
                // Reset wave manager for next wave
                this.waveManager.enemiesSpawned = 0;
                this.waveManager.waveInProgress = false;
                
                // Start next wave after delay
                this.time.delayedCall(3000, () => {
                    if (this.isPlaying) {
                        console.log(`Starting wave ${this.wave}`);
                        this.betweenWaves = false;
                        this.waveManager.startWave(this.wave);
                    }
                });
            }
        }
    }

    spawnEnemy(type, spawnPoint) {
        if (!this.isPlaying) return;
        
        // Debug spawn point
        if (spawnPoint.x > 100 || spawnPoint.y > 100) {
            console.error('Invalid spawn point:', spawnPoint);
            return;
        }
        
        console.log(`Creating ${type} enemy at grid (${spawnPoint.x}, ${spawnPoint.y})`);
        
        // Convert grid coordinates to isometric coordinates
        const isoPos = this.gridToIso(spawnPoint.x, spawnPoint.y);
        console.log(`Grid (${spawnPoint.x}, ${spawnPoint.y}) -> Iso (${isoPos.x}, ${isoPos.y})`);
        
        // Add spawn marker for debugging
        const marker = this.add.circle(isoPos.x, isoPos.y, 10, 0xff00ff);
        marker.setDepth(3000);
        this.time.delayedCall(1000, () => marker.destroy());
        
        const enemy = new Enemy(this, isoPos.x, isoPos.y, type, this.wave);
        
        console.log(`Enemy active right after creation: ${enemy.active}`);
        
        // Set target to tower's grid position
        const towerIsoPos = this.gridToIso(this.towerGridPos.x, this.towerGridPos.y);
        enemy.setTarget(towerIsoPos.x, towerIsoPos.y);
        
        this.enemies.push(enemy);
        console.log(`Total enemies in array: ${this.enemies.length}`);
        console.log(`Enemy in array active state: ${this.enemies[this.enemies.length - 1].active}`);
    }

    createArrow(x, y, target, damage) {
        const arrow = new Arrow(this, x, y, target, damage);
        this.arrows.push(arrow);
    }

    findNearestEnemy(x, y) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (const enemy of this.enemies) {
            if (!enemy || !enemy.active) continue;
            
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (distance < minDistance && distance <= this.tower.range) {
                minDistance = distance;
                nearest = enemy;
            }
        }
        
        return nearest;
    }

    loseLife() {
        this.lives--;
        this.updateUI();
        
        this.cameras.main.shake(200, 0.01);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    goldReward(amount) {
        this.gold += amount;
        this.updateUI();
    }

    updateUI() {
        if (document.getElementById('wave')) {
            document.getElementById('wave').textContent = Math.max(1, this.wave);
        }
        if (document.getElementById('gold')) {
            document.getElementById('gold').textContent = this.gold;
        }
        if (document.getElementById('lives')) {
            document.getElementById('lives').textContent = this.lives;
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.gameStarted = false;
        
        if (this.waveManager) {
            this.waveManager.stopSpawning();
        }
        
        // Destroy all enemies
        this.enemies.forEach(enemy => {
            if (enemy && enemy.active) enemy.destroy();
        });
        this.enemies = [];
        
        // Show game over text
        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `GAME OVER\nWave Reached: ${this.wave}\nGold Earned: ${this.gold}`,
            {
                fontSize: '48px',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        );
        gameOverText.setOrigin(0.5, 0.5);
        gameOverText.setDepth(5000);
    }
}