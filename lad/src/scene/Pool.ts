/*
    LAD.Pool creates a finite collection of the specified type, allowing
    access to the last used item first.
*/
export class Pool<T> {
    
    items: T[] = [];
    index = 0;
    
    constructor(public type: new () => T, public size: number) {
        this.items = [];
        this.index = 0;
        while (size-- > 0) {
            this.items.push(new type());
        }
    }
    
    getNext(): T {
        // pulls the last used item from the bottom of the stack
        this.index++;
        if (this.index >= this.size) {
            this.index = 0;
        }
        return this.items[this.index];
    }
    
}