import { Entity } from "lad/scene/Entity";
import { Point } from "lad/math/Point";
import { Path } from "lad/display/Path";

/*
	SSSmokePart is the trail behind the  player's ship.
*/
export class SSSmokePart extends Entity {

    move = new Point();
    life = 0;

	constructor() {
		super();
		let alpha = Math.random()*0.3+0.2;
		let p = new Path("rgba(150,150,150,"+alpha+")");
		p.add(-15, 5);
		p.add(0, -8);
		p.add(15, 5);
		p.add(15, 8);
		p.add(0, -5);
		p.add(-15, 8);
		p.closed = true;
		this.clip = p;
    }
    
	go(rotation: number) { 
		let speed = 3;
		this.move.setValue(Math.cos(rotation)*speed, Math.sin(rotation)*speed);
		this.transform.rotation = rotation - Math.PI * 0.5;
		this.life = 8;
    }
    
	start() {
		this.transform.p.add(this.move.clone().multiply(3));
    }
    
	update() {
		this.transform.p.add(this.move);
		if (this.life-- > 0) return;
		this.remove();
	}
}