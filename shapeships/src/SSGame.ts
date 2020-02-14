import { SSInput } from "./SSInput";
import { SSWave } from "./SSWave";
import { SSScore } from "./SSScore";
import { SSHUD } from "./SSHUD";
import { Game } from "lad/Game";
import { SSScreenTitle } from "./SSScreenTitle";
import { SSScreenEnd } from "SSScreenEnd";
import { SSScene } from "SSScene";

/*
	SSGame extends Game to include key bindings, mouse binding,
	input and some game specific properties.
*/
export const SSScreens  = {
    title: new SSScreenTitle(),
    game: new SSScene(),
    end: new SSScreenEnd()
};

export class SSGame extends Game {

    hud: SSHUD;	
    keys = {
        up: 87, // W
        left: 65, // A
        down: 83, // S
        right: 68, // D
        shootUp: 38, // UP
        shootDown: 40, // DOWN
        shootLeft: 37, // LEFT
        shootRight: 39, // RIGHT
        shootStraight: 32, //SPACE
        confirm: 13, // ENTER
    };
    mouse = {
        shoot: 0
    };
    input = new SSInput();
    wave = new SSWave();
    score = new SSScore();

	constructor(canvasName: string) {
		super(canvasName, {
			fpsUpdate: 30,
            fpsRender: 120,
            autoSize: true
		});
        this.setScene(SSScreens.title);
        this.hud = new SSHUD(this);
    }
}