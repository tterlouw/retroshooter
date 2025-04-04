export class InputHandler {
    constructor() {
        this.keys = {};
        this.keyCallbacks = {};
        
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
    }

    isKeyDown(key) {
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
}