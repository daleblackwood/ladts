import { Rect } from "../math/Rect";
import { Point } from "../math/Point";
import { Renderer } from "./Renderer";
import { Transform } from "../math/Transform";
import { IClip } from "./IClip";

/*
    LAD.Sprite is used to render portions of a spritesheet. It uses a
    transform object, bounds rectangle and anchor point to discern
    what and where to render.
*/

export class Sprite implements IClip {

    image: HTMLImageElement;
    clipRect: Rect;
    anchor: Point;
    alpha: number;
    frameX = 0;
    frameY = 0;
    framesX = 0;
    framesY = 0;

    constructor(image: HTMLImageElement, options? : { 
        clipRect?: Rect,
        anchor?: Point,
        alpha?: number,
        frameX?: number,
        frameY?: number,
        framesX?: number,
        framesY?: number
    }) {
        this.image = image;
        options = options || {};
        this.clipRect = options.clipRect || new Rect(0, 0, image.width, image.height);
        this.anchor = options.anchor || new Point();
        this.alpha = 1;
        this.framesX = options.framesX || Math.floor(image.width / this.clipRect.width);
        this.framesY = options.framesY || Math.floor(image.width / this.clipRect.height);
        this.setFrame(options.frameX, options.frameY);
    }

    setFrame(x: number, y?: number) {
        if (isNaN(y)) {
            y = Math.floor(x / this.framesX);
        }
        this.frameX = Math.floor((x || 0) % this.framesX);
        this.frameY = Math.floor((y || 0) % this.framesY);
    }
    
    render(r: Renderer, t: Transform) {
        // renders the sprite with the given transformation
        if (!this.image) return;
        let c = r.context;
        c.globalAlpha = this.alpha;

        const anchor = this.anchor.clone();
        const rect = this.clipRect.clone();
        rect.x += this.frameX * this.clipRect.width;
        rect.y += this.frameY * this.clipRect.height;
        anchor.x = anchor.x * rect.width * t.scale;
        anchor.y = anchor.y * rect.height * t.scale;
        let x = t.p.x - anchor.x;
        let y = t.p.y - anchor.y;
        let w = this.clipRect.width * t.scale;
        let h = this.clipRect.height * t.scale;

        if (r.isSmoothing === false) {
            x = Math.round(x);
            y = Math.round(y);
            w = Math.round(w);
            h = Math.round(h);
        }

        c.drawImage(this.image, 
            rect.x, 
            rect.y, 
            rect.width, 
            rect.height, 
            x,
            y,
            w, 
            h
        );
    }
    
    getBounds(): Rect {
        return new Rect().copy(this.clipRect).move(-this.anchor.x, -this.anchor.y);
    }

    clone(): Sprite {
        return new Sprite(this.image, {
            ...this
        });
    }
    
    toString() {
        return (this.image ? "Image" : "No Image") + ": " + this.clipRect.x + "," + this.clipRect.y + " " + this.clipRect.width + "x" + this.clipRect.height;
    }
}