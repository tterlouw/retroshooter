export class UI {
    constructor(game) {
        this.game = game;
        this.sectionTransition = {
            active: false,
            timer: 0,
            section: 1
        };
    }

    render(ctx) {
        if (this.game.state === 'menu') {
            this.renderMenu(ctx);
        } else if (this.game.state === 'playing') {
            this.renderHUD(ctx);
            
            // Show section transition if active
            if (this.sectionTransition.active) {
                this.renderSectionTransition(ctx);
            }
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
        ctx.fillText('Arrow Keys to Move, Auto-Firing Enabled', this.game.width / 2, this.game.height / 2 + 60);
        ctx.fillText('Shoot Enemies to Score Points!', this.game.width / 2, this.game.height / 2 + 85);
    }
    
    renderHUD(ctx) {
        // Make score more prominent
        ctx.fillStyle = '#FFFF00'; // Bright yellow for score
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.game.score}`, 10, 30);
        
        // Other HUD elements with regular styling
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`Fuel: ${Math.floor(this.game.fuel)}`, 10, 55);
        ctx.fillText(`Lives: ${this.game.lives}`, 10, 75);
        
        // Display current section in the upper right corner
        ctx.textAlign = 'right';
        ctx.fillText(`Section: ${this.game.currentSection}`, this.game.width - 10, 30);
    }
    
    renderGameOver(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.game.width / 2, this.game.height / 2 - 40);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${this.game.score}`, this.game.width / 2, this.game.height / 2 + 10);
        ctx.fillText(`Sections Completed: ${this.game.currentSection - 1}`, this.game.width / 2, this.game.height / 2 + 30);
        ctx.fillText('Press ENTER or SPACE to Restart', this.game.width / 2, this.game.height / 2 + 70);
    }
    
    // Display section transition message
    renderSectionTransition(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, this.game.height / 2 - 50, this.game.width, 100);
        
        ctx.fillStyle = '#FFCC00';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Section ${this.sectionTransition.section} Complete!`, this.game.width / 2, this.game.height / 2 - 10);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.fillText(`+50 Points  |  +10 Fuel`, this.game.width / 2, this.game.height / 2 + 20);
        ctx.restore();
    }
    
    // Show section transition message
    showSectionTransition(section) {
        this.sectionTransition.active = true;
        this.sectionTransition.timer = 2; // Show for 2 seconds
        this.sectionTransition.section = section;
    }
    
    // Update UI state
    update(deltaTime) {
        // Update section transition timer
        if (this.sectionTransition.active) {
            this.sectionTransition.timer -= deltaTime;
            if (this.sectionTransition.timer <= 0) {
                this.sectionTransition.active = false;
            }
        }
    }
}
