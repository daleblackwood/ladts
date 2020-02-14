import { SSScreenMenu } from "./SSScreenMenu";
import { SSScreenTitle } from "./SSScreenTitle";
import { Renderer } from "lad/display/Renderer";
import { SSScreens } from "SSGame";

/*
	SSEndScreen is displayed after the match is complete, giving a
	summary of score and performance.
*/
export class SSScreenEnd extends SSScreenMenu {

	getNextScreen() {
		return SSScreens.title;
	}
    
	render(r: Renderer) {
		super.render(r);
		
		let w = r.width,
			h = r.height,
			c = r.context;
		
		r.setFont({ size: 72 });
		r.writeText("SHAPESHIPS", w * 0.5, h * 0.5 - 65);
		
		r.setFont({ size: 24 });
		r.writeText(this.game.wave.getSuccess(), w * 0.5, h * 0.5 + 70);
		r.setFont({ size: 32 });
		r.writeText("YOU GOT " + this.game.score.score + " POINTS", w * 0.5, h * 0.5 + 110);
		r.writeText("AND A " + this.game.score.multi + "x MULTIPLIER", w * 0.5, h * 0.5 + 150);
		
		r.setFont({ size: 14 });
		r.writeText("(C) 2012 DALE J WILLIAMS", w * 0.5, h - 25);
	}
}