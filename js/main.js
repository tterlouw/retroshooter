import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
function resizeCanvas() {
    const scale = Math.min(window.innerWidth / 480, window.innerHeight / 640);
    canvas.width = 480 * scale;
    canvas.height = 640 * scale;
    
    // Update game and renderer with new dimensions
    if (window.game) {
        window.game.handleResize(canvas.width, canvas.height);
    }
}

// Initial sizing
resizeCanvas();

const renderer = new Renderer(ctx, canvas.width, canvas.height);
const input = new InputHandler();
const game = new Game(canvas.width, canvas.height, input, renderer);

// Store game in window for resize handler
window.game = game;

// Add window resize event listener
window.addEventListener('resize', resizeCanvas);

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