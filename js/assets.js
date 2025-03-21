export class AssetManager {
    constructor() {
        this.sprites = {
            helicopter: this.loadSVG('assets/helicopter-sprite.svg'),
            gunboat: this.loadSVG('assets/gunboat-sprite-side.svg'),
            fuelItem: this.loadSVG('assets/fuel-item-sprite.svg')
        };
        this.sounds = {
            fuel: new Audio('assets/fuel.wav'),
            bgm: new Audio('assets/bgm.mp3')
        };
    }
    
    loadSVG(src) {
        const img = new Image();
        img.src = src;
        return img;
    }
}
