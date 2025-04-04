import { Player, Enemy, Bullet, FuelItem } from './entities.js';
import { Pool } from './pool.js';
import { UI } from './ui.js';
import { AssetManager } from './assets.js';
import { CollisionManager } from './collision.js';

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
        this.collisionManager = new CollisionManager(this);
        
        // Enable debug collision visualization with D key
        this.input.addKeyCallback('d', () => {
            this.renderer.toggleDebug();
        });
    }

    init() {
        this.player = new Player(this.width / 2, this.height - 50, this.input, this.bulletPool);
        this.entities = [this.player];
        this.score = 0;
        this.fuel = 100;
        this.lives = 3;
        this.scrollSpeed = 100; // Pixels per second
        
        // Re-initialize collision manager when game restarts
        // This updates the river boundaries in case the window was resized
        this.collisionManager = new CollisionManager(this);
        
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
        
        // Check collisions
        this.checkCollisions();
        
        // Update collision effects
        this.collisionManager.updateEffects(deltaTime);

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
        this.collisionManager.checkAllCollisions();
    }

    isColliding(a, b) {
        return this.collisionManager.isColliding(a, b);
    }
    
    // Handle window resize to update collision boundaries
    handleResize(width, height) {
        this.width = width;
        this.height = height;
        
        // Update collision manager boundaries
        this.collisionManager.leftBankBoundary = this.width * 0.25;
        this.collisionManager.rightBankBoundary = this.width * 0.75;
    }
}
