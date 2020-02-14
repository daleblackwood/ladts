import { UIButton } from "../ui/UIButton";
import { Sprite } from "../display/Sprite";
import { Renderer } from "../display/Renderer";
import { Point } from "lad/math/Point";
import { Rect } from "lad/math/Rect";

export class UISpriteButton extends UIButton {

    sprite: Sprite;
    padding = 0;
    anchor: Point = new Point();

    constructor(sprite: Sprite, tile: [number, number]) {
        super();
        this.sprite = sprite.clone();
        this.size.setValue(40, 40);
        this.sprite.setDefaultClip({ frameX: tile[0], frameY: tile[1] });
    }

    render(r: Renderer) {
        super.render(r);
        this.renderIcon(r);
    }

    renderIcon(r: Renderer) {
        const t = this.renderTransform.clone();
        t.p.move(this.padding, this.padding);
        t.p.move(this.anchor.x * -this.size.x, this.anchor.y * -this.size.y);
        const scale = Math.min(
            (this.size.x - this.padding * 2) / this.sprite.clipRect.width, 
            (this.size.y - this.padding * 2) / this.sprite.clipRect.height
        );
        t.scale.setValue(scale, scale);
        this.sprite.render(r, t);
    }

    getBounds(): Rect {
        const rx = this.renderTransform.p.x + this.anchor.x * -this.size.x;
        const ry = this.renderTransform.p.y + this.anchor.y * -this.size.y;
        const rw = this.renderTransform.scale.x * this.size.x;
        const rh = this.renderTransform.scale.y * this.size.y;
        return new Rect(rx, ry, rw, rh);
    }

}