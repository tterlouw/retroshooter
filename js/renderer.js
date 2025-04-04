export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.terrainOffset = 0;
        this.debug = false; // Debug flag for collision visualization
    }

    render(game) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update terrain scroll position
        if (game.state === 'playing') {
            this.terrainOffset += game.scrollSpeed * 0.01;
            if (this.terrainOffset > this.height) {
                this.terrainOffset = 0;
            }
        }

        // Draw terrain (scrolling river with banks)
        this.ctx.fillStyle = '#005500'; // Green banks
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#0055AA'; // Blue river
        this.ctx.fillRect(this.width * 0.25, 0, this.width * 0.5, this.height);
        
        // Draw some terrain features that scroll
        this.drawTerrainFeatures(game);

        // Render entities
        game.entities.forEach(entity => entity.render(this.ctx));

        // Render collision effects
        game.collisionManager.renderEffects(this.ctx);
        
        // Debug visualization for collision boundaries
        if (this.debug) {
            this.drawCollisionDebug(game);
        }

        // Render UI
        game.ui.render(this.ctx);
    }
    
    drawTerrainFeatures(game) {
        // Draw some random terrain features that scroll with the game
        this.ctx.fillStyle = '#003300'; // Darker green for terrain features
        
        // Left bank features
        for (let i = 0; i < 5; i++) {
            const y = (i * 200 + this.terrainOffset) % (this.height + 100) - 100;
            this.ctx.fillRect(this.width * 0.05, y, this.width * 0.15, 30);
        }
        
        // Right bank features
        for (let i = 0; i < 5; i++) {
            const y = (i * 200 + this.terrainOffset + 100) % (this.height + 100) - 100;
            this.ctx.fillRect(this.width * 0.8, y, this.width * 0.15, 30);
        }
    }
    
    // Add debug visualization for collision boundaries
    drawCollisionDebug(game) {
        // Draw river boundaries
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        
        // Left boundary
        this.ctx.beginPath();
        this.ctx.moveTo(game.collisionManager.leftBankBoundary, 0);
        this.ctx.lineTo(game.collisionManager.leftBankBoundary, this.height);
        this.ctx.stroke();
        
        // Right boundary
        this.ctx.beginPath();
        this.ctx.moveTo(game.collisionManager.rightBankBoundary, 0);
        this.ctx.lineTo(game.collisionManager.rightBankBoundary, this.height);
        this.ctx.stroke();
        
        // Draw entity hitboxes
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        game.entities.forEach(entity => {
            let width, height;
            
            if (entity.constructor.name === 'Player') {
                width = game.collisionManager.entityDimensions.player.width;
                height = game.collisionManager.entityDimensions.player.height;
            } else if (entity.constructor.name === 'Enemy') {
                width = game.collisionManager.entityDimensions.enemy.width;
                height = game.collisionManager.entityDimensions.enemy.height;
            } else if (entity.constructor.name === 'Bullet') {
                width = game.collisionManager.entityDimensions.bullet.width;
                height = game.collisionManager.entityDimensions.bullet.height;
            } else if (entity.constructor.name === 'FuelItem') {
                width = game.collisionManager.entityDimensions.fuelItem.width;
                height = game.collisionManager.entityDimensions.fuelItem.height;
            }
            
            this.ctx.strokeRect(entity.x, entity.y, width, height);
        });
    }
    
    // Toggle debug visualization
    toggleDebug() {
        this.debug = !this.debug;
    }
}
