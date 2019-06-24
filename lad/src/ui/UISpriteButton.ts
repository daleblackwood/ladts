import { UIButton } from "lad/ui/UIButton";
import { Sprite } from "lad/display/Sprite";
import { Renderer } from "lad/display/Renderer";

export class UISpriteButton extends UIButton {

    sprite: Sprite;
    padding = 0;
    onClick: () => void;

    constructor(sprite: Sprite, tile: [number, number]) {
        super();
        this.sprite = sprite.clone();
        this.size.setValue(40, 40);
        this.sprite.setFrame(tile[0], tile[1]);
    }

    handleClick() {
        if (typeof this.onClick === "function") {
            this.onClick();
        }
        super.handleClick();
    }

    render(r: Renderer) {
        super.render(r);
        this.renderIcon(r);
    }

    renderIcon(r: Renderer) {
        const t = this.renderTransform.clone();
        t.p.move(this.padding, this.padding);
        const scale = Math.min(
            (this.size.x - this.padding * 2) / this.sprite.clipRect.width, 
            (this.size.y - this.padding * 2) / this.sprite.clipRect.height
        );
        t.scale = scale;
        this.sprite.render(r, t);
    }

}