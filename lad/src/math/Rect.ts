/*
    LAD.Rectangle is used for bounds and rectangle operations.
*/
export class Rect {

    public x = 0;
    public y = 0;
    public width = 0;
    public height = 0;

    constructor(x?: number, y?: number, width?: number, height?:number) {
        this.setSize(x, y, width, height);
    }

    setSize(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
        return this;
    }

    inset(padding: number) {
        this.x += padding;
        this.width -= padding * 2;
        this.y += padding;
        this.height += padding * 2;
        return this;
    }

    move(x: number, y: number) {
        this.x += x;
        this.y += y;
        return this;
    }
    
    getLeft() {
        return this.x;
    }
    setLeft(value: number) {
        this.x = value;
    }

    getRight() {
        return this.x + this.width;
    }
    setRight(value: number) {
        this.width = value - this.x;
    }

    getTop() {
        return this.y;
    }
    setTop(value: number) {
        this.y = value
    }

    getBottom() {
        return this.y + this.height;
    }
    setBottom(value: number) {
        this.height = value - this.y;
    }
    
    isWithin(p: { x: number, y: number }) {
        // returns true if the given point is within this rectangle
        return p.x > this.x 
            && p.y > this.y
            && p.x < this.x + this.width
            && p.y < this.y + this.height;
    }

    overlaps(r: Rect): boolean {
        return this.isWithin({ x: r.x, y: r.y })
            && this.isWithin({ x: r.x + r.width, y : r.y + r.height });
    }

    copy(r: Rect): Rect {
        this.x = r.x;
        this.y = r.y;
        this.width = r.width;
        this.height = r.height;
        return this;
    }

    clone(): Rect {
        return new Rect().copy(this);
    }

    encapsulate(r: Rect): Rect {
        this.x = Math.min(this.x, r.x);
        this.y = Math.min(this.y, r.y);

        const rRight = r.x + r.width;
        if (rRight > this.x + this.width) {
            this.width = rRight - this.x;
        }

        const rBottom = r.y + r.height;
        if (rBottom > this.y + this.height) {
            this.height = rBottom - this.y;
        }

        return this;
    }
}