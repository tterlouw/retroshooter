export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.terrainOffset = 0;
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
}
