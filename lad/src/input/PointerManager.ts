import { Renderer } from "lad/display/Renderer";
import { Dispatcher } from "lad/events/Dispatcher";
import { LAD } from "lad/LAD";
import { Point, IPoint } from "lad/math/Point";
import { Game } from "lad/scene/Game";
import { Entity } from "lad/scene/Entity";

export interface IPointerEvent {
	pos: Point;
	button: number;
	isDown: boolean;
	delta: Point;
	prevPos: Point;
	cancelled?: boolean;
}

class PointerManager {

	buttons: IPointerEvent[] = [
		{
			pos: new Point(),
			button: 0,
			isDown: false,
			delta: new Point(),
			prevPos: new Point()
		}, 
		{
			pos: new Point(),
			button: 1,
			isDown: false,
			delta: new Point(),
			prevPos: new Point()
		}
	];
	
	onChange = new Dispatcher<IPointerEvent>();

    constructor() {
        this.handleMouse = this.handleMouse.bind(this);
		this.handleTouch = this.handleTouch.bind(this);
		this.enable();
    }

    enable() {
		window.addEventListener("mousedown", this.handleMouse);
		window.addEventListener("mouseup", this.handleMouse);
		window.addEventListener("mousemove", this.handleMouse);
		window.addEventListener("touchstart", this.handleTouch);
		window.addEventListener("touchmove", this.handleTouch);
		window.addEventListener("touchend", this.handleTouch);
		window.addEventListener("touchcancel", this.handleTouch);
    }

    disable() {
		window.removeEventListener("mousedown", this.handleMouse);
		window.removeEventListener("mouseup", this.handleMouse);
		window.removeEventListener("mousemove", this.handleMouse);
		window.removeEventListener("touchstart", this.handleTouch);
		window.removeEventListener("touchmove", this.handleTouch);
		window.removeEventListener("touchend", this.handleTouch);
		window.removeEventListener("touchcancel", this.handleTouch);
	}
	
	update() {
		for (const button of this.buttons) {
			button.delta.x = button.pos.x - button.prevPos.x;
			button.delta.y = button.pos.y - button.prevPos.y;
			button.prevPos.copy(button.pos);
		}
	}
    
	handleMouse(e: MouseEvent) {
		const buttonIndex = e.button === 0 ? 0 : 1;
		const button = this.buttons[buttonIndex];
		let moved = false;
		let changed = false;
		switch (e.type) {
			case "mousedown":
				if (button.isDown !== true) {
					button.isDown = true;
				}
				changed = true;
				moved = true;
				break;
			case "mouseup":
				if (button.isDown === true) {
					button.isDown = false;
				}
				changed = true;
				break;
			case "mousemove":
				moved = true;
		}
		if (moved) {
			for (let i=0; i<this.buttons.length; i++) {
				const b = this.buttons[i];
				b.pos.copy(this.screenToCanvasPos({ x: e.clientX, y: e.clientY }));
			}
		}
		if (changed) {
			button.cancelled = false;
			this.onChange.dispatch(button);
		}
	}

	handleTouch(e: TouchEvent) {
        if (! Renderer.main) {
            return;
        }
		const buttonIndex = e.touches.length > 1 ? 0 : 1;
		const button = this.buttons[buttonIndex];
		let moved = false;
		let changed = false;
		switch (e.type) {
			case "touchstart":
				if (button.isDown !== true) {
					button.isDown = true;
				}
				changed = true;
				moved = true;
                break;
			case "touchend":
            case "touchcancel":
				if (button.isDown !== true) {
					button.isDown = false;
				}
				changed = true;
				break;
			case "touchmove":
				moved = true;
		}
		if (moved) {
			for (let i=0; i<this.buttons.length; i++) {
				const touch = e.touches[i];
				if (! touch) {
					continue;
				}
				const b = this.buttons[i];
				b.pos.copy(this.screenToCanvasPos({ x: touch.clientX, y: touch.clientY }));
			}
		}
		if (changed) {
			button.cancelled = false;
			this.dispatchChanges(button);
		}
	}

	screenToCanvasPos(p: IPoint): Point {
		const canvas = Renderer.main.canvas;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const scaleB = Math.max(scaleX, scaleY);
		let offsetX = rect.left;
		let offsetY = rect.top;
		// fix fullscreen issues
		offsetX -= Math.min(rect.left - (rect.width - canvas.width / scaleB) * 0.5, 0) * scaleB;
		offsetY -= Math.min(rect.top - (rect.height - canvas.height / scaleB) * 0.5, 0) * scaleB;
		const px = Math.round(p.x * scaleB - offsetX);
		const py = Math.round(p.y * scaleB - offsetY);
		return new Point(px, py);
	}

	private dispatchChanges(button: IPointerEvent) {
		const listeners = this.onChange.listeners.slice();
		listeners.sort((a, b) => {
			let aDepth = 0;
			let bDepth = 0;
			if (a.scope && a.scope.renderTransform && a.scope.renderTransform.depth) {
				aDepth = (a.scope as Entity).renderTransform.depth;
			}
			if (b.scope && b.scope.renderTransform && b.scope.renderTransform.depth) {
				bDepth = (b.scope as Entity).renderTransform.depth;
			}
			if (aDepth === bDepth) {
				return 0;
			}
			return aDepth > bDepth ? -1 : 1;
		});

		for (let i=0; i < listeners.length; i++) {
			const listener = listeners[i];
			listener.boundHandler(button);
			if (button.cancelled) {
				break;
			}
		}
	}

}

export const pointerManager = LAD.require(PointerManager);