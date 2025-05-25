import * as Phaser from '../../../node_modules/phaser/dist/phaser.esm.js';

export class Tower extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'tower');
        
        scene.add.existing(this);
        
        // Tower stats
        this.damage = 10;
        this.fireRate = 2; // Shots per second (faster)
        this.range = 300;
        this.lastShotTime = 0;
        this.autoFire = false; // Will implement auto-fire option later
        
        console.log(`Tower created with autoFire: ${this.autoFire}`);
        
        // Adjust position for tower height (base is at y, top is higher)
        this.y -= 32; // Offset for visual height
        
        // Set depth for isometric layering based on base position
        this.setDepth(1000 + y);
        
        // Add range indicator (optional)
        this.rangeIndicator = scene.add.circle(x, y, this.range, 0xffffff, 0.1);
        this.rangeIndicator.setDepth(999);
        this.rangeIndicator.setVisible(true); // Show range for debugging
    }

    shoot(target) {
        const currentTime = this.scene.time.now;
        const cooldown = 1000 / this.fireRate;
        
        if (currentTime - this.lastShotTime < cooldown) {
            return false; // Indicate shot was not fired
        }
        
        console.log(`Tower shooting at enemy. AutoFire: ${this.autoFire}, damage: ${this.damage}`);
        this.lastShotTime = currentTime;
        
        // Calculate lead position for moving target
        let targetX = target.x;
        let targetY = target.y;
        
        // Simple prediction: aim where enemy will be
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        const timeToHit = distance / 300; // Arrow speed is ~300
        
        if (target.targetX !== undefined && target.targetY !== undefined) {
            // Calculate enemy velocity
            const dx = target.targetX - target.x;
            const dy = target.targetY - target.y;
            const enemyDist = Math.sqrt(dx * dx + dy * dy);
            
            if (enemyDist > 5) {
                // Predict where enemy will be
                const vx = (dx / enemyDist) * target.speed;
                const vy = (dy / enemyDist) * target.speed;
                
                targetX += vx * timeToHit * 0.5; // Partial lead
                targetY += vy * timeToHit * 0.5;
            }
        }
        
        // Create arrow projectile from top of tower
        this.scene.createArrow(
            this.x,
            this.y - 40, // Shoot from higher up on the tower
            target,
            this.damage
        );
        
        // Tower shoot animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            ease: 'Power1'
        });
        
        return true; // Indicate shot was fired
    }

    showRange() {
        this.rangeIndicator.setVisible(true);
    }

    hideRange() {
        this.rangeIndicator.setVisible(false);
    }

    upgrade(type) {
        switch(type) {
            case 'damage':
                this.damage += 5;
                break;
            case 'fireRate':
                this.fireRate += 0.5;
                break;
            case 'range':
                this.range += 50;
                this.rangeIndicator.setRadius(this.range);
                break;
        }
    }

    update(time, delta) {
        // Auto-fire at nearest enemy if enabled
        if (this.autoFire && this.scene.gameStarted && this.scene.isPlaying) {
            const nearestEnemy = this.scene.findNearestEnemy(this.x, this.y);
            if (nearestEnemy) {
                this.shoot(nearestEnemy);
            }
        }
    }
}