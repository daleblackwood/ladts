import { Renderer } from "./Renderer";
import { Transform } from "../math/Transform";
import { Rect } from "../math/Rect";
import { IClip } from "./IClip";

/*
	LAD.Path is used to render vector paths. Paths are given fill
	colors, line colors, line widths and a series of points.
*/
export interface IPathPoint {
    x: number;
	y: number;
	op?: PathOp;
}

export enum PathOp {
	Line,
	Move
}

export class Path implements IClip {

    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    points: IPathPoint[];
    closed: boolean;

	constructor(fillColor?: string, stokeStyle?: string, lineWidth?: number, points?: IPathPoint[], closed?: boolean) {
		this.fillStyle = fillColor;
		this.strokeStyle = stokeStyle || "black";
		this.lineWidth = lineWidth > 0 ? lineWidth : 0;
		this.points = points || [];
		this.closed = closed || false;
    }
    
	add(x: number, y: number, op?: PathOp): IPathPoint {
		x = x || 0;
		y = y || 0;
		op = op || PathOp.Line;
		const p = { x, y, op };
		this.points.push(p);
		return p;
    }
    
	remove(p: IPathPoint): IPathPoint | null {
		// removes a point from the path
		let i = this.points.length;
		while (i-- > 0) {
			if (this.points[i].x !== p.x) continue;
			if (this.points[i].y !== p.y) continue;
			this.points.splice(i, 1);
			break;
		}
		return p || null;
    }
    
	addCircle(x: number, y: number, radius: number, pointCount?: number) {
		// creates a circle with given points (or 16) with given radius
		if (isNaN(pointCount)) pointCount = 16;
		let ang = Math.PI * 2,
			seg = ang / pointCount;
		
		this.add(x, y, PathOp.Move);
		while (ang > 0) {
			this.add(
				Math.cos(ang) * radius + x, 
				Math.sin(ang) * radius + y
			);
			ang -= seg;
		}
    }
    
	addBox(x: number, y: number, width: number, height: number) {
		// creates a rectangle (four points)
		this.add(x, y, PathOp.Move);
		this.add(x + width, y);
		this.add(x + width, y + height);
		this.add(y, y + height);
    }
    
	render(r: Renderer, t: Transform) {
		// renders the path
		if (this.points.length < 2) {
			return;
		}
        const c = r.context;
		
		const useFill = this.fillStyle != null;
        const useStroke = this.lineWidth > 0;	
		
		c.beginPath();

		c.lineWidth = this.lineWidth;
		if (useFill) {
			c.fillStyle = this.fillStyle;
		}
		if (useStroke) {
			c.strokeStyle = this.strokeStyle;
		}
		
		const points = this.points.slice();
		if (closed) {
			points.push(points[0]);
		}
		let len = points.length, i = -1;
		while(++i < len) {
			const p = points[i];
			const cos = Math.cos(t.rotation) * t.scale.x;
			const sin = Math.sin(t.rotation) * t.scale.y;
			const px = p.x * cos - p.y * sin + t.p.x;
			const py = p.x * sin + p.y * cos + t.p.y;
			if (i == 0 || p.op === PathOp.Move) {
				c.moveTo(px, py);
			}
			else {
				c.lineTo(px, py);
			}
		}
		if (useFill) {
			c.fill();
		}
		if (useStroke) {
			c.stroke();
		}
    }
    
	getRect(): Rect {
        // returns a new rectangle with the boundaries of this path
        let points = this.points;
        let l = 0, r = 0, b = 0, t = 0;
        let i = this.points.length;
		if (i > 0) {
			let p;
			while (i-- > 0) {
				p = points[i];
				if (isNaN(l) || p.x < l) l = p.x;
				if (isNaN(r) || p.x > r) r = p.x;
				if (isNaN(t) || p.y < t) t = p.y;
				if (isNaN(b) || p.y > b) b = p.y;
			}
			return new Rect(l, t, r-l, b-t);
        }
        return new Rect();
    }
    
}