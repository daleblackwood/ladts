import { EntityContainer } from "../scene/EntityContainer";
import { Renderer } from "../display/Renderer";
import { IPoint, Point } from "../math/Point";
import { UIPanel } from "./UIPanel";
import { Entity, EntityState } from "../scene/Entity";

export class UIGrid extends UIPanel {

    static BREAK: Entity = new Entity();
    
    tileSize: IPoint;
    padding: IPoint;
    alignH: "left"|"center"|"right" = "left";
    alignV: "top"|"middle"|"bottom" = "top";
    order: "forwards"|"reverse" = "forwards";
    fitToParent = false;

    constructor(tileSize: IPoint, padding?: IPoint) {
        super();
        this.tileSize = tileSize;
        this.padding = padding || { x: 0, y: 0 };
    }

    add<T extends Entity>(entity: T, index: number = -1): T {
        if (this.isGriddable(entity) === false) {
            throw new Error("UIGrid must be contain UIPanels or UIGrid.BREAK");
        }
        return super.add(entity, index);
    }

    isGriddable(entity: Entity) {
        return entity instanceof UIPanel || entity === UIGrid.BREAK;
    }

    callRender(r: Renderer) {
        // calculate rows
        const size = this.fitToParent && this.parent instanceof UIPanel ? this.parent.size : this.size;
        const children = this.entities.filter(x => this.isGriddable(x));
        const maxChildrenPerRow = Math.floor((size.x + this.padding.x) / (this.tileSize.x + this.padding.x));
        const rows: Entity[][] = [[]];
        for (let i = 0; i < children.length; i++) {
            const row = rows[rows.length - 1];
            const childI = this.order === "reverse" ? children.length - i - 1 : i;
            const child = children[childI];
            if (child === UIGrid.BREAK) {
                rows.push(row);
                continue;
            }
            row.push(child);
            if (row.length >= maxChildrenPerRow) {
                rows.push(row);
            }
        }

        // position children
        const totalHeight = rows.length * (this.tileSize.y + this.padding.y) - this.padding.y;
        for (let y = 0; y < rows.length; y++) {
            const row = rows[y];
            const rowWidth = row.length * (this.tileSize.x + this.padding.x) - this.padding.x;
            for (let x = 0; x < row.length; x++) {
                const child = row[x];
                let px = this.padding.x + x * (this.tileSize.x + this.padding.x);
                if (this.alignH === "right") {
                    px = (size.x - rowWidth) + px - this.padding.x * 2;
                }
                else if (this.alignH === "center") {
                    px = (size.x - rowWidth) * 0.5 + px - this.padding.x;
                }
                child.transform.p.x = px;
                let py = this.padding.y + y * (this.tileSize.y + this.padding.y);
                if (this.alignV === "bottom") {
                    py = (size.y - totalHeight) + py - this.padding.y * 2;
                }
                else if (this.alignV === "middle") {
                    py = (size.y - totalHeight) * 0.5 + py - this.padding.y;
                }
                child.transform.p.y = py;
                const panel = child as UIPanel;
                panel.size.copy(this.tileSize);
            }
        }
        super.callRender(r);
    }


}