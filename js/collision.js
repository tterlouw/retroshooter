// filepath: d:\GithubRepos\retroshooter\js\collision.js
import { Player, Enemy, Bullet, FuelItem } from './entities.js';

/**
 * CollisionManager handles all collision detection and resolution in the game.
 * It provides optimized collision detection for different game objects and terrain.
 */
export class CollisionManager {
    constructor(game) {
        this.game = game;
        
        // Define river boundaries (25% to 75% of screen width)
        this.leftBankBoundary = this.game.width * 0.25;
        this.rightBankBoundary = this.game.width * 0.75;
        
        // Lookup table for entity dimensions to avoid repeated calculations
        this.entityDimensions = {
            player: { width: 30, height: 30 },
            enemy: { width: 40, height: 20 },
            bullet: { width: 3, height: 10 },
            fuelItem: { width: 20, height: 20 }
        };
        
        // Collision effects
        this.collisionEffects = {
            active: false,
            duration: 0,
            type: null,
            position: { x: 0, y: 0 }
        };
    }
    
    /**
     * Check all collisions in the game world
     */
    checkAllCollisions() {
        if (this.game.state !== 'playing') return;
        
        const player = this.game.player;
        const bullets = this.game.entities.filter(e => e instanceof Bullet && e.active);
        const enemies = this.game.entities.filter(e => e instanceof Enemy && e.active);
        const fuelItems = this.game.entities.filter(e => e instanceof FuelItem && e.active);
        
        // Check bullet-enemy collisions
        this.checkBulletEnemyCollisions(bullets, enemies);
        
        // Check player-enemy collisions
        this.checkPlayerEnemyCollisions(player, enemies);
        
        // Check player-fuel collisions
        this.checkPlayerFuelCollisions(player, fuelItems);
        
        // Check player-terrain collisions
        this.checkPlayerTerrainCollision(player);
    }
    
    /**
     * Check collisions between bullets and enemies
     */
    checkBulletEnemyCollisions(bullets, enemies) {
        bullets.forEach(bullet => {
            enemies.forEach(enemy => {
                if (this.isColliding(bullet, enemy)) {
                    bullet.active = false;
                    enemy.active = false;
                    this.game.score += 10;
                    this.triggerCollisionEffect('explosion', enemy.x + 20, enemy.y + 10);
                }
            });
        });
    }
    
    /**
     * Check collisions between player and enemies
     */
    checkPlayerEnemyCollisions(player, enemies) {
        enemies.forEach(enemy => {
            if (this.isColliding(player, enemy)) {
                enemy.active = false;
                this.game.lives--;
                this.triggerCollisionEffect('playerHit', player.x + 15, player.y + 15);
                
                if (this.game.lives <= 0) {
                    this.game.state = 'gameOver';
                }
            }
        });
    }
    
    /**
     * Check collisions between player and fuel items
     */
    checkPlayerFuelCollisions(player, fuelItems) {
        fuelItems.forEach(fuel => {
            if (this.isColliding(player, fuel)) {
                fuel.active = false;
                this.game.fuel = Math.min(100, this.game.fuel + 25);
                this.game.assets.sounds.fuel.play().catch(e => console.log("Audio play failed:", e));
                this.triggerCollisionEffect('fuelPickup', fuel.x + 10, fuel.y + 10);
            }
        });
    }
    
    /**
     * Check collision between player and terrain (river banks)
     */
    checkPlayerTerrainCollision(player) {
        // Get player hitbox
        const playerWidth = this.entityDimensions.player.width;
        const playerLeft = player.x;
        const playerRight = player.x + playerWidth;
        
        // Check if player is touching river banks
        if (playerLeft < this.leftBankBoundary || playerRight > this.rightBankBoundary) {
            this.game.lives--;
            this.triggerCollisionEffect('crash', player.x + 15, player.y + 15);
            
            // Reset player position to safe zone
            player.x = this.game.width / 2 - playerWidth / 2;
            
            if (this.game.lives <= 0) {
                this.game.state = 'gameOver';
            }
        }
    }
    
    /**
     * Optimized AABB collision detection between two entities
     */
    isColliding(a, b) {
        // Get entity dimensions from lookup table for better performance
        const aWidth = this.getDimension(a, 'width');
        const aHeight = this.getDimension(a, 'height');
        const bWidth = this.getDimension(b, 'width');
        const bHeight = this.getDimension(b, 'height');
        
        // Simple AABB collision detection
        return a.x < b.x + bWidth && 
               a.x + aWidth > b.x && 
               a.y < b.y + bHeight && 
               a.y + aHeight > b.y;
    }
    
    /**
     * Get entity dimension from lookup table
     */
    getDimension(entity, dimension) {
        if (entity instanceof Player) {
            return this.entityDimensions.player[dimension];
        } else if (entity instanceof Enemy) {
            return this.entityDimensions.enemy[dimension];
        } else if (entity instanceof Bullet) {
            return this.entityDimensions.bullet[dimension];
        } else if (entity instanceof FuelItem) {
            return this.entityDimensions.fuelItem[dimension];
        }
        return 0;
    }
    
    /**
     * Trigger visual effect for collision
     */
    triggerCollisionEffect(type, x, y) {
        this.collisionEffects = {
            active: true,
            duration: 0.3, // 300ms
            type: type,
            position: { x, y }
        };
    }
    
    /**
     * Update collision effects
     */
    updateEffects(deltaTime) {
        if (this.collisionEffects.active) {
            this.collisionEffects.duration -= deltaTime;
            if (this.collisionEffects.duration <= 0) {
                this.collisionEffects.active = false;
            }
        }
    }
    
    /**
     * Render collision effects
     */
    renderEffects(ctx) {
        if (!this.collisionEffects.active) return;
        
        const { type, position } = this.collisionEffects;
        
        ctx.save();
        
        switch (type) {
            case 'explosion':
                ctx.fillStyle = '#FF5500';
                ctx.beginPath();
                ctx.arc(position.x, position.y, 15, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'playerHit':
                ctx.fillStyle = '#FF0000';
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(position.x, position.y, 20, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'fuelPickup':
                ctx.fillStyle = '#00FF00';
                ctx.beginPath();
                ctx.arc(position.x, position.y, 10, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'crash':
                ctx.fillStyle = '#FFAA00';
                ctx.beginPath();
                ctx.arc(position.x, position.y, 25, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
}