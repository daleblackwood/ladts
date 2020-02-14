import { Manager } from "../Manager";
import { Collider } from "./Collider";
import { EntityState } from "lad/scene/Entity";
import { Renderer } from "lad/display/Renderer";

export class CollisionManager extends Manager {

    colliders: Collider[] = [];
    doRender = false;

    add(collider: Collider) {
        const index = this.indexOf(collider);
        if (index < 0) {
            this.colliders.push(collider);
        }
        return collider;
    }

    indexOf(collider: Collider) {
        return this.colliders.indexOf(collider);
    }

    remove(collider: Collider) {
        const index = this.indexOf(collider);
        if (index >= 0) {
            this.colliders.splice(index, 1);
        }
        return collider;
    }

    update() {
        for (const c of this.colliders) {
            c.clearCollisions();
        }
        let i = this.colliders.length;
        if (i < 2) {
            return;
        }
        while (i-- > 0) {
            const ci = this.colliders[i];
            if (ci.enabled === false || ci.entity.entityState !== EntityState.ENABLED) {
                continue;
            }
            let j = i;
            while (j-- > 0) {
                const cj = this.colliders[j];
                if (cj.enabled === false || cj.entity.entityState !== EntityState.ENABLED) {
                    continue;
                }
                cj.checkCollision(ci);
            }
        }
    }

    postRender(r: Renderer) {
        if (this.doRender !== true) {
            return;
        }
        for (const c of this.colliders) {
            if (c.enabled === false || c.entity.entityState !== EntityState.ENABLED) {
                continue;
            }
            c.render(r);
        }
    }

}