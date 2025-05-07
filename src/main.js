// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

// game config
let config = {
    fps: { forceSetTimeOut: true, target: 30 },  // FPS lock
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 600,
    height: 950,
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: [HomeScreen, Move, GameOver, Controls, Upgrades]
}

// Global variable to hold sprites
var my = {sprite: {}};
var highScore = 0;

const game = new Phaser.Game(config);
