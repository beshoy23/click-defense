import * as Phaser from '../../../node_modules/phaser/dist/phaser.esm.js';

export class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type = 'basic', wave = 1) {
        // Select texture based on type
        const textureMap = {
            'basic': 'enemy-basic',
            'fast': 'enemy-fast',
            'tank': 'enemy-tank'
        };
        
        super(scene, x, y, textureMap[type] || 'enemy-basic');
        
        scene.add.existing(this);
        console.log(`Enemy sprite created with texture: ${textureMap[type] || 'enemy-basic'}`);
        
        this.type = type;
        this.wave = wave;
        
        // Set enemy stats based on type and wave
        this.setStats(type, wave);
        
        // Movement - don't set target to spawn position
        this.targetX = null;
        this.targetY = null;
        
        // Make sure enemy is visible
        this.setVisible(true);
        this.setActive(true);
        
        console.log(`Enemy active state after creation: ${this.active}`);
        
        // Create shadow for 3D effect
        this.createShadow();
        
        // Health bar
        this.createHealthBar();
        
        // Set initial depth higher to ensure visibility
        this.setDepth(1000);
        this.updateDepth();
        
        // Set a smaller size
        this.setScale(0.8);
        
        // Vertical offset for 3D effect
        this.verticalOffset = 15; // Enemies float above ground
        this.groundY = y; // Store ground position
        this.y = this.groundY - this.verticalOffset;
        
        // Store actual position for movement
        this.actualX = x;
        this.actualY = y;
        
        console.log(`Enemy created at (${this.x}, ${this.y}) targeting (${this.targetX}, ${this.targetY})`);
        console.log(`Final enemy active state: ${this.active}, visible: ${this.visible}`);
    }

    setStats(type, wave) {
        const waveMultiplier = 1 + (wave - 1) * 0.2;
        
        switch(type) {
            case 'fast':
                this.maxHealth = Math.floor(20 * waveMultiplier);
                this.speed = 40; // Much slower
                this.goldValue = 15;
                break;
            case 'tank':
                this.maxHealth = Math.floor(50 * waveMultiplier);
                this.speed = 20; // Much slower
                this.goldValue = 30;
                break;
            case 'basic':
            default:
                this.maxHealth = Math.floor(30 * waveMultiplier);
                this.speed = 30; // Much slower
                this.goldValue = 10;
                break;
        }
        
        this.health = this.maxHealth;
        console.log(`Enemy stats set - type: ${type}, wave: ${wave}, health: ${this.health}/${this.maxHealth}`);
    }

    createShadow() {
        if (this.scene && this.scene.add) {
            try {
                // Create shadow at ground level (smaller)
                this.shadow = this.scene.add.ellipse(this.x, this.groundY + 10, 20, 10, 0x000000, 0.3);
                this.shadow.setDepth(this.depth - 100); // Below enemy
                console.log(`Shadow created successfully`);
            } catch (error) {
                console.error(`Error creating shadow:`, error);
            }
        }
    }
    
    createHealthBar() {
        try {
            const barWidth = 30;
            const barHeight = 4;
            
            this.healthBarBg = this.scene.add.rectangle(
                this.x, this.y - 25, // Closer to enemy since it's smaller
                barWidth, barHeight,
                0x000000
            );
            
            this.healthBar = this.scene.add.rectangle(
                this.x, this.y - 25,
                barWidth, barHeight,
                0x00ff00
            );
            
            this.healthBarBg.setDepth(this.depth + 1);
            this.healthBar.setDepth(this.depth + 2);
            console.log(`Health bar created successfully`);
        } catch (error) {
            console.error(`Error creating health bar:`, error);
        }
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        console.log(`Enemy target set to (${x}, ${y})`);
    }

    update(time, delta) {
        if (!this.active) return;
        
        // Don't move if no target set
        if (this.targetX === null || this.targetY === null) return;
        
        // Move towards target using actual ground positions
        const dx = this.targetX - this.actualX;
        const dy = this.targetY - this.actualY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            const moveDistance = this.speed * (delta / 1000);
            const ratio = moveDistance / distance;
            
            // Update actual position
            this.actualX += dx * ratio;
            this.actualY += dy * ratio;
            
            // Update visual position
            this.x = this.actualX;
            this.groundY = this.actualY;
            this.y = this.groundY - this.verticalOffset;
            
            // Update shadow position
            if (this.shadow && this.shadow.active) {
                this.shadow.x = this.actualX;
                this.shadow.y = this.actualY + 10;
            }
            
            // Update health bar position
            this.healthBarBg.x = this.x;
            this.healthBarBg.y = this.y - 25;
            this.healthBar.x = this.x;
            this.healthBar.y = this.y - 25;
            
            // Update depth for isometric sorting
            this.updateDepth();
        }
    }

    updateDepth() {
        // In isometric view, objects further down should appear in front
        // Use ground position for depth sorting
        const baseDepth = 1000 + Math.floor(this.groundY || this.y);
        this.setDepth(baseDepth);
        
        if (this.shadow) {
            this.shadow.setDepth(baseDepth - 100);
        }
        
        if (this.healthBarBg) {
            this.healthBarBg.setDepth(this.depth + 100);
            this.healthBar.setDepth(this.depth + 101);
        }
    }

    takeDamage(damage) {
        console.log(`Enemy taking ${damage} damage. Current health: ${this.health}/${this.maxHealth}`);
        this.health -= damage;
        
        // Update health bar
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        this.healthBar.scaleX = healthPercent;
        
        // Change color based on health
        if (healthPercent > 0.6) {
            this.healthBar.fillColor = 0x00ff00; // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.fillColor = 0xffff00; // Yellow
        } else {
            this.healthBar.fillColor = 0xff0000; // Red
        }
        
        // Flash red when hit
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });
        
        if (this.health <= 0) {
            // Award gold before destroying
            if (this.scene && this.scene.goldReward) {
                this.scene.goldReward(this.goldValue);
            }
            
            // Create death effect
            this.createDeathEffect();
            this.destroy();
        }
    }

    createDeathEffect() {
        if (!this.scene) return;
        
        // Create a burst effect
        const burst = this.scene.add.circle(this.x, this.y, 20, 0xFFFF00, 0.8);
        burst.setDepth(this.depth + 10);
        
        this.scene.tweens.add({
            targets: burst,
            scale: 2,
            alpha: 0,
            duration: 400,
            onComplete: () => burst.destroy()
        });
    }
    
    destroy() {
        console.log(`Enemy destroyed at position (${this.x}, ${this.y})`);
        if (this.shadow) this.shadow.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        super.destroy();
    }
}