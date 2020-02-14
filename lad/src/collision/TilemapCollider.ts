import { Collider } from "./Collider";
import { Rect } from "../math/Rect";
import { Tilemap, BlockInfo } from "../tiles/Tilemap";
import { RectCollider } from "./RectCollider";
import { Renderer } from "lad/display/Renderer";
import { IBlock } from "lad/tiles/Tileset";

export type TilemapContact = { rect: Rect, target: BlockInfo } | null;

export class TilemapCollision {
    contacts: TilemapContact[];
    top: TilemapContact;
    left: TilemapContact;
    bottom: TilemapContact;
    right: TilemapContact;
}

export class TilemapCollider extends Collider {

    rect = new Rect();

    constructor(public tilemap: Tilemap) {
        super(tilemap);
        (tilemap as any).collider = this;
    }

    public checkCollision(other: Collider) {
        if (typeof other.onCollision !== "function") {
            return;
        }
        if (other instanceof RectCollider) {
            const rect = other.rect.clone().addPos(other.entity.transform.p);
            const centerX = (rect.topLeft.x + rect.bottomRight.x) * 0.5;
            const centerY = (rect.topLeft.y + rect.bottomRight.y) * 0.5;

            const parseContact = (x: number, y: number): TilemapContact => {
                const target = this.tilemap.getBlockAt({ x, y });
                if (! target.block) {
                    return null;
                }
                const rect = target.rect.clone();
                return { rect, target };
            };

            const c = new TilemapCollision();
            c.bottom = parseContact(centerX, rect.bottomRight.y);
            c.left = parseContact(rect.topLeft.x, centerY);
            c.right = parseContact(rect.bottomRight.x, centerY);
            c.top = parseContact(centerX, rect.topLeft.y);
            c.contacts = [ c.bottom, c.left, c.right, c.top ].filter(x => Boolean(x));
            for (const contact of c.contacts) {
                other.handleCollision({ ...contact });
            }
            return;
        }
    }

    public render(r: Renderer) {
        const c = r.context;
        c.beginPath()
        c.strokeStyle = "blue";
        c.lineWidth = 1;
        const p = this.tilemap.renderTransform.p;
        for (let y=0; y<this.tilemap.tilesY; y++) {
            for (let x=0; x<this.tilemap.tilesX; x++) {
                const { rect, block } = this.tilemap.getBlockAt(this.tilemap.getBlockPoint(x, y));
                rect.addPos(this.entity.scene.renderTransform.p);
                if (!block) {
                    continue;
                }
                rect.move(p.x, p.y);
                c.moveTo(rect.left, rect.top);
                c.lineTo(rect.right, rect.top);
                c.lineTo(rect.right, rect.bottom);
                c.lineTo(rect.left, rect.bottom);
                c.lineTo(rect.left, rect.top);
            }
        }
        c.stroke();
    }

}