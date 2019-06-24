import { Entity, EntityState } from "./Entity";
import { Renderer } from "../display/Renderer";
import { EntityContainer } from "./EntityContainer";

/**
 * LAD.Scene is used to contain all entity objects. From the top.
 * Like EntityContainer, it automatically calls lifecycle methods
 */
export class Scene extends EntityContainer {

	fillColor = "";

	public add<T extends Entity>(entity: T, index: number = -1): T {
		super.add(entity, index);
		entity.scene = this;
		return entity;
	}

	callRender(r: Renderer) {
		r.renderCount = 0;
		if (this.fillColor) {
			r.context.fillStyle = this.fillColor;
			r.context.fillRect(0, 0, this.game.rect.width, this.game.rect.height);
		}
		super.callRender(r);
	}

}