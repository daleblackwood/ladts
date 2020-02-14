import { AInput } from "./AInput";
import { Renderer } from "../display/Renderer";
import { pointerManager, IPointerEvent } from "./PointerManager";

/*
	LAD.MouseInput extends LAD.AbstractInput to handle the pressing
	of mouse buttons and track the mouse position.
*/
export class PointerInput extends AInput {

    public x = 0.0;
	public y = 0.0;
	public isDown = false;

	constructor() {
		super("pointer");
		pointerManager.onChange.listen(this, this.handlePointerChange);
		pointerManager.onMove.listen(this, this.handlePointerMove);
	}

	handlePointerMove(e: IPointerEvent) {
		this.x = e.pos.x;
		this.y = e.pos.y;
	}
	
	handlePointerChange(e: IPointerEvent) {
		if (e.button !== 0) {
			return;
		}
		this.isDown = e.isDown;
		this.x = e.pos.x;
		this.y = e.pos.y;
		if (this.isDown) {
			this.press(e.button + "");
		}
		else {
			this.release(e.button + "");
		}
	}
}