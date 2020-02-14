import { Entity } from "lad/scene/Entity";

export class SSEntity extends Entity {

	hitRadius = 5;
	enemy = false;

	onCollision(e: Entity) {}
	
}