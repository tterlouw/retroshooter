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
        this.fireRate = 0.15; // Faster fire rate for continuous shooting (was 0.25)
        this.fireTimer = 0;
        this.width = 30;
        this.height = 30;
        this.autoFire = true; // Enable continuous firing by default
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
        
        // Automatic continuous shooting
        this.fireTimer -= deltaTime;
        if (this.autoFire && this.fireTimer <= 0) {
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
        this.fromEnemy = false; // Flag to determine if bullet is from enemy or player
        this.width = 5;  // Slightly wider bullet
        this.height = 15; // Slightly taller bullet
    }
    
    update(deltaTime) {
        // Bullets move up if from player, down if from enemy
        this.y -= this.speed * deltaTime;
        
        // Deactivate when off-screen
        if ((this.fromEnemy && this.y > 640 + 10) || (!this.fromEnemy && this.y < -10)) {
            this.active = false;
        }
    }
    
    render(ctx) {
        // Player bullets are white with yellow glow, enemy bullets are red with orange glow
        if (this.fromEnemy) {
            // Enemy bullet - red with glow
            ctx.fillStyle = '#FF3333';
            ctx.shadowColor = '#FF8800';
            ctx.shadowBlur = 5;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0; // Reset shadow blur
        } else {
            // Player bullet - white with glow
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 5;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0; // Reset shadow blur
        }
    }
    
    reset() {
        // Reset properties when bullet is recycled from pool
        this.fromEnemy = false;
        this.speed = 300; // Reset to positive speed (upward direction)
    }
}

export class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
        this.speed = 100;
        this.health = 1;
        this.points = 10;
        this.movementPattern = 'straight';
        this.movementTimer = 0;
        this.amplitude = 0;
        this.frequency = 0;
        this.initialX = x;
        this.initialY = y;
        this.fireRate = 0;
        this.fireTimer = 0;
        this.bulletPool = null;
        
        // Set properties based on enemy type
        this.initEnemyType();
    }
    
    initEnemyType() {
        switch(this.type) {
            case 'boat':
                // Default gunboat - moves straight down
                this.speed = 100;
                this.health = 1;
                this.points = 100; // Increased from 10 to 100
                this.width = 40;
                this.height = 20;
                break;
                
            case 'helicopter':
                // Enemy helicopter - moves in a sine wave pattern
                this.speed = 120;
                this.health = 1;
                this.points = 150; // Increased from 15 to 150
                this.width = 30;
                this.height = 30;
                this.movementPattern = 'sine';
                this.amplitude = 80; // Horizontal movement amplitude
                this.frequency = 2; // Wave frequency
                break;
                
            case 'fastBoat':
                // Fast moving boat - harder to hit
                this.speed = 180;
                this.health = 1;
                this.points = 200; // Increased from 20 to 200
                this.width = 35;
                this.height = 18;
                break;
                
            case 'heavyBoat':
                // Armored boat - requires multiple hits
                this.speed = 70;
                this.health = 3;
                this.points = 300; // Increased from 30 to 300
                this.width = 45;
                this.height = 25;
                break;
                
            case 'shooterBoat':
                // Boat that fires back at the player
                this.speed = 90;
                this.health = 2;
                this.points = 250; // Increased from 25 to 250
                this.width = 40;
                this.height = 20;
                this.fireRate = 2; // Seconds between shots
                break;
        }
    }
    
    update(deltaTime) {
        // Basic vertical movement for all enemies
        this.y += this.speed * deltaTime;
        
        // Apply specific movement patterns
        switch(this.movementPattern) {
            case 'sine':
                // Sine wave movement (side to side)
                this.x = this.initialX + Math.sin((this.y - this.initialY) / 50 * this.frequency) * this.amplitude;
                break;
                
            case 'zigzag':
                // Zigzag movement
                this.movementTimer += deltaTime;
                if (this.movementTimer > 1) {
                    this.amplitude *= -1;
                    this.movementTimer = 0;
                }
                this.x += this.amplitude * deltaTime;
                break;
        }
        
        // Handle shooting for enemies that can fire
        if (this.fireRate > 0 && this.bulletPool) {
            this.fireTimer -= deltaTime;
            if (this.fireTimer <= 0) {
                this.shoot();
                this.fireTimer = this.fireRate;
            }
        }
        
        // Deactivate when off-screen
        if (this.y > 640 + 30) this.active = false;
    }
    
    shoot() {
        if (!this.bulletPool) return;
        
        const bullet = this.bulletPool.get();
        if (bullet) {
            bullet.x = this.x + this.width / 2;
            bullet.y = this.y + this.height;
            bullet.speed *= -1; // Make bullet go down
            bullet.fromEnemy = true;
            bullet.active = true;
        }
    }
    
    takeDamage() {
        this.health--;
        return this.health <= 0;
    }
    
    render(ctx) {
        switch(this.type) {
            case 'boat':
                ctx.drawImage(assets.sprites.gunboat, this.x, this.y, this.width, this.height);
                break;
                
            case 'helicopter':
                ctx.drawImage(assets.sprites.helicopter, this.x, this.y, this.width, this.height);
                // Draw rotor animation
                ctx.fillStyle = '#CCCCCC';
                ctx.fillRect(this.x + 5, this.y - 2, this.width - 10, 2);
                break;
                
            case 'fastBoat':
                // Fast boat - red tinted
                ctx.save();
                ctx.drawImage(assets.sprites.gunboat, this.x, this.y, this.width, this.height);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.restore();
                break;
                
            case 'heavyBoat':
                // Heavy armored boat - draw with extra details
                ctx.save();
                ctx.drawImage(assets.sprites.gunboat, this.x, this.y, this.width, this.height);
                // Add armor plates
                ctx.fillStyle = '#555555';
                ctx.fillRect(this.x + 5, this.y - 2, this.width - 10, 4);
                ctx.fillRect(this.x - 2, this.y + 5, 4, this.height - 10);
                ctx.fillRect(this.x + this.width - 2, this.y + 5, 4, this.height - 10);
                ctx.restore();
                // Health bar
                this.renderHealthBar(ctx);
                break;
                
            case 'shooterBoat':
                ctx.save();
                ctx.drawImage(assets.sprites.gunboat, this.x, this.y, this.width, this.height);
                // Add gun turret
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(this.x + this.width / 2 - 1, this.y + this.height / 2, 2, 10);
                ctx.restore();
                // Health bar
                this.renderHealthBar(ctx);
                break;
        }
    }
    
    renderHealthBar(ctx) {
        if (this.health <= 1) return; // Only show health bar for multi-hit enemies
        
        const barWidth = this.width;
        const barHeight = 3;
        const maxHealth = this.type === 'heavyBoat' ? 3 : 2;
        
        // Background
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x, this.y - barHeight - 2, barWidth, barHeight);
        
        // Health amount
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x, this.y - barHeight - 2, barWidth * (this.health / maxHealth), barHeight);
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
