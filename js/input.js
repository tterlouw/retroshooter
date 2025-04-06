export class InputHandler {
    constructor() {
        this.keys = {};
        this.keyCallbacks = {};
        this.touchInputs = {
            left: false,
            right: false,
            up: false,
            down: false,
            fire: false
        };
        this.touchAreas = {}; // Will store touch area coordinates
        
        window.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            
            // Execute any callbacks registered for this key
            const keyCallbacks = this.keyCallbacks[e.key];
            if (keyCallbacks) {
                keyCallbacks.forEach(callback => callback());
            }
        });
        
        window.addEventListener('keyup', e => {
            this.keys[e.key] = false;
        });

        // Mobile touch controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        // Add touch event listeners
        window.addEventListener('touchstart', e => this.handleTouch(e, true));
        window.addEventListener('touchmove', e => this.handleTouch(e, true));
        window.addEventListener('touchend', e => this.handleTouch(e, false));
        window.addEventListener('touchcancel', e => this.handleTouch(e, false));

        // Recalculate touch areas when window resizes
        window.addEventListener('resize', () => this.calculateTouchAreas());

        // Initial calculation of touch areas
        this.calculateTouchAreas();
    }

    calculateTouchAreas() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Define touch areas based on screen size
        // We'll use a simple layout with left/right controls on bottom left
        // and up/down controls on bottom right
        
        const buttonSize = Math.min(80, Math.max(40, width * 0.15)); // Responsive button size
        const margin = buttonSize * 0.5;
        
        this.touchAreas = {
            left: {
                x: margin,
                y: height - buttonSize * 2.5,
                width: buttonSize,
                height: buttonSize
            },
            right: {
                x: margin + buttonSize * 1.5,
                y: height - buttonSize * 2.5,
                width: buttonSize,
                height: buttonSize
            },
            up: {
                x: width - margin - buttonSize * 1.5,
                y: height - buttonSize * 3.5,
                width: buttonSize,
                height: buttonSize
            },
            down: {
                x: width - margin - buttonSize * 1.5,
                y: height - buttonSize * 1.5,
                width: buttonSize,
                height: buttonSize
            }
        };
    }

    handleTouch(e, isActive) {
        e.preventDefault(); // Prevent scrolling while playing

        const touches = e.touches || e.changedTouches;
        
        // Reset all touch inputs first if this is touchend/cancel
        if (!isActive) {
            Object.keys(this.touchInputs).forEach(key => {
                this.touchInputs[key] = false;
            });
        }
        
        // Check each touch against our touch areas
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const x = touch.clientX;
            const y = touch.clientY;
            
            // Check if touch is in each of our control areas
            Object.keys(this.touchAreas).forEach(key => {
                const area = this.touchAreas[key];
                if (x >= area.x && x <= area.x + area.width && 
                    y >= area.y && y <= area.y + area.height) {
                    this.touchInputs[key] = isActive;
                }
            });
        }
    }

    isKeyDown(key) {
        // Map arrow keys to touch inputs
        if (key === 'ArrowLeft') return this.keys[key] || this.touchInputs.left;
        if (key === 'ArrowRight') return this.keys[key] || this.touchInputs.right;
        if (key === 'ArrowUp') return this.keys[key] || this.touchInputs.up;
        if (key === 'ArrowDown') return this.keys[key] || this.touchInputs.down;
        if (key === ' ' || key === 'Enter') return this.keys[key] || this.touchInputs.fire;
        
        return !!this.keys[key];
    }
    
    // Register a callback function to be executed when a specific key is pressed
    addKeyCallback(key, callback) {
        if (!this.keyCallbacks[key]) {
            this.keyCallbacks[key] = [];
        }
        this.keyCallbacks[key].push(callback);
    }
    
    // Remove a callback for a specific key
    removeKeyCallback(key, callback) {
        if (this.keyCallbacks[key]) {
            const index = this.keyCallbacks[key].indexOf(callback);
            if (index !== -1) {
                this.keyCallbacks[key].splice(index, 1);
            }
        }
    }

    // Gets the touch areas for rendering
    getTouchAreas() {
        return this.touchAreas;
    }
}