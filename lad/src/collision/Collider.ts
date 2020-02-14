import { Rect } from "../math/Rect";
import { Entity, EntityComponent } from "../scene/Entity";
import { Renderer } from "lad/display/Renderer";
import { CollisionManager } from "./CollisionManager";

export interface ICollision {
    rect: Rect;
    target: any;
}

export interface ICollidable {
    collider: Collider;
}

export type CollidableEnity = Entity & ICollidable;

export class Collider extends EntityComponent {

    public onCollision: (collision: ICollision) => void;
    public manager: CollisionManager|null = null;
    public collisions: ICollision[] = [];

    constructor(entity: Entity) {
        super(entity);
    }

    start() {
        this.manager = this.entity.game.getManager(CollisionManager);
        if (this.manager) {
            this.manager.add(this);
        }
    }

    checkCollision(other: Collider) {};

    clearCollisions() {
        this.collisions = [];
    }

    handleCollision(collision: ICollision) {
        this.collisions.push(collision);
        if (this.onCollision) {
            this.onCollision(collision);
        }
    }

    render(r: Renderer) {}

    remove() {
        if (this.manager) {
            this.manager.remove(this);
        }
    }
}