import * as Phaser from '../../../node_modules/phaser/dist/phaser.esm.js';

export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 0;
        this.enemiesInWave = 0;
        this.enemiesSpawned = 0;
        this.spawnTimer = null;
        this.waveInProgress = false;
    }

    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.enemiesSpawned = 0;
        this.waveInProgress = true;
        
        // Calculate enemies for this wave
        this.enemiesInWave = Math.min(5 + (waveNumber * 2), 30); // Cap at 30 enemies
        
        // Start spawning enemies
        this.spawnNextEnemy();
    }

    spawnNextEnemy() {
        if (this.enemiesSpawned >= this.enemiesInWave) {
            this.waveInProgress = false;
            console.log(`Wave ${this.currentWave} spawning complete`);
            return;
        }
        
        // Determine enemy type based on wave
        let enemyType = 'basic';
        const rand = Math.random();
        
        if (this.currentWave >= 3) {
            if (rand < 0.2) {
                enemyType = 'tank';
            } else if (rand < 0.5) {
                enemyType = 'fast';
            }
        } else if (this.currentWave >= 2 && rand < 0.3) {
            enemyType = 'fast';
        }
        
        // Get random spawn point
        const spawnPoint = this.getRandomSpawnPoint();
        console.log(`Spawning enemy ${this.enemiesSpawned + 1}/${this.enemiesInWave} at grid`, spawnPoint);
        
        // Spawn enemy
        this.scene.spawnEnemy(enemyType, spawnPoint);
        this.enemiesSpawned++;
        
        // Schedule next spawn with proper delay
        const spawnDelay = Math.max(1000, 3000 - (this.currentWave * 50)); // Slower spawn rate
        if (this.enemiesSpawned < this.enemiesInWave) {
            this.spawnTimer = this.scene.time.delayedCall(spawnDelay, () => {
                this.spawnNextEnemy();
            });
        }
    }

    getRandomSpawnPoint() {
        const side = Phaser.Math.Between(0, 3);
        const mapSize = this.scene.mapWidth || 16;
        
        let gridX, gridY;
        
        switch(side) {
            case 0: // Top edge
                gridX = Phaser.Math.Between(1, mapSize - 2);
                gridY = 0;
                break;
            case 1: // Right edge
                gridX = mapSize - 1;
                gridY = Phaser.Math.Between(1, mapSize - 2);
                break;
            case 2: // Bottom edge
                gridX = Phaser.Math.Between(1, mapSize - 2);
                gridY = mapSize - 1;
                break;
            case 3: // Left edge
                gridX = 0;
                gridY = Phaser.Math.Between(1, mapSize - 2);
                break;
        }
        
        return { x: gridX, y: gridY };
    }

    isWaveComplete() {
        const complete = this.enemiesSpawned >= this.enemiesInWave;
        if (complete && this.waveInProgress) {
            console.log(`Wave ${this.currentWave} spawning complete: ${this.enemiesSpawned}/${this.enemiesInWave}`);
        }
        return complete;
    }

    stopSpawning() {
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
    }
}