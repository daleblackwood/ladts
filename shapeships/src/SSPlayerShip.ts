import { SSShip, SSBullet } from "./SSShip";
import { SSGame } from "./SSGame";
import { SSSmokePart } from "./SSSmokePart";
import { SSInput } from "./SSInput";
import { Point } from "lad/math/Point";
import { ClipGroup } from "lad/display/ClipGroup";
import { Path } from "lad/display/Path";
import { Entity } from "lad/scene/Entity";

/*
	SSPlayerShip extends SSShip to include player control and input
	responses.
*/
export class SSPlayerShip extends SSShip {

    game: SSGame;
    speed = 12;
    fireSpeed = 30;
    shootFrames = 4;
    smokeFrames = 4;
    hitRadius = 24;
    enemy = false;
    bullets: SSBullet[] = [];
    smokes: SSSmokePart[] = [];
    input: SSInput;
    move = new Point();
    frame = 0;
    shootAngle = 0;
    
	awake() {
		this.input = this.game.input;
		this.input.keyboard.addActions(this.game.keys);
		this.input.pointer.addActions(this.game.mouse);
		this.input.player = this;
		this.draw();
    }
    
	draw() {
		let s = new ClipGroup();
	
		let p = new Path("#DDA", "#999", 1);
		p.add(-16, 24);
		p.add(0, -24);
		p.add(16, 24);
		p.add(0, 18);
		p.add(-16, 24);
		p.closed = true;
		s.add(p);
		
		p = new Path("#FFF");
		p.add(-10, 12);
		p.add(-16, 24);
		p.add(0,0);
		p.closed = true;
		s.add(p);
		
		p = new Path("#FFF");
		p.add(10, 12);
		p.add(16, 24);
		p.add(0,0);
		p.closed = true;
		s.add(p);
		
		p = new Path("#AAA");
		p.add(0, -24);
		p.add(-1, 24);
		p.add(1, 24);
		p.closed = true;
		s.add(p);
		
		this.clip = s;
    }
    
	start() {
		this.reset();
    }
    
	reset() {
		this.transform.rotation = 0;
		this.move.setValue(0, -1);
		this.moveDelta.copy(this.move);
		this.frame = 0;
    }
    
	update() {
		let moveAngle = this.game.input.getMoveAngle();

		this.speed = Math.min(10 + (this.game ? this.game.score.multi / 50 : 1), 25);
		
		if (isNaN(moveAngle)) {
			this.moveDelta.reset();
		}
		else {
			this.moveDelta.setVector(moveAngle, this.speed);
		}
		this.move.ease(this.moveDelta, 0.2);
		
		let rot = this.origin.directionTo(this.move);
		this.transform.rotation = rot + Math.PI * 0.5;
		this.transform.p.add(this.move);
		
		this.scene.constrain(this);
		
		// shoot
		let shootAngle = this.game.input.isPressed("shootStraight") ? rot : this.game.input.getShootAngle();	
		if (shootAngle && !this.shootAngle) this.shootAngle = shootAngle;
		if (shootAngle && this.shootAngle) shootAngle = (shootAngle*7 + this.shootAngle) * 0.125;
		
		if (this.frame % this.shootFrames == 0 && !isNaN(shootAngle)) {
			if (this.shootAngle - shootAngle > Math.PI) {
				this.shootAngle -= Math.PI * 2;
			}
			this.shoot(shootAngle);
		}
		this.shootAngle = shootAngle;
		
		//smoke
		if (this.frame % this.smokeFrames == 0 && !isNaN(moveAngle)) {
			this.smoke();
		}
		
		this.frame++;
    }
    
	shoot(angle: number) {
		let bullet = this.bullets.length > 10 ? this.bullets.shift() : new SSBullet();
		bullet.transform.copy(this.prevTransform);
		bullet.go(angle, this.fireSpeed);
		if (!bullet.scene) this.scene.add(bullet, 1);
		this.bullets.push(bullet);
    }
    
	smoke() {
		let smoke = this.smokes.length > 8 ? this.smokes.shift() : new SSSmokePart();
		smoke.go(this.transform.rotation + Math.PI * 0.5)
		smoke.transform.copy(this.prevTransform);
		if (!smoke.scene) this.scene.add(smoke, 1);
		this.smokes.push(smoke);
    }

	onCollision(e: Entity) {
        if ((e as any).enemy) {
            this.scene.die();
        }
    }
}