import { Entity } from "../scene/Entity";

export class HTMLComponent extends Entity {

    constructor(public element: HTMLElement) {
        super();
    }

    start() {
        this.game.renderer.overlay.appendChild(this.element);
    }

    remove() {
        this.element.remove();
        super.remove();
    }

}