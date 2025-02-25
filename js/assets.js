export class AssetManager {
    constructor() {
        this.sprites = new Image();
        this.sprites.src = 'assets/sprites.png';
        this.sounds = {
            fuel: new Audio('assets/fuel.wav'),
            bgm: new Audio('assets/bgm.mp3')
        };
    }
}