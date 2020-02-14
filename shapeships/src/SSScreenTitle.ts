import { SSScreenMenu } from "./SSScreenMenu";
import { SSExplosion } from "./SSExplosion";
import { Renderer } from "lad/display/Renderer";
import { SSScreens } from "SSGame";

/*
	SSTitleScreen is displayed before the game starts, showing many
	explosions and title text.
*/
export class SSScreenTitle extends SSScreenMenu {

	getNextScreen() {
		return SSScreens.game;
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
    
	callRender(r: Renderer) {
		super.callRender(r);
		
		let w = r.width,
			h = r.height,
			c = r.context;
		
		r.setFont({ size: 72, face: "serif", fill: "rgba(0,0,0,0.2)", stroke: "#234", lineWidth: 1.3 });
		r.writeText("SHAPESHIPS", w * 0.5, h * 0.5 - 65);
		
		r.setFont({ size: 28 });
		r.writeText("A CANVAS POWERED SHOOTER", w * 0.5, h * 0.5 - 45);
		
		r.setFont({ size: 32 });
		r.writeText("CLICK TO START", w * 0.5, h * 0.5 + 160);
		
		r.setFont({ size: 14 });
		r.writeText("Copyright 2012-19 Dale Williams", w * 0.5, h - 25);
    }
    
}