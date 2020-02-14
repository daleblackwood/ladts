import { Renderer } from "./display/Renderer";
import { Scene } from "./scene/Scene";
import { TickTimer } from "./events/TickTimer";
import { Rect } from "./math/Rect";
import { EntityState } from "./scene/Entity";
import { PointerManager, pointerManager } from "./input/PointerManager";
import { Manager } from "./Manager";


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
	autoSize?: boolean;
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
	public managers: { [key: string]: Manager } = {};

	constructor(containerId: string, options: IGameOptions) {
		Game.main = this;
		this.managers[PointerManager.name] = pointerManager;
		this.requireCanvas(containerId, options.autoSize);
		this.setFramerate(options.fpsUpdate, options.fpsRender);
		this.parseParams();
		this.updateRect();
	}
	
	requireCanvas(containerId: string, autoSize: boolean = false) {
		let container = document.getElementById(containerId);
		this.renderer = new Renderer(container);
		this.renderer.autoSize = this.autoSize;
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
			this.scene.remove();
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
		this.updateRect();

		for (const key in this.managers) {
			this.managers[key].game = this;
			this.managers[key].update();
		}

		// calls scene update then schedules next
		for (const scene of this.layers) {
			if (scene.entityState < EntityState.AWAKE) {
				scene.callAwake();
			}
		}
		const removeLayerIndices = [];
		for (let i=0; i<this.layers.length; i++) {
			const layer = this.layers[i];
			if (layer.entityState <= EntityState.ENABLED) {
				layer.callUpdate();
			}
			else if (layer.entityState === EntityState.REMOVING) {
				removeLayerIndices.push(i);
			}
		}
		if (removeLayerIndices.length > 0) {
			removeLayerIndices.sort((a, b) => a > b ? -1 : 1);
			for (const removeIndex of removeLayerIndices) {
				this.layers.slice(removeIndex, 1);
			}
		}

		for (const key in this.managers) {
			this.managers[key].postUpdate();
		}

		this.lastUpdate = this.tickTimer.getNow();
		this.frames++;
	}
	
	isMobile() {
		let check = false;
		(function(a: string){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor);
		return check;
	}
    
	callRender() {		
		// clears the canvas, calls scene render then schedules next
		this.renderer.update();

		for (const key in this.managers) {
			this.managers[key].render(this.renderer);
		}

		this.timeDelta = this.tickTimer.getNow() - this.lastUpdate;
		const updateTime = 1000 / this.fpsUpdate;
		this.renderer.percent = Math.min(this.timeDelta / updateTime, 1);
		for (const scene of this.layers) {
			(scene as any).callRender(this.renderer);
		}
		this.lastRender = this.tickTimer.getNow();

		for (const key in this.managers) {
			this.managers[key].postRender(this.renderer);
		}
	}

	setManager<T extends Manager>(manager: T): T {
        const key = manager.constructor.name;
		this.managers[key] = manager;
		return manager;
	}
	
	getManager<T extends Manager>(managerType: new () => T): T|null {
		return this.managers[managerType.name] as T || null;
	}

	unsetManager<T extends Manager>(managerType: new () => T): void {
		delete this.managers[managerType.name];
	}
	
	private updateRect() {
		this.rect.setSize(
			0, 0, 
			this.renderer.canvas.offsetWidth,
			this.renderer.canvas.offsetHeight
		);
	}
    
}