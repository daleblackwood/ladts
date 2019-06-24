import { AInput } from "./AInput";
import { KeyboardInput } from "./KeyboardInput";
import { PointerInput } from "./PointerInput";

/*
    LAD.MultiInput extends LAD.AbstractInput to combine keyboard, mouse
    and gamepad inputs.
*/
export class MultiInput extends AInput {

    keyboard = new KeyboardInput();
    mouse = new PointerInput();

    constructor() {
        super("multiinput");
        this.keyboard.listen(this, this.dispatch);
        this.mouse.listen(this, this.dispatch);
    }
    
    hasAction(name: string) {
        // checks each device to discern whether the action is registed
        if (this.keyboard.hasAction(name)) return true;
        if (this.mouse.hasAction(name)) return true;
        return false;
    }
    
    isPressed(actionNameOrButton: string) {
        // checks each device to discern whether the action is pressed
        if (this.keyboard.isPressed(actionNameOrButton)) return true;
        if (this.mouse.isPressed(actionNameOrButton)) return true;
        return false;
    }
    
    anyPressed() {
        // checks all actions in arguments against each device
        let i = arguments.length;
        let actionNameOrButton: string;
        while (i-- > 0) {
            actionNameOrButton = arguments[i];
            if (this.keyboard.isPressed(actionNameOrButton)) return true;
            if (this.mouse.isPressed(actionNameOrButton)) return true;
        }
        return false;
    }
}