import { Player } from './entities.js';
import { Pool } from './pool.js';
import { UI } from './ui.js';

export class Game {
    constructor(width, height, input, renderer) {
        this.width = width;
        this.height = height;
        this.input = input;
        this.renderer = renderer;
        this.state = 'menu'; // 'menu', 'playing', 'gameOver'
        this.entities = [];
        this.bulletPool = new Pool(() => ({ x: 0, y: 0, active: false, speed: 300 }));
        this.enemyPool = new Pool(() => ({ x: 0, y: 0, active: false, speed: 100, type: 'boat' }));
        this.ui = new UI(this);
    }

    init() {
        this.player = new Player(this.width / 2, this.height - 50, this.input, this.bulletPool);
        this.entities.push(this.player);
        this.score = 0;
        this.fuel = 100;
        this.lives = 3;
        this.scrollSpeed = 100; // Pixels per second
    }

    update(deltaTime) {
        if (this.state !== 'playing') return;

        this.fuel -= 10 * deltaTime; // Fuel decreases over time
        if (this.fuel <= 0) this.state = 'gameOver';

        this.entities.forEach(entity => entity.update(deltaTime));
        this.spawnEnemies(deltaTime);
        this.checkCollisions();

        // Increase difficulty
        this.scrollSpeed += 0.1 * deltaTime;
    }

    spawnEnemies(deltaTime) {
        if (Math.random() < 0.01) {
            const enemy = this.enemyPool.get();
            enemy.x = this.width * 0.25 + Math.random() * (this.width * 0.5);
            enemy.y = -20;
            enemy.active = true;
            this.entities.push(enemy);
        }
    }

    checkCollisions() {
        // Simple AABB collision (to be optimized later)
        this.entities.forEach(e1 => {
            this.entities.forEach(e2 => {
                if (e1 !== e2 && e1.active && e2.active && this.isColliding(e1, e2)) {
                    if (e1 === this.player) this.state = 'gameOver';
                    else { e1.active = false; this.score += 10; }
                }
            });
        });
    }

    isColliding(a, b) {
        return a.x < b.x + 20 && a.x + 20 > b.x && a.y < b.y + 20 && a.y + 20 > b.y;
    }
}