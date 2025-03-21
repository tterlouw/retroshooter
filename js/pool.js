export class Pool {
    constructor(factory) {
        this.factory = factory;
        this.pool = [];
    }

    get() {
        let obj = this.pool.find(o => !o.active) || this.factory();
        if (!this.pool.includes(obj)) this.pool.push(obj);
        return obj;
    }

    update(deltaTime) {
        this.pool.forEach(obj => {
            if (obj.active) {
                obj.update(deltaTime);
            }
        });
    }
}
