import { UIPanel } from "./UIPanel";
import { Sprite } from "lad/display/Sprite";
import { Renderer } from "lad/display/Renderer";

export class UISprite extends UIPanel {

    sprite: Sprite;

    constructor(sprite: Sprite) {
        super();
        this.sprite = sprite.clone();
    }

    render(r: Renderer) {
        super.render(r);
        const st = this.renderTransform.clone();
        const scale = Math.min(
            this.sprite.clipRect.width / this.size.x, 
            this.sprite.clipRect.height / this.size.y
        );
        st.scale.setValue(scale, scale);
        st.p.move(this.size.x * 0.5, this.size.y * 0.5);
        this.sprite.render(r, st, { x: 0.5, y: 0.5 });
    }

}