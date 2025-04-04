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

export class Bridge extends Entity {
    constructor(x, y, width, game) {
        super(x, y);
        this.width = width;
        this.game = game;
        this.height = 20;
        this.gapPosition = Math.floor(Math.random() * 3); // 0 = left, 1 = middle, 2 = right
        this.gapWidth = 60; // Width of the gap the player can pass through
        this.sections = this.createSections();
        this.speed = game.scrollSpeed;
        this.passed = false; // Track if player has passed this bridge
    }
    
    createSections() {
        const sections = [];
        const totalSections = 3;
        const sectionWidth = this.width / totalSections;
        
        for (let i = 0; i < totalSections; i++) {
            if (i !== this.gapPosition) {
                sections.push({
                    x: this.x + i * sectionWidth,
                    y: this.y,
                    width: sectionWidth,
                    height: this.height
                });
            } else {
                // Create gap in the bridge
                const gapStart = this.x + i * sectionWidth + (sectionWidth - this.gapWidth) / 2;
                
                // Left part of section
                if ((sectionWidth - this.gapWidth) / 2 > 0) {
                    sections.push({
                        x: this.x + i * sectionWidth,
                        y: this.y,
                        width: (sectionWidth - this.gapWidth) / 2,
                        height: this.height
                    });
                }
                
                // Right part of section
                if ((sectionWidth - this.gapWidth) / 2 > 0) {
                    sections.push({
                        x: gapStart + this.gapWidth,
                        y: this.y,
                        width: (sectionWidth - this.gapWidth) / 2,
                        height: this.height
                    });
                }
            }
        }
        
        return sections;
    }
    
    update(deltaTime) {
        this.speed = this.game.scrollSpeed; // Keep bridge speed synced with game scrolling
        this.y += this.speed * deltaTime;
        
        // Update sections positions
        this.sections.forEach(section => {
            section.y = this.y;
        });
        
        // Mark bridge as inactive when it moves off-screen
        if (this.y > this.game.height + 30) {
            this.active = false;
        }
        
        // Check if player has passed this bridge - used for section transitions
        if (!this.passed && this.y > this.game.height / 2) {
            this.passed = true;
            this.game.sectionPassed();
        }
    }
    
    render(ctx) {
        ctx.fillStyle = '#8B4513'; // Brown color for wooden bridge
        
        // Draw each section of the bridge
        this.sections.forEach(section => {
            ctx.fillRect(section.x, section.y, section.width, section.height);
            
            // Add some wood texture details
            ctx.fillStyle = '#A0522D';
            for (let i = 0; i < section.width; i += 15) {
                ctx.fillRect(section.x + i, section.y + 5, 10, 5);
            }
            ctx.fillStyle = '#8B4513';
        });
    }
}
