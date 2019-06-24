import { Entity } from "lad/scene/Entity";
import { SSExplosionPart } from "./SSExplosionPart";

/*
    SSExplosion causes a particle explosion at a specified point.
*/
export class SSExplosion extends Entity {

    color: string = "grey";
    life = 0;

    constructor(public partCount: number, public speed: number) {
        super();
    }
    
    start(){
        let g = Math.floor(Math.random() * 150 + 30);
        let b = Math.floor(Math.random() * 150 + 100);
        if (!this.color) this.color = "rgb(125," + g + "," + b + ")";
        let part: SSExplosionPart;
        let ang = Math.PI * 2;
        let seg = ang / this.partCount;
        while (ang > 0) {
            part = new SSExplosionPart();
            part.life = this.life;
            part.go(ang, this.speed, this.color);
            part.transform.p.copy(this.transform.p);
            this.scene.add(part, 1);
            ang -= seg;
        }
        this.remove();
    }
}