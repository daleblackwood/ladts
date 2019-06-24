var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("lad/src/math/Point", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Point {
        constructor(x = 0, y = 0) {
            this.x = 0.0;
            this.y = 0.0;
            this.setValue(x || 0, y || 0);
        }
        reset() {
            this.x = this.y = 0;
            return this;
        }
        add(p) {
            this.x += p.x;
            this.y += p.y;
            return this;
        }
        move(x, y) {
            this.x += x;
            this.y += y;
            return this;
        }
        subtract(p) {
            this.x -= p.x;
            this.y -= p.y;
            return this;
        }
        multiply(value) {
            this.x *= value;
            this.y *= value;
            return this;
        }
        divide(value) {
            this.x /= value;
            this.y /= value;
            return this;
        }
        distanceTo(p) {
            return Math.sqrt(this.distanceToSq(p));
        }
        distanceToSq(p) {
            let dx = this.x - p.x, dy = this.y - p.y;
            return dx * dx + dy * dy;
        }
        isWithinDistance(p, d) {
            if (isNaN(d))
                return false;
            let dx = this.x - p.x, dy = this.y - p.y;
            return d * d > dx * dx + dy * dy;
        }
        isZero() {
            return this.x == 0 && this.y == 0;
        }
        isNearZero(thresh) {
            thresh = thresh || 0.0001;
            return Math.abs(this.x) < thresh && Math.abs(this.y) < thresh;
        }
        directionTo(p) {
            return Math.atan2(p.y - this.y, p.x - this.x);
        }
        setValue(x, y) {
            if (isNaN(x))
                x = 0;
            if (isNaN(y))
                y = 0;
            this.x = x;
            this.y = y;
            return this;
        }
        gridSnap(pixels) {
            this.x = Math.round(this.x / pixels) * pixels;
            this.y = Math.round(this.y / pixels) * pixels;
            return this;
        }
        ease(dest, percent) {
            this.x = dest.x * percent + this.x * (1 - percent);
            this.y = dest.y * percent + this.y * (1 - percent);
        }
        getLength() {
            return Math.sqrt(this.getLengthSq());
        }
        getLengthSq() {
            return this.x * this.x + this.y * this.y;
        }
        setLength(length) {
            return this.setVector(this.getAngle(), length);
        }
        getAngle() {
            return Math.atan2(this.y, this.x);
        }
        setAngle(angle) {
            return this.setVector(angle, this.getLength());
        }
        setVector(angle, length) {
            this.x = Math.cos(angle) * length;
            this.y = Math.sin(angle) * length;
            return this;
        }
        invert() {
            this.x *= -1;
            this.y *= -1;
            return this;
        }
        copy(p) {
            this.x = p.x;
            this.y = p.y;
            return this;
        }
        clone() {
            return new Point(this.x, this.y);
        }
        toString() {
            return "(" + this.x + "," + this.y + ")";
        }
    }
    exports.Point = Point;
});
define("lad/src/math/Transform", ["require", "exports", "lad/src/math/Point"], function (require, exports, Point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Transform {
        constructor(x = 0, y = 0, scale = 1, rotation = 0) {
            this.p = new Point_1.Point();
            this.scale = 0;
            this.rotation = 0;
            this.depth = 0;
            this.p.setValue(x, y);
            this.scale = scale;
            this.rotation = rotation;
        }
        reset() {
            this.p.reset();
            this.scale = 1;
            this.rotation = 0;
            return this;
        }
        add(t) {
            this.p.add(t.p);
            if (!isNaN(t.scale))
                this.scale *= t.scale;
            if (!isNaN(t.rotation))
                this.rotation += t.rotation;
            return this;
        }
        subtract(t) {
            this.p.subtract(t.p);
            if (!isNaN(t.scale))
                this.scale /= t.scale;
            if (!isNaN(t.rotation))
                this.rotation -= t.rotation;
            return this;
        }
        copy(t) {
            this.p.copy(t.p);
            if (!isNaN(t.scale))
                this.scale = t.scale;
            if (!isNaN(t.rotation))
                this.rotation = t.rotation;
            return this;
        }
        copyPosition(p) {
            this.p.copy(p);
            return this;
        }
        ease(dest, percent) {
            this.p.ease(dest.p, percent);
            if (!isNaN(dest.scale)) {
                this.scale = dest.scale * percent + this.scale * (1 - percent);
            }
            if (!isNaN(dest.rotation)) {
                if (Math.abs(dest.rotation - this.rotation) > Math.PI)
                    this.rotation += dest.rotation > this.rotation ? Math.PI * 2 : Math.PI * -2;
                this.rotation = dest.rotation * percent + this.rotation * (1 - percent);
            }
            return this;
        }
        clone() {
            return new Transform(this.p.x, this.p.y, this.scale, this.rotation);
        }
    }
    exports.Transform = Transform;
});
define("lad/src/scene/EntityContainer", ["require", "exports", "lad/src/scene/Entity", "lad/src/scene/Scene"], function (require, exports, Entity_1, Scene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EntityContainer extends Entity_1.Entity {
        constructor() {
            super(...arguments);
            this.entities = [];
        }
        add(entity, index = -1) {
            if (entity.parent === this) {
                return;
            }
            entity.scene = this instanceof Scene_1.Scene ? this : this.scene;
            entity.parent = this;
            entity.game = this.game;
            if (this.game && this.game.isPlaying) {
                entity.callAwake();
            }
            if (index >= 0) {
                this.entities.splice(index, 0, entity);
            }
            else {
                this.entities.push(entity);
            }
            return entity;
        }
        removeAll() {
            for (const entity of this.entities) {
                entity.remove();
            }
        }
        contains(entity) {
            const index = this.indexOf(entity);
            return index >= 0;
        }
        indexOf(entity) {
            let i = this.entities.length;
            while (i-- > 0) {
                if (this.entities[i] == entity) {
                    return i;
                }
            }
            return -1;
        }
        callAwake() {
            super.callAwake();
            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].callAwake();
            }
        }
        callUpdate() {
            super.callUpdate();
            const self = this;
            let updating = this.entities.filter(e => e.parent === self && e.entityState <= Entity_1.EntityState.ENABLED);
            let i = updating.length;
            while (i-- > 0) {
                const e = updating[i];
                e.callUpdate();
            }
            i = this.entities.length;
            while (i-- > 0) {
                const e = this.entities[i];
                if (!e || e.parent != this || e.entityState >= Entity_1.EntityState.REMOVING) {
                    this.entities.splice(i, 1);
                    e.scene = null;
                    e.parent = null;
                }
            }
        }
        callRender(r) {
            super.callRender(r);
            for (const e of this.entities) {
                e.renderTransform.depth = r.renderCount++;
                e.callRender(r);
            }
        }
    }
    exports.EntityContainer = EntityContainer;
});
define("lad/src/scene/Scene", ["require", "exports", "lad/src/scene/EntityContainer"], function (require, exports, EntityContainer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Scene extends EntityContainer_1.EntityContainer {
        constructor() {
            super(...arguments);
            this.fillColor = "";
        }
        add(entity, index = -1) {
            super.add(entity, index);
            entity.scene = this;
            return entity;
        }
        callRender(r) {
            r.renderCount = 0;
            if (this.fillColor) {
                r.context.fillStyle = this.fillColor;
                r.context.fillRect(0, 0, this.game.rect.width, this.game.rect.height);
            }
            super.callRender(r);
        }
    }
    exports.Scene = Scene;
});
define("lad/src/display/Renderer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Renderer {
        constructor(canvas) {
            this.percent = 1;
            this.isSmoothing = false;
            this.renderCount = 0;
            this.defaultFont = {
                face: "serif",
                size: 24,
                stroke: "#234",
                fill: "#468",
                baseline: "bottom",
                align: "center",
                lineWidth: 2
            };
            this.font = {};
            Renderer.main = this;
            this.canvas = canvas;
            this.handleContext = this.handleContext.bind(this);
            this.canvas.addEventListener('contextmenu', e => this.handleContext(e));
            this.context = canvas.getContext("2d");
            this.width = canvas.width;
            this.height = canvas.height;
            this.font = Object.assign({}, this.defaultFont);
            this.setSmoothing(this.isSmoothing);
        }
        clear() {
            this.context.clearRect(0, 0, this.width, this.height);
        }
        setSize(width, height) {
            this.width = this.canvas.width = width;
            this.height = this.canvas.height = height;
        }
        setSmoothing(on) {
            this.isSmoothing = on;
            this.canvas.style.imageRendering = on ? "" : "pixelated";
        }
        setFont(options) {
            const c = this.context;
            if (!options) {
                options = this.defaultFont;
            }
            this.font = options = Object.assign({}, this.font, options);
            c.fillStyle = options.fill;
            c.strokeStyle = options.stroke;
            c.font = options.size + "px " + options.face;
            c.textBaseline = options.baseline;
            c.textAlign = options.align;
        }
        writeText(text, x, y, maxWidth) {
            const c = this.context;
            if (this.font.stroke && this.font.lineWidth > 0) {
                c.lineWidth = this.font.lineWidth;
                c.strokeText(text, x, y, maxWidth);
            }
            if (this.font.fill) {
                c.fillText(text, x, y, maxWidth);
            }
        }
        handleContext(e) {
            e.preventDefault();
        }
    }
    exports.Renderer = Renderer;
});
define("lad/src/events/TickTimer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TickTimer {
        constructor() {
            this.isTicking = true;
            this.tickActions = [];
            this.tick = this.tick.bind(this);
        }
        start() {
            this.isTicking = true;
            setTimeout(this.tick, 100);
        }
        stop() {
            this.isTicking = false;
        }
        set(scope, method, fps) {
            const boundMethod = method.bind(scope);
            const lastTick = this.getNow();
            const tickAction = {
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
        unset(scope, method) {
            const index = this.indexOf(scope, method);
            if (index >= 0) {
                this.tickActions.splice(index, 1);
            }
        }
        indexOf(scope, method) {
            for (let i = 0; i < this.tickActions.length; i++) {
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
            requestAnimationFrame(this.tick);
            for (const tickAction of this.tickActions) {
                const now = this.getNow();
                const dt = now - tickAction.lastTick;
                const elapsed = 1000 / tickAction.fps;
                if (dt >= elapsed) {
                    tickAction.lastTick = now - (dt % elapsed);
                    tickAction.boundMethod(dt);
                }
            }
        }
        getNow() {
            return performance.now();
        }
    }
    exports.TickTimer = TickTimer;
});
define("lad/src/math/Rect", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Rect {
        constructor(x, y, width, height) {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.setSize(x, y, width, height);
        }
        setSize(x = 0, y = 0, width = 0, height = 0) {
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
            return this;
        }
        inset(padding) {
            this.x += padding;
            this.width -= padding * 2;
            this.y += padding;
            this.height += padding * 2;
            return this;
        }
        move(x, y) {
            this.x += x;
            this.y += y;
            return this;
        }
        getLeft() {
            return this.x;
        }
        setLeft(value) {
            this.x = value;
        }
        getRight() {
            return this.x + this.width;
        }
        setRight(value) {
            this.width = value - this.x;
        }
        getTop() {
            return this.y;
        }
        setTop(value) {
            this.y = value;
        }
        getBottom() {
            return this.y + this.height;
        }
        setBottom(value) {
            this.height = value - this.y;
        }
        isWithin(p) {
            return p.x > this.x
                && p.y > this.y
                && p.x < this.x + this.width
                && p.y < this.y + this.height;
        }
        overlaps(r) {
            return this.isWithin({ x: r.x, y: r.y })
                && this.isWithin({ x: r.x + r.width, y: r.y + r.height });
        }
        copy(r) {
            this.x = r.x;
            this.y = r.y;
            this.width = r.width;
            this.height = r.height;
            return this;
        }
        clone() {
            return new Rect().copy(this);
        }
        encapsulate(r) {
            this.x = Math.min(this.x, r.x);
            this.y = Math.min(this.y, r.y);
            const rRight = r.x + r.width;
            if (rRight > this.x + this.width) {
                this.width = rRight - this.x;
            }
            const rBottom = r.y + r.height;
            if (rBottom > this.y + this.height) {
                this.height = rBottom - this.y;
            }
            return this;
        }
    }
    exports.Rect = Rect;
});
define("lad/src/events/Dispatcher", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Dispatcher {
        constructor() {
            this.listeners = Array();
        }
        listen(scope, handler, options = {}) {
            const existingIndex = this.indexOf(scope, handler);
            if (existingIndex >= 0) {
                return this.listeners[existingIndex];
            }
            const boundHandler = handler.bind(scope);
            const listener = {
                scope,
                handler,
                boundHandler,
                once: options.once === true
            };
            this.listeners.push(listener);
            return listener;
        }
        unlisten(scope, handler) {
            const index = this.indexOf(scope, handler);
            if (index < 0) {
                return;
            }
            this.listeners.splice(index, 1);
        }
        unlistenAll(scope) {
            let i = this.listeners.length;
            while (i-- > 0) {
                const listener = this.listeners[i];
                if (listener.scope === scope) {
                    this.listeners.splice(i, 1);
                }
            }
        }
        hasListener(scope, handler) {
            return this.indexOf(scope, handler) >= 0;
        }
        indexOf(scope, handler) {
            let i = this.listeners.length;
            while (i-- > 0) {
                const listener = this.listeners[i];
                if (listener.scope === scope && listener.handler === handler) {
                    return i;
                }
            }
            return -1;
        }
        dispatch(message) {
            for (const listener of this.listeners) {
                listener.boundHandler(message);
            }
            this.removeOnces();
        }
        removeOnces() {
            for (let i = this.listeners.length - 1; i >= 0; i--) {
                if (this.listeners[i].once) {
                    this.listeners.splice(i, 1);
                }
            }
        }
    }
    exports.Dispatcher = Dispatcher;
});
define("lad/src/LAD", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const global = window;
    class LADNS {
        constructor() {
            this.modules = {};
            this.DEBUG = false;
        }
        isFunction(object) {
            return typeof object == "function";
        }
        hasFunction(object, name) {
            if (typeof object !== "object")
                return false;
            return typeof object[name] == "function";
        }
        proxyFunction(scope, name) {
            if (this.hasFunction(scope, name) === false) {
                return null;
            }
            return scope[name].bind(scope);
        }
        log(...args) {
            if (console)
                console.log(args);
        }
        error(...args) {
            if (console)
                console.error(args);
        }
        init(type, canvasId) {
            const key = type.name;
            if (!canvasId) {
                let canvas = document.querySelector("canvas#" + key);
                if (!canvas) {
                    canvas = document.createElement("canvas");
                    canvas.id = key;
                    document.body.appendChild(canvas);
                }
                canvasId = key;
                canvas.className = (canvas.className || "") + " ladgame";
            }
            this.game = window.ladgame = new type(canvasId, {});
            return this.game;
        }
        require(type) {
            const name = type.name;
            if (!this.modules[name]) {
                this.modules[name] = new type();
            }
            return this.modules[name];
        }
        fullscreen(on) {
            this.game.renderer.canvas.requestFullscreen({
                navigationUI: "hide"
            });
        }
    }
    global.LAD = global.LAD || new LADNS();
    exports.LAD = global.LAD;
});
define("lad/src/input/PointerManager", ["require", "exports", "lad/src/display/Renderer", "lad/src/events/Dispatcher", "lad/src/LAD", "lad/src/math/Point"], function (require, exports, Renderer_1, Dispatcher_1, LAD_1, Point_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PointerManager {
        constructor() {
            this.buttons = [
                {
                    pos: new Point_2.Point(),
                    button: 0,
                    isDown: false,
                    delta: new Point_2.Point(),
                    prevPos: new Point_2.Point()
                },
                {
                    pos: new Point_2.Point(),
                    button: 1,
                    isDown: false,
                    delta: new Point_2.Point(),
                    prevPos: new Point_2.Point()
                }
            ];
            this.onChange = new Dispatcher_1.Dispatcher();
            this.handleMouse = this.handleMouse.bind(this);
            this.handleTouch = this.handleTouch.bind(this);
            this.enable();
        }
        enable() {
            window.addEventListener("mousedown", this.handleMouse);
            window.addEventListener("mouseup", this.handleMouse);
            window.addEventListener("mousemove", this.handleMouse);
            window.addEventListener("touchstart", this.handleTouch);
            window.addEventListener("touchmove", this.handleTouch);
            window.addEventListener("touchend", this.handleTouch);
            window.addEventListener("touchcancel", this.handleTouch);
        }
        disable() {
            window.removeEventListener("mousedown", this.handleMouse);
            window.removeEventListener("mouseup", this.handleMouse);
            window.removeEventListener("mousemove", this.handleMouse);
            window.removeEventListener("touchstart", this.handleTouch);
            window.removeEventListener("touchmove", this.handleTouch);
            window.removeEventListener("touchend", this.handleTouch);
            window.removeEventListener("touchcancel", this.handleTouch);
        }
        update() {
            for (const button of this.buttons) {
                button.delta.x = button.pos.x - button.prevPos.x;
                button.delta.y = button.pos.y - button.prevPos.y;
                button.prevPos.copy(button.pos);
            }
        }
        handleMouse(e) {
            const buttonIndex = e.button === 0 ? 0 : 1;
            const button = this.buttons[buttonIndex];
            let moved = false;
            let changed = false;
            switch (e.type) {
                case "mousedown":
                    if (button.isDown !== true) {
                        button.isDown = true;
                    }
                    changed = true;
                    moved = true;
                    break;
                case "mouseup":
                    if (button.isDown === true) {
                        button.isDown = false;
                    }
                    changed = true;
                    break;
                case "mousemove":
                    moved = true;
            }
            if (moved) {
                for (let i = 0; i < this.buttons.length; i++) {
                    const b = this.buttons[i];
                    b.pos.copy(this.screenToCanvasPos({ x: e.clientX, y: e.clientY }));
                }
            }
            if (changed) {
                button.cancelled = false;
                this.onChange.dispatch(button);
            }
        }
        handleTouch(e) {
            if (!Renderer_1.Renderer.main) {
                return;
            }
            const buttonIndex = e.touches.length > 1 ? 0 : 1;
            const button = this.buttons[buttonIndex];
            let moved = false;
            let changed = false;
            switch (e.type) {
                case "touchstart":
                    if (button.isDown !== true) {
                        button.isDown = true;
                    }
                    changed = true;
                    moved = true;
                    break;
                case "touchend":
                case "touchcancel":
                    if (button.isDown !== true) {
                        button.isDown = false;
                    }
                    changed = true;
                    break;
                case "touchmove":
                    moved = true;
            }
            if (moved) {
                for (let i = 0; i < this.buttons.length; i++) {
                    const touch = e.touches[i];
                    if (!touch) {
                        continue;
                    }
                    const b = this.buttons[i];
                    b.pos.copy(this.screenToCanvasPos({ x: touch.clientX, y: touch.clientY }));
                }
            }
            if (changed) {
                button.cancelled = false;
                this.dispatchChanges(button);
            }
        }
        screenToCanvasPos(p) {
            const canvas = Renderer_1.Renderer.main.canvas;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const scaleB = Math.max(scaleX, scaleY);
            let offsetX = rect.left;
            let offsetY = rect.top;
            offsetX -= Math.min(rect.left - (rect.width - canvas.width / scaleB) * 0.5, 0) * scaleB;
            offsetY -= Math.min(rect.top - (rect.height - canvas.height / scaleB) * 0.5, 0) * scaleB;
            const px = Math.round(p.x * scaleB - offsetX);
            const py = Math.round(p.y * scaleB - offsetY);
            return new Point_2.Point(px, py);
        }
        dispatchChanges(button) {
            const listeners = this.onChange.listeners.slice();
            listeners.sort((a, b) => {
                let aDepth = 0;
                let bDepth = 0;
                if (a.scope && a.scope.renderTransform && a.scope.renderTransform.depth) {
                    aDepth = a.scope.renderTransform.depth;
                }
                if (b.scope && b.scope.renderTransform && b.scope.renderTransform.depth) {
                    bDepth = b.scope.renderTransform.depth;
                }
                if (aDepth === bDepth) {
                    return 0;
                }
                return aDepth > bDepth ? -1 : 1;
            });
            for (let i = 0; i < listeners.length; i++) {
                const listener = listeners[i];
                listener.boundHandler(button);
                if (button.cancelled) {
                    break;
                }
            }
        }
    }
    exports.pointerManager = LAD_1.LAD.require(PointerManager);
});
define("lad/src/scene/Game", ["require", "exports", "lad/src/display/Renderer", "lad/src/events/TickTimer", "lad/src/math/Rect", "lad/src/scene/Entity", "lad/src/input/PointerManager"], function (require, exports, Renderer_2, TickTimer_1, Rect_1, Entity_2, PointerManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_FRAME_RATE = 60;
    const DEFAULT_UPDATE_TIME = 1000 / DEFAULT_FRAME_RATE;
    class Game {
        constructor(canvasId, options) {
            this.params = {};
            this.isPlaying = false;
            this.timeDelta = DEFAULT_UPDATE_TIME;
            this.rect = new Rect_1.Rect();
            this.tickTimer = new TickTimer_1.TickTimer();
            this.lastUpdate = 0.0;
            this.lastRender = 0.0;
            this.fpsUpdate = DEFAULT_FRAME_RATE;
            this.fpsRender = DEFAULT_FRAME_RATE;
            this.pointer = PointerManager_1.pointerManager;
            this.frames = 0;
            Game.main = this;
            this.renderer = new Renderer_2.Renderer(document.getElementById(canvasId));
            this.setFramerate(options.fpsUpdate, options.fpsRender);
            this.parseParams();
            this.updateRect();
        }
        parseParams() {
            this.params = {};
            const paramPairs = window.location.hash.substr(1).split(",");
            if (paramPairs.length == 0)
                return;
            let pair;
            let i = paramPairs.length;
            while (i-- > 0) {
                pair = paramPairs[i].split("=");
                this.params[pair[0]] = pair[1] || "";
            }
        }
        setFramerate(fpsUpdate, fpsRender) {
            this.fpsUpdate = fpsUpdate || 60;
            this.fpsRender = fpsRender || this.fpsUpdate;
            this.tickTimer.clear();
            this.tickTimer.set(this, this.callUpdate, this.fpsUpdate);
            this.tickTimer.set(this, this.callRender, this.fpsRender);
        }
        start() {
            if (!this.scene)
                return;
            this.tickTimer.start();
            this.isPlaying = true;
        }
        stop() {
            this.tickTimer.stop();
            this.isPlaying = false;
        }
        setScene(scene) {
            if (scene == this.scene) {
                return;
            }
            this.stop();
            if (this.scene) {
                this.scene.game = null;
            }
            this.scene = scene;
            this.layers = [scene];
            scene.game = this;
            setTimeout(this.start.bind(this), 10);
        }
        addScene(scene) {
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
        removeScene(scene) {
            if (scene == this.scene) {
                throw new Error("Can't remove top scene");
            }
            const index = this.getLayerIndex(scene);
            if (index > 0) {
                this.layers.splice(index, 1);
            }
        }
        getLayerIndex(scene) {
            for (let i = 0; i < this.layers.length; i++) {
                if (this.layers[i] === scene) {
                    return i;
                }
            }
            return -1;
        }
        callUpdate() {
            this.pointer.update();
            this.updateRect();
            for (const scene of this.layers) {
                if (scene.entityState < Entity_2.EntityState.AWAKE) {
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
            this.renderer.clear();
            this.timeDelta = this.tickTimer.getNow() - this.lastUpdate;
            const updateTime = 1000 / this.fpsUpdate;
            this.renderer.percent = Math.min(this.timeDelta / updateTime, 1);
            for (const scene of this.layers) {
                scene.callRender(this.renderer);
            }
            this.lastRender = this.tickTimer.getNow();
        }
        updateRect() {
            this.rect.x = this.rect.y = 0;
            this.rect.width = this.renderer.canvas.offsetWidth;
            this.rect.height = this.renderer.canvas.offsetHeight;
        }
    }
    exports.Game = Game;
});
define("lad/src/scene/Entity", ["require", "exports", "lad/src/math/Transform"], function (require, exports, Transform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EntityState;
    (function (EntityState) {
        EntityState[EntityState["INIT"] = 0] = "INIT";
        EntityState[EntityState["AWAKE"] = 1] = "AWAKE";
        EntityState[EntityState["ENABLED"] = 2] = "ENABLED";
        EntityState[EntityState["DISABLED"] = 3] = "DISABLED";
        EntityState[EntityState["REMOVING"] = 4] = "REMOVING";
    })(EntityState = exports.EntityState || (exports.EntityState = {}));
    class Entity {
        constructor() {
            this.transform = new Transform_1.Transform();
            this.prevTransform = this.transform.clone();
            this.renderTransform = new Transform_1.Transform();
            this.parent = null;
            this.clip = null;
            this.scene = null;
            this.game = null;
            this.entityState = EntityState.INIT;
        }
        awake() { }
        start() { }
        update() { }
        render(r) {
            if (this.clip == null) {
                return;
            }
            this.clip.render(r, this.renderTransform);
        }
        setEnabled(enabled) {
            this.entityState = enabled ? Math.min(this.entityState, EntityState.ENABLED) : EntityState.DISABLED;
        }
        remove() {
            this.entityState = EntityState.REMOVING;
        }
        onCollision(entity) { }
        callAwake() {
            if (this.entityState < EntityState.AWAKE) {
                this.awake();
            }
            this.entityState = EntityState.AWAKE;
            this.prevTransform.copy(this.transform);
        }
        callUpdate() {
            if (this.entityState < EntityState.ENABLED) {
                this.start();
                this.prevTransform.copy(this.transform);
                this.entityState = EntityState.ENABLED;
            }
            else if (this.entityState > EntityState.ENABLED) {
                return;
            }
            this.update();
            this.prevTransform.copy(this.transform);
        }
        callRender(r) {
            if (this.entityState != EntityState.ENABLED) {
                return;
            }
            this.calcRender(r);
            this.render(r);
        }
        calcRender(r) {
            let rt = this.renderTransform;
            rt.copy(this.prevTransform).ease(this.transform, r.percent);
            if (this.parent) {
                rt.add(this.parent.renderTransform);
            }
        }
    }
    exports.Entity = Entity;
});
define("shapeships/src/SSEntity", ["require", "exports", "lad/src/scene/Entity"], function (require, exports, Entity_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSEntity extends Entity_3.Entity {
        constructor() {
            super(...arguments);
            this.hitRadius = 5;
            this.enemy = false;
        }
    }
    exports.SSEntity = SSEntity;
});
define("lad/src/input/AInput", ["require", "exports", "lad/src/events/Dispatcher"], function (require, exports, Dispatcher_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AInput extends Dispatcher_2.Dispatcher {
        constructor(deviceName) {
            super();
            this.deviceName = deviceName;
            this.actions = {};
            this.buttons = {};
            this.pressed = {};
            this.window = window;
        }
        addAction(name, button) {
            this.actions[name] = { name: name, button: button + "", down: false, deviceName: this.deviceName };
            this.buttons[button] = name;
        }
        addActions(keymap) {
            for (let key in keymap) {
                this.addAction(key, keymap[key]);
            }
        }
        removeAction(name) {
            if (!this.hasAction(name))
                return;
            delete this.buttons[this.actions[name].button];
            delete this.actions[name];
        }
        hasAction(name) {
            return this.actions[name] != null;
        }
        getAction(actionNameOrButton) {
            if (this.actions.hasOwnProperty(actionNameOrButton))
                return this.actions[actionNameOrButton];
            if (this.buttons.hasOwnProperty(actionNameOrButton))
                return this.actions[this.buttons[actionNameOrButton]];
            return null;
        }
        press(button) {
            this.pressed[button] = true;
            if (this.buttons.hasOwnProperty(button)) {
                let action = this.actions[this.buttons[button]];
                action.down = true;
                this.pressed[action.name] = true;
                this.dispatch(action);
            }
            else {
                this.dispatch({ button: button, down: true, deviceName: this.deviceName });
            }
        }
        release(button) {
            this.pressed[button] = false;
            if (this.buttons.hasOwnProperty(button)) {
                let action = this.actions[this.buttons[button]];
                action.down = false;
                this.pressed[action.name] = false;
                this.dispatch(action);
            }
            else {
                this.dispatch({ button: button, down: false, deviceName: this.deviceName });
            }
        }
        isPressed(actionNameOrButton) {
            return this.pressed[actionNameOrButton] == true;
        }
        anyPressed() {
            let i = arguments.length;
            if (arguments.length < 1) {
                for (let key in this.pressed)
                    if (this.pressed[key] == true)
                        return true;
                return false;
            }
            let actionNameOrButton;
            while (i-- > 0) {
                actionNameOrButton = arguments[i];
                if (this.pressed[actionNameOrButton] == true)
                    return true;
            }
            return false;
        }
    }
    exports.AInput = AInput;
});
define("lad/src/input/KeyboardInput", ["require", "exports", "lad/src/input/AInput"], function (require, exports, AInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class KeyboardInput extends AInput_1.AInput {
        constructor() {
            super("keyboard");
            const handler = this.handleInput.bind(this);
            window.addEventListener("keydown", handler);
            window.addEventListener("keyup", handler);
        }
        handleInput(e) {
            const keyName = (e.keyCode || "") + "";
            switch (e.type) {
                case "keydown":
                    this.press(keyName);
                    break;
                case "keyup":
                    this.release(keyName);
                    break;
            }
        }
    }
    exports.KeyboardInput = KeyboardInput;
});
define("lad/src/input/PointerInput", ["require", "exports", "lad/src/input/AInput", "lad/src/display/Renderer"], function (require, exports, AInput_2, Renderer_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PointerInput extends AInput_2.AInput {
        constructor() {
            super("mouse");
            this.x = 0.0;
            this.y = 0.0;
            this.isDown = false;
            this.handleMouse = this.handleMouse.bind(this);
            window.addEventListener("mousedown", this.handleMouse);
            window.addEventListener("mouseup", this.handleMouse);
            window.addEventListener("mousemove", this.handleMouse);
            this.handleTouch = this.handleTouch.bind(this);
            window.addEventListener("touchstart", this.handleTouch);
            window.addEventListener("touchmove", this.handleTouch);
            window.addEventListener("touchend", this.handleTouch);
            window.addEventListener("touchcancel", this.handleTouch);
        }
        handleMouse(e) {
            const button = e.button === 0 ? 0 : 1;
            switch (e.type) {
                case "mousedown":
                    if (this.isDown === false) {
                        this.press(button + "");
                        this.isDown = true;
                    }
                    break;
                case "mouseup":
                    if (this.isDown) {
                        this.release(button + "");
                        this.isDown = false;
                    }
                    break;
            }
            this.x = e.offsetX || this.x;
            this.y = e.offsetY || this.y;
        }
        handleTouch(e) {
            const button = e.touches.length > 1 ? 0 : 1;
            switch (e.type) {
                case "touchstart":
                    if (this.isDown === false) {
                        this.press(button + "");
                        this.isDown = true;
                    }
                    break;
                case "touchend":
                    if (this.isDown) {
                        this.release(button + "");
                        this.isDown = false;
                    }
                    break;
            }
            this.x = (e.touches[0].pageX - Renderer_3.Renderer.main.canvas.offsetTop) || this.x;
            this.y = (e.touches[0].pageY - Renderer_3.Renderer.main.canvas.offsetTop) || this.y;
        }
    }
    exports.PointerInput = PointerInput;
});
define("lad/src/input/MultiInput", ["require", "exports", "lad/src/input/AInput", "lad/src/input/KeyboardInput", "lad/src/input/PointerInput"], function (require, exports, AInput_3, KeyboardInput_1, PointerInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MultiInput extends AInput_3.AInput {
        constructor() {
            super("multiinput");
            this.keyboard = new KeyboardInput_1.KeyboardInput();
            this.mouse = new PointerInput_1.PointerInput();
            this.keyboard.listen(this, this.dispatch);
            this.mouse.listen(this, this.dispatch);
        }
        hasAction(name) {
            if (this.keyboard.hasAction(name))
                return true;
            if (this.mouse.hasAction(name))
                return true;
            return false;
        }
        isPressed(actionNameOrButton) {
            if (this.keyboard.isPressed(actionNameOrButton))
                return true;
            if (this.mouse.isPressed(actionNameOrButton))
                return true;
            return false;
        }
        anyPressed() {
            let i = arguments.length;
            let actionNameOrButton;
            while (i-- > 0) {
                actionNameOrButton = arguments[i];
                if (this.keyboard.isPressed(actionNameOrButton))
                    return true;
                if (this.mouse.isPressed(actionNameOrButton))
                    return true;
            }
            return false;
        }
    }
    exports.MultiInput = MultiInput;
});
define("lad/src/display/IClip", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lad/src/display/Path", ["require", "exports", "lad/src/math/Rect"], function (require, exports, Rect_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PathOp;
    (function (PathOp) {
        PathOp[PathOp["Line"] = 0] = "Line";
        PathOp[PathOp["Move"] = 1] = "Move";
    })(PathOp = exports.PathOp || (exports.PathOp = {}));
    class Path {
        constructor(fillColor, stokeStyle, lineWidth, points, closed) {
            this.fillStyle = fillColor;
            this.strokeStyle = stokeStyle || "black";
            this.lineWidth = lineWidth > 0 ? lineWidth : 0;
            this.points = points || [];
            this.closed = closed || false;
        }
        add(x, y, op) {
            x = x || 0;
            y = y || 0;
            op = op || PathOp.Line;
            const p = { x, y, op };
            this.points.push(p);
            return p;
        }
        remove(p) {
            let i = this.points.length;
            while (i-- > 0) {
                if (this.points[i].x !== p.x)
                    continue;
                if (this.points[i].y !== p.y)
                    continue;
                this.points.splice(i, 1);
                break;
            }
            return p || null;
        }
        addCircle(x, y, radius, pointCount) {
            if (isNaN(pointCount))
                pointCount = 16;
            let ang = Math.PI * 2, seg = ang / pointCount;
            this.add(x, y, PathOp.Move);
            while (ang > 0) {
                this.add(Math.cos(ang) * radius + x, Math.sin(ang) * radius + y);
                ang -= seg;
            }
        }
        addBox(x, y, width, height) {
            this.add(x, y, PathOp.Move);
            this.add(x + width, y);
            this.add(x + width, y + height);
            this.add(y, y + height);
        }
        render(r, t) {
            if (this.points.length < 2) {
                return;
            }
            const c = r.context;
            const useFill = this.fillStyle != null;
            const useStroke = this.lineWidth > 0;
            c.beginPath();
            c.lineWidth = this.lineWidth;
            if (useFill) {
                c.fillStyle = this.fillStyle;
            }
            if (useStroke) {
                c.strokeStyle = this.strokeStyle;
            }
            const points = this.points.slice();
            if (closed) {
                points.push(points[0]);
            }
            let len = points.length, i = -1;
            while (++i < len) {
                const p = points[i];
                const cos = Math.cos(t.rotation) * t.scale;
                const sin = Math.sin(t.rotation) * t.scale;
                const px = p.x * cos - p.y * sin + t.p.x;
                const py = p.x * sin + p.y * cos + t.p.y;
                if (i == 0 || p.op === PathOp.Move) {
                    c.moveTo(px, py);
                }
                else {
                    c.lineTo(px, py);
                }
            }
            if (useFill) {
                c.fill();
            }
            if (useStroke) {
                c.stroke();
            }
        }
        getBounds() {
            let points = this.points;
            let l = 0, r = 0, b = 0, t = 0;
            let i = this.points.length;
            if (i > 0) {
                let p;
                while (i-- > 0) {
                    p = points[i];
                    if (isNaN(l) || p.x < l)
                        l = p.x;
                    if (isNaN(r) || p.x > r)
                        r = p.x;
                    if (isNaN(t) || p.y < t)
                        t = p.y;
                    if (isNaN(b) || p.y > b)
                        b = p.y;
                }
                return new Rect_2.Rect(l, t, r - l, b - t);
            }
            return new Rect_2.Rect();
        }
    }
    exports.Path = Path;
});
define("shapeships/src/SSSmokePart", ["require", "exports", "lad/src/scene/Entity", "lad/src/math/Point", "lad/src/display/Path"], function (require, exports, Entity_4, Point_3, Path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSSmokePart extends Entity_4.Entity {
        constructor() {
            super();
            this.move = new Point_3.Point();
            this.life = 0;
            let alpha = Math.random() * 0.3 + 0.2;
            let p = new Path_1.Path("rgba(150,150,150," + alpha + ")");
            p.add(-15, 5);
            p.add(0, -8);
            p.add(15, 5);
            p.add(15, 8);
            p.add(0, -5);
            p.add(-15, 8);
            p.closed = true;
            this.clip = p;
        }
        go(rotation) {
            let speed = 3;
            this.move.setValue(Math.cos(rotation) * speed, Math.sin(rotation) * speed);
            this.transform.rotation = rotation - Math.PI * 0.5;
            this.life = 8;
        }
        start() {
            this.transform.p.add(this.move.clone().multiply(3));
        }
        update() {
            this.transform.p.add(this.move);
            if (this.life-- > 0)
                return;
            this.remove();
        }
    }
    exports.SSSmokePart = SSSmokePart;
});
define("lad/src/display/ClipGroup", ["require", "exports", "lad/src/math/Rect"], function (require, exports, Rect_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ClipGroup {
        constructor(paths) {
            this.clips = [];
            this.clips = paths || [];
        }
        add(path) {
            this.remove(path);
            this.clips.push(path);
            return path;
        }
        remove(path) {
            let i = -1, len = this.clips.length;
            while (++i < len) {
                if (this.clips[i] != path)
                    continue;
                this.clips.splice(i, 1);
                break;
            }
            return path || null;
        }
        render(r, t) {
            let i = -1, len = this.clips.length;
            while (++i < len) {
                this.clips[i].render(r, t);
            }
        }
        getBounds() {
            let i = this.clips.length;
            let rect = new Rect_3.Rect();
            if (i > 0) {
                rect.copy(this.clips[0].getBounds());
                while (i-- > 1) {
                    rect.encapsulate(this.clips[i].getBounds());
                }
            }
            return rect;
        }
    }
    exports.ClipGroup = ClipGroup;
});
define("shapeships/src/SSPlayerShip", ["require", "exports", "shapeships/src/SSShip", "shapeships/src/SSSmokePart", "lad/src/math/Point", "lad/src/display/ClipGroup", "lad/src/display/Path"], function (require, exports, SSShip_1, SSSmokePart_1, Point_4, ClipGroup_1, Path_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSPlayerShip extends SSShip_1.SSShip {
        constructor() {
            super(...arguments);
            this.speed = 12;
            this.fireSpeed = 30;
            this.shootFrames = 4;
            this.smokeFrames = 4;
            this.hitRadius = 24;
            this.enemy = false;
            this.bullets = [];
            this.smokes = [];
            this.move = new Point_4.Point();
            this.frame = 0;
            this.shootAngle = 0;
        }
        awake() {
            this.input = this.game.input;
            this.input.keyboard.addActions(this.game.keys);
            this.input.mouse.addActions(this.game.mouse);
            this.input.player = this;
            this.draw();
        }
        draw() {
            let s = new ClipGroup_1.ClipGroup();
            let p = new Path_2.Path("#DDA", "#999", 1);
            p.add(-16, 24);
            p.add(0, -24);
            p.add(16, 24);
            p.add(0, 18);
            p.add(-16, 24);
            p.closed = true;
            s.add(p);
            p = new Path_2.Path("#FFF");
            p.add(-10, 12);
            p.add(-16, 24);
            p.add(0, 0);
            p.closed = true;
            s.add(p);
            p = new Path_2.Path("#FFF");
            p.add(10, 12);
            p.add(16, 24);
            p.add(0, 0);
            p.closed = true;
            s.add(p);
            p = new Path_2.Path("#AAA");
            p.add(0, -24);
            p.add(-1, 24);
            p.add(1, 24);
            p.closed = true;
            s.add(p);
            this.clip = s;
        }
        start() {
            this.reset();
        }
        reset() {
            this.transform.rotation = 0;
            this.move.setValue(0, -1);
            this.moveDelta.copy(this.move);
            this.frame = 0;
        }
        update() {
            let moveAngle = this.game.input.getMoveAngle();
            this.speed = Math.min(10 + (this.game ? this.game.score.multi / 50 : 1), 25);
            if (isNaN(moveAngle)) {
                this.moveDelta.reset();
            }
            else {
                this.moveDelta.setVector(moveAngle, this.speed);
            }
            this.move.ease(this.moveDelta, 0.2);
            let rot = this.origin.directionTo(this.move);
            this.transform.rotation = rot + Math.PI * 0.5;
            this.transform.p.add(this.move);
            this.scene.constrain(this);
            let shootAngle = this.game.input.isPressed("shootStraight") ? rot : this.game.input.getShootAngle();
            if (shootAngle && !this.shootAngle)
                this.shootAngle = shootAngle;
            if (shootAngle && this.shootAngle)
                shootAngle = (shootAngle * 7 + this.shootAngle) * 0.125;
            if (this.frame % this.shootFrames == 0 && !isNaN(shootAngle)) {
                if (this.shootAngle - shootAngle > Math.PI) {
                    this.shootAngle -= Math.PI * 2;
                }
                this.shoot(shootAngle);
            }
            this.shootAngle = shootAngle;
            if (this.frame % this.smokeFrames == 0 && !isNaN(moveAngle)) {
                this.smoke();
            }
            this.frame++;
        }
        shoot(angle) {
            let bullet = this.bullets.length > 10 ? this.bullets.shift() : new SSShip_1.SSBullet();
            bullet.transform.copy(this.prevTransform);
            bullet.go(angle, this.fireSpeed);
            if (!bullet.scene)
                this.scene.add(bullet, 1);
            this.bullets.push(bullet);
        }
        smoke() {
            let smoke = this.smokes.length > 8 ? this.smokes.shift() : new SSSmokePart_1.SSSmokePart();
            smoke.go(this.transform.rotation + Math.PI * 0.5);
            smoke.transform.copy(this.prevTransform);
            if (!smoke.scene)
                this.scene.add(smoke, 1);
            this.smokes.push(smoke);
        }
        onCollision(e) {
            if (e.enemy) {
                this.scene.die();
            }
        }
    }
    exports.SSPlayerShip = SSPlayerShip;
});
define("shapeships/src/SSInput", ["require", "exports", "lad/src/input/MultiInput"], function (require, exports, MultiInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSInput extends MultiInput_1.MultiInput {
        constructor(player) {
            super();
            this.player = player || null;
        }
        getMoveAngle() {
            return this.getAngle("left", "up", "right", "down");
        }
        getShootAngle() {
            if (!this.isPressed("shoot")) {
                return this.getAngle("shootLeft", "shootUp", "shootRight", "shootDown");
            }
            else {
                if (this.player) {
                    let t = this.player.renderTransform;
                    let dx = this.mouse.x - t.p.x;
                    let dy = this.mouse.y - t.p.y;
                    return Math.atan2(dy, dx);
                }
            }
        }
        getAngle(leftName, upName, rightName, downName) {
            let left = this.isPressed(leftName), up = this.isPressed(upName), right = this.isPressed(rightName), down = this.isPressed(downName);
            if (up && left)
                return Math.PI * -0.75;
            if (up && right)
                return Math.PI * -0.25;
            if (down && left)
                return Math.PI * 0.75;
            if (down && right)
                return Math.PI * 0.25;
            if (up)
                return Math.PI * -0.5;
            if (down)
                return Math.PI * 0.5;
            if (left)
                return Math.PI;
            if (right)
                return 0;
            return NaN;
        }
    }
    exports.SSInput = SSInput;
});
define("shapeships/src/SSChaserShip", ["require", "exports", "shapeships/src/SSShip", "lad/src/math/Point", "lad/src/display/ClipGroup", "lad/src/display/Path"], function (require, exports, SSShip_2, Point_5, ClipGroup_2, Path_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSChaserShip extends SSShip_2.SSShip {
        constructor() {
            super();
            this.speed = 10;
            this.hitRadius = 15;
            this.move = new Point_5.Point(0, -1);
            this.moveDelta = new Point_5.Point(0, -1);
            this.origin = new Point_5.Point();
            this.enemy = true;
            this.draw();
        }
        draw() {
            let s = new ClipGroup_2.ClipGroup();
            let p = new Path_3.Path("#E44", undefined, 0);
            let PI2 = Math.PI * 2;
            let ang = PI2;
            let seg = PI2 / 24;
            let rad = 20;
            let px, py;
            while (ang >= 0) {
                px = Math.cos(ang) * rad;
                py = Math.sin(ang) * rad;
                p.add(px, py);
                rad = rad == 20 ? 16 : 20;
                ang -= seg;
            }
            while (ang <= PI2) {
                px = Math.cos(ang) * rad;
                py = Math.sin(ang) * rad;
                p.add(px, py);
                rad = rad == 10 ? 8 : 10;
                ang += seg;
            }
            p.closed = true;
            s.add(p);
            p = new Path_3.Path("#666", undefined, 0);
            p.add(0, 10);
            p.add(10, 0);
            p.add(0, -10);
            p.add(-10, 0);
            p.closed = true;
            s.add(p);
            this.clip = s;
        }
        update() {
            let target = this.scene.ship;
            let moveAngle = target.transform.p.directionTo(this.transform.p) + Math.PI;
            this.moveDelta.x = Math.cos(moveAngle) * this.speed;
            this.moveDelta.y = Math.sin(moveAngle) * this.speed;
            this.move.x = (this.move.x * 4 + this.moveDelta.x) * 0.2;
            this.move.y = (this.move.y * 4 + this.moveDelta.y) * 0.2;
            let rot = this.origin.directionTo(this.move);
            this.transform.rotation = rot + Math.PI * 0.5;
            this.transform.p.add(this.move);
            this.scene.constrain(this);
        }
        onCollision(e) {
            if (!this.scene)
                return;
            let isEnemy = e.enemy === true;
            if (isEnemy) {
                let r = e.transform.p.directionTo(this.transform.p);
                this.transform.p.x += Math.cos(r) * this.speed * 0.3;
                this.transform.p.y += Math.sin(r) * this.speed * 0.3;
            }
        }
    }
    exports.SSChaserShip = SSChaserShip;
});
define("shapeships/src/SSWave", ["require", "exports", "shapeships/src/SSBouncerShip", "shapeships/src/SSChaserShip"], function (require, exports, SSBouncerShip_1, SSChaserShip_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSWave {
        constructor() {
            this.spawnFrames = 0;
            this.enemies = 0;
            this.enemiesSpawned = 0;
            this.enemiesKilled = 0;
            this.enemySpeed = 0;
            this.wave = 0;
            this.enemyTypes = [];
            this.reset();
        }
        reset() {
            this.setWave(1);
        }
        next() {
            this.setWave(this.wave + 1);
        }
        prev() {
            this.setWave(this.wave - 1);
        }
        again() {
            this.setWave(this.wave);
        }
        setWave(wave) {
            this.spawnFrames = this.getSpawnFrames();
            this.enemies = Math.floor(wave * 0.5) + 3;
            this.enemiesSpawned = 0;
            this.enemiesKilled = 0;
            this.enemySpeed = 3 + (wave * 0.3);
            this.wave = wave;
            this.enemyTypes = this.getEnemyTypes();
        }
        getSpawnFrames() {
            const spawnWave = Math.min(this.wave, 3);
            let result = 60 - 3 * spawnWave;
            result = Math.min(60, Math.max(10, result));
            return result;
        }
        getEnemyTypes() {
            let wave = this.wave;
            let result = [SSBouncerShip_1.SSBounceShip];
            if (wave > 3)
                result.push(SSChaserShip_1.SSChaserShip);
            return result;
        }
        getRandomEnemy() {
            return this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        }
        getSuccess() {
            let wave = this.wave;
            if (wave > 2) {
                let type;
                if (wave > 30)
                    type = "IMPOSSIBLE";
                else if (wave > 20)
                    type = "IMPROBABLE";
                else if (wave > 15)
                    type = "AMAZING";
                else if (wave > 10)
                    type = "GREAT";
                else if (wave > 8)
                    type = "GOOD";
                else if (wave > 5)
                    type = "DECENT";
                else if (wave > 5)
                    type = "SOME";
                else
                    type = "FLEETING";
                return "YOU LASTED " + (wave - 1) + " WAVES - " + type + " SUCCESS!";
            }
            else if (wave == 2) {
                return "YOU MADE IT THROUGH A SINGLE WAVE";
            }
            else {
                return "YOU COULDN'T LAST A SINGLE WAVE";
            }
        }
    }
    exports.SSWave = SSWave;
});
define("shapeships/src/SSScore", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSScore {
        constructor() {
            this.score = 0;
            this.multi = 1;
            this.lives = 3;
            this.reset();
        }
        reset() {
            this.score = 0;
            this.multi = 1;
            this.lives = 3;
        }
        increaseMulti() {
            this.multi++;
        }
    }
    exports.SSScore = SSScore;
});
define("shapeships/src/SSHUD", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSHUD {
        constructor(game) {
            this.game = game;
            this.score = 0;
            this.wave = 0;
            this.lives = 0;
            this.multi = 0;
        }
        render(r, score, multi, wave, lives) {
            if (this.score == score
                && this.wave == wave
                && this.lives == lives
                && this.multi == multi)
                return;
            let w = r.width, h = r.height, c = r.context;
            c.fillStyle = "#468";
            c.strokeStyle = "#234";
            c.font = "24px serif";
            c.textBaseline = "bottom";
            c.textAlign = "left";
            c.strokeText("SCORE: " + score, 30, 50);
            c.strokeText("MULTI: " + multi + "x", w - 500, 50);
            c.strokeText("WAVE: " + wave, w - 300, 50);
            c.strokeText("LIVES: " + lives, w - 140, 50);
        }
    }
    exports.SSHUD = SSHUD;
});
define("shapeships/src/SSExplosionPart", ["require", "exports", "shapeships/src/SSEntity", "lad/src/math/Point", "lad/src/display/Path"], function (require, exports, SSEntity_1, Point_6, Path_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSExplosionPart extends SSEntity_1.SSEntity {
        constructor() {
            super();
            this.move = new Point_6.Point();
            this.magnetDistance = 150;
            this.speed = 0;
            this.lived = 0;
            this.hitRadius = 5;
            this.magnetic = false;
            this.life = 0;
            let p = new Path_4.Path("red");
            p.addCircle(0, 0, 4, 6);
            p.closed = true;
            this.clip = p;
        }
        go(angle, speed, color) {
            this.speed = speed;
            this.life = this.life || Math.random() * 30 + 30;
            this.lived = 0;
            this.clip.fillColor = color;
            this.move.setVector(angle, speed);
            this.transform.rotation = angle;
            this.hitRadius = 5;
            this.magnetic = false;
        }
        update() {
            if (this.magnetic && this.scene.ableState == "alive") {
                if (this.speed < 20) {
                    this.speed += 0.5;
                }
                let ang = this.transform.p.directionTo(this.scene.ship.transform.p);
                this.move.setVector(ang, this.speed);
            }
            else {
                if (this.scene.ship) {
                    const near = this.transform.p.isWithinDistance(this.scene.ship.transform.p, this.magnetDistance);
                    this.magnetic = this.lived > 10 && near;
                }
                this.move.multiply(0.95);
            }
            this.transform.p.add(this.move);
            this.scene.constrain(this);
            if (this.lived++ >= this.life) {
                this.remove();
            }
        }
        onCollision(e) {
            if (e != this.scene.ship)
                return;
            this.game.score.increaseMulti();
            this.remove();
        }
    }
    exports.SSExplosionPart = SSExplosionPart;
});
define("shapeships/src/SSExplosion", ["require", "exports", "lad/src/scene/Entity", "shapeships/src/SSExplosionPart"], function (require, exports, Entity_5, SSExplosionPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSExplosion extends Entity_5.Entity {
        constructor(partCount, speed) {
            super();
            this.partCount = partCount;
            this.speed = speed;
            this.color = "grey";
            this.life = 0;
        }
        start() {
            let g = Math.floor(Math.random() * 150 + 30);
            let b = Math.floor(Math.random() * 150 + 100);
            if (!this.color)
                this.color = "rgb(125," + g + "," + b + ")";
            let part;
            let ang = Math.PI * 2;
            let seg = ang / this.partCount;
            while (ang > 0) {
                part = new SSExplosionPart_1.SSExplosionPart();
                part.life = this.life;
                part.go(ang, this.speed, this.color);
                part.transform.p.copy(this.transform.p);
                this.scene.add(part, 1);
                ang -= seg;
            }
            this.remove();
        }
    }
    exports.SSExplosion = SSExplosion;
});
define("shapeships/src/SSScreenMenu", ["require", "exports", "shapeships/src/SSScene", "shapeships/src/SSExplosion"], function (require, exports, SSScene_1, SSExplosion_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSScreenMenu extends SSScene_1.SSScene {
        constructor() {
            super(...arguments);
            this.frame = 0;
        }
        start() {
            this.game.input.listen(this, this.handleInput);
        }
        handleInput(action) {
            if (action.down) {
                if (action.button === this.game.keys.shootStraight + ""
                    || action.button === this.game.keys.confirm + ""
                    || action.deviceName === "mouse") {
                    this.game.input.unlistenAll(this);
                    const nextScreen = this.getNextScreen();
                    if (nextScreen) {
                        this.game.setScene(nextScreen);
                    }
                }
            }
        }
        update() {
            if (isNaN(this.frame))
                this.frame = 1;
            if (this.frame-- > 0)
                return;
            let explosion = new SSExplosion_1.SSExplosion(16, 10), r = this.game.renderer;
            explosion.transform.p.x = Math.random() * r.width;
            explosion.transform.p.y = Math.random() * r.height;
            explosion.life = Math.random() * 8 + 8;
            explosion.color = "#ACE";
            this.add(explosion);
            this.frame = NaN;
        }
        constrain(e) { }
        getNextScreen() {
            return null;
        }
    }
    exports.SSScreenMenu = SSScreenMenu;
});
define("shapeships/src/SSScreenTitle", ["require", "exports", "shapeships/src/SSScreenMenu", "shapeships/src/SSExplosion", "shapeships/src/SSGame"], function (require, exports, SSScreenMenu_1, SSExplosion_2, SSGame_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSScreenTitle extends SSScreenMenu_1.SSScreenMenu {
        getNextScreen() {
            return SSGame_1.SSScreens.game;
        }
        update() {
            if (isNaN(this.frame))
                this.frame = 1;
            if (this.frame-- > 0)
                return;
            let explosion = new SSExplosion_2.SSExplosion(16, 10), r = this.game.renderer;
            explosion.transform.p.x = Math.random() * r.width;
            explosion.transform.p.y = Math.random() * r.height;
            explosion.life = Math.random() * 8 + 8;
            explosion.color = "#ACE";
            this.add(explosion);
            this.frame = NaN;
        }
        callRender(r) {
            super.callRender(r);
            let w = r.width, h = r.height, c = r.context;
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
    exports.SSScreenTitle = SSScreenTitle;
});
define("shapeships/src/SSScreenEnd", ["require", "exports", "shapeships/src/SSScreenMenu", "shapeships/src/SSGame"], function (require, exports, SSScreenMenu_2, SSGame_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSScreenEnd extends SSScreenMenu_2.SSScreenMenu {
        getNextScreen() {
            return SSGame_2.SSScreens.title;
        }
        render(r) {
            super.render(r);
            let w = r.width, h = r.height, c = r.context;
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
    exports.SSScreenEnd = SSScreenEnd;
});
define("shapeships/src/SSGame", ["require", "exports", "shapeships/src/SSInput", "shapeships/src/SSWave", "shapeships/src/SSScore", "shapeships/src/SSHUD", "lad/src/scene/Game", "shapeships/src/SSScreenTitle", "shapeships/src/SSScreenEnd", "shapeships/src/SSScene"], function (require, exports, SSInput_1, SSWave_1, SSScore_1, SSHUD_1, Game_1, SSScreenTitle_1, SSScreenEnd_1, SSScene_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SSScreens = {
        title: new SSScreenTitle_1.SSScreenTitle(),
        game: new SSScene_2.SSScene(),
        end: new SSScreenEnd_1.SSScreenEnd()
    };
    class SSGame extends Game_1.Game {
        constructor(canvasName) {
            super(canvasName, {
                fpsUpdate: 30,
                fpsRender: 120
            });
            this.keys = {
                up: 87,
                left: 65,
                down: 83,
                right: 68,
                shootUp: 38,
                shootDown: 40,
                shootLeft: 37,
                shootRight: 39,
                shootStraight: 32,
                confirm: 13,
            };
            this.mouse = {
                shoot: 0
            };
            this.input = new SSInput_1.SSInput();
            this.wave = new SSWave_1.SSWave();
            this.score = new SSScore_1.SSScore();
            this.setScene(exports.SSScreens.title);
            this.hud = new SSHUD_1.SSHUD(this);
        }
    }
    exports.SSGame = SSGame;
});
define("shapeships/src/SSGrid", ["require", "exports", "lad/src/scene/Entity", "lad/src/display/Path"], function (require, exports, Entity_6, Path_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSGrid extends Entity_6.Entity {
        constructor() {
            super();
            this.width = 0;
            this.height = 0;
            this.gridSize = 80;
            let cols = 17;
            let rows = 9;
            let odd = false;
            let width = this.gridSize * cols;
            let height = this.gridSize * rows;
            let p = new Path_5.Path(null, "#ACE", 2);
            let a = 0, b = 0;
            let pos = this.gridSize;
            while (pos <= width) {
                odd = !odd;
                a = odd ? height : 0;
                b = odd ? 0 : height;
                p.add(pos, a);
                p.add(pos, b);
                pos += this.gridSize;
            }
            pos = height;
            while (pos >= 0) {
                a = odd ? width : 0;
                b = odd ? 0 : width;
                p.add(a, pos);
                p.add(b, pos);
                pos -= this.gridSize;
                odd = !odd;
            }
            p.add(0, 0);
            p.add(width, 0);
            p.add(width, height);
            p.add(0, height);
            p.add(0, 0);
            p.closed = false;
            this.clip = p;
            this.width = width;
            this.height = height;
        }
    }
    exports.SSGrid = SSGrid;
});
define("shapeships/src/SSScene", ["require", "exports", "lad/src/scene/Scene", "shapeships/src/SSGame", "shapeships/src/SSGrid", "shapeships/src/SSPlayerShip", "shapeships/src/SSEntity", "shapeships/src/SSShip", "shapeships/src/SSExplosion", "lad/src/math/Point"], function (require, exports, Scene_2, SSGame_3, SSGrid_1, SSPlayerShip_1, SSEntity_2, SSShip_3, SSExplosion_3, Point_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSScene extends Scene_2.Scene {
        constructor() {
            super(...arguments);
            this.grid = new SSGrid_1.SSGrid();
            this.ship = new SSPlayerShip_1.SSPlayerShip();
            this.ableState = "";
            this.frames = 0;
            this.deadFrames = 0;
        }
        awake() {
            this.add(this.grid);
        }
        start() {
            this.restart();
        }
        update() {
            let t = this.transform;
            let p = this.transform.p;
            let r = this.game.renderer;
            p.x = (r.width * 0.5 - this.ship.transform.p.x - this.ship.move.x) / t.scale;
            p.y = (r.height * 0.5 - this.ship.transform.p.y - this.ship.move.y) / t.scale;
            if (p.x > 100)
                p.x = 100;
            if (p.y > 100)
                p.y = 100;
            let xmax = r.width - this.grid.width - 100;
            let ymax = r.height - this.grid.height - 100;
            if (p.x < xmax)
                p.x = xmax;
            if (p.y < ymax)
                p.y = ymax;
            this.frames++;
            switch (this.ableState) {
                case "alive":
                    this.detectCollisions();
                    this.updateSpawn();
                    break;
                case "dead":
                    this.updateDead();
                    break;
            }
        }
        render(r) {
            this.game.hud.render(r, this.game.score.score, this.game.score.multi, this.game.wave.wave, this.game.score.lives);
        }
        restart() {
            this.respawn();
            this.frames = 0;
            this.game.score.reset();
            this.game.wave.reset();
        }
        respawn() {
            this.ableState = "alive";
            this.spawnPlayer();
            this.game.wave.again();
        }
        detectCollisions() {
            let ea, eb, hitDistance, i, j;
            let colliders = this.entities.filter(e => e instanceof SSEntity_2.SSEntity && e.hitRadius > 0);
            i = colliders.length;
            while (i-- > 0) {
                ea = colliders[i];
                j = i;
                while (j-- > 0) {
                    eb = colliders[j];
                    if (!ea.scene || !eb.scene)
                        return;
                    if (!ea.transform.p.isWithinDistance(eb.transform.p, ea.hitRadius + eb.hitRadius))
                        continue;
                    ea.onCollision(eb);
                    eb.onCollision(ea);
                }
            }
        }
        updateSpawn() {
            if (this.ableState == "dead")
                return;
            if (this.game.wave.enemiesKilled >= this.game.wave.enemies) {
                this.game.wave.next();
                return;
            }
            if (this.game.wave.enemiesSpawned >= this.game.wave.enemies)
                return;
            if (this.frames % this.game.wave.spawnFrames == 0)
                this.spawnEnemy();
        }
        updateDead() {
            if (this.deadFrames-- > 0)
                return;
            if (this.game.score.lives > 0)
                this.respawn();
            else
                this.game.setScene(SSGame_3.SSScreens.end);
        }
        spawnPlayer() {
            if (this.ableState == "dead")
                return;
            this.add(this.ship);
            this.ship.reset();
            this.ship.transform.p.x = this.grid.width * 0.5;
            this.ship.transform.p.y = this.grid.height * 0.5;
        }
        spawnEnemy() {
            let p;
            do {
                p = this.getRandomWallPosition();
            } while (p.isWithinDistance(this.ship.transform.p, 200));
            let enemyType = this.game.wave.getRandomEnemy();
            let enemy = new enemyType();
            enemy.transform.p.setValue(p.x, p.y);
            enemy.speed = this.game.wave.enemySpeed;
            this.add(enemy, 1);
            this.game.wave.enemiesSpawned++;
        }
        kill(e) {
            this.game.score.score += 100 * this.game.score.multi;
            this.explode(e);
            this.game.wave.enemiesKilled++;
        }
        explode(e) {
            if (e instanceof SSShip_3.SSShip === false) {
                return;
            }
            let parts = Math.ceil(Math.random() * 8) + 4;
            let speed = 10;
            let explosion = new SSExplosion_3.SSExplosion(parts, speed);
            explosion.transform.p.copy(e.transform.p);
            e.remove();
            this.add(explosion);
        }
        die() {
            if (this.ableState == "dead")
                return;
            this.ableState = "dead";
            for (let i = 0; i < this.entities.length; i++) {
                this.explode(this.entities[i]);
            }
            this.deadFrames = 80;
            this.game.score.lives--;
        }
        getRandomWallPosition() {
            let p = new Point_7.Point();
            if (Math.random() > 0.5) {
                p.x = Math.random() * this.grid.width;
                p.y = Math.random() > 0.5 ? 0 : this.grid.height;
            }
            else {
                p.y = Math.random() * this.grid.height;
                p.x = Math.random() > 0.5 ? 0 : this.grid.width;
            }
            return p;
        }
        constrain(e) {
            if (e.transform.p.x < 0)
                e.transform.p.x = 0;
            if (e.transform.p.y < 0)
                e.transform.p.y = 0;
            if (e.transform.p.x > this.grid.width)
                e.transform.p.x = this.grid.width;
            if (e.transform.p.y > this.grid.height)
                e.transform.p.y = this.grid.height;
        }
        isWithin(e) {
            return e.transform.p.x > 0
                && e.transform.p.y > 0
                && e.transform.p.x < this.grid.width
                && e.transform.p.y < this.grid.height;
        }
    }
    exports.SSScene = SSScene;
});
define("shapeships/src/SSShip", ["require", "exports", "shapeships/src/SSEntity", "lad/src/math/Point", "lad/src/display/Path"], function (require, exports, SSEntity_3, Point_8, Path_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSShip extends SSEntity_3.SSEntity {
        constructor() {
            super(...arguments);
            this.speed = 10;
            this.move = new Point_8.Point(0, -1);
            this.moveDelta = new Point_8.Point(0, -1);
            this.origin = new Point_8.Point();
            this.hitRadius = 20;
            this.collides = true;
        }
        update() {
            this.transform.p.add(this.move);
        }
    }
    exports.SSShip = SSShip;
    class SSBullet extends SSShip {
        constructor() {
            super();
            this.hitRadius = 20;
            this.enemy = false;
            let p = new Path_6.Path("#468");
            p.add(-5, -3);
            p.add(0, -7);
            p.add(5, -3);
            p.add(5, 5);
            p.add(-5, 5);
            p.closed = true;
            this.clip = p;
        }
        go(angle, speed) {
            this.move.setVector(angle, speed);
            this.transform.rotation = angle + Math.PI * 0.5;
        }
        update() {
            super.update();
            if (this.scene.isWithin(this))
                return;
            this.remove();
        }
        onCollision(e) {
            let isFriendly = e.enemy === true;
            if (e == this.scene.ship || isFriendly === false)
                return;
            this.scene.kill(e);
        }
    }
    exports.SSBullet = SSBullet;
});
define("shapeships/src/SSBouncerShip", ["require", "exports", "shapeships/src/SSShip", "lad/src/math/Point", "lad/src/display/ClipGroup", "lad/src/display/Path"], function (require, exports, SSShip_4, Point_9, ClipGroup_3, Path_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSBounceShip extends SSShip_4.SSShip {
        constructor() {
            super();
            this.direction = 0;
            this.speed = 10;
            this.hitRadius = 15;
            this.origin = new Point_9.Point();
            this.enemy = true;
            this.draw();
        }
        draw() {
            let s = new ClipGroup_3.ClipGroup();
            let p = new Path_7.Path("#44E", undefined, 0);
            let PI2 = Math.PI * 2;
            let ang = PI2;
            let seg = ang / 6;
            let rad = 20;
            let px, py;
            while (ang >= 0) {
                px = Math.cos(ang) * rad;
                py = Math.sin(ang) * rad;
                p.add(px, py);
                rad = rad == 20 ? 16 : 20;
                ang -= seg;
            }
            while (ang <= PI2) {
                px = Math.cos(ang) * rad;
                py = Math.sin(ang) * rad;
                p.add(px, py);
                rad = rad == 10 ? 8 : 10;
                ang += seg;
            }
            p.closed = true;
            s.add(p);
            p = new Path_7.Path("#999", undefined, 0);
            p.addCircle(0, 0, 8);
            p.closed = true;
            s.add(p);
            this.clip = s;
        }
        start() {
            this.setRandomDirection();
        }
        update() {
            this.moveDelta.setVector(this.direction, this.speed);
            this.move.ease(this.moveDelta, 0.2);
            this.transform.rotation += 0.2;
            this.transform.p.add(this.move);
            if (this.scene.isWithin(this))
                return;
            this.scene.constrain(this);
            this.setRandomDirection();
        }
        setRandomDirection() {
            this.direction = Math.floor(Math.random() * 4) * Math.PI * 0.5 + Math.PI * 0.25;
        }
        onCollision(e) {
            if (!this.scene)
                return;
            if (e.enemy === true) {
                this.direction = e.transform.p.directionTo(this.transform.p);
            }
        }
    }
    exports.SSBounceShip = SSBounceShip;
});
define("shapeships/src/main", ["require", "exports", "shapeships/src/SSGame", "lad/src/LAD"], function (require, exports, SSGame_4, LAD_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    LAD_2.LAD.init(SSGame_4.SSGame, "gameCanvas");
});
define("lad/src/display/Sprite", ["require", "exports", "lad/src/math/Rect", "lad/src/math/Point"], function (require, exports, Rect_4, Point_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Sprite {
        constructor(image, options) {
            this.frameX = 0;
            this.frameY = 0;
            this.framesX = 0;
            this.framesY = 0;
            this.image = image;
            options = options || {};
            this.clipRect = options.clipRect || new Rect_4.Rect(0, 0, image.width, image.height);
            this.anchor = options.anchor || new Point_10.Point();
            this.alpha = 1;
            this.framesX = options.framesX || Math.floor(image.width / this.clipRect.width);
            this.framesY = options.framesY || Math.floor(image.width / this.clipRect.height);
            this.setFrame(options.frameX, options.frameY);
        }
        setFrame(x, y) {
            if (isNaN(y)) {
                y = Math.floor(x / this.framesX);
            }
            this.frameX = Math.floor((x || 0) % this.framesX);
            this.frameY = Math.floor((y || 0) % this.framesY);
        }
        render(r, t) {
            if (!this.image)
                return;
            let c = r.context;
            c.globalAlpha = this.alpha;
            const anchor = this.anchor.clone();
            const rect = this.clipRect.clone();
            rect.x += this.frameX * this.clipRect.width;
            rect.y += this.frameY * this.clipRect.height;
            anchor.x = anchor.x * rect.width * t.scale;
            anchor.y = anchor.y * rect.height * t.scale;
            let x = t.p.x - anchor.x;
            let y = t.p.y - anchor.y;
            let w = this.clipRect.width * t.scale;
            let h = this.clipRect.height * t.scale;
            if (r.isSmoothing === false) {
                x = Math.round(x);
                y = Math.round(y);
                w = Math.round(w);
                h = Math.round(h);
            }
            c.drawImage(this.image, rect.x, rect.y, rect.width, rect.height, x, y, w, h);
        }
        getBounds() {
            return new Rect_4.Rect().copy(this.clipRect).move(-this.anchor.x, -this.anchor.y);
        }
        clone() {
            return new Sprite(this.image, Object.assign({}, this));
        }
        toString() {
            return (this.image ? "Image" : "No Image") + ": " + this.clipRect.x + "," + this.clipRect.y + " " + this.clipRect.width + "x" + this.clipRect.height;
        }
    }
    exports.Sprite = Sprite;
});
define("lad/src/events/Subject", ["require", "exports", "lad/src/events/Dispatcher"], function (require, exports, Dispatcher_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Subject extends Dispatcher_3.Dispatcher {
        constructor(value) {
            super();
            this.value = value;
        }
        listen(scope, handler, options = {}) {
            const listener = super.listen(scope, handler, { once: options.once });
            if (options.immediate !== false) {
                listener.boundHandler(this.value);
            }
            return listener;
        }
        setValue(newValue, forceUpdate = false) {
            if (newValue === this.value && !forceUpdate) {
                return;
            }
            this.value = newValue;
            this.dispatch(this.value);
        }
    }
    exports.Subject = Subject;
});
define("lad/src/load/ALoader", ["require", "exports", "lad/src/events/Dispatcher"], function (require, exports, Dispatcher_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LoaderError extends Error {
        constructor(loader, message) {
            super(message);
            this.loader = loader;
        }
    }
    exports.LoaderError = LoaderError;
    class ALoader {
        constructor(url) {
            this.url = url;
            this.onLoaded = new Dispatcher_4.Dispatcher();
            this.data = null;
            this.isComplete = false;
            this.data = null;
            this.isComplete = false;
        }
        load() {
            this.loadPromise().then(text => {
                this.data = text;
                this.onComplete();
            }).catch(e => {
                this.onError(e);
            });
        }
        loadPromise() {
            return __awaiter(this, void 0, void 0, function* () {
                throw new LoaderError(this, "Cannot load from ALoader");
            });
        }
        onComplete() {
            this.isComplete = true;
            this.onLoaded.dispatch(this.data);
        }
        onError(e) {
            const typeName = this.constructor.name;
            let message = typeName + " (" + this.url + ") ";
            if (e) {
                message += e.message;
            }
            else {
                message += "couldn't load.";
            }
            throw new LoaderError(this, message);
        }
    }
    exports.ALoader = ALoader;
});
define("lad/src/load/ImageLoader", ["require", "exports", "lad/src/load/ALoader"], function (require, exports, ALoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ImageLoader extends ALoader_1.ALoader {
        loadPromise() {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    var image = new Image();
                    image.onload = () => {
                        resolve(image);
                    };
                    image.onerror = () => {
                        this.data = null;
                        reject();
                    };
                    image.src = this.url;
                });
            });
        }
    }
    exports.ImageLoader = ImageLoader;
});
define("lad/src/load/TextLoader", ["require", "exports", "lad/src/load/ALoader"], function (require, exports, ALoader_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TextLoader extends ALoader_2.ALoader {
        loadPromise() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.loadText();
            });
        }
        loadText() {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield fetch(this.url + "?" + Math.random());
                const text = yield res.text();
                return text;
            });
        }
    }
    exports.TextLoader = TextLoader;
});
define("lad/src/load/JSONLoader", ["require", "exports", "lad/src/load/TextLoader"], function (require, exports, TextLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class JSONLoader extends TextLoader_1.TextLoader {
        loadPromise() {
            return __awaiter(this, void 0, void 0, function* () {
                const text = yield this.loadText();
                try {
                    return JSON.parse(text);
                }
                catch (_a) {
                    throw new Error("Couldn't parse JSON from " + this.url);
                }
            });
        }
    }
    exports.JSONLoader = JSONLoader;
});
define("lad/src/load/MultiLoader", ["require", "exports", "lad/src/load/ALoader", "lad/src/load/ImageLoader", "lad/src/load/TextLoader", "lad/src/load/JSONLoader"], function (require, exports, ALoader_3, ImageLoader_1, TextLoader_2, JsonLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MultiLoader extends ALoader_3.ALoader {
        constructor() {
            super("");
            this.queue = [];
            this.loaded = [];
            this.assets = {};
        }
        add(...args) {
            let i = args.length;
            while (i-- > 0) {
                const url = arguments[i];
                const ext = String(url.substr(url.lastIndexOf(".") + 1)).toUpperCase();
                console.log(url, ext);
                switch (ext) {
                    case "JPG":
                    case "PNG":
                    case "GIF":
                    case "BMP":
                    case "JPEG":
                        this.queue.push(new ImageLoader_1.ImageLoader(url));
                        break;
                    case "JSON":
                        this.queue.push(new JsonLoader_1.JSONLoader(url));
                        break;
                    default:
                        this.queue.push(new TextLoader_2.TextLoader(url));
                        break;
                }
                this.queue.push();
            }
        }
        load() {
            this.loadNext();
        }
        loadNext() {
            if (this.queue.length <= 0) {
                return this.onComplete();
            }
            this.isComplete = false;
            const next = this.queue.shift();
            next.onLoaded.listen(this, () => {
                this.assets[next.url] = next.data;
                this.loadNext();
            }, { once: true });
            next.load();
        }
        getAsset(url) {
            return this.assets[url];
        }
    }
    exports.MultiLoader = MultiLoader;
});
define("lad/src/tiles/Tileset", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BlockType;
    (function (BlockType) {
        BlockType[BlockType["Empty"] = 0] = "Empty";
        BlockType[BlockType["Solid"] = 1] = "Solid";
    })(BlockType = exports.BlockType || (exports.BlockType = {}));
    class Tileset {
        constructor(tileSize, layer) {
            this.tileSize = tileSize;
            this.layer = layer;
            this.blocks = [];
        }
        getBlock(index) {
            if (index < 0 || index >= this.blocks.length) {
                return null;
            }
            return this.blocks[index];
        }
    }
    exports.Tileset = Tileset;
});
define("lad/src/load/TilesetLoader", ["require", "exports", "lad/src/load/ALoader", "lad/src/tiles/Tileset", "lad/src/load/JSONLoader", "lad/src/load/ImageLoader"], function (require, exports, ALoader_4, Tileset_1, JsonLoader_2, ImageLoader_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TilesetLoader extends ALoader_4.ALoader {
        constructor(url, layer) {
            super(url);
            this.layer = layer;
        }
        loadPromise() {
            return __awaiter(this, void 0, void 0, function* () {
                const data = yield new JsonLoader_2.JSONLoader(this.url).loadPromise();
                let imageUrl = data.image;
                const jsonPath = this.url.replace(/\\/g, "/");
                const jsonFolder = jsonPath.substr(0, jsonPath.lastIndexOf("/") + 1);
                imageUrl = jsonFolder + "/" + imageUrl;
                imageUrl = imageUrl.replace(/\/\//g, "/");
                const image = yield new ImageLoader_2.ImageLoader(imageUrl).loadPromise();
                const tileset = new Tileset_1.Tileset(data.tilesize || 32, this.layer);
                tileset.image = image;
                tileset.blocks = [];
                for (const key in data.blocks) {
                    const blockJson = data.blocks[key];
                    blockJson.name = blockJson.name || key;
                    const parsed = this.parseBlock(tileset, tileset.blocks.length, blockJson);
                    tileset.blocks.push(parsed);
                }
                return tileset;
            });
        }
        parseBlock(tileset, index, json) {
            const fill = json instanceof Array ? json : json.fill;
            let type = Tileset_1.BlockType.Empty;
            switch ((json.type || "").toLowerCase()) {
                case "solid":
                    type = Tileset_1.BlockType.Solid;
                    break;
            }
            const name = json.name;
            return Object.assign({ index,
                name,
                type,
                fill,
                tileset }, json);
        }
    }
    exports.TilesetLoader = TilesetLoader;
});
define("lad/src/math/MathUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MathUtils;
    (function (MathUtils) {
        function randomRange(min, max) {
            return Math.random() * (max - min) + min;
        }
        MathUtils.randomRange = randomRange;
        function scatter(number, percent) {
            return number + (Math.random() - 0.5) * number * percent;
        }
        MathUtils.scatter = scatter;
        function limit(value, low, high) {
            if (value < low)
                return low;
            if (value > high)
                return high;
            return value;
        }
        MathUtils.limit = limit;
    })(MathUtils = exports.MathUtils || (exports.MathUtils = {}));
});
define("lad/src/scene/Pool", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Pool {
        constructor(type, size) {
            this.type = type;
            this.size = size;
            this.items = [];
            this.index = 0;
            this.items = [];
            this.index = 0;
            while (size-- > 0) {
                this.items.push(new type());
            }
        }
        getNext() {
            this.index++;
            if (this.index >= this.size) {
                this.index = 0;
            }
            return this.items[this.index];
        }
    }
    exports.Pool = Pool;
});
define("lad/src/tiles/Mapset", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function validateSize(x, y) {
        if (isNaN(x) || isNaN(y) || x < 1 || y < 1) {
            throw new Error("Invalid map dimensions (" + x + "*" + y + ")");
        }
        if (Math.floor(x) !== x || Math.floor(y) !== y) {
            throw new Error("Int map dimensions only: got (" + x + "*" + y + ")");
        }
    }
    class Mapset {
        constructor() {
            this.tiles = new Uint8Array();
            this.tilesX = 0;
            this.tilesY = 0;
        }
        getTile(x, y) {
            const index = this.getIndex(x, y);
            if (index >= 0 && index < this.tiles.length) {
                return this.tiles[index];
            }
            return Mapset.EMPTY;
        }
        setTile(x, y, tile) {
            const index = this.getIndex(x, y);
            if (index >= 0 && index < this.tiles.length) {
                this.tiles[index] = tile;
            }
        }
        getIndex(x, y) {
            return x + y * this.tilesX;
        }
        setSize(tilesX, tilesY) {
            validateSize(tilesX, tilesY);
            let prevMapSet = null;
            const prevTiles = this.tiles;
            if (prevTiles && prevTiles.length > 0) {
                prevMapSet = this.clone();
            }
            this.tilesX = tilesX;
            this.tilesY = tilesY;
            const size = tilesX * tilesY;
            this.tiles = new Uint8Array(size);
            for (let i = 0; i < size; i++) {
                this.tiles[i] = Mapset.EMPTY;
            }
            if (prevMapSet) {
                this.copyOver(prevMapSet);
            }
        }
        copyOver(mapset) {
            const limX = Math.min(this.tilesX, mapset.tilesX);
            const limY = Math.min(this.tilesY, mapset.tilesY);
            for (let y = 0; y < limY; y++) {
                for (let x = 0; x < limX; x++) {
                    const tile = mapset.getTile(x, y);
                    this.setTile(x, y, tile);
                }
            }
        }
        setTiles(tilesX, tilesY, tiles) {
            validateSize(tilesX, tilesY);
            if (tiles && tiles.length !== tilesX * tilesY) {
                throw new Error("tiles provided are incorrect length");
            }
            this.tilesX = tilesX;
            this.tilesY = tilesY;
            this.tiles = tiles;
        }
        clone() {
            const result = new Mapset();
            result.setTiles(this.tilesX, this.tilesY, this.tiles);
            return result;
        }
    }
    Mapset.EMPTY = 255;
    exports.Mapset = Mapset;
});
define("lad/src/tiles/Tilemap", ["require", "exports", "lad/src/tiles/Mapset", "lad/src/scene/Entity"], function (require, exports, Mapset_1, Entity_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ILayer {
    }
    exports.ILayer = ILayer;
    class Tilemap extends Entity_7.Entity {
        constructor() {
            super(...arguments);
            this.layers = [];
            this.tileSize = 32;
            this.tilesX = 0;
            this.tilesY = 0;
        }
        setTileset(tileset, layerIndex) {
            if (!this.layers[layerIndex]) {
                const tiles = new Mapset_1.Mapset();
                tiles.setSize(this.tilesX, this.tilesY);
                this.layers[layerIndex] = {
                    tileset,
                    tiles
                };
            }
            if (this.layers[layerIndex].tileset != tileset) {
                this.layers[layerIndex].tileset = tileset;
            }
        }
        getBlocks(x, y) {
            const result = [];
            for (const layer of this.layers) {
                const index = layer.tiles.getTile(x, y);
                const block = layer.tileset.getBlock(index);
                result.push(block);
            }
            return result;
        }
        setBlock(x, y, block) {
            for (const layer of this.layers) {
                layer.tiles.setTile(x, y, Mapset_1.Mapset.EMPTY);
            }
            if (block) {
                const layer = this.layers[block.tileset.layer] || this.layers[0];
                layer.tiles.setTile(x, y, block.index);
            }
        }
        setSize(tilesX, tilesY) {
            this.tilesX = tilesX;
            this.tilesY = tilesY;
            for (const layer of this.layers) {
                layer.tiles.setSize(tilesX, tilesY);
            }
        }
        render(r) {
            if (this.layers.length < 1) {
                return;
            }
            for (const layer of this.layers) {
                for (let y = 0; y < this.tilesY; y++) {
                    for (let x = 0; x < this.tilesX; x++) {
                        this.renderBlock(r, layer, x, y);
                    }
                }
            }
        }
        renderBlock(r, layer, x, y) {
            const rt = this.renderTransform;
            const blockI = layer.tiles.getTile(x, y);
            if (blockI === Mapset_1.Mapset.EMPTY) {
                return;
            }
            const block = layer.tileset.getBlock(blockI);
            let tile = block.fill;
            const capT = layer.tiles.getTile(x, y - 1) !== blockI;
            const capL = layer.tiles.getTile(x - 1, y) !== blockI;
            const capR = layer.tiles.getTile(x + 1, y) !== blockI;
            const capB = layer.tiles.getTile(x, y + 1) !== blockI;
            if (block.solo && capT && capL && capR && capB) {
                tile = block.solo;
            }
            else if (block.t && capT) {
                if (block.tl && capL) {
                    tile = block.tl;
                }
                else if (block.tr && capR) {
                    tile = block.tr;
                }
                else {
                    tile = block.t;
                }
            }
            else if (block.b && capB) {
                if (block.bl && capL) {
                    tile = block.bl;
                }
                else if (block.br && capR) {
                    tile = block.br;
                }
                else {
                    tile = block.b;
                }
            }
            else if (block.l && capL) {
                tile = block.l;
            }
            else if (block.r && capR) {
                tile = block.r;
            }
            const ts = layer.tileset.tileSize;
            const tx = tile[0] * ts;
            const ty = tile[1] * ts;
            const rs = rt.scale * ts;
            const rx = x * ts * rt.scale + rt.p.x;
            const ry = y * ts * rt.scale + rt.p.y;
            r.context.drawImage(layer.tileset.image, tx, ty, ts, ts, rx, ry, rs, rs);
        }
    }
    exports.Tilemap = Tilemap;
});
define("lad/src/ui/IBoxStyle", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lad/src/ui/UIPanel", ["require", "exports", "lad/src/scene/EntityContainer", "lad/src/math/Point", "lad/src/math/Rect"], function (require, exports, EntityContainer_2, Point_11, Rect_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIPanel extends EntityContainer_2.EntityContainer {
        constructor() {
            super(...arguments);
            this.size = new Point_11.Point();
            this.bgStyle = null;
        }
        render(r) {
            this.renderBg(r);
            super.render(r);
        }
        renderBg(r) {
            if (!this.bgStyle) {
                return;
            }
            const size = this.size;
            const rl = this.renderTransform.p.x;
            const rr = rl + this.renderTransform.scale * size.x;
            const rt = this.renderTransform.p.y;
            const rb = rt + this.renderTransform.scale * size.y;
            const c = r.context;
            c.fillStyle = this.bgStyle.fillStyle;
            c.strokeStyle = this.bgStyle.strokeStyle || "none";
            c.lineWidth = this.bgStyle.lineWidth || 0;
            c.beginPath();
            c.moveTo(rl, rt);
            c.lineTo(rr, rt);
            c.lineTo(rr, rb);
            c.lineTo(rl, rb);
            c.lineTo(rl, rt);
            if (this.bgStyle.fillStyle) {
                c.fill();
            }
            if (this.bgStyle.strokeStyle) {
                c.stroke();
            }
        }
        getBounds() {
            const rx = this.renderTransform.p.x;
            const ry = this.renderTransform.p.y;
            const rw = this.renderTransform.scale * this.size.x;
            const rh = this.renderTransform.scale * this.size.y;
            return new Rect_5.Rect(rx, ry, rw, rh);
        }
    }
    exports.UIPanel = UIPanel;
});
define("lad/src/ui/UIButton", ["require", "exports", "lad/src/ui/UIPanel", "lad/src/input/PointerManager"], function (require, exports, UIPanel_1, PointerManager_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIButton extends UIPanel_1.UIPanel {
        constructor() {
            super(...arguments);
            this.isDownTarget = false;
        }
        start() {
            PointerManager_2.pointerManager.onChange.listen(this, this.handlePointer);
        }
        remove() {
            super.remove();
            PointerManager_2.pointerManager.onChange.unlisten(this, this.handlePointer);
        }
        handleClick() { }
        handlePointer(e) {
            if (e.button !== 0) {
                return;
            }
            const bounds = this.getBounds();
            if (bounds.isWithin(e.pos)) {
                if (e.isDown) {
                    e.cancelled = true;
                    console.log("depth: " + this.renderTransform.depth, e);
                    this.isDownTarget = true;
                }
                else if (this.isDownTarget) {
                    e.cancelled = true;
                    this.handleClick();
                }
            }
            else if (e.isDown === false) {
                this.isDownTarget = false;
            }
        }
    }
    exports.UIButton = UIButton;
});
define("lad/src/ui/UIPanelGrid", ["require", "exports", "lad/src/scene/EntityContainer", "lad/src/math/Point", "lad/src/ui/UIPanel"], function (require, exports, EntityContainer_3, Point_12, UIPanel_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIPanelGrid extends EntityContainer_3.EntityContainer {
        constructor(tileSize, padding) {
            super();
            this.tileSize = tileSize;
            this.padding = padding || new Point_12.Point();
        }
        add(entity, index = -1) {
            if (entity instanceof UIPanel_2.UIPanel === false) {
                throw new Error("UIGrid must be contain UIPanels");
            }
            return super.add(entity, index);
        }
        callRender(r) {
            if (!this.parent || this.parent instanceof UIPanel_2.UIPanel === false) {
                this.remove();
                throw new Error("UIGrid must be child of UIPanel");
            }
            const size = this.parent.size;
            const point = this.padding.clone();
            for (const child of this.entities) {
                child.transform.p.x = point.x;
                child.transform.p.y = point.y;
                child.setEnabled(true);
                const panel = child;
                panel.size.copy(this.tileSize);
                point.x += this.tileSize.x + this.padding.x;
                if (point.x > size.x) {
                    point.x = this.padding.x;
                    point.y += this.tileSize.y + this.padding.y;
                }
                if (point.y + this.tileSize.y > size.y) {
                    child.setEnabled(false);
                }
            }
            super.callRender(r);
        }
    }
    exports.UIPanelGrid = UIPanelGrid;
});
define("lad/src/ui/UIScreen", ["require", "exports", "lad/src/scene/Scene", "lad/src/math/Rect"], function (require, exports, Scene_3, Rect_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIScreen extends Scene_3.Scene {
        constructor() {
            super(...arguments);
            this.rect = new Rect_6.Rect();
        }
    }
    exports.UIScreen = UIScreen;
});
define("lad/src/ui/UISpriteButton", ["require", "exports", "lad/src/ui/UIButton"], function (require, exports, UIButton_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UISpriteButton extends UIButton_1.UIButton {
        constructor(sprite, tile) {
            super();
            this.padding = 0;
            this.sprite = sprite.clone();
            this.size.setValue(40, 40);
            this.sprite.setFrame(tile[0], tile[1]);
        }
        handleClick() {
            if (typeof this.onClick === "function") {
                this.onClick();
            }
            super.handleClick();
        }
        render(r) {
            super.render(r);
            this.renderIcon(r);
        }
        renderIcon(r) {
            const t = this.renderTransform.clone();
            t.p.move(this.padding, this.padding);
            const scale = Math.min((this.size.x - this.padding * 2) / this.sprite.clipRect.width, (this.size.y - this.padding * 2) / this.sprite.clipRect.height);
            t.scale = scale;
            this.sprite.render(r, t);
        }
    }
    exports.UISpriteButton = UISpriteButton;
});
//# sourceMappingURL=shapeships.js.map