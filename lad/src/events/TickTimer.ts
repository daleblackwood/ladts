type TickMethod = (dt?: number) => void;

interface ITickAction {
    fps: number;
    scope: object;
    method: TickMethod;
    boundMethod: TickMethod;
    lastTick?: number;
}

export class TickTimer {

    isTicking = true;
    tickActions: ITickAction[] = [];

    constructor() {
        this.tick = this.tick.bind(this);
    }

    start() {
        this.isTicking = true;
        setTimeout(this.tick, 100);
    }

    stop() {
        this.isTicking = false;
    }
    
    set(scope: object, method: TickMethod, fps: number) {
        const boundMethod = method.bind(scope);
        const lastTick = this.getNow();
        const tickAction: ITickAction = { 
            fps,
            scope,
            method,
            boundMethod,
            lastTick
        };
        const index = this.indexOf(scope, method);
        if (index < 0) {
            this.tickActions.push(tickAction);
        }
        else {
            this.tickActions.splice(index, 1, tickAction);
        }
    }

    unset(scope: object, method: TickMethod) {
        const index = this.indexOf(scope, method);
        if (index >= 0) {
            this.tickActions.splice(index, 1);
        }
    }

    indexOf(scope: object, method: TickMethod): number {
        for (let i=0; i<this.tickActions.length; i++) {
            const tm = this.tickActions[i];
            if (tm.scope === scope && tm.method === method) {
                return i;
            }
        }
        return -1;
    }

    clear() {
        this.tickActions = [];
    }

    tick() {
        if (this.isTicking === false) {
            return;
        }
        for (const tickAction of this.tickActions) {
            const now = this.getNow();
            const dt = now - tickAction.lastTick;
            const elapsed = 1000 / tickAction.fps;
            if (dt >= elapsed) {
                tickAction.lastTick = now - (dt % elapsed);
                tickAction.boundMethod(dt);
            }
        }
        requestAnimationFrame(this.tick);
    }

    getNow() {
        return performance.now();
    }

}