import { Scene } from "lad/scene/Scene";
import { EntityContainer } from "lad/scene/EntityContainer";

export interface IFontOptions {
    face?: string;
    size?: number;
    stroke?: string;
    fill?: string;
    baseline?: CanvasTextBaseline;
    align?: CanvasTextAlign;
    lineWidth? : number;
}

export class Renderer {

    static main: Renderer;

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    percent: number = 1;
    isSmoothing = false;
    renderCount = 0;

    defaultFont: IFontOptions = {
        face: "serif",
        size: 24,
        stroke: "#234",
        fill: "#468",
        baseline: "bottom",
        align: "center",
        lineWidth: 2
    };
    font: IFontOptions = {};

    constructor(canvas: HTMLCanvasElement) {
        Renderer.main = this;
        this.canvas = canvas;
        this.handleContext = this.handleContext.bind(this);
        this.canvas.addEventListener('contextmenu', e => this.handleContext(e));
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.font = { ...this.defaultFont };
        this.setSmoothing(this.isSmoothing);
    }
        
    clear(): void {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    setSize(width: number, height: number) {
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
    }

    setSmoothing(on: boolean) {
        this.isSmoothing = on;
        this.canvas.style.imageRendering = on ? "" : "pixelated";
    }

    setFont(options?: IFontOptions) {
        const c = this.context;

        if (! options) {
            options = this.defaultFont;
        }

        this.font = options = { ...this.font, ...options };
        c.fillStyle = options.fill
        c.strokeStyle = options.stroke;
        c.font = options.size + "px " + options.face;
        c.textBaseline = options.baseline;
        c.textAlign = options.align;
    }

    writeText(text: string, x: number, y: number, maxWidth?: number) {
        const c = this.context;
        if (this.font.stroke && this.font.lineWidth > 0) {
            c.lineWidth = this.font.lineWidth;
            c.strokeText(text, x, y, maxWidth);
        }
        if (this.font.fill) {
            c.fillText(text, x, y, maxWidth);
        }
    }
    
    private handleContext(e: Event) {
        e.preventDefault();
    }
    
}