import { MultiInput } from "lad/input/MultiInput";
import { SSPlayerShip } from "./SSPlayerShip";
import { PointerInput } from "lad/input/PointerInput";
import { KeyboardInput } from "lad/input/KeyboardInput";

/*
	SSInput extends MultiInput to include anglular detect on
	multiple devices.
*/
export class SSInput extends MultiInput {	

	player: SSPlayerShip | null;
	pointer: PointerInput;
	keyboard: KeyboardInput;

	constructor(player?: SSPlayerShip) {
		super("ssinput");
		this.player = player || null;
		this.pointer = this.devices.find(x => x instanceof PointerInput) as PointerInput;
		this.keyboard = this.devices.find(x => x instanceof KeyboardInput) as KeyboardInput;
    }
    
	getMoveAngle() {
		return this.getAngle("left", "up", "right", "down");
    }
    
	getShootAngle() {
		if (!this.isPressed("shoot")) {
			return this.getAngle("shootLeft", "shootUp", "shootRight", "shootDown");
		} else {
            if (this.player) {
                let t = this.player.renderTransform;
                let dx = this.pointer.x - t.p.x;
                let dy = this.pointer.y - t.p.y;
                return Math.atan2(dy, dx);
            }
		}
    }
    
	getAngle(leftName: string, upName: string, rightName: string, downName: string) {
		let left = this.isPressed(leftName),
			up = this.isPressed(upName),
			right = this.isPressed(rightName),
			down = this.isPressed(downName);
		if (up && left) return Math.PI * -0.75;
		if (up && right) return Math.PI * -0.25;
		if (down && left) return Math.PI * 0.75;
		if (down && right) return Math.PI * 0.25;
		if (up) return Math.PI * -0.5;
		if (down) return Math.PI * 0.5;
		if (left) return Math.PI;
		if (right) return 0;
		return NaN;
    }
    
}