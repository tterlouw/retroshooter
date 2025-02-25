export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    render(game) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw terrain (simple scrolling background)
        this.ctx.fillStyle = '#00f';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(this.width * 0.25, 0, this.width * 0.5, this.height * 2);

        // Render entities
        game.entities.forEach(entity => entity.render(this.ctx));

        // Render UI
        game.ui.render(this.ctx);
    }
}