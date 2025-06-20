import * as Phaser from '../../node_modules/phaser/dist/phaser.esm.js';
import { GameScene } from './scenes/GameScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    scene: [PreloadScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

// Make game instance globally available for debugging
window.game = game;

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
