import { Dispatcher } from "../events/Dispatcher";

/*
    LAD.AbstractInput is extended by various input classes to map
    buttons to actions
*/

export interface IAction {
    name?: string;
    button: string;
    down: boolean;
    deviceName?: string;
}

export type ActionMap = { [key: string]: IAction };

export abstract class AInput extends Dispatcher<IAction> {

    window: Window;
    actions: { [key: string]: IAction } = {};
    buttons: { [key: string]: string } = {};
    pressed: { [key: string]: boolean } = {};

    constructor(public deviceName: string) {
        super();
        this.window = window;
    }
    
    addAction(name: string, button: string|number) {
        // maps an action to a button
        this.actions[name] = { name: name, button: button + "", down: false, deviceName: this.deviceName };
        this.buttons[button] = name;
    }
    
    addActions(keymap: { [key: string]: string|number }) {
        // maps an object of key/value pairs where the key is the
        // action and the value is the button
        for (let key in keymap) {
            this.addAction(key, keymap[key]);
        }
    }
    
    removeAction(name: string) { 
        // deletes an action from the list
        if (!this.hasAction(name)) return;
        delete this.buttons[this.actions[name].button];
        delete this.actions[name];
    }
    
    hasAction(name: string) {
        // returns true if the action is mapped
        return this.actions[name] != null;
    }
    
    getAction(actionNameOrButton: string) {
        // returns the action matching the action or button name
        // specified as the argument
        if (this.actions.hasOwnProperty(actionNameOrButton))
            return this.actions[actionNameOrButton];
        if (this.buttons.hasOwnProperty(actionNameOrButton))
            return this.actions[this.buttons[actionNameOrButton]];
        return null;
    }
    
    press(button: string) {
        // sets the button to pressed, dispatches press event
        this.pressed[button] = true;
        if (this.buttons.hasOwnProperty(button)) {
            let action = this.actions[this.buttons[button]];
            action.down = true;
            this.pressed[action.name] = true;
            this.dispatch(action);
        } else {
            this.dispatch({ button: button, down: true, deviceName: this.deviceName });
        }
    }
    
    release(button: string) {
        // sets the button to unpressed, dispatches release event
        this.pressed[button] = false;
        if (this.buttons.hasOwnProperty(button)) {
            let action = this.actions[this.buttons[button]];
            action.down = false;
            this.pressed[action.name] = false;
            this.dispatch(action);
        } else {
            this.dispatch({ button: button, down: false, deviceName: this.deviceName });
        }
    }
    
    isPressed(actionNameOrButton: string): boolean {
        // returns true if the action or button is pressed
        return this.pressed[actionNameOrButton] == true;
    }
    
    anyPressed(): boolean {
        // returns true if any of the buttons in the args are pressed
        // if no args returns true if anything at all is pressed
        let i = arguments.length;
        if (arguments.length < 1) {
            for (let key in this.pressed)
                if (this.pressed[key] == true) return true;
                return false;
        }
        let actionNameOrButton;
        while (i-- > 0) {
            actionNameOrButton = arguments[i];
            if (this.pressed[actionNameOrButton] == true) return true;
        }
        return false;
    }
}