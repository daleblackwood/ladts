import { AInput } from "./AInput";
import { KeyboardInput } from "./KeyboardInput";
import { PointerInput } from "./PointerInput";

/*
	LAD.MultiInput extends LAD.AbstractInput to combine keyboard, mouse
	and gamepad inputs.
*/
export class MultiInput extends AInput {

	devices: AInput[];

	constructor(name: string, devices?: AInput[]) {
		super(name || "multiinput");
		this.devices = devices || [
			new KeyboardInput(),
			new PointerInput()
		];
		for (const device of this.devices) {
			device.listen(this, this.dispatch);
		}
    }
    
	hasAction(name: string) {
		// checks each device to discern whether the action is registed
		for (const device of this.devices) {
			if (device.hasAction(name)) {
				return true;
			}
		}
		return false;
    }
    
	isPressed(actionNameOrButton: string) {
		// checks each device to discern whether the action is pressed
		for (const device of this.devices) {
			if (device.isPressed(actionNameOrButton)) {
				return true;
			}
		}
		return false;
	}
	
	nowPressed(actionNameOrButton: string) {
		// checks each device to discern whether the action is pressed
		for (const device of this.devices) {
			if (device.nowPressed(actionNameOrButton)) {
				return true;
			}
		}
		return false;
    }
    
	anyPressed(...args: string[]) {
		// checks all actions in arguments against each device
		for (const actionNameOrButton of args) {
			if (this.isPressed(actionNameOrButton)) {
				return true;
			}
		}
		return false;
	}
}