export class UI {
    constructor(game) {
        this.game = game;
        this.sectionTransition = {
            active: false,
            timer: 0,
            section: 1
        };
        this.isMobile = this.detectMobile();
    }

    detectMobile() {
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0);
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
            
            // Render touch controls if on mobile
            if (this.isMobile) {
                this.renderTouchControls(ctx);
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
        
        if (this.isMobile) {
            ctx.fillText('Tap to Start', this.game.width / 2, this.game.height / 2 + 20);
            ctx.font = '16px Arial';
            ctx.fillText('Use On-screen Controls or Keyboard to Move', this.game.width / 2, this.game.height / 2 + 60);
            ctx.fillText('Arrow Keys or On-screen Controls, Auto-Firing Enabled', this.game.width / 2, this.game.height / 2 + 85);
        } else {
            ctx.fillText('Press ENTER or SPACE to Start', this.game.width / 2, this.game.height / 2 + 20);
            ctx.font = '16px Arial';
            ctx.fillText('Arrow Keys to Move, Auto-Firing Enabled', this.game.width / 2, this.game.height / 2 + 60);
            ctx.fillText('Shoot Enemies to Score Points!', this.game.width / 2, this.game.height / 2 + 85);
        }
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
        
        if (this.isMobile) {
            ctx.fillText('Tap to Restart', this.game.width / 2, this.game.height / 2 + 70);
        } else {
            ctx.fillText('Press ENTER or SPACE to Restart', this.game.width / 2, this.game.height / 2 + 70);
        }
    }
    
    renderTouchControls(ctx) {
        const touchAreas = this.game.input.getTouchAreas();
        const joystick = this.game.input.getJoystick();
        
        ctx.save();
        ctx.globalAlpha = 0.5;
        
        // Draw direction buttons
        Object.keys(touchAreas).forEach(key => {
            const area = touchAreas[key];
            
            // Draw background circle for button
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(
                area.x + area.width / 2, 
                area.y + area.height / 2, 
                area.width / 2, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw arrow/icon based on the button type
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            
            switch(key) {
                case 'left':
                    // Draw left arrow
                    ctx.moveTo(area.x + area.width * 0.7, area.y + area.height * 0.3);
                    ctx.lineTo(area.x + area.width * 0.3, area.y + area.height * 0.5);
                    ctx.lineTo(area.x + area.width * 0.7, area.y + area.height * 0.7);
                    break;
                case 'right':
                    // Draw right arrow
                    ctx.moveTo(area.x + area.width * 0.3, area.y + area.height * 0.3);
                    ctx.lineTo(area.x + area.width * 0.7, area.y + area.height * 0.5);
                    ctx.lineTo(area.x + area.width * 0.3, area.y + area.height * 0.7);
                    break;
                case 'up':
                    // Draw up arrow
                    ctx.moveTo(area.x + area.width * 0.3, area.y + area.height * 0.7);
                    ctx.lineTo(area.x + area.width * 0.5, area.y + area.height * 0.3);
                    ctx.lineTo(area.x + area.width * 0.7, area.y + area.height * 0.7);
                    break;
                case 'down':
                    // Draw down arrow
                    ctx.moveTo(area.x + area.width * 0.3, area.y + area.height * 0.3);
                    ctx.lineTo(area.x + area.width * 0.5, area.y + area.height * 0.7);
                    ctx.lineTo(area.x + area.width * 0.7, area.y + area.height * 0.3);
                    break;
            }
            
            ctx.fill();
        });
        
        // Draw fire button
        if (touchAreas.fire) {
            const area = touchAreas.fire;
            
            // Draw fire button
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(
                area.x + area.width / 2, 
                area.y + area.height / 2, 
                area.width / 2, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw icon for fire button
            ctx.fillStyle = '#FF3333'; // Red color for fire button
            ctx.beginPath();
            // Draw a simple bullet shape
            ctx.moveTo(area.x + area.width * 0.5, area.y + area.height * 0.3);
            ctx.lineTo(area.x + area.width * 0.3, area.y + area.height * 0.7);
            ctx.lineTo(area.x + area.width * 0.7, area.y + area.height * 0.7);
            ctx.fill();
        }
        
        // Draw virtual joystick if it's active/visible
        if (joystick.visible) {
            // Draw joystick base (outer circle)
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(
                joystick.startX, 
                joystick.startY, 
                joystick.maxDistance, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw crosshairs on base for visual reference
            ctx.strokeStyle = '#555555';
            ctx.lineWidth = 2;
            
            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(joystick.startX - joystick.maxDistance * 0.7, joystick.startY);
            ctx.lineTo(joystick.startX + joystick.maxDistance * 0.7, joystick.startY);
            ctx.stroke();
            
            // Vertical line
            ctx.beginPath();
            ctx.moveTo(joystick.startX, joystick.startY - joystick.maxDistance * 0.7);
            ctx.lineTo(joystick.startX, joystick.startY + joystick.maxDistance * 0.7);
            ctx.stroke();
            
            // Draw joystick handle (inner circle)
            const handleX = joystick.startX + joystick.deltaX;
            const handleY = joystick.startY + joystick.deltaY;
            
            // Draw handle shadow for 3D effect
            ctx.fillStyle = '#222222';
            ctx.beginPath();
            ctx.arc(
                handleX + 2, 
                handleY + 2, 
                joystick.maxDistance * 0.4,
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw handle
            ctx.fillStyle = '#AAAAAA'; 
            ctx.beginPath();
            ctx.arc(
                handleX, 
                handleY, 
                joystick.maxDistance * 0.4, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // Add a highlight/shine effect to handle
            const gradient = ctx.createRadialGradient(
                handleX - joystick.maxDistance * 0.15, 
                handleY - joystick.maxDistance * 0.15,
                0,
                handleX, 
                handleY,
                joystick.maxDistance * 0.4
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                handleX, 
                handleY, 
                joystick.maxDistance * 0.4,
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.restore();
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
