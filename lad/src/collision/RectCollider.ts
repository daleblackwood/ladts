import { Collider } from "./Collider";
import { Rect } from "../math/Rect";
import { Entity } from "../scene/Entity";
import { Renderer } from "lad/display/Renderer";

export class RectCollider extends Collider {

    rect = new Rect();

    constructor(entity: Entity) {
        super(entity);
    }

    public checkCollision(other: Collider) {
        if (other instanceof RectCollider) {
            const thisRect = this.getRect();
            const otherRect = other.getRect();
            if (thisRect.overlaps(otherRect)) {
                if (this.onCollision) {
                    this.handleCollision({ rect: otherRect, target: other.entity });
                }
                if (other.onCollision) {
                    other.handleCollision({ rect: thisRect, target: this.entity });
                }
            }
            return;
        }
        other.checkCollision(this);
    }

    getRect(): Rect {
        const rt = this.entity.renderTransform;
        return this.rect.clone().move(
            rt.p.x - this.entity.scene.renderTransform.p.x,
            rt.p.y - this.entity.scene.renderTransform.p.y,
        );
    }

    public render(r: Renderer) {
        const rect = this.getRect().addPos(this.entity.scene.renderTransform.p);
        const c = r.context;
        c.beginPath()
        c.strokeStyle = "red";
        c.lineWidth = 1;
        c.moveTo(rect.left, rect.top);
        c.lineTo(rect.right, rect.top);
        c.lineTo(rect.right, rect.bottom);
        c.lineTo(rect.left, rect.bottom);
        c.lineTo(rect.left, rect.top);
        c.stroke();
    }

}