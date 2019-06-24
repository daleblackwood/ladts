import { EntityContainer } from "lad/scene/EntityContainer";
import { Renderer } from "lad/display/Renderer";
import { IBoxStyle } from "./IBoxStyle";
import { Point } from "lad/math/Point";
import { Rect } from "lad/math/Rect";

export class UIPanel extends EntityContainer {

    size = new Point();
    bgStyle: IBoxStyle|null = null;

    render(r: Renderer) {
        this.renderBg(r);
        super.render(r);
    }

    renderBg(r: Renderer) {
        if (! this.bgStyle) {
            return;
        }

        const size = this.size;
        
        const rl = this.renderTransform.p.x;
        const rr = rl + this.renderTransform.scale * size.x;
        const rt = this.renderTransform.p.y;
        const rb = rt + this.renderTransform.scale * size.y;
        
        const c = r.context;
        c.fillStyle = this.bgStyle.fillStyle;
        c.strokeStyle = this.bgStyle.strokeStyle || "none";
        c.lineWidth = this.bgStyle.lineWidth || 0;
        c.beginPath();
        c.moveTo(rl, rt);
        c.lineTo(rr, rt);
        c.lineTo(rr, rb);
        c.lineTo(rl, rb);
        c.lineTo(rl, rt);
        if (this.bgStyle.fillStyle) {
            c.fill();
        }
        if (this.bgStyle.strokeStyle) {
            c.stroke();
        }
    }

    getBounds(): Rect {
        const rx = this.renderTransform.p.x;
        const ry = this.renderTransform.p.y;
        const rw = this.renderTransform.scale * this.size.x;
        const rh = this.renderTransform.scale * this.size.y;
        return new Rect(rx, ry, rw, rh);
    }

}