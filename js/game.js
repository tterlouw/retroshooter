import { Player, Enemy, Bullet, FuelItem } from './entities.js';
import { Pool } from './pool.js';
import { UI } from './ui.js';
import { AssetManager } from './assets.js';

export class Game {
    constructor(width, height, input, renderer) {
        this.width = width;
        this.height = height;
        this.input = input;
        this.renderer = renderer;
        this.state = 'menu'; // 'menu', 'playing', 'gameOver'
        this.entities = [];
        this.assets = new AssetManager();
        this.bulletPool = new Pool(() => new Bullet(0, 0));
        this.enemyPool = new Pool(() => new Enemy(0, 0, 'boat'));
        this.fuelPool = new Pool(() => new FuelItem(0, 0));
        this.ui = new UI(this);
        this.enemyTimer = 0;
        this.fuelTimer = 0;
    }

    init() {
        this.player = new Player(this.width / 2, this.height - 50, this.input, this.bulletPool);
        this.entities = [this.player];
        this.score = 0;
        this.fuel = 100;
        this.lives = 3;
        this.scrollSpeed = 100; // Pixels per second
        
        // Start background music
        this.assets.sounds.bgm.loop = true;
        this.assets.sounds.bgm.play().catch(e => console.log("Audio play failed:", e));
    }

    update(deltaTime) {
        if (this.state === 'menu') {
            if (this.input.isKeyDown('Enter') || this.input.isKeyDown(' ')) {
                this.state = 'playing';
            }
            return;
        }
        
        if (this.state === 'gameOver') {
            if (this.input.isKeyDown('Enter') || this.input.isKeyDown(' ')) {
                this.init();
                this.state = 'playing';
            }
            return;
        }

        // Playing state
        this.fuel -= 5 * deltaTime; // Fuel decreases over time
        if (this.fuel <= 0) {
            this.state = 'gameOver';
            return;
        }

        // Update all entities
        this.entities = this.entities.filter(entity => entity.active);
        this.entities.forEach(entity => entity.update(deltaTime));
        
        // Update all pools and add active objects to entities
        this.bulletPool.update(deltaTime);
        const activeBullets = this.bulletPool.pool.filter(bullet => bullet.active);
        activeBullets.forEach(bullet => {
            if (!this.entities.includes(bullet)) {
                this.entities.push(bullet);
            }
        });
        
        this.enemyPool.update(deltaTime);
        this.fuelPool.update(deltaTime);
        
        // Spawn enemies
        this.enemyTimer -= deltaTime;
        if (this.enemyTimer <= 0) {
            this.spawnEnemy();
            this.enemyTimer = 1 + Math.random() * 2; // 1-3 seconds
        }
        
        // Spawn fuel items
        this.fuelTimer -= deltaTime;
        if (this.fuelTimer <= 0) {
            this.spawnFuelItem();
            this.fuelTimer = 5 + Math.random() * 5; // 5-10 seconds
        }
        
        this.checkCollisions();

        // Increase difficulty
        this.scrollSpeed += 0.1 * deltaTime;
    }

    spawnEnemy() {
        const enemy = this.enemyPool.get();
        enemy.x = this.width * 0.25 + Math.random() * (this.width * 0.5 - 40);
        enemy.y = -30;
        enemy.active = true;
        this.entities.push(enemy);
    }
    
    spawnFuelItem() {
        const fuel = this.fuelPool.get();
        fuel.x = this.width * 0.25 + Math.random() * (this.width * 0.5 - 20);
        fuel.y = -20;
        fuel.active = true;
        this.entities.push(fuel);
    }

    checkCollisions() {
        // Check bullet-enemy collisions
        const bullets = this.entities.filter(e => e instanceof Bullet && e.active);
        const enemies = this.entities.filter(e => e instanceof Enemy && e.active);
        const fuelItems = this.entities.filter(e => e instanceof FuelItem && e.active);
        
        bullets.forEach(bullet => {
            enemies.forEach(enemy => {
                if (this.isColliding(bullet, enemy)) {
                    bullet.active = false;
                    enemy.active = false;
                    this.score += 10;
                }
            });
        });
        
        // Check player-enemy collisions
        enemies.forEach(enemy => {
            if (this.isColliding(this.player, enemy)) {
                enemy.active = false;
                this.lives--;
                if (this.lives <= 0) {
                    this.state = 'gameOver';
                }
            }
        });
        
        // Check player-fuel collisions
        fuelItems.forEach(fuel => {
            if (this.isColliding(this.player, fuel)) {
                fuel.active = false;
                this.fuel = Math.min(100, this.fuel + 25);
                this.assets.sounds.fuel.play().catch(e => console.log("Audio play failed:", e));
            }
        });
    }

    isColliding(a, b) {
        // Simple AABB collision
        const aWidth = a instanceof Player ? 30 : a instanceof Enemy ? 40 : a instanceof Bullet ? 3 : 20;
        const aHeight = a instanceof Player ? 30 : a instanceof Enemy ? 20 : a instanceof Bullet ? 10 : 20;
        const bWidth = b instanceof Player ? 30 : b instanceof Enemy ? 40 : b instanceof Bullet ? 3 : 20;
        const bHeight = b instanceof Player ? 30 : b instanceof Enemy ? 20 : b instanceof Bullet ? 10 : 20;
        
        return a.x < b.x + bWidth && 
               a.x + aWidth > b.x && 
               a.y < b.y + bHeight && 
               a.y + aHeight > b.y;
    }
}
