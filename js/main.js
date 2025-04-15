import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { AssetManager } from './assets.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
function resizeCanvas() {
    const scale = Math.min(window.innerWidth / 480, window.innerHeight / 640);
    canvas.width = 480 * scale;
    canvas.height = 640 * scale;
    if (window.game) {
        window.game.handleResize(canvas.width, canvas.height);
    }
}
resizeCanvas();

const renderer = new Renderer(ctx, canvas.width, canvas.height);
const input = new InputHandler();
const assets = new AssetManager();

// Show loading message
ctx.fillStyle = '#fff';
ctx.font = '24px Arial';
ctx.textAlign = 'center';
ctx.fillText('Loading assets...', canvas.width / 2, canvas.height / 2);

assets.preloadAll().then(() => {
    // Inject loaded assets into the game
    const game = new Game(canvas.width, canvas.height, input, renderer);
    game.assets = assets;
    window.game = game;
    window.addEventListener('resize', resizeCanvas);
    let lastTime = 0;
    function gameLoop(timestamp) {
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        game.update(deltaTime);
        renderer.render(game);
        requestAnimationFrame(gameLoop);
    }
    game.init();
    requestAnimationFrame(gameLoop);
}).catch((err) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f00';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Failed to load assets. See console for details.', canvas.width / 2, canvas.height / 2);
    console.error('Asset loading error:', assets.errors, err);
});