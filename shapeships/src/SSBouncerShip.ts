import { SSShip } from "./SSShip";
import { Point } from "lad/math/Point";
import { ClipGroup } from "lad/display/ClipGroup";
import { Path } from "lad/display/Path";
import { Entity } from "lad/scene/Entity";

/*
    SSBounceShip is an enemy ship that travels diagonally from wall
    to wall, turning 90 degrees at each wall collision.
*/
export class SSBounceShip extends SSShip {

    direction = 0;
    speed = 10;
    hitRadius = 15;
    origin = new Point();
    enemy = true;

    constructor() {
        super();
        this.draw();
    }
    
    draw() {
        let s = new ClipGroup();
        
        let p = new Path("#44E", undefined, 0);
        let PI2 = Math.PI * 2;
        let ang = PI2;
        let seg = ang / 6;
        let rad = 20;
        let px, py;
        while (ang >= 0) {
            px = Math.cos(ang) * rad;
            py = Math.sin(ang) * rad;
            p.add(px, py);
            rad = rad == 20 ? 16 : 20;
            ang -= seg;
        }
        while (ang <= PI2) {
            px = Math.cos(ang) * rad;
            py = Math.sin(ang) * rad;
            p.add(px, py);
            rad = rad == 10 ? 8 : 10;
            ang += seg;
        }
        p.closed = true;
        s.add(p);
        
        p = new Path("#999", undefined, 0);
        p.addCircle(0,0,8);
        p.closed = true;
        s.add(p);
        
        this.clip = s;
    }
    
    start() {
        this.setRandomDirection();
    }
    
    update() {
        this.moveDelta.setVector(this.direction, this.speed);
        this.move.ease(this.moveDelta, 0.2);
        
        this.transform.rotation += 0.2;
        this.transform.p.add(this.move);
        
        if (this.scene.isWithin(this)) return;
        this.scene.constrain(this);
        this.setRandomDirection();
    }
    
    setRandomDirection() {
        this.direction = Math.floor(Math.random() * 4) * Math.PI * 0.5 + Math.PI * 0.25;
    }
    
    onCollision(e: Entity) {
        if (!this.scene) return;
        if ((e as any).enemy === true) {
            this.direction = e.transform.p.directionTo(this.transform.p);
        }
    }
}