import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
const scale = Math.min(window.innerWidth / 480, window.innerHeight / 640);
canvas.width = 480 * scale;
canvas.height = 640 * scale;

const renderer = new Renderer(ctx, canvas.width, canvas.height);
const input = new InputHandler();
const game = new Game(canvas.width, canvas.height, input, renderer);

// Main game loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
    lastTime = timestamp;

    game.update(deltaTime);
    renderer.render(game);

    requestAnimationFrame(gameLoop);
}

game.init();
requestAnimationFrame(gameLoop);