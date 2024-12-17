import Phaser from 'phaser';
import SpaceWarpScene from './SpaceWarpScene';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [SpaceWarpScene],
    scale: {
        mode: Phaser.Scale.RESIZE, // Enables resizing
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game
    },
};

const game = new Phaser.Game(config);

// Resize listener to adjust canvas on window resize
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});