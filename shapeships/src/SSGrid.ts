import { Entity } from "lad/scene/Entity";
import { Path } from "lad/display/Path";

/*
	SSGrid displays a grid for the map (behind the player).
*/
export class SSGrid extends Entity {

    width = 0;
    height = 0;
    gridSize = 80;

	constructor() {
        super();
		let cols = 17;
		let rows = 9;
		let odd = false;
		let width = this.gridSize * cols;
		let height = this.gridSize * rows;
		
		let p = new Path(null, "#ACE", 2);
		let a = 0, b = 0;
		let pos = this.gridSize;
		while (pos <= width) {
			odd = !odd;
			a = odd ? height : 0;
			b = odd ? 0 : height;
			p.add(pos, a);
			p.add(pos, b);
			pos += this.gridSize;
		}
		pos = height;
		while (pos >= 0) {
			a = odd ? width : 0;
			b = odd ? 0 : width;
			p.add(a, pos);
			p.add(b, pos);
			pos -= this.gridSize;
			odd = !odd;
		}
		p.add(0, 0);
		p.add(width, 0);
		p.add(width, height);
		p.add(0, height);
		p.add(0, 0);
		p.closed = false;
		
		this.clip = p;
		this.width = width;
		this.height = height;
    }
    
}