import { Player, Enemy, Bullet, FuelItem, Bridge } from './entities.js';
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
        this.bulletPool = new Pool(() => {
            const bullet = new Bullet(0, 0);
            bullet.reset(); // Ensure bullet is properly initialized
            return bullet;
        });
        this.enemyBulletPool = new Pool(() => {
            const bullet = new Bullet(0, 0);
            bullet.fromEnemy = true;
            return bullet;
        });
        this.enemyPool = new Pool(() => new Enemy(0, 0, 'boat'));
        this.fuelPool = new Pool(() => new FuelItem(0, 0));
        this.bridgePool = new Pool(() => new Bridge(0, 0, this.width * 0.5, this));
        this.ui = new UI(this);
        this.enemyTimer = 0;
        this.fuelTimer = 0;
        this.bridgeTimer = 0;
        this.collisionManager = new CollisionManager(this);
        
        // Track game sections
        this.currentSection = 1;
        this.difficultyMultiplier = 1.0;
        
        // Enable debug collision visualization with D key
        this.input.addKeyCallback('d', () => {
            this.renderer.toggleDebug();
        });
        
        // Add touch event listener for game state transitions
        if (this.ui.isMobile) {
            this.setupTouchEvents();
        }
    }
    
    setupTouchEvents() {
        window.addEventListener('touchstart', (e) => {
            if (this.state === 'menu') {
                this.state = 'playing';
                e.preventDefault();
            } else if (this.state === 'gameOver') {
                this.init();
                this.state = 'playing';
                e.preventDefault();
            }
        });
    }

    init() {
        this.player = new Player(this.width / 2, this.height - 50, this.input, this.bulletPool);
        this.player.game = this; // Set game reference for the player
        this.entities = [this.player];
        this.score = 0;
        this.fuel = 100;
        this.lives = 3;
        this.scrollSpeed = 100; // Pixels per second
        this.currentSection = 1;
        this.difficultyMultiplier = 1.0;
        this.bridgeTimer = 15; // First bridge appears after 15 seconds
        
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
        this.updateBulletPool(deltaTime);
        this.updateEnemyBulletPool(deltaTime);
        this.enemyPool.update(deltaTime);
        this.fuelPool.update(deltaTime);
        this.bridgePool.update(deltaTime);
        
        // Spawn enemies - increased spawn rate for more shooting action
        this.enemyTimer -= deltaTime;
        if (this.enemyTimer <= 0) {
            this.spawnEnemy();
            // Reduced spawn time for more enemies (0.5 to 1 second between spawns)
            this.enemyTimer = (0.5 + Math.random() * 0.5) / this.difficultyMultiplier; 
        }
        
        // Spawn fuel items
        this.fuelTimer -= deltaTime;
        if (this.fuelTimer <= 0) {
            this.spawnFuelItem();
            this.fuelTimer = 5 + Math.random() * 5; // 5-10 seconds
        }
        
        // Spawn bridges to divide sections
        this.bridgeTimer -= deltaTime;
        if (this.bridgeTimer <= 0) {
            this.spawnBridge();
            this.bridgeTimer = 30; // New bridge every 30 seconds
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Update collision effects
        this.collisionManager.updateEffects(deltaTime);
        
        // Update UI (for transition messages)
        this.ui.update(deltaTime);

        // Increase difficulty
        this.scrollSpeed += 0.1 * deltaTime;
    }
    
    updateBulletPool(deltaTime) {
        this.bulletPool.update(deltaTime);
        const activeBullets = this.bulletPool.pool.filter(bullet => bullet.active);
        activeBullets.forEach(bullet => {
            // Set game reference if not already set
            if (!bullet.game) {
                bullet.game = this;
            }
            if (!this.entities.includes(bullet)) {
                this.entities.push(bullet);
            }
        });
    }
    
    updateEnemyBulletPool(deltaTime) {
        this.enemyBulletPool.update(deltaTime);
        const activeEnemyBullets = this.enemyBulletPool.pool.filter(bullet => bullet.active);
        activeEnemyBullets.forEach(bullet => {
            // Set game reference if not already set
            if (!bullet.game) {
                bullet.game = this;
            }
            if (!this.entities.includes(bullet)) {
                this.entities.push(bullet);
            }
        });
    }

    spawnEnemy() {
        // Select enemy type based on current section and random chance
        const enemyType = this.selectEnemyType();
        
        const enemy = this.enemyPool.get();
        enemy.type = enemyType;
        enemy.x = this.width * 0.25 + Math.random() * (this.width * 0.5 - 40);
        enemy.y = -30;
        enemy.initialX = enemy.x;
        enemy.initialY = enemy.y;
        enemy.game = this; // Set game reference for the enemy
        
        // If it's a shooting enemy, give it access to the bullet pool
        if (enemyType === 'shooterBoat') {
            enemy.bulletPool = this.enemyBulletPool;
        } else {
            enemy.bulletPool = null;
        }
        
        // Reset health and other properties based on type
        enemy.initEnemyType();
        
        enemy.active = true;
        this.entities.push(enemy);
    }
    
    selectEnemyType() {
        // Enemy type selection based on game section and randomness
        const random = Math.random();
        
        // Section 1: Only basic boats
        if (this.currentSection === 1) {
            return 'boat';
        }
        
        // Section 2: Introduce helicopters
        if (this.currentSection === 2) {
            return random < 0.7 ? 'boat' : 'helicopter';
        }
        
        // Section 3: Introduce fast boats
        if (this.currentSection === 3) {
            if (random < 0.5) return 'boat';
            else if (random < 0.8) return 'helicopter';
            else return 'fastBoat';
        }
        
        // Section 4: Introduce heavy boats
        if (this.currentSection === 4) {
            if (random < 0.3) return 'boat';
            else if (random < 0.55) return 'helicopter';
            else if (random < 0.8) return 'fastBoat';
            else return 'heavyBoat';
        }
        
        // Section 5+: All enemy types, including shooter boats
        const types = ['boat', 'helicopter', 'fastBoat', 'heavyBoat', 'shooterBoat'];
        const weights = [0.2, 0.25, 0.25, 0.15, 0.15];
        
        // Select enemy type based on weights
        let cumulativeWeight = 0;
        for (let i = 0; i < types.length; i++) {
            cumulativeWeight += weights[i];
            if (random < cumulativeWeight) {
                return types[i];
            }
        }
        
        return 'boat'; // Default to basic boat
    }
    
    spawnFuelItem() {
        const fuel = this.fuelPool.get();
        fuel.x = this.width * 0.25 + Math.random() * (this.width * 0.5 - 20);
        fuel.y = -20;
        fuel.game = this; // Set game reference for fuel item
        fuel.active = true;
        this.entities.push(fuel);
    }
    
    spawnBridge() {
        const bridge = this.bridgePool.get();
        bridge.x = this.width * 0.25; // Align with left edge of river
        bridge.y = -20; // Start just above the visible area
        bridge.gapPosition = Math.floor(Math.random() * 3); // 0 = left, 1 = middle, 2 = right
        bridge.width = this.width * 0.5; // Width of the river
        bridge.sections = bridge.createSections();
        bridge.active = true;
        bridge.passed = false;
        bridge.game = this; // Set game reference for the bridge
        this.entities.push(bridge);
    }
    
    // Called when player passes a bridge
    sectionPassed() {
        // Save previous section for UI notification
        const previousSection = this.currentSection;
        
        this.currentSection++;
        this.difficultyMultiplier += 0.1; // Increase difficulty with each section
        
        // Add bonus score for reaching a new section
        this.score += 50;
        
        // Add a small fuel bonus
        this.fuel = Math.min(100, this.fuel + 10);
        
        // Show section transition message
        this.ui.showSectionTransition(previousSection);
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
