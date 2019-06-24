import { SSShip } from "./SSShip";
import { Point } from "lad/math/Point";
import { ClipGroup } from "lad/display/ClipGroup";
import { Path } from "lad/display/Path";
import { Entity } from "lad/scene/Entity";

/*
    SSChaserShip is an enemy ship that follows the player's ship.
*/
export class SSChaserShip extends SSShip {

    speed = 10;
    hitRadius = 15;
    move = new Point(0, -1);
    moveDelta = new Point(0, -1);
    origin = new Point();
    enemy = true;

    constructor() {
        super();
        this.draw();
    }
    
    draw() {
        let s = new ClipGroup();
        
        let p = new Path("#E44", undefined, 0);
        let PI2 = Math.PI * 2;
        let ang = PI2;
        let seg = PI2 / 24;
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
        
        p = new Path("#666", undefined, 0);
        p.add(0,10);
        p.add(10,0);
        p.add(0,-10);
        p.add(-10,0);
        p.closed = true;
        s.add(p);
        
        this.clip = s;
    }
    
    update() {
        let target = this.scene.ship;
        let moveAngle = target.transform.p.directionTo(this.transform.p) + Math.PI;
        
        this.moveDelta.x = Math.cos(moveAngle) * this.speed;
        this.moveDelta.y = Math.sin(moveAngle) * this.speed;

        this.move.x = (this.move.x * 4 + this.moveDelta.x) * 0.2;
        this.move.y = (this.move.y * 4 + this.moveDelta.y) * 0.2;
        
        let rot = this.origin.directionTo(this.move);
        this.transform.rotation = rot + Math.PI * 0.5;
        this.transform.p.add(this.move);
        
        this.scene.constrain(this);
    }
    
    onCollision(e: Entity) {
        if (!this.scene) return;
        let isEnemy = (e as any).enemy === true;
        if (isEnemy) {
            let r = e.transform.p.directionTo(this.transform.p);
            this.transform.p.x += Math.cos(r) * this.speed * 0.3;
            this.transform.p.y += Math.sin(r) * this.speed * 0.3;
        }
    }
    
}
