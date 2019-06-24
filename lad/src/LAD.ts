import { Game, IGameOptions, GameType } from "./scene/Game";

/*
    LAD is an object that acts as a namespace for all classes in the 
    LAD framework.
*/
const global = (window as any);

class LADNS {

    modules: { [key: string]: any } = {};
    game: Game;
    DEBUG = false;
    
    isFunction(object: any) {
        // returns true if the object is a function
        return typeof object == "function";
    }
    
    hasFunction(object: any, name: string) {
        // returns true if the object is a function
        if (typeof object !== "object") return false;
        return typeof object[name] == "function";
    }
    
    proxyFunction(scope: any, name: string): () => void | null {
        if (this.hasFunction(scope, name) === false) {
            return null;
        }
        return (scope[name] as () => void).bind(scope);
    }
    
    log(...args: any[]) {
        // an internal logging function
        if (console) console.log(args);
    }
    
    error(...args: any[]) {
        // an internal error logging function
        if (console) console.error(args);
    }
    
    init(type: GameType, canvasId?: string) {
        const key = type.name;
        if (!canvasId) {
            let canvas = document.querySelector("canvas#" + key);
            if (! canvas) {
                canvas = document.createElement("canvas");
                canvas.id = key;
                document.body.appendChild(canvas);
            }
            canvasId = key;
            canvas.className = (canvas.className || "") + " ladgame";
        }
        this.game = (window as any).ladgame = new type(canvasId, {});
        return this.game;
    }

    require<T>(type: new() => T): T {
        const name = type.name;
        if (! this.modules[name]) {
            this.modules[name] = new type();
        }
        return this.modules[name] as T;
    }

    fullscreen(on: boolean) {
        this.game.renderer.canvas.requestFullscreen({
            navigationUI: "hide"
        });
    }
    
}

global.LAD = global.LAD || new LADNS();
export const LAD: LADNS = global.LAD;