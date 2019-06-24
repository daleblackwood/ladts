import { MultiInput } from "lad/input/MultiInput";
import { SSPlayerShip } from "./SSPlayerShip";

/*
	SSInput extends MultiInput to include anglular detect on
	multiple devices.
*/
export class SSInput extends MultiInput {	

    player: SSPlayerShip | null;

	constructor(player?: SSPlayerShip) {
		super();
		this.player = player || null;
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
                let dx = this.mouse.x - t.p.x;
                let dy = this.mouse.y - t.p.y;
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