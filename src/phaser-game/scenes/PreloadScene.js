import * as Phaser from '../../../node_modules/phaser/dist/phaser.esm.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Create loading text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
            fontSize: '32px',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);

        // Since we don't have image assets yet, we'll create them programmatically
        // For now, we'll just create colored rectangles as placeholders
        
        // Create arrow texture
        this.createArrowTexture();
        
        // Create tower texture
        this.createTowerTexture();
        
        // Create enemy textures
        this.createEnemyTextures();
        
        // Create tile texture for isometric ground
        this.createTileTexture();
    }

    create() {
        this.scene.start('GameScene');
    }

    createArrowTexture() {
        const graphics = this.add.graphics();
        
        // Minimalist cell-shaded arrow design
        const length = 36;
        const width = 12;
        
        // Main arrow body - single color with clean edges
        graphics.fillStyle(0xFFA500, 1); // Orange main color
        
        // Arrow shaft - simple rectangle
        graphics.fillRect(0, length/2 - 3, 24, 6);
        
        // Arrow head - clean triangular shape
        graphics.beginPath();
        graphics.moveTo(24, length/2);
        graphics.lineTo(length, length/2);
        graphics.lineTo(24, length/2 - width/2);
        graphics.lineTo(24, length/2 + width/2);
        graphics.closePath();
        graphics.fill();
        
        // Fletching - simple geometric shapes
        graphics.fillStyle(0xFF6B6B, 1); // Coral red
        graphics.beginPath();
        graphics.moveTo(0, length/2);
        graphics.lineTo(6, length/2 - 8);
        graphics.lineTo(6, length/2);
        graphics.closePath();
        graphics.fill();
        
        graphics.beginPath();
        graphics.moveTo(0, length/2);
        graphics.lineTo(6, length/2 + 8);
        graphics.lineTo(6, length/2);
        graphics.closePath();
        graphics.fill();
        
        // Cell-shading effect - darker shade on bottom
        graphics.fillStyle(0xCC6600, 0.4); // Darker orange
        graphics.fillRect(0, length/2, 24, 3);
        graphics.beginPath();
        graphics.moveTo(24, length/2);
        graphics.lineTo(length, length/2);
        graphics.lineTo(24, length/2 + width/2);
        graphics.closePath();
        graphics.fill();
        
        // Clean black outline
        graphics.lineStyle(2, 0x333333, 1);
        // Outline shaft
        graphics.strokeRect(0, length/2 - 3, 24, 6);
        // Outline head
        graphics.beginPath();
        graphics.moveTo(24, length/2 - width/2);
        graphics.lineTo(length, length/2);
        graphics.lineTo(24, length/2 + width/2);
        graphics.stroke();
        
        graphics.generateTexture('arrow', length, length);
        graphics.destroy();
    }

    createTowerTexture() {
        const graphics = this.add.graphics();
        
        // Tower dimensions
        const baseWidth = 64;
        const baseHeight = 32;
        const towerHeight = 80;
        
        // Draw tower base (isometric rectangle)
        graphics.fillStyle(0x555555, 1);
        graphics.beginPath();
        graphics.moveTo(32, 64); // Bottom
        graphics.lineTo(0, 48);  // Left
        graphics.lineTo(32, 32); // Top
        graphics.lineTo(64, 48); // Right
        graphics.closePath();
        graphics.fill();
        
        // Draw tower walls (vertical faces)
        // Left wall
        graphics.fillStyle(0x444444, 1);
        graphics.fillRect(0, 48 - towerHeight, 32, towerHeight);
        
        // Right wall (lighter)
        graphics.fillStyle(0x666666, 1);
        graphics.beginPath();
        graphics.moveTo(32, 32);
        graphics.lineTo(64, 48);
        graphics.lineTo(64, 48 - towerHeight);
        graphics.lineTo(32, 32 - towerHeight);
        graphics.closePath();
        graphics.fill();
        
        // Tower top (isometric square)
        graphics.fillStyle(0x777777, 1);
        graphics.beginPath();
        graphics.moveTo(32, 32 - towerHeight); // Top center
        graphics.lineTo(0, 48 - towerHeight);   // Left
        graphics.lineTo(32, 64 - towerHeight);  // Bottom
        graphics.lineTo(64, 48 - towerHeight);  // Right
        graphics.closePath();
        graphics.fill();
        
        // Add battlement details on top
        graphics.fillStyle(0x888888, 1);
        for (let i = 0; i < 4; i++) {
            const x = i * 16 + 4;
            graphics.fillRect(x, 48 - towerHeight - 8, 8, 8);
        }
        
        // Add dark outline
        graphics.lineStyle(2, 0x333333, 1);
        graphics.strokeRect(0, 32 - towerHeight, 64, towerHeight + 32);
        
        graphics.generateTexture('tower', 64, 96);
        graphics.destroy();
    }

    createEnemyTextures() {
        // Basic enemy - bright red with outline
        let graphics = this.add.graphics();
        graphics.fillStyle(0xFF0000, 1); // Red
        graphics.fillCircle(16, 16, 14);
        graphics.lineStyle(2, 0xFFFFFF, 1); // White outline
        graphics.strokeCircle(16, 16, 14);
        graphics.generateTexture('enemy-basic', 32, 32);
        graphics.destroy();
        
        // Fast enemy - bright green with outline
        graphics = this.add.graphics();
        graphics.fillStyle(0x00FF00, 1); // Green
        graphics.fillCircle(16, 16, 12);
        graphics.lineStyle(2, 0xFFFFFF, 1); // White outline
        graphics.strokeCircle(16, 16, 12);
        graphics.generateTexture('enemy-fast', 32, 32);
        graphics.destroy();
        
        // Tank enemy - bright blue with outline
        graphics = this.add.graphics();
        graphics.fillStyle(0x4444FF, 1); // Brighter blue
        graphics.fillCircle(20, 20, 18);
        graphics.lineStyle(2, 0xFFFFFF, 1); // White outline
        graphics.strokeCircle(20, 20, 18);
        graphics.generateTexture('enemy-tank', 40, 40);
        graphics.destroy();
    }

    createTileTexture() {
        const graphics = this.add.graphics();
        
        // Create isometric tile
        const tileWidth = 64;
        const tileHeight = 32;
        
        // Draw isometric diamond shape with outline
        graphics.fillStyle(0x6B8E5A, 1); // Grass green
        graphics.lineStyle(2, 0x4A6B3A, 1); // Dark green outline
        
        graphics.beginPath();
        graphics.moveTo(tileWidth / 2, 0);
        graphics.lineTo(tileWidth, tileHeight / 2);
        graphics.lineTo(tileWidth / 2, tileHeight);
        graphics.lineTo(0, tileHeight / 2);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        
        // Add highlight on top faces
        graphics.fillStyle(0x7FA060, 0.5); // Lighter green
        graphics.beginPath();
        graphics.moveTo(tileWidth / 2, 2);
        graphics.lineTo(tileWidth - 2, tileHeight / 2);
        graphics.lineTo(tileWidth / 2, tileHeight / 2);
        graphics.closePath();
        graphics.fill();
        
        // Add shadow on bottom faces
        graphics.fillStyle(0x3A5A2A, 0.5); // Darker green
        graphics.beginPath();
        graphics.moveTo(tileWidth / 2, tileHeight / 2);
        graphics.lineTo(tileWidth / 2, tileHeight - 2);
        graphics.lineTo(2, tileHeight / 2);
        graphics.closePath();
        graphics.fill();
        
        graphics.generateTexture('tile', tileWidth, tileHeight);
        graphics.destroy();
    }
}