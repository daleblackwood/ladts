import { Entity, EntityState } from "./Entity";
import { Renderer } from "../display/Renderer";
import { EntityContainer } from "./EntityContainer";
import { Rect } from "lad/math/Rect";

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
			r.context.fillRect(
				0, 0, 
				this.game.renderer.width * this.renderTransform.scale.x, 
				this.game.renderer.height * this.renderTransform.scale.y
			);
		}
		super.callRender(r);
	}

	getRect(): Rect {
		const w = this.game ? this.game.renderer.width : 0;
		const h = this.game ? this.game.renderer.height : 0;
		return new Rect(0, 0, w, h);
	}

}