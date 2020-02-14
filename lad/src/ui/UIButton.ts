import { UIPanel } from "./UIPanel";
import { pointerManager, IPointerEvent } from "../input/PointerManager";

export class UIButton extends UIPanel {

    parent: UIPanel;
    isPressed = false;
    onClick: () => void;
    onPress: () => void;
    onRelease: () => void;
    onContext: () => void;
    downTime = 0;

    start() {
        pointerManager.onChange.listen(this, this.handlePointer);
    }

    update() {
        if (this.isPressed && this.onContext && (performance.now() - this.downTime) > 500) {
            this.isPressed = false;
            this.downTime = 0;
            this.onContext();
        }
    }

    remove() {
        super.remove();
        pointerManager.onChange.unlisten(this, this.handlePointer);
    }

    handleClick() {
        if (typeof this.onClick === "function") {
            this.onClick();
        }
    }

    handlePress() {
        if (typeof this.onPress === "function") {
            this.onPress();
        }
    }

    handleRelease() {
        if (typeof this.onRelease === "function") {
            this.onRelease();
        }
    }

    handlePointer(e: IPointerEvent) {
        if (e.button !== 0) {
            return;
        }
        const bounds = this.getBounds();
        if (bounds.isWithin(e.pos)) {
            if (e.isDown) {
                this.downTime = performance.now();
                e.cancelled = true;
                this.isPressed = true;
                this.handlePress();
            }
            else if (this.isPressed) {
                this.handleClick();
                e.cancelled = true;
            }
        }
        else if (e.isDown === false) {
            if (this.isPressed) {
                this.handleRelease();
            }
            this.isPressed = false;
        }
    }

}