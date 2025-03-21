export class UI {
    constructor(game) {
        this.game = game;
    }

    render(ctx) {
        if (this.game.state === 'menu') {
            this.renderMenu(ctx);
        } else if (this.game.state === 'playing') {
            this.renderHUD(ctx);
        } else if (this.game.state === 'gameOver') {
            this.renderGameOver(ctx);
        }
    }
    
    renderMenu(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RETRO SHOOTER', this.game.width / 2, this.game.height / 2 - 40);
        ctx.font = '20px Arial';
        ctx.fillText('Press ENTER or SPACE to Start', this.game.width / 2, this.game.height / 2 + 20);
        ctx.font = '16px Arial';
        ctx.fillText('Arrow Keys to Move, Space to Shoot', this.game.width / 2, this.game.height / 2 + 60);
    }
    
    renderHUD(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.game.score}`, 10, 20);
        ctx.fillText(`Fuel: ${Math.floor(this.game.fuel)}`, 10, 40);
        ctx.fillText(`Lives: ${this.game.lives}`, 10, 60);
    }
    
    renderGameOver(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.game.width / 2, this.game.height / 2 - 40);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${this.game.score}`, this.game.width / 2, this.game.height / 2 + 10);
        ctx.fillText('Press ENTER or SPACE to Restart', this.game.width / 2, this.game.height / 2 + 50);
    }
}
