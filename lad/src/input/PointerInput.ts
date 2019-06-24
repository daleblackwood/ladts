import { AInput } from "./AInput";
import { Renderer } from "lad/display/Renderer";

/*
    LAD.MouseInput extends LAD.AbstractInput to handle the pressing
    of mouse buttons and track the mouse position.
*/
export class PointerInput extends AInput {

    public x = 0.0;
    public y = 0.0;
    public isDown = false;

    constructor() {
        super("mouse");
        this.handleMouse = this.handleMouse.bind(this);
        window.addEventListener("mousedown", this.handleMouse);
        window.addEventListener("mouseup", this.handleMouse);
        window.addEventListener("mousemove", this.handleMouse);

        this.handleTouch = this.handleTouch.bind(this);
        window.addEventListener("touchstart", this.handleTouch);
        window.addEventListener("touchmove", this.handleTouch);
        window.addEventListener("touchend", this.handleTouch);
        window.addEventListener("touchcancel", this.handleTouch);
    }
    
    handleMouse(e: MouseEvent) {
        const button = e.button === 0 ? 0 : 1;
        switch (e.type) {
            case "mousedown":
                if (this.isDown === false) {
                    this.press(button + "");
                    this.isDown = true;
                }
                break;
            case "mouseup":
                if (this.isDown) {
                    this.release(button + "");
                    this.isDown = false;
                }
                break;
        }
        this.x = e.offsetX || this.x;
        this.y = e.offsetY || this.y;
    }

    handleTouch(e: TouchEvent) {
        const button = e.touches.length > 1 ? 0 : 1;
        switch (e.type) {
            case "touchstart":
                if (this.isDown === false) {
                    this.press(button + "");
                    this.isDown = true;
                }
                break;
            case "touchend":
                if (this.isDown) {
                    this.release(button + "");
                    this.isDown = false;
                }
                break;
        }
        this.x = (e.touches[0].pageX - Renderer.main.canvas.offsetTop) || this.x;
        this.y = (e.touches[0].pageY - Renderer.main.canvas.offsetTop) || this.y;
    }
}