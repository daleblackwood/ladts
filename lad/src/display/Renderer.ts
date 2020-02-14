import { html, StyleAttributes } from "../html/html";
import { IPoint } from "lad/math/Point";

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
    outerContainer: HTMLElement;
    innerContainer: HTMLElement;
    overlay: HTMLElement;
    overlayStyles: CSSStyleSheet;
    autoSize = false;

    private containerWidth = 0;
    private containerHeight = 0;

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

    constructor(outerContainer: HTMLElement) {
        Renderer.main = this;
        this.setContainer(outerContainer);
        this.font = { ...this.defaultFont };
        this.setSmoothing(this.isSmoothing);
        this.handleContext = this.handleContext.bind(this);
        this.innerContainer.addEventListener('contextmenu', e => this.handleContext(e));
    }

    setContainer(container: HTMLElement) {
        if (! container) {
			throw new Error("Div container expected, got null");
		}
		if (container.tagName.toLowerCase() !== "div") {
			throw new Error("Div container expected, got " + container.tagName);
        }

        this.outerContainer = html.setAttributes(container, {
            class: "lad-container",
            style: {
                minWidth: "512px",
                minHeight: "288px",
                position: "relative"
            }
        });

        this.innerContainer = html.create("div", {
            class: "lad-inner",
            style: { 
                position: "absolute",
                overflow: "hidden",
                fontSize: "10px"
            },
            parentElement: this.outerContainer
        });

        this.canvas = html.create("canvas", {
            class: "lad-canvas",
            style: { },
            parentElement: this.innerContainer
        }) as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d");

        this.overlay = html.create("div", {
            class: "lad-overlay",
            style: {
                position: "absolute",
                top: "0",
                left: "0"
            },
            parentElement: this.innerContainer
        });

        const overlayStyles = document.createElement("style");
        document.head.appendChild(overlayStyles);
        this.overlayStyles = overlayStyles.sheet as CSSStyleSheet;
    }
        
    update(): void {
        this.context.clearRect(0, 0, this.width, this.height);
        this.updateSize();
    }

    private updateSize() {
        const newW = this.outerContainer.offsetWidth;
        const newH = this.outerContainer.offsetHeight;
        if (newW === this.containerWidth && newH === this.containerHeight) {
            return;
        }
        if (this.autoSize) {
            this.width = newW;
            this.height = newH;
        }
        this.containerWidth = newW;
        this.containerHeight = newH;
        const ratioX = this.containerWidth / this.width;
        const ratioY = this.containerHeight / this.height;
        const scale = Math.min(ratioX, ratioY);
        const innerW = scale * this.width;
        const innerH = scale * this.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        const offsetX = (this.containerWidth - this.width * scale) * 0.5;
        const offsetY = (this.containerHeight - this.height * scale) * 0.5;
        this.innerContainer.style.left = offsetX + "px";
        this.innerContainer.style.top = offsetY + "px";
        this.innerContainer.style.width = innerW + "px";
        this.innerContainer.style.height = innerH + "px";
        this.canvas.style.width = innerW + "px";
        this.canvas.style.height = innerH + "px";
        this.overlay.style.width = this.width + "px";
        this.overlay.style.height = this.height + "px";
        const overlayX = (innerW - this.width) * 0.5 / scale;
        const overlayY = (innerH - this.height) * 0.5 / scale;
        this.overlay.style.transform = "scale(" + scale + ") translate(" + overlayX + "px," + overlayY + "px)";
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
    
    addStyleRule(rule: string) {
        rule = rule.trim();
        const openBraceI = rule.indexOf("{");
        if (openBraceI >= 0) {
            const rest = rule.substr(openBraceI);
            const head = rule.substr(0, openBraceI);
            const headBits = head.split(",");
            const newHead = ".lad-overlay " + headBits.join(", .lad-overlay ");
            rule = newHead + rest;
        }
        this.overlayStyles.insertRule(rule, this.overlayStyles.cssRules.length);
    }

    addCss(css: string) {
        const ruleParts = css.split("}");
        for (const part of ruleParts) {
            const rule = part.trim() + "}";
            if (rule.length < 2) {
                continue;
            }
            this.addStyleRule(rule);
        }
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

    isVisible(p: IPoint) {
		return p.x > 0 
			&& p.y > 0 
			&& p.x < this.width 
			&& p.y < this.height;
	}
    
    private handleContext(e: Event) {
        e.preventDefault();
    }
    
}