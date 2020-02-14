/*
	LAD.Point is used for positioning. It contains x ans y values and
	methods to operate on multiple points.
*/
export interface IPoint {
    x: number;
    y: number;
}

export class Point implements IPoint {

    public x = 0.0
    public y = 0.0

	constructor(x: number = 0, y: number = 0) {
		this.setValue(x || 0, y || 0);
    }
    
	reset(): Point {
		// returns the point to origin (0, 0)
		this.x = this.y = 0;
		return this;
    }

	add(p: IPoint): Point {
		// adds two points together
		this.x += p.x;
		this.y += p.y;
		return this;
	}
	
	move(x: number, y: number): Point {
		this.x += x;
		this.y += y;
		return this;
	}
    
	subtract(p: IPoint): Point {
		// subtracts the given point from this
		this.x -= p.x;
		this.y -= p.y;
		return this;
    }
    
	multiply(value: number): Point {
		// multiplies each axis by the given value
		this.x *= value;
		this.y *= value;
		return this;
    }
    
	divide(value: number): Point {
		// divides each axis by the given value
		this.x /= value;
		this.y /= value;
		return this;
    }
    
	distanceTo(p: IPoint): number {
		// determines the distance between two points
		return Math.sqrt(this.distanceToSq(p));
    }
    
	distanceToSq(p: IPoint): number {
		// determines the distance squared between two points
		// (useful for faster operations)
		let dx = this.x - p.x,
			dy = this.y - p.y;
		return dx * dx + dy * dy;
    }
    
	isWithinDistance(p: IPoint, d: number): boolean {
		// returns true if the point is within the given distance
		if (isNaN(d)) return false;
		let dx = this.x - p.x,
			dy = this.y - p.y;
		return d * d > dx * dx + dy * dy;
    }
    
	isZero(): boolean {
		// returns true if both axis' are zero
		return this.x == 0 && this.y == 0;
    }
    
	isNearZero(thresh: number): boolean {
		// returns true if both axis' are within the given threshhold
		thresh = thresh || 0.0001;
		return Math.abs(this.x) < thresh && Math.abs(this.y) < thresh;
    }
    
	directionTo(p: IPoint): number {
		// calculates the angle between two points
		return Math.atan2(p.y - this.y, p.x - this.x);
    }
    
	setValue(x: number, y: number): Point {
		// repositions the point
		if (isNaN(x)) x = 0;
		if (isNaN(y)) y = 0;
		this.x = x;
		this.y = y;
		return this;
    }
    
	gridSnap(pixels: number): Point {
		// locks the item to a designated grid size
		this.x = Math.round(this.x / pixels) * pixels;
		this.y = Math.round(this.y / pixels) * pixels;
		return this;
    }
    
	ease(dest: IPoint, percent: number) {
		// moves the given percentage towards the specified point
		this.x = dest.x * percent + this.x * (1 - percent);
		this.y = dest.y * percent + this.y * (1 - percent); 
    }

    getLength(): number {
		// returns the distance to 0,0
		return Math.sqrt(this.getLengthSq());
    }
    
	getLengthSq(): number {
		// returns the distance, squared to 0,0
		// faster for comparison usage
		return this.x * this.x + this.y * this.y;
    }
    
	setLength(length: number): Point {
		// sets x and y according to current angle at new length
		return this.setVector(this.getAngle(), length);
    }
    
	getAngle(): number {
		// returns the angle of x and y from 0,0
		return Math.atan2(this.y, this.x);
    }
    
	setAngle(angle: number) {
		// sets the new angle of x and y at current length
		return this.setVector(angle, this.getLength());
    }

    setVector(angle: number, length: number): Point {
		// sets the x and y according to length and angle from 0,0
		this.x = Math.cos(angle) * length;
		this.y = Math.sin(angle) * length;
		return this;
	}
    
	invert(): Point {
		// turns the vector around
		this.x *= -1;
		this.y *= -1;
		return this;
    }
    
	copy(p: IPoint): Point {
		// repositions the point to match the given point
		this.x = p.x;
		this.y = p.y;
		return this;
    }
    
	clone(): Point {
		// returns a duplicate of this point
		return new Point(this.x, this.y);
    }
    
	toString(): string {
		return "("+ this.x + "," + this.y + ")";
    }
    
}