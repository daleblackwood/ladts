import { Point, IPoint } from "./Point";

/*
	LAD.Transform extends LAD.Point to include scale and rotation
	properties.
*/
export class Transform {

    public p = new Point();
    public scale = new Point(1, 1);
	public rotation = 0;
	public depth = 0;

	constructor(p: IPoint = { x: 0, y: 0 }, scale: IPoint = { x: 1, y: 1 }, rotation: number = 0) {
		this.p.copy(p);
		this.scale.copy(scale);
		this.rotation = rotation;
    }
    
	reset(): Transform {
		// returns values to their unaffected, default state
		this.p.reset();
		this.scale.setValue(1, 1);
		this.rotation = 0;
		return this;
    }
    
	add(t: Transform): Transform {
		// adds a transform to this
		this.p.add(t.p);
		if (!isNaN(t.scale.x)) this.scale.x *= t.scale.x;
		if (!isNaN(t.scale.y)) this.scale.y *= t.scale.y;
		if (!isNaN(t.rotation)) this.rotation += t.rotation;
		return this;
    }
    
	subtract(t: Transform): Transform {
		// subtracts a transform from this
		this.p.subtract(t.p);
		if (!isNaN(t.scale.x)) this.scale.x /= t.scale.x;
		if (!isNaN(t.scale.y)) this.scale.y /= t.scale.y;
		if (!isNaN(t.rotation)) this.rotation -= t.rotation;
		return this;
    }
    
	copy(t: Transform): Transform {
		// copies all properties from another transform
		this.p.copy(t.p);
		if (!isNaN(t.scale.x)) this.scale.x = t.scale.x;
		if (!isNaN(t.scale.y)) this.scale.y = t.scale.y;
		if (!isNaN(t.rotation)) this.rotation = t.rotation;
		return this;
    }
    
	copyPosition(p: Point): Transform {
		// copies only the position of the given point
        this.p.copy(p);
		return this;
    }
    
	ease(dest: Transform, percent: number): Transform {
		// moves all properties the given percentage towards the 
		// given destination
		this.p.ease(dest.p, percent);
		if (!isNaN(dest.scale.x)) {
			this.scale.x = dest.scale.x * percent + this.scale.x * (1-percent);
		}
		if (!isNaN(dest.scale.y)) {
			this.scale.y = dest.scale.y * percent + this.scale.y * (1-percent);
		}
		if (!isNaN(dest.rotation)) {
			if (Math.abs(dest.rotation - this.rotation) > Math.PI)
				this.rotation += dest.rotation > this.rotation ? Math.PI*2 : Math.PI*-2;
			this.rotation = dest.rotation * percent + this.rotation * (1-percent);
		}
		return this;
    }
    
	clone() {
		// returns a duplicate of this transform
		return new Transform(this.p, this.scale, this.rotation);
	}
}
