import { Renderer } from "../display/Renderer";
import { Scene } from "./Scene";
import { TickTimer } from "../events/TickTimer";
import { Rect } from "lad/math/Rect";
import { EntityState } from "./Entity";
import { pointerManager } from "lad/input/PointerManager";


const DEFAULT_FRAME_RATE = 60;
const DEFAULT_UPDATE_TIME = 1000 / DEFAULT_FRAME_RATE;

/*
	LAD.Game runs all control for the game. It sets the frames and 
	updates per second (seperately). It allows the game to be started or 
	stopped and calls update and render upon the active scene.
*/
export interface IGameOptions {
	fpsUpdate?: number;
	fpsRender?: number;
}

export type GameType = new (canvasName: string, options: IGameOptions) => Game;

export class Game {

	static main: Game;

    public renderer: Renderer;
    public scene: Scene;
    public layers: Scene[];
    public params: any = {};
    public isPlaying = false;
    public timeDelta = DEFAULT_UPDATE_TIME;
	public rect = new Rect();
	public tickTimer = new TickTimer();
	public lastUpdate = 0.0;
	public lastRender = 0.0;
	public fpsUpdate = DEFAULT_FRAME_RATE;
	public fpsRender = DEFAULT_FRAME_RATE;
	public pointer = pointerManager;
	public frames = 0;

	constructor(canvasId: string, options: IGameOptions) {
		Game.main = this;
		this.renderer = new Renderer(document.getElementById(canvasId) as HTMLCanvasElement);
		this.setFramerate(options.fpsUpdate, options.fpsRender);
		this.parseParams();
		this.updateRect();
    }
    
	parseParams() {
		// parses hash parameters (#) to the game instance.
		this.params = {};
		const paramPairs = window.location.hash.substr(1).split(",");
		if (paramPairs.length == 0) return;
		let pair: string[];
		let i = paramPairs.length;
		while (i-- > 0) {
			pair = paramPairs[i].split("=");
			this.params[pair[0]] = pair[1] || "";
		}
    }
    
	setFramerate(fpsUpdate?: number, fpsRender?: number) {
		// sets the frame udpate rate in frames per second
		this.fpsUpdate = fpsUpdate || 60;
		this.fpsRender = fpsRender || this.fpsUpdate;
		this.tickTimer.clear();
		this.tickTimer.set(this, this.callUpdate, this.fpsUpdate);
		this.tickTimer.set(this, this.callRender, this.fpsRender);
    }
    
	start() {
		// starts the active scene, begins the update timers
		if (!this.scene) return;
		this.tickTimer.start();
		this.isPlaying = true;
    }
    
	stop() {
		// stops the active scene, pauses the update timers
		this.tickTimer.stop();
		this.isPlaying = false;
    }
    
	setScene(scene: Scene) {
		// unloads the current scene, replaces it with new one
		if (scene == this.scene) {
			return;
		}
		this.stop();
		if (this.scene) {
			this.scene.game = null;
		}
		this.scene = scene;
		this.layers = [ scene ];
		scene.game = this;
		setTimeout(this.start.bind(this), 10);
	}

	addScene(scene: Scene) {
		if (scene == this.scene) {
			return;
		}
		const index = this.getLayerIndex(scene);
		if (index > 0) {
			return;
		}
		scene.game = this;
		this.layers.push(scene);
	}

	removeScene(scene: Scene) {
		if (scene == this.scene) {
			throw new Error("Can't remove top scene");
		}
		const index = this.getLayerIndex(scene);
		if (index > 0) {
			this.layers.splice(index, 1);
		}
	}

	getLayerIndex(scene: Scene) {
		for (let i=0; i < this.layers.length; i++) {
			if (this.layers[i] === scene) {
				return i;
			}
		}
		return -1;
	}
    
	callUpdate() {
		this.pointer.update();
		this.updateRect();
		// calls scene update then schedules next
		for (const scene of this.layers) {
			if (scene.entityState < EntityState.AWAKE) {
				scene.callAwake();
			}
		}
		for (const scene of this.layers) {
			scene.callUpdate();
		}
		this.lastUpdate = this.tickTimer.getNow();
		this.frames++;
    }
    
	callRender() {		
		// clears the canvas, calls scene render then schedules next
		this.renderer.clear();
		this.timeDelta = this.tickTimer.getNow() - this.lastUpdate;
		const updateTime = 1000 / this.fpsUpdate;
		this.renderer.percent = Math.min(this.timeDelta / updateTime, 1);
		for (const scene of this.layers) {
			(scene as any).callRender(this.renderer);
		}
		this.lastRender = this.tickTimer.getNow();
	}
	
	private updateRect() {
		this.rect.x = this.rect.y = 0;
		this.rect.width = this.renderer.canvas.offsetWidth;
		this.rect.height = this.renderer.canvas.offsetHeight;
	}
    
}