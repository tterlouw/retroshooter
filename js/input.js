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
        
        // Touch sensitivity settings (lower = less sensitive)
        this.touchSensitivity = 0.5; // 50% sensitivity compared to keyboard
        
        // Virtual joystick properties
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0,
            angle: 0,
            distance: 0,
            maxDistance: 60, // Maximum distance for full speed
            visible: false,
            touchId: null, // To track the specific touch point for the joystick
            // Store normalized joystick values (-1 to 1) for each direction
            dirValues: {
                left: 0,
                right: 0,
                up: 0,
                down: 0
            }
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
        window.addEventListener('touchstart', e => this.handleTouchStart(e));
        window.addEventListener('touchmove', e => this.handleTouchMove(e));
        window.addEventListener('touchend', e => this.handleTouchEnd(e));
        window.addEventListener('touchcancel', e => this.handleTouchEnd(e));

        // Recalculate touch areas when window resizes
        window.addEventListener('resize', () => this.calculateTouchAreas());

        // Initial calculation of touch areas
        this.calculateTouchAreas();
    }

    calculateTouchAreas() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // For joystick, we'll define a joystick area on the left side of the screen
        // And a fire button on the right side
        const buttonSize = Math.min(80, Math.max(40, width * 0.15)); // Responsive button size
        const margin = buttonSize * 0.5;
        
        this.touchAreas = {
            // Fire button on the right side
            fire: {
                x: width - margin - buttonSize,
                y: height - margin - buttonSize,
                width: buttonSize,
                height: buttonSize
            },
            // Joystick area (left half of screen)
            joystick: {
                x: 0,
                y: 0,
                width: width * 0.5,
                height: height
            }
        };
        
        // Update joystick max distance based on screen size
        this.joystick.maxDistance = Math.min(100, Math.max(40, width * 0.15));
    }

    handleTouchStart(e) {
        e.preventDefault(); // Prevent scrolling while playing
        
        const touches = e.changedTouches;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const x = touch.clientX;
            const y = touch.clientY;
            
            // Check for joystick activation in the left portion of the screen
            if (!this.joystick.active && 
                x < this.touchAreas.joystick.width && 
                y > window.innerHeight * 0.3) { // Only bottom 70% to avoid blocking view
                
                this.joystick.active = true;
                this.joystick.visible = true;
                this.joystick.touchId = touch.identifier;
                this.joystick.startX = x;
                this.joystick.startY = y;
                this.joystick.currentX = x;
                this.joystick.currentY = y;
                this.joystick.deltaX = 0;
                this.joystick.deltaY = 0;
                this.joystick.distance = 0;
                this.joystick.angle = 0;
            }
            
            // Check for fire button
            if (this.touchAreas.fire && 
                x >= this.touchAreas.fire.x && 
                x <= this.touchAreas.fire.x + this.touchAreas.fire.width && 
                y >= this.touchAreas.fire.y && 
                y <= this.touchAreas.fire.y + this.touchAreas.fire.height) {
                
                this.touchInputs.fire = true;
            }
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        
        const touches = e.touches;
        
        // Find and update the joystick touch point
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            
            if (this.joystick.active && touch.identifier === this.joystick.touchId) {
                this.joystick.currentX = touch.clientX;
                this.joystick.currentY = touch.clientY;
                
                // Calculate delta from start position
                this.joystick.deltaX = this.joystick.currentX - this.joystick.startX;
                this.joystick.deltaY = this.joystick.currentY - this.joystick.startY;
                
                // Calculate distance and angle
                this.joystick.distance = Math.sqrt(
                    this.joystick.deltaX * this.joystick.deltaX + 
                    this.joystick.deltaY * this.joystick.deltaY
                );
                
                this.joystick.angle = Math.atan2(this.joystick.deltaY, this.joystick.deltaX);
                
                // Limit distance to maxDistance
                if (this.joystick.distance > this.joystick.maxDistance) {
                    this.joystick.deltaX = Math.cos(this.joystick.angle) * this.joystick.maxDistance;
                    this.joystick.deltaY = Math.sin(this.joystick.angle) * this.joystick.maxDistance;
                    this.joystick.distance = this.joystick.maxDistance;
                }
                
                // Update directional inputs based on joystick position
                this.updateDirectionalInputs();
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        
        const touches = e.changedTouches;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            
            // Reset joystick if it's the joystick touch point
            if (this.joystick.active && touch.identifier === this.joystick.touchId) {
                this.resetJoystick();
            }
            
            // Check if fire button touch has ended
            if (this.touchAreas.fire && 
                touch.clientX >= this.touchAreas.fire.x && 
                touch.clientX <= this.touchAreas.fire.x + this.touchAreas.fire.width && 
                touch.clientY >= this.touchAreas.fire.y && 
                touch.clientY <= this.touchAreas.fire.y + this.touchAreas.fire.height) {
                
                this.touchInputs.fire = false;
            }
        }
        
        // If no touches remain, ensure all inputs are reset
        if (e.touches.length === 0) {
            this.resetJoystick();
            this.touchInputs.fire = false;
        }
    }

    resetJoystick() {
        this.joystick.active = false;
        this.joystick.deltaX = 0;
        this.joystick.deltaY = 0;
        this.joystick.distance = 0;
        this.joystick.dirValues = {
            left: 0,
            right: 0,
            up: 0,
            down: 0
        };
        
        // Reset directional inputs
        this.touchInputs.left = false;
        this.touchInputs.right = false;
        this.touchInputs.up = false;
        this.touchInputs.down = false;
        
        // Keep the joystick visible briefly so the player can see it return to center
        setTimeout(() => {
            if (!this.joystick.active) {
                this.joystick.visible = false;
            }
        }, 500);
    }

    updateDirectionalInputs() {
        // Convert the joystick's angle and distance to directional inputs
        const strength = this.joystick.distance / this.joystick.maxDistance;
        
        // Reset all directional inputs
        this.touchInputs.left = false;
        this.touchInputs.right = false;
        this.touchInputs.up = false;
        this.touchInputs.down = false;
        
        // Reset all directional values
        this.joystick.dirValues = {
            left: 0,
            right: 0,
            up: 0,
            down: 0
        };
        
        // Apply touch sensitivity to the strength
        const adjustedStrength = strength * this.touchSensitivity;
        
        // Only register input if the joystick has moved a minimum distance
        if (strength > 0.2) {
            // Calculate normalized direction values based on the angle
            // These are continuous values between 0 and 1 representing the strength
            // in each direction, and will be used by the player entity
            
            // Horizontal component
            if (this.joystick.deltaX < 0) {
                this.joystick.dirValues.left = -this.joystick.deltaX / this.joystick.maxDistance * this.touchSensitivity;
                this.touchInputs.left = true;
            } else if (this.joystick.deltaX > 0) {
                this.joystick.dirValues.right = this.joystick.deltaX / this.joystick.maxDistance * this.touchSensitivity;
                this.touchInputs.right = true;
            }
            
            // Vertical component
            if (this.joystick.deltaY < 0) {
                this.joystick.dirValues.up = -this.joystick.deltaY / this.joystick.maxDistance * this.touchSensitivity;
                this.touchInputs.up = true;
            } else if (this.joystick.deltaY > 0) {
                this.joystick.dirValues.down = this.joystick.deltaY / this.joystick.maxDistance * this.touchSensitivity;
                this.touchInputs.down = true;
            }
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
    
    // Gets the joystick data for rendering
    getJoystick() {
        return this.joystick;
    }

    // Methods to get the joystick directional values
    getJoystickDirectionValue(direction) {
        return this.joystick.dirValues[direction] || 0;
    }
}