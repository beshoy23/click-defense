import * as Phaser from '../../../node_modules/phaser/dist/phaser.esm.js';

export class Arrow extends Phaser.GameObjects.Container {
    constructor(scene, x, y, target, damage, type = 'normal') {
        super(scene, x, y);
        
        scene.add.existing(this);
        
        this.damage = damage;
        this.target = target;
        this.type = type; // 'normal', 'fire', 'ice'
        
        // Create arrow visuals with Thronefall style
        this.createArrowVisuals();
        
        // Starting position in 3D space
        this.startX = x;
        this.startY = y;
        this.startZ = 60;
        
        // Target position - use actual ground position for accurate targeting
        const targetX = target.actualX || target.x;
        const targetY = target.actualY || target.y;
        const targetZ = 15;
        
        // Calculate distance and flight time
        const horizontalDistance = Phaser.Math.Distance.Between(x, y, targetX, targetY);
        this.flightTime = Math.max(0.3, Math.min(0.8, horizontalDistance / 500)); // Faster for snappier feel
        
        // Predict where enemy will be (using actual positions)
        if (target.targetX !== undefined && target.targetY !== undefined && target.speed) {
            const currentX = target.actualX || target.x;
            const currentY = target.actualY || target.y;
            const dx = target.targetX - currentX;
            const dy = target.targetY - currentY;
            const enemyDist = Math.sqrt(dx * dx + dy * dy);
            
            if (enemyDist > 5) {
                const vx = (dx / enemyDist) * target.speed;
                const vy = (dy / enemyDist) * target.speed;
                
                this.targetX = targetX + vx * this.flightTime * 0.8;
                this.targetY = targetY + vy * this.flightTime * 0.8;
            } else {
                this.targetX = targetX;
                this.targetY = targetY;
            }
        } else {
            this.targetX = targetX;
            this.targetY = targetY;
        }
        
        // Calculate velocities
        this.velocityX = (this.targetX - x) / this.flightTime;
        this.velocityY = (this.targetY - y) / this.flightTime;
        
        // Enhanced gravity for more dramatic arc
        this.gravity = 800;
        const heightDiff = targetZ - this.startZ;
        this.velocityZ = (heightDiff + 0.5 * this.gravity * this.flightTime * this.flightTime) / this.flightTime;
        
        // Ensure nice arc
        const minUpwardVelocity = 150 + horizontalDistance * 0.3;
        if (this.velocityZ < minUpwardVelocity) {
            this.velocityZ = minUpwardVelocity;
            this.gravity = 2 * (this.velocityZ * this.flightTime - heightDiff) / (this.flightTime * this.flightTime);
        }
        
        this.elapsedTime = 0;
        
        // Trail effect
        this.trail = [];
        this.lastTrailTime = 0;
        this.trailInterval = 30; // milliseconds between trail segments
        
        // Set depth
        this.setDepth(3000);
        
        // Make arrow smaller
        this.setScale(0.6);
        
        // Hit flag
        this.hasHit = false;
        
        // Initial rotation
        this.updateVisuals(0);
    }

    createArrowVisuals() {
        // Arrow colors based on type
        const colors = {
            normal: { main: 0xE8D4B0, outline: 0x8B7355, trail: 0xE8D4B0 },
            fire: { main: 0xFF6B35, outline: 0xCC4125, trail: 0xFFAA00 },
            ice: { main: 0x7EC8E3, outline: 0x4A90A4, trail: 0xB0E0E6 }
        };
        
        const arrowColor = colors[this.type] || colors.normal;
        
        // Create minimalist arrow shape using graphics
        this.arrowGraphics = this.scene.add.graphics();
        
        // Draw arrow shaft (rectangle)
        this.arrowGraphics.fillStyle(arrowColor.main, 1);
        this.arrowGraphics.fillRect(-15, -2, 25, 4);
        
        // Draw arrow head (triangle)
        this.arrowGraphics.fillStyle(arrowColor.main, 1);
        this.arrowGraphics.fillTriangle(10, 0, 15, -4, 15, 4);
        
        // Draw outline for cell-shaded effect
        this.arrowGraphics.lineStyle(2, arrowColor.outline, 1);
        this.arrowGraphics.strokeRect(-15, -2, 25, 4);
        this.arrowGraphics.strokeTriangle(10, 0, 15, -4, 15, 4);
        
        // Add fletching (feathers)
        this.arrowGraphics.fillStyle(arrowColor.outline, 0.8);
        this.arrowGraphics.fillTriangle(-15, 0, -12, -3, -12, 3);
        this.arrowGraphics.fillTriangle(-13, 0, -10, -3, -10, 3);
        
        this.add(this.arrowGraphics);
        
        // Create stylized shadow (more prominent)
        this.shadow = this.scene.add.ellipse(0, 0, 35, 18, 0x000000, 0.25);
        this.shadow.setDepth(10);
        
        // Store trail color
        this.trailColor = arrowColor.trail;
    }

    update(time, delta) {
        if (!this.active || !this.scene || this.hasHit) return;
        
        this.elapsedTime += delta / 1000;
        const t = this.elapsedTime;
        
        // If flight time exceeded, force hit
        if (t >= this.flightTime) {
            this.forceHit();
            return;
        }
        
        // Calculate 3D position
        const worldX = this.startX + this.velocityX * t;
        const worldY = this.startY + this.velocityY * t;
        const worldZ = this.startZ + this.velocityZ * t - 0.5 * this.gravity * t * t;
        
        // Convert to screen position
        this.x = worldX;
        this.y = worldY - worldZ * 0.8;
        
        // Update shadow
        if (this.shadow && this.shadow.active) {
            this.shadow.x = worldX;
            this.shadow.y = worldY;
            
            // More dramatic shadow scaling
            const maxHeight = this.startZ + (this.velocityZ * this.velocityZ) / (2 * this.gravity);
            const heightRatio = Math.max(0, Math.min(1, worldZ / maxHeight));
            
            const shadowScale = 1.2 - heightRatio * 0.7;
            this.shadow.setScale(shadowScale);
            this.shadow.alpha = 0.25 - heightRatio * 0.15;
            
            this.shadow.setDepth(50 + Math.floor(worldY / 10));
        }
        
        // Create trail effect
        if (time - this.lastTrailTime > this.trailInterval) {
            this.createTrailSegment(worldX, worldY - worldZ * 0.8);
            this.lastTrailTime = time;
        }
        
        // Update visual properties
        this.updateVisuals(worldZ);
        
        // Update depth
        this.setDepth(3000 + Math.floor(worldY) - Math.floor(worldZ));
        
        // Check for hit - use actual position for accurate hit detection
        if (this.target && this.target.active && worldZ < 40) {
            const targetX = this.target.actualX || this.target.x;
            const targetY = this.target.actualY || this.target.y;
            const distance = Phaser.Math.Distance.Between(worldX, worldY, targetX, targetY);
            if (distance < 25) { // Slightly smaller hit radius for smaller enemies
                this.hitTarget();
            }
        }
    }

    createTrailSegment(x, y) {
        // Create minimalist trail effect
        const trailSegment = this.scene.add.circle(x, y, 3, this.trailColor, 0.6);
        trailSegment.setDepth(this.depth - 1);
        
        this.trail.push(trailSegment);
        
        // Fade out trail
        this.scene.tweens.add({
            targets: trailSegment,
            scale: 0.5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                const index = this.trail.indexOf(trailSegment);
                if (index > -1) {
                    this.trail.splice(index, 1);
                }
                if (trailSegment && trailSegment.active) {
                    trailSegment.destroy();
                }
            }
        });
        
        // Limit trail length
        if (this.trail.length > 5) {
            const oldSegment = this.trail.shift();
            if (oldSegment && oldSegment.active) {
                oldSegment.destroy();
            }
        }
    }

    updateVisuals(worldZ) {
        const t = this.elapsedTime;
        
        // Calculate current velocity components
        const currentVelX = this.velocityX;
        const currentVelY = this.velocityY;
        const currentVelZ = this.velocityZ - this.gravity * t;
        
        // Calculate angles
        const horizontalAngle = Math.atan2(currentVelY, currentVelX);
        const horizontalVel = Math.sqrt(currentVelX * currentVelX + currentVelY * currentVelY);
        const verticalAngle = Math.atan2(currentVelZ, horizontalVel);
        
        // Set rotation - arrow points in direction of movement
        this.rotation = horizontalAngle;
        
        // Simple scale adjustment for trajectory
        const baseScale = 1.2; // Slightly larger for visibility
        const trajectoryScale = 1 + Math.abs(verticalAngle) * 0.2;
        this.setScale(baseScale * trajectoryScale);
        
        // Add wobble for fire arrows
        if (this.type === 'fire') {
            const wobble = Math.sin(t * 20) * 0.05;
            this.rotation += wobble;
        }
    }

    hitTarget() {
        if (this.hasHit) return;
        this.hasHit = true;
        
        if (this.target && this.target.active) {
            this.target.takeDamage(this.damage);
            this.createImpactEffect();
            
            // Special effects based on arrow type
            if (this.type === 'fire') {
                this.createFirePool();
            } else if (this.type === 'ice') {
                this.createIceEffect();
            }
        }
        
        this.destroy();
    }

    createImpactEffect() {
        if (!this.scene || !this.scene.add) return;
        
        // Thronefall-style impact burst
        const numParticles = 6;
        const colors = {
            normal: 0xFFFFFF,
            fire: 0xFF6B35,
            ice: 0x7EC8E3
        };
        
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const speed = 100 + Math.random() * 50;
            
            const particle = this.scene.add.circle(
                this.x, 
                this.y, 
                4, 
                colors[this.type] || colors.normal, 
                1
            );
            particle.setDepth(3500);
            
            // Add outline
            const outline = this.scene.add.circle(
                this.x, 
                this.y, 
                5, 
                0x333333, 
                1
            );
            outline.setDepth(3499);
            
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            this.scene.tweens.add({
                targets: [particle, outline],
                x: particle.x + velocityX * 0.5,
                y: particle.y + velocityY * 0.5,
                scale: 0,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    if (particle.active) particle.destroy();
                    if (outline.active) outline.destroy();
                }
            });
        }
        
        // Screen shake for impact
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(100, 0.003);
        }
    }

    createFirePool() {
        if (!this.scene || !this.scene.add) return;
        
        // Create fire pool effect
        const firePool = this.scene.add.container(this.target.x, this.target.y);
        
        // Base fire circle
        const baseCircle = this.scene.add.circle(0, 0, 40, 0xFF6B35, 0.4);
        const innerCircle = this.scene.add.circle(0, 0, 25, 0xFFAA00, 0.6);
        const coreCircle = this.scene.add.circle(0, 0, 15, 0xFFFF00, 0.8);
        
        firePool.add([baseCircle, innerCircle, coreCircle]);
        firePool.setDepth(100);
        
        // Animate fire
        this.scene.tweens.add({
            targets: [baseCircle, innerCircle, coreCircle],
            scale: { from: 0.8, to: 1.2 },
            duration: 200,
            yoyo: true,
            repeat: 14, // 3 seconds total
            onComplete: () => {
                if (firePool.active) firePool.destroy();
            }
        });
        
        // Damage zone
        const damageZone = this.scene.physics.add.staticBody(this.target.x, this.target.y, 80, 80);
        damageZone.gameObject = { data: { isFirePool: true } };
        
        // Store reference for collision detection
        if (this.scene.fireZones) {
            this.scene.fireZones.push({ zone: damageZone, pool: firePool });
        }
        
        // Clean up after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            if (damageZone) damageZone.destroy();
        });
    }

    createIceEffect() {
        // Similar to fire but with ice visuals
        if (this.target && this.target.active) {
            // Slow effect visual
            const iceRing = this.scene.add.circle(this.target.x, this.target.y, 30, 0x7EC8E3, 0.5);
            iceRing.setStrokeStyle(3, 0x4A90A4, 1);
            iceRing.setDepth(this.target.depth + 1);
            
            this.scene.tweens.add({
                targets: iceRing,
                scale: 1.5,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    if (iceRing.active) iceRing.destroy();
                }
            });
            
            // Apply slow effect
            if (this.target.speed) {
                const originalSpeed = this.target.speed;
                this.target.speed *= 0.5;
                this.scene.time.delayedCall(2000, () => {
                    if (this.target && this.target.active) {
                        this.target.speed = originalSpeed;
                    }
                });
            }
        }
    }

    createGroundImpact() {
        if (!this.scene || !this.scene.add) return;
        
        // Minimalist ground impact
        const impact = this.scene.add.graphics();
        impact.lineStyle(2, 0x666666, 0.5);
        impact.strokeCircle(0, 0, 8);
        impact.x = this.x;
        impact.y = this.y;
        impact.setDepth(100);
        
        this.scene.tweens.add({
            targets: impact,
            scale: 2,
            alpha: 0,
            duration: 600,
            onComplete: () => {
                if (impact.active) impact.destroy();
            }
        });
    }

    forceHit() {
        if (this.target && this.target.active && !this.hasHit) {
            this.hitTarget();
        } else {
            this.createGroundImpact();
        }
        this.destroy();
    }

    destroy() {
        // Clean up trail
        this.trail.forEach(segment => {
            if (segment && segment.active) {
                segment.destroy();
            }
        });
        this.trail = [];
        
        // Clean up shadow
        if (this.shadow && this.shadow.active) {
            this.shadow.destroy();
        }
        
        // Clean up graphics
        if (this.arrowGraphics && this.arrowGraphics.active) {
            this.arrowGraphics.destroy();
        }
        
        // Remove from scene's arrow array
        if (this.scene && this.scene.arrows) {
            const index = this.scene.arrows.indexOf(this);
            if (index > -1) {
                this.scene.arrows.splice(index, 1);
            }
        }
        
        super.destroy();
    }
}