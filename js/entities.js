import { AssetManager } from './assets.js';

const assets = new AssetManager();

export class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
    }
    
    update(deltaTime) {
        // Base update logic
    }
    
    render(ctx) {
        // Base render logic
    }
}

export class Player extends Entity {
    constructor(x, y, input, bulletPool) {
        super(x, y);
        this.input = input;
        this.bulletPool = bulletPool;
        this.speed = 200;
        this.fireRate = 0.25; // Seconds between shots
        this.fireTimer = 0;
    }
    
    update(deltaTime) {
        // Handle movement
        if (this.input.isKeyDown('ArrowLeft')) this.x -= this.speed * deltaTime;
        if (this.input.isKeyDown('ArrowRight')) this.x += this.speed * deltaTime;
        if (this.input.isKeyDown('ArrowUp')) this.y -= this.speed * deltaTime;
        if (this.input.isKeyDown('ArrowDown')) this.y += this.speed * deltaTime;
        
        // Keep player within bounds
        this.x = Math.max(0, Math.min(this.x, 480 - 30));
        this.y = Math.max(0, Math.min(this.y, 640 - 30));
        
        // Handle shooting
        this.fireTimer -= deltaTime;
        if (this.input.isKeyDown(' ') && this.fireTimer <= 0) {
            this.shoot();
            this.fireTimer = this.fireRate;
        }
    }
    
    shoot() {
        const bullet = this.bulletPool.get();
        bullet.x = this.x + 15;
        bullet.y = this.y - 10;
        bullet.active = true;
    }
    
    render(ctx) {
        ctx.drawImage(assets.sprites.helicopter, this.x, this.y, 30, 30);
    }
}

export class Bullet extends Entity {
    constructor(x, y) {
        super(x, y);
        this.speed = 300;
    }
    
    update(deltaTime) {
        this.y -= this.speed * deltaTime;
        if (this.y < -10) this.active = false;
    }
    
    render(ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, 3, 10);
    }
}

export class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
        this.speed = 100;
    }
    
    update(deltaTime) {
        this.y += this.speed * deltaTime;
        if (this.y > 640 + 30) this.active = false;
    }
    
    render(ctx) {
        if (this.type === 'boat') {
            ctx.drawImage(assets.sprites.gunboat, this.x, this.y, 40, 20);
        }
    }
}

export class FuelItem extends Entity {
    constructor(x, y) {
        super(x, y);
        this.speed = 50;
    }
    
    update(deltaTime) {
        this.y += this.speed * deltaTime;
        if (this.y > 640 + 20) this.active = false;
    }
    
    render(ctx) {
        ctx.drawImage(assets.sprites.fuelItem, this.x, this.y, 20, 20);
    }
}
