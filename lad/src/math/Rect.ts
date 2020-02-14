import { Point, IPoint } from "./Point";

/*
	LAD.Rectangle is used for bounds and rectangle operations.
*/
export class Rect {

	public topLeft: Point = new Point();
	public bottomRight: Point = new Point();
	public get width() { return this.bottomRight.x - this.topLeft.x }
	public get height() { return this.bottomRight.y - this.topLeft.y }
	public get top() { return this.topLeft.y }
	public get left() { return this.topLeft.x }
	public get bottom() { return this.bottomRight.y }
	public get right() { return this.bottomRight.x }
	public get center() { return this.topLeft.clone().add(this.bottomRight).divide(2) }

	constructor(x: number = 0, y: number = 0, width: number = 0, height:number = 0) {
		this.setSize(x, y, width, height);
	}

	setSize(x: number = 0, y: number = 0, width: number = 0, height:number = 0) {
		this.topLeft.setValue(x, y);
		this.bottomRight.setValue(x + width, y + height);
	}

	insetAll(padding: number) {
		this.topLeft.move(padding, padding);
		this.bottomRight.move(-padding, -padding);
		return this;
	}

	insetEach(top: number, left: number, bottom: number, right: number) {
		this.topLeft.move(left, top);
		this.bottomRight.move(-right, -bottom);
		return this;
	}

	move(x: number, y: number) {
		this.topLeft.move(x, y);
		this.bottomRight.move(x, y);
		return this;
	}

	addPos(p: IPoint) {
		this.topLeft.add(p);
		this.bottomRight.add(p);
		return this;
	}
    
	isWithin(p: { x: number, y: number }) {
		// returns true if the given point is within this rectangle
		return p.x >= this.topLeft.x 
			&& p.y >= this.topLeft.y
			&& p.x <= this.bottomRight.x
			&& p.y <= this.bottomRight.y
	}

	overlaps(r: Rect): boolean {
		if (this.topLeft.x > r.bottomRight.x || this.bottomRight.x < r.topLeft.x) 
        	return false; 
  
		if (this.topLeft.y > r.bottomRight.y || this.bottomRight.y < r.topLeft.y) 
			return false; 
	
		return true; 
	}

	copy(r: Rect): Rect {
		this.topLeft.copy(r.topLeft);
		this.bottomRight.copy(r.bottomRight);
		return this;
	}

	clone(): Rect {
		return new Rect().copy(this);
	}

	encapsulate(r: Rect): Rect {
		this.topLeft.x = Math.min(this.topLeft.x, r.topLeft.x);
		this.topLeft.y = Math.min(this.topLeft.y, r.topLeft.y);
		this.bottomRight.x = Math.max(this.bottomRight.x, r.bottomRight.x);
		this.bottomRight.y = Math.min(this.bottomRight.y, r.bottomRight.y);
		return this;
	}
}