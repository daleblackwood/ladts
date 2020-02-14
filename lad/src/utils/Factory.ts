export class Factory<T> {

    builders: { [key: string]: () => T } = {};

    canMake(key: string) {
        return Boolean(this.builders[key]);
    }

    make(key: string, props?: any): T {
        const builder = this.builders[key];
        const entity = builder();
        return entity;
    }

    addMakers(makers: { [key: string]: () => T }) {
        for (var key in makers) {
            this.addMaker(key, makers[key]);
        }
    }

    addMaker(key: string, type: () => T) {
        this.builders[key] = type;
    }

}