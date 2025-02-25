export class UI {
    constructor(game) {
        this.game = game;
    }

    render(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`Score: ${this.game.score}`, 10, 20);
        ctx.fillText(`Fuel: ${Math.floor(this.game.fuel)}`, 10, 40);
        ctx.fillText(`Lives: ${this.game.lives}`, 10, 60);
    }
}