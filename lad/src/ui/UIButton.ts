import { UIPanel } from "./UIPanel";
import { pointerManager, IPointerEvent } from "lad/input/PointerManager";

export class UIButton extends UIPanel {

    parent: UIPanel;
    isDownTarget = false;

    start() {
        pointerManager.onChange.listen(this, this.handlePointer);
    }

    remove() {
        super.remove();
        pointerManager.onChange.unlisten(this, this.handlePointer);
    }

    handleClick() {}

    handlePointer(e: IPointerEvent) {
        if (e.button !== 0) {
            return;
        }
        const bounds = this.getBounds();
        if (bounds.isWithin(e.pos)) {
            if (e.isDown) {
                e.cancelled = true;
                console.log("depth: " + this.renderTransform.depth, e);
                this.isDownTarget = true;
            }
            else if (this.isDownTarget) {
                e.cancelled = true;
                this.handleClick();
            }
        }
        else if (e.isDown === false) {
            this.isDownTarget = false;
        }
    }

}