import { SSEntity } from "./SSEntity";
import { SSGame } from "./SSGame";
import { SSScene } from "./SSScene";
import { Point } from "lad/math/Point";
import { Path } from "lad/display/Path";
import { Entity } from "lad/scene/Entity";

/*
    SSExplosionPart is a single particle from a particle explosion.
*/
export class SSExplosionPart extends SSEntity {

    game: SSGame;
    scene: SSScene;
    move = new Point();
    magnetDistance = 150;
    speed = 0;
    lived = 0;
    hitRadius = 5;
    magnetic = false;
    life = 0;
    
    constructor() { 
        super();
        let p = new Path("red");
        p.addCircle(0, 0, 4, 6);
        p.closed = true;
        this.clip = p;		
    }
    
    go(angle: number, speed: number, color: string) {		
        this.speed = speed;
        this.life = this.life || Math.random()*30+30;
        this.lived = 0;
        this.clip.fillColor = color;

        this.move.setVector(angle, speed);
        
        this.transform.rotation = angle;
        this.hitRadius = 5;
        this.magnetic = false;
    }
    
    update() {
        if (this.magnetic && this.scene.ableState == "alive") {
            if (this.speed < 20) {
                this.speed += 0.5;
            }
            let ang = this.transform.p.directionTo(this.scene.ship.transform.p);
            this.move.setVector(ang, this.speed);
        } else {
            if (this.scene.ship) {
                const near = this.transform.p.isWithinDistance(this.scene.ship.transform.p, this.magnetDistance);
                this.magnetic = this.lived > 10 && near;
            }
            this.move.multiply(0.95);
        }
        this.transform.p.add(this.move);
        this.scene.constrain(this);

        if (this.lived++ >= this.life) {
            this.remove();
        }
    }
    
    onCollision (e: Entity) {
        if (e != this.scene.ship) return;
        this.game.score.increaseMulti();
        this.remove();
    }
}