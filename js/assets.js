export class AssetManager {
    constructor() {
        this.spriteSources = {
            helicopter: 'assets/helicopter-sprite.svg',
            gunboat: 'assets/gunboat-sprite-side.svg',
            fuelItem: 'assets/fuel-item-sprite.svg'
        };
        this.soundSources = {
            fuel: 'assets/fuel.wav',
            bgm: 'assets/bgm.mp3'
        };
        this.sprites = {};
        this.sounds = {};
        this.errors = [];
    }

    preloadAll() {
        const spritePromises = Object.entries(this.spriteSources).map(([key, src]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.sprites[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    this.errors.push(`Failed to load image: ${src}`);
                    reject(new Error(`Failed to load image: ${src}`));
                };
                img.src = src;
            });
        });

        const soundPromises = Object.entries(this.soundSources).map(([key, src]) => {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    this.sounds[key] = audio;
                    resolve();
                };
                audio.onerror = () => {
                    this.errors.push(`Failed to load sound: ${src}`);
                    reject(new Error(`Failed to load sound: ${src}`));
                };
                audio.src = src;
                // For some browsers, force load
                audio.load();
            });
        });

        return Promise.all([...spritePromises, ...soundPromises]);
    }
}
