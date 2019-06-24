import { Entity, EntityState } from "./Entity";
import { Renderer } from "lad/display/Renderer";
import { Scene } from "./Scene";

/**
 * LAD.Scene is used to contain entity objects. It automatically
 * calls lifecycle methods suchs as awake, start, update and 
 * render on all objects within.
 */
export class EntityContainer extends Entity {

    protected entities: Entity[] = [];
    
    /**
     * Adds an entity to this scene at the next (or given) index
     * @param entity - the entity to add
     * @param index - the index to add it at (optional)
     * @returns the entity
     */
    public add(entity: Entity, index: number = -1): Entity {
        if (entity.parent === this) {
            return;
        }
        entity.scene = this instanceof Scene ? this : this.scene;
        entity.parent = this;
        entity.game = this.game;
        if (this.game && this.game.isPlaying) {
            entity.callAwake();
        }
        if (index >= 0) {
            this.entities.splice(index, 0, entity);
        } else {
            this.entities.push(entity);
        }
        return entity;
    }

    public removeAll() {
        for (const entity of this.entities) {
            entity.remove();
        }
    }

    /**
     * Check if the scene contains the entity
     * @param entity - the entity to check
     * @returns true if this scene contains the entity
     */
    public contains(entity: Entity): boolean {
        const index = this.indexOf(entity);
        return index >= 0;
    }

    /**
     * Find the index of an entity in the scene (if inside)
     * @param entity - the entity to check
     * @returns the index if the scene contains it, -1 if it doesn't
     */
    public indexOf(entity: Entity): number {
        // returns true if the scene contains the entit
        let i = this.entities.length;
        while (i-- > 0) {
            if (this.entities[i] == entity) {
                return i;
            }
        }
        return -1;
    }
    
    public callAwake() {
        // calls start on scene, then entities within
        super.callAwake();
        for (let i = 0; i < this.entities.length; i++) {
            (this.entities[i] as any).callAwake();
        }		
    }
    
    public callUpdate() {
        // calls update on scene, then entities within
        super.callUpdate();
        const self = this;
        let updating = this.entities.filter(e => e.parent === self && e.entityState <= EntityState.ENABLED);
        let i = updating.length;
        while (i-- > 0) {
            const e = updating[i];
            e.callUpdate();
        }
        
        // remove dead entities
        i = this.entities.length;
        while (i-- > 0) {
            const e = this.entities[i];
            if (!e || e.parent != this || e.entityState >= EntityState.REMOVING) {
                this.entities.splice(i, 1);
                e.scene = null;
                e.parent = null;
            }
        }
    }
    
    public callRender(r: Renderer) {
        // calls render on scene, then entities within
        super.callRender(r);
        for (const e of this.entities) {
            e.renderTransform.depth = r.renderCount++;
            e.callRender(r);
        }
    }
}