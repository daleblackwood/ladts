import { SSEntity } from "./SSEntity";
import { Point } from "lad/math/Point";
import { SSScene } from "./SSScene";
import { Entity } from "lad/scene/Entity";
import { Path } from "lad/display/Path";

/*
	SSShip acts as a base class for all ships and bullets in the game.
*/
export class SSShip extends SSEntity {

    scene: SSScene;
    speed = 10;
    move = new Point(0, -1);
    moveDelta = new Point(0, -1);
    origin = new Point();
	hitRadius = 20;
	collides = true;
    
	update() {
		this.transform.p.add(this.move);
    }
    
}

export class SSBullet extends SSShip {

    hitRadius = 20;
    enemy = false;
        
	constructor() { 
        super();
		let p = new Path("#468");
		p.add(-5,-3);
		p.add(0, -7);
		p.add(5,-3);
		p.add(5, 5);
		p.add(-5, 5);
		p.closed = true;
		this.clip = p;
    }
    
	go(angle: number, speed: number) {
		this.move.setVector(angle, speed);
		this.transform.rotation = angle + Math.PI * 0.5;
    }
    
	update() {
		super.update();
		if (this.scene.isWithin(this)) return;
		this.remove();
    }
    
	onCollision(e: Entity) {
        let isFriendly = (e as any).enemy === true;
		if (e == this.scene.ship || isFriendly === false) return;
		this.scene.kill(e);
	}
}