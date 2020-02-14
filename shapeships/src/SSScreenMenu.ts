import { SSScene } from "./SSScene";
import { IAction } from "lad/input/AInput";
import { SSExplosion } from "./SSExplosion";
import { Entity } from "lad/scene/Entity";
import { Scene } from "lad/scene/Scene";
import { Renderer } from "lad/display/Renderer";

/*
	SSMenuScreen acts as a base class for the various menu screens
	displayed before and after the game.
*/
export abstract class SSScreenMenu extends SSScene {

    handleInputBind: () => void;
    frame = 0;
    
	start() {
		this.game.input.listen(this, this.handleInput);
    }
    
	handleInput(action: IAction) {
		if (action.down) {
			if (action.button === this.game.keys.shootStraight + ""
				|| action.button === this.game.keys.confirm + ""
				|| action.deviceName === "pointer") 
			{
				this.game.input.unlistenAll(this);
				const nextScreen = this.getNextScreen();
				if (nextScreen) {
					this.game.setScene(nextScreen);
				}
			}
		}
    }
    
	update() {
		if (isNaN(this.frame)) this.frame = 1;
		if (this.frame-- > 0) return;
		let explosion = new SSExplosion(16, 10),
			r = this.game.renderer;
		explosion.transform.p.x = Math.random() * r.width;
		explosion.transform.p.y = Math.random() * r.height;
		explosion.life = Math.random()*8+8;
		explosion.color = "#ACE";
		this.add(explosion);
		this.frame = NaN;
	}
    
	constrain(e: Entity) {}

	getNextScreen(): Scene|null {
		return null;
	}
}