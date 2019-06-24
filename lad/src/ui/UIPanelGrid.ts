import { EntityContainer } from "lad/scene/EntityContainer";
import { Renderer } from "lad/display/Renderer";
import { Point } from "lad/math/Point";
import { UIPanel } from "./UIPanel";
import { Entity } from "lad/scene/Entity";
import { Rect } from "lad/math/Rect";

export class UIPanelGrid extends EntityContainer {
    
    tileSize: Point;
    padding: Point;

    constructor(tileSize: Point, padding?: Point) {
        super();
        this.tileSize = tileSize;
        this.padding = padding || new Point();
    }

    add(entity: Entity, index: number = -1): Entity {
        if (entity instanceof UIPanel === false) {
            throw new Error("UIGrid must be contain UIPanels");
        }
        return super.add(entity, index);
    }

    callRender(r: Renderer) {
        if (!this.parent || this.parent instanceof UIPanel === false) {
            this.remove();
            throw new Error("UIGrid must be child of UIPanel");
        }
        const size = (this.parent as UIPanel).size;
        const point = this.padding.clone();
        for (const child of this.entities) {
            child.transform.p.x = point.x;
            child.transform.p.y = point.y;
            child.setEnabled(true);
            const panel = child as UIPanel;
            panel.size.copy(this.tileSize);
            point.x += this.tileSize.x + this.padding.x;
            if (point.x > size.x) {
                point.x = this.padding.x;
                point.y += this.tileSize.y + this.padding.y;
            }
            if (point.y + this.tileSize.y > size.y) {
                child.setEnabled(false);
            }
        }
        super.callRender(r);
    }

}