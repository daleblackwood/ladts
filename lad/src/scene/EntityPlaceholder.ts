import { Entity } from "./Entity";
import { Renderer } from "../display/Renderer";
import { IEntityData } from "../tiles/Tilemap";
import { pointerManager, IPointerEvent } from "lad/input/PointerManager";
import { RectCollider } from "lad/collision/RectCollider";

export class EntityPlaceholder extends Entity {

    collider: RectCollider = null;

    constructor(public data: IEntityData, public entity: Entity) {
        super();
    }

    start() {
        pointerManager.onChange.listen(this, this.handlePointer);
    }

    handlePointer(e: IPointerEvent) {
        if (e.isDown) {
            this.collider = this.entity.getComponent(RectCollider);
        }
    }

    remove() {
        pointerManager.onChange.unlistenAll(this);
        super.remove();
    }

    callRender(r: Renderer) {
        super.callRender(r);
        this.entity.scene = this.scene;
        this.entity.parent = this;
        this.entity.calculateRenderTransform(r);
        this.entity.render(r);
    }

}