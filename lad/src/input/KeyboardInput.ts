import { AInput } from "./AInput";

/*
    LAD.KeyboardInput extends LAD.AbstractInput to handle the pressing
    of keyboard keys.
*/
export class KeyboardInput extends AInput {

    constructor() {
        super("keyboard");
        const handler = this.handleInput.bind(this);
        window.addEventListener("keydown", handler);
        window.addEventListener("keyup", handler);
    }
    
    handleInput(e: KeyboardEvent) {
        const keyName = (e.keyCode || "") + "";
        switch (e.type) {
            case "keydown":
                this.press(keyName);
                break;
            case "keyup":
                this.release(keyName);
                break;
        }
    }
    
}