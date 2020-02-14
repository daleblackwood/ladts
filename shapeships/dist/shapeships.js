var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("lad/src/html/html", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class html {
        static create(tag, attrs = {}, children) {
            const elem = document.createElement(tag);
            this.setAttributes(elem, attrs);
            if (children) {
                for (const child of children) {
                    elem.appendChild(child);
                }
            }
            return elem;
        }
        static setAttributes(elem, attrs = {}) {
            let parentElement = null;
            for (const key in attrs) {
                if (key === "style") {
                    this.setStyle(elem, attrs[key]);
                }
                else if (key === "parentElement") {
                    parentElement = attrs[key];
                }
                else if (key === "innerHTML") {
                    elem.innerHTML = attrs[key];
                }
                else if (key === "innerText") {
                    elem.innerText = attrs[key];
                }
                else {
                    elem.setAttribute(key, attrs[key].toString());
                }
            }
            if (parentElement) {
                parentElement.appendChild(elem);
            }
            return elem;
        }
        static setStyle(elem, style = {}) {
            for (const key in style) {
                elem.style[key] = style[key];
            }
            return elem;
        }
    }
    exports.html = html;
});
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
define("lad/src/display/Renderer", ["require", "exports", "lad/src/html/html"], function (require, exports, html_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Renderer {
        constructor(outerContainer) {
            this.percent = 1;
            this.isSmoothing = false;
            this.renderCount = 0;
            this.containerWidth = 0;
            this.containerHeight = 0;
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
            this.setContainer(outerContainer);
            this.font = Object.assign({}, this.defaultFont);
            this.setSmoothing(this.isSmoothing);
            this.handleContext = this.handleContext.bind(this);
            this.innerContainer.addEventListener('contextmenu', e => this.handleContext(e));
        }
        setContainer(container) {
            if (!container) {
                throw new Error("Div container expected, got null");
            }
            if (container.tagName.toLowerCase() !== "div") {
                throw new Error("Div container expected, got " + container.tagName);
            }
            this.outerContainer = html_1.html.setAttributes(container, {
                class: "lad-container",
                style: {
                    minWidth: "512px",
                    minHeight: "288px",
                    position: "relative"
                }
            });
            this.innerContainer = html_1.html.create("div", {
                class: "lad-inner",
                style: {
                    position: "absolute",
                    overflow: "hidden",
                    fontSize: "10px"
                },
                parentElement: this.outerContainer
            });
            this.canvas = html_1.html.create("canvas", {
                class: "lad-canvas",
                style: {},
                parentElement: this.innerContainer
            });
            this.context = this.canvas.getContext("2d");
            this.overlay = html_1.html.create("div", {
                class: "lad-overlay",
                style: {
                    position: "absolute",
                    top: "0",
                    left: "0"
                },
                parentElement: this.innerContainer
            });
            const overlayStyles = document.createElement("style");
            document.head.appendChild(overlayStyles);
            this.overlayStyles = overlayStyles.sheet;
        }
        update() {
            this.context.clearRect(0, 0, this.width, this.height);
            this.updateSize();
        }
        updateSize() {
            const newW = this.outerContainer.offsetWidth;
            const newH = this.outerContainer.offsetHeight;
            if (newW === this.containerWidth && newH === this.containerHeight) {
                return;
            }
            this.containerWidth = newW;
            this.containerHeight = newH;
            const ratioX = this.containerWidth / this.width;
            const ratioY = this.containerHeight / this.height;
            const scale = Math.min(ratioX, ratioY);
            const innerW = scale * this.width;
            const innerH = scale * this.height;
            this.canvas.width = this.outerContainer.offsetWidth;
            this.canvas.height = this.outerContainer.offsetHeight;
            const offsetX = (this.containerWidth - this.width * scale) * 0.5;
            const offsetY = (this.containerHeight - this.height * scale) * 0.5;
            this.innerContainer.style.left = offsetX + "px";
            this.innerContainer.style.top = offsetY + "px";
            this.innerContainer.style.width = innerW + "px";
            this.innerContainer.style.height = innerH + "px";
            this.canvas.style.width = innerW + "px";
            this.canvas.style.height = innerH + "px";
            this.overlay.style.width = this.width + "px";
            this.overlay.style.height = this.height + "px";
            const overlayX = (innerW - this.width) * 0.5 / scale;
            const overlayY = (innerH - this.height) * 0.5 / scale;
            this.overlay.style.transform = "scale(" + scale + ") translate(" + overlayX + "px," + overlayY + "px)";
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
            this.font = options = Object.assign(Object.assign({}, this.font), options);
            c.fillStyle = options.fill;
            c.strokeStyle = options.stroke;
            c.font = options.size + "px " + options.face;
            c.textBaseline = options.baseline;
            c.textAlign = options.align;
        }
        addStyleRule(rule) {
            rule = rule.trim();
            const openBraceI = rule.indexOf("{");
            if (openBraceI >= 0) {
                const rest = rule.substr(openBraceI);
                const head = rule.substr(0, openBraceI);
                const headBits = head.split(",");
                const newHead = ".lad-overlay " + headBits.join(", .lad-overlay ");
                rule = newHead + rest;
            }
            this.overlayStyles.insertRule(rule, this.overlayStyles.cssRules.length);
        }
        addCss(css) {
            const ruleParts = css.split("}");
            for (const part of ruleParts) {
                const rule = part.trim() + "}";
                if (rule.length < 2) {
                    continue;
                }
                this.addStyleRule(rule);
            }
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
        isVisible(p) {
            return p.x > 0
                && p.y > 0
                && p.x < this.width
                && p.y < this.height;
        }
        handleContext(e) {
            e.preventDefault();
        }
    }
    exports.Renderer = Renderer;
});
define("lad/src/math/Transform", ["require", "exports", "lad/src/math/Point"], function (require, exports, Point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Transform {
        constructor(p = { x: 0, y: 0 }, scale = { x: 1, y: 1 }, rotation = 0) {
            this.p = new Point_1.Point();
            this.scale = new Point_1.Point(1, 1);
            this.rotation = 0;
            this.depth = 0;
            this.p.copy(p);
            this.scale.copy(scale);
            this.rotation = rotation;
        }
        reset() {
            this.p.reset();
            this.scale.setValue(1, 1);
            this.rotation = 0;
            return this;
        }
        add(t) {
            this.p.add(t.p);
            if (!isNaN(t.scale.x))
                this.scale.x *= t.scale.x;
            if (!isNaN(t.scale.y))
                this.scale.y *= t.scale.y;
            if (!isNaN(t.rotation))
                this.rotation += t.rotation;
            return this;
        }
        subtract(t) {
            this.p.subtract(t.p);
            if (!isNaN(t.scale.x))
                this.scale.x /= t.scale.x;
            if (!isNaN(t.scale.y))
                this.scale.y /= t.scale.y;
            if (!isNaN(t.rotation))
                this.rotation -= t.rotation;
            return this;
        }
        copy(t) {
            this.p.copy(t.p);
            if (!isNaN(t.scale.x))
                this.scale.x = t.scale.x;
            if (!isNaN(t.scale.y))
                this.scale.y = t.scale.y;
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
            if (!isNaN(dest.scale.x)) {
                this.scale.x = dest.scale.x * percent + this.scale.x * (1 - percent);
            }
            if (!isNaN(dest.scale.y)) {
                this.scale.y = dest.scale.y * percent + this.scale.y * (1 - percent);
            }
            if (!isNaN(dest.rotation)) {
                if (Math.abs(dest.rotation - this.rotation) > Math.PI)
                    this.rotation += dest.rotation > this.rotation ? Math.PI * 2 : Math.PI * -2;
                this.rotation = dest.rotation * percent + this.rotation * (1 - percent);
            }
            return this;
        }
        clone() {
            return new Transform(this.p, this.scale, this.rotation);
        }
    }
    exports.Transform = Transform;
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
    class EntityComponent {
        constructor(entity) {
            this.entity = entity;
            this.enabled = true;
        }
        start() { }
        update() { }
        remove() { }
    }
    exports.EntityComponent = EntityComponent;
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
            this.components = {};
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
        callAwake() {
            if (this.entityState < EntityState.AWAKE) {
                this.awake();
            }
            this.entityState = EntityState.AWAKE;
            this.prevTransform.copy(this.transform);
        }
        callStart() {
            this.start();
            for (const key in this.components) {
                this.components[key].start();
            }
        }
        callUpdate() {
            if (this.entityState < EntityState.ENABLED) {
                this.callStart();
                this.prevTransform.copy(this.transform);
                this.entityState = EntityState.ENABLED;
            }
            else if (this.entityState > EntityState.ENABLED) {
                return;
            }
            this.update();
            for (const key in this.components) {
                this.components[key].update();
            }
            this.prevTransform.copy(this.transform);
        }
        callRender(r) {
            if (this.entityState != EntityState.ENABLED) {
                return;
            }
            this.calculateRenderTransform(r);
            this.render(r);
        }
        calculateRenderTransform(r) {
            let rt = this.renderTransform;
            rt.copy(this.prevTransform).ease(this.transform, r.percent);
            if (this.parent) {
                rt.add(this.parent.renderTransform);
            }
            if (r.isSmoothing) {
                rt.p.x = Math.round(rt.p.x);
                rt.p.y = Math.round(rt.p.y);
            }
        }
        remove() {
            this.entityState = EntityState.REMOVING;
            for (const key in this.components) {
                this.components[key].remove();
            }
        }
        setComponent(component) {
            const key = component.constructor.name;
            this.components[key] = component;
            return component;
        }
        getComponent(componentType) {
            return this.components[componentType.name] || null;
        }
    }
    exports.Entity = Entity;
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
define("lad/src/math/Rect", ["require", "exports", "lad/src/math/Point"], function (require, exports, Point_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Rect {
        constructor(x = 0, y = 0, width = 0, height = 0) {
            this.topLeft = new Point_2.Point();
            this.bottomRight = new Point_2.Point();
            this.setSize(x, y, width, height);
        }
        get width() { return this.bottomRight.x - this.topLeft.x; }
        get height() { return this.bottomRight.y - this.topLeft.y; }
        get top() { return this.topLeft.y; }
        get left() { return this.topLeft.x; }
        get bottom() { return this.bottomRight.y; }
        get right() { return this.bottomRight.x; }
        get center() { return this.topLeft.clone().add(this.bottomRight).divide(2); }
        setSize(x = 0, y = 0, width = 0, height = 0) {
            this.topLeft.setValue(x, y);
            this.bottomRight.setValue(x + width, y + height);
        }
        insetAll(padding) {
            this.topLeft.move(padding, padding);
            this.bottomRight.move(-padding, -padding);
            return this;
        }
        insetEach(top, left, bottom, right) {
            this.topLeft.move(left, top);
            this.bottomRight.move(-right, -bottom);
            return this;
        }
        move(x, y) {
            this.topLeft.move(x, y);
            this.bottomRight.move(x, y);
            return this;
        }
        addPos(p) {
            this.topLeft.add(p);
            this.bottomRight.add(p);
            return this;
        }
        isWithin(p) {
            return p.x >= this.topLeft.x
                && p.y >= this.topLeft.y
                && p.x <= this.bottomRight.x
                && p.y <= this.bottomRight.y;
        }
        overlaps(r) {
            if (this.topLeft.x > r.bottomRight.x || this.bottomRight.x < r.topLeft.x)
                return false;
            if (this.topLeft.y > r.bottomRight.y || this.bottomRight.y < r.topLeft.y)
                return false;
            return true;
        }
        copy(r) {
            this.topLeft.copy(r.topLeft);
            this.bottomRight.copy(r.bottomRight);
            return this;
        }
        clone() {
            return new Rect().copy(this);
        }
        encapsulate(r) {
            this.topLeft.x = Math.min(this.topLeft.x, r.topLeft.x);
            this.topLeft.y = Math.min(this.topLeft.y, r.topLeft.y);
            this.bottomRight.x = Math.max(this.bottomRight.x, r.bottomRight.x);
            this.bottomRight.y = Math.min(this.bottomRight.y, r.bottomRight.y);
            return this;
        }
    }
    exports.Rect = Rect;
});
define("lad/src/scene/Scene", ["require", "exports", "lad/src/scene/EntityContainer", "lad/src/math/Rect"], function (require, exports, EntityContainer_1, Rect_1) {
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
                r.context.fillRect(0, 0, this.game.renderer.width * this.renderTransform.scale.x, this.game.renderer.height * this.renderTransform.scale.y);
            }
            super.callRender(r);
        }
        getRect() {
            const w = this.game ? this.game.renderer.width : 0;
            const h = this.game ? this.game.renderer.height : 0;
            return new Rect_1.Rect(0, 0, w, h);
        }
    }
    exports.Scene = Scene;
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
    exports.TickTimer = TickTimer;
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
        init(type, containerId) {
            const key = type.name;
            let container = null;
            if (!containerId) {
                container = document.querySelector("#Game");
                containerId = "Game";
            }
            if (!container) {
                container = document.createElement("div");
                container.id = containerId;
                document.body.appendChild(container);
            }
            this.game = window.ladgame = new type(containerId, {});
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
            this.game.renderer.outerContainer.requestFullscreen({
                navigationUI: "hide"
            });
        }
    }
    global.LAD = global.LAD || new LADNS();
    exports.LAD = global.LAD;
});
define("lad/src/Manager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Manager {
        update() { }
        postUpdate() { }
        render(r) { }
        postRender(r) { }
    }
    exports.Manager = Manager;
});
define("lad/src/input/PointerManager", ["require", "exports", "lad/src/display/Renderer", "lad/src/events/Dispatcher", "lad/src/LAD", "lad/src/math/Point", "lad/src/Manager"], function (require, exports, Renderer_1, Dispatcher_1, LAD_1, Point_3, Manager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PointerManager extends Manager_1.Manager {
        constructor() {
            super();
            this.buttons = [
                {
                    pos: new Point_3.Point(),
                    button: 0,
                    isDown: false,
                    delta: new Point_3.Point(),
                    prevPos: new Point_3.Point()
                },
                {
                    pos: new Point_3.Point(),
                    button: 1,
                    isDown: false,
                    delta: new Point_3.Point(),
                    prevPos: new Point_3.Point()
                }
            ];
            this.onChange = new Dispatcher_1.Dispatcher();
            this.onMove = new Dispatcher_1.Dispatcher();
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
            const x = e.clientX;
            const y = e.clientY;
            let type = "move";
            switch (e.type) {
                case "mousedown":
                    type = "press";
                    break;
                case "mouseup":
                    type = "release";
                    break;
            }
            this.changeInput(buttonIndex, type, x, y);
        }
        handleTouch(e) {
            if (!Renderer_1.Renderer.main) {
                return;
            }
            const buttonIndex = e.touches.length > 1 ? 1 : 0;
            const touch = e.touches[buttonIndex];
            const x = touch.clientX;
            const y = touch.clientY;
            let type = "move";
            switch (e.type) {
                case "touchstart":
                    type = "press";
                    break;
                case "touchend":
                case "touchcancel":
                    type = "release";
                    break;
            }
            this.changeInput(buttonIndex, type, x, y);
        }
        changeInput(buttonIndex, type, x, y) {
            const r = Renderer_1.Renderer.main;
            if (r.overlay && r.overlay.childElementCount > 0) {
                return;
            }
            const button = this.buttons[buttonIndex];
            let moved = false;
            let changed = false;
            switch (type) {
                case "press":
                    if (button.isDown !== true) {
                        button.isDown = true;
                        changed = true;
                        moved = true;
                    }
                    break;
                case "release":
                    if (button.isDown === true) {
                        button.isDown = false;
                        changed = true;
                    }
                    break;
                case "move":
                    moved = true;
            }
            if (moved) {
                for (let i = 0; i < this.buttons.length; i++) {
                    const b = this.buttons[i];
                    b.pos.copy(this.screenToCanvasPos({ x, y }));
                }
            }
            if (changed) {
                button.cancelled = false;
                this.onChange.dispatch(button);
            }
            this.onMove.dispatch(button);
        }
        screenToCanvasPos(p) {
            const r = Renderer_1.Renderer.main;
            const rect = r.innerContainer.getBoundingClientRect();
            return new Point_3.Point((p.x - rect.left) * r.width / rect.width, (p.y - rect.top) * r.height / rect.height);
        }
    }
    exports.PointerManager = PointerManager;
    exports.pointerManager = LAD_1.LAD.require(PointerManager);
});
define("lad/src/Game", ["require", "exports", "lad/src/display/Renderer", "lad/src/events/TickTimer", "lad/src/math/Rect", "lad/src/scene/Entity", "lad/src/input/PointerManager"], function (require, exports, Renderer_2, TickTimer_1, Rect_2, Entity_2, PointerManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_FRAME_RATE = 60;
    const DEFAULT_UPDATE_TIME = 1000 / DEFAULT_FRAME_RATE;
    class Game {
        constructor(containerId, options) {
            this.params = {};
            this.isPlaying = false;
            this.timeDelta = DEFAULT_UPDATE_TIME;
            this.rect = new Rect_2.Rect();
            this.tickTimer = new TickTimer_1.TickTimer();
            this.lastUpdate = 0.0;
            this.lastRender = 0.0;
            this.fpsUpdate = DEFAULT_FRAME_RATE;
            this.fpsRender = DEFAULT_FRAME_RATE;
            this.pointer = PointerManager_1.pointerManager;
            this.frames = 0;
            this.managers = {};
            this.autoSize = false;
            Game.main = this;
            this.managers[PointerManager_1.PointerManager.name] = PointerManager_1.pointerManager;
            if (typeof options.autoSize !== "undefined") {
                this.autoSize = options.autoSize;
            }
            this.requireCanvas(containerId);
            this.setFramerate(options.fpsUpdate, options.fpsRender);
            this.parseParams();
            this.updateRect();
        }
        requireCanvas(containerId) {
            let container = document.getElementById(containerId);
            this.renderer = new Renderer_2.Renderer(container);
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
                this.scene.remove();
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
            this.updateRect();
            for (const key in this.managers) {
                this.managers[key].game = this;
                this.managers[key].update();
            }
            for (const scene of this.layers) {
                if (scene.entityState < Entity_2.EntityState.AWAKE) {
                    scene.callAwake();
                }
            }
            const removeLayerIndices = [];
            for (let i = 0; i < this.layers.length; i++) {
                const layer = this.layers[i];
                if (layer.entityState <= Entity_2.EntityState.ENABLED) {
                    layer.callUpdate();
                }
                else if (layer.entityState === Entity_2.EntityState.REMOVING) {
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
            (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                check = true; })(navigator.userAgent || navigator.vendor);
            return check;
        }
        callRender() {
            this.renderer.update();
            for (const key in this.managers) {
                this.managers[key].render(this.renderer);
            }
            this.timeDelta = this.tickTimer.getNow() - this.lastUpdate;
            const updateTime = 1000 / this.fpsUpdate;
            this.renderer.percent = Math.min(this.timeDelta / updateTime, 1);
            for (const scene of this.layers) {
                scene.callRender(this.renderer);
            }
            this.lastRender = this.tickTimer.getNow();
            for (const key in this.managers) {
                this.managers[key].postRender(this.renderer);
            }
        }
        setManager(manager) {
            const key = manager.constructor.name;
            this.managers[key] = manager;
            return manager;
        }
        getManager(managerType) {
            return this.managers[managerType.name] || null;
        }
        unsetManager(managerType) {
            delete this.managers[managerType.name];
        }
        updateRect() {
            this.rect.setSize(0, 0, this.renderer.canvas.offsetWidth, this.renderer.canvas.offsetHeight);
        }
    }
    exports.Game = Game;
});
define("lad/src/collision/CollisionManager", ["require", "exports", "lad/src/Manager", "lad/src/scene/Entity"], function (require, exports, Manager_2, Entity_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CollisionManager extends Manager_2.Manager {
        constructor() {
            super(...arguments);
            this.colliders = [];
            this.doRender = false;
        }
        add(collider) {
            const index = this.indexOf(collider);
            if (index < 0) {
                this.colliders.push(collider);
            }
            return collider;
        }
        indexOf(collider) {
            return this.colliders.indexOf(collider);
        }
        remove(collider) {
            const index = this.indexOf(collider);
            if (index >= 0) {
                this.colliders.splice(index, 1);
            }
            return collider;
        }
        update() {
            for (const c of this.colliders) {
                c.clearCollisions();
            }
            let i = this.colliders.length;
            if (i < 2) {
                return;
            }
            while (i-- > 0) {
                const ci = this.colliders[i];
                if (ci.enabled === false || ci.entity.entityState !== Entity_3.EntityState.ENABLED) {
                    continue;
                }
                let j = i;
                while (j-- > 0) {
                    const cj = this.colliders[j];
                    if (cj.enabled === false || cj.entity.entityState !== Entity_3.EntityState.ENABLED) {
                        continue;
                    }
                    cj.checkCollision(ci);
                }
            }
        }
        postRender(r) {
            if (this.doRender !== true) {
                return;
            }
            for (const c of this.colliders) {
                if (c.enabled === false || c.entity.entityState !== Entity_3.EntityState.ENABLED) {
                    continue;
                }
                c.render(r);
            }
        }
    }
    exports.CollisionManager = CollisionManager;
});
define("lad/src/collision/Collider", ["require", "exports", "lad/src/scene/Entity", "lad/src/collision/CollisionManager"], function (require, exports, Entity_4, CollisionManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Collider extends Entity_4.EntityComponent {
        constructor(entity) {
            super(entity);
            this.manager = null;
            this.collisions = [];
        }
        start() {
            this.manager = this.entity.game.getManager(CollisionManager_1.CollisionManager);
            if (this.manager) {
                this.manager.add(this);
            }
        }
        checkCollision(other) { }
        ;
        clearCollisions() {
            this.collisions = [];
        }
        handleCollision(collision) {
            this.collisions.push(collision);
            if (this.onCollision) {
                this.onCollision(collision);
            }
        }
        render(r) { }
        remove() {
            if (this.manager) {
                this.manager.remove(this);
            }
        }
    }
    exports.Collider = Collider;
});
define("lad/src/collision/RectCollider", ["require", "exports", "lad/src/collision/Collider", "lad/src/math/Rect"], function (require, exports, Collider_1, Rect_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RectCollider extends Collider_1.Collider {
        constructor(entity) {
            super(entity);
            this.rect = new Rect_3.Rect();
        }
        checkCollision(other) {
            if (other instanceof RectCollider) {
                const thisRect = this.getRect();
                const otherRect = other.getRect();
                if (thisRect.overlaps(otherRect)) {
                    if (this.onCollision) {
                        this.handleCollision({ rect: otherRect, target: other.entity });
                    }
                    if (other.onCollision) {
                        other.handleCollision({ rect: thisRect, target: this.entity });
                    }
                }
                return;
            }
            other.checkCollision(this);
        }
        getRect() {
            const rt = this.entity.renderTransform;
            return this.rect.clone().move(rt.p.x - this.entity.scene.renderTransform.p.x, rt.p.y - this.entity.scene.renderTransform.p.y);
        }
        render(r) {
            const rect = this.getRect().addPos(this.entity.scene.renderTransform.p);
            const c = r.context;
            c.beginPath();
            c.strokeStyle = "red";
            c.lineWidth = 1;
            c.moveTo(rect.left, rect.top);
            c.lineTo(rect.right, rect.top);
            c.lineTo(rect.right, rect.bottom);
            c.lineTo(rect.left, rect.bottom);
            c.lineTo(rect.left, rect.top);
            c.stroke();
        }
    }
    exports.RectCollider = RectCollider;
});
define("lad/src/tiles/Mapset", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function validateSize(x, y) {
        if (isNaN(x) || isNaN(y) || x < 0 || y < 0) {
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
        setSize(tilesX, tilesY, offsetX = 0, offsetY = 0) {
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
                this.copyOver(prevMapSet, offsetX, offsetY);
            }
        }
        copyOver(mapset, offsetX = 0, offsetY = 0) {
            for (let y = 0; y < this.tilesY; y++) {
                for (let x = 0; x < this.tilesX; x++) {
                    let tile = Mapset.EMPTY;
                    const tsx = x - offsetX;
                    const tsy = y - offsetY;
                    if (mapset.isWithin(tsx, tsy)) {
                        tile = mapset.getTile(tsx, tsy);
                    }
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
        isWithin(x, y) {
            return x >= 0 && y >= 0 && x < this.tilesX && y < this.tilesY;
        }
        clone() {
            const result = new Mapset();
            result.setTiles(this.tilesX, this.tilesY, this.tiles);
            return result;
        }
        getDataString() {
            let line = this.tilesX + ":";
            line += btoa(String.fromCharCode.apply(null, this.tiles));
            return line;
        }
        setDataString(line) {
            const colonI = line.indexOf(":");
            const tilesX = parseInt(line.substr(0, colonI));
            const rest = atob(line.substr(colonI + 1));
            const uint8 = Uint8Array.from([...rest].map(ch => ch.charCodeAt(0)));
            const tilesY = Math.ceil(uint8.length / tilesX);
            this.setSize(tilesX, tilesY);
            this.tiles = uint8;
        }
    }
    exports.Mapset = Mapset;
    Mapset.EMPTY = 255;
});
define("lad/src/display/IClip", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lad/src/display/Sprite", ["require", "exports", "lad/src/math/Rect", "lad/src/math/Point"], function (require, exports, Rect_4, Point_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SpriteClip {
        constructor(name = "default", frameX = 0, frameY = 0, frames = 0, fps = 15) {
            this.name = name;
            this.frameX = frameX;
            this.frameY = frameY;
            this.frames = frames;
            this.fps = fps;
        }
        copy(other) {
            this.name = other.name || this.name;
            this.frameX = Number(other.frameX) || 0;
            this.frameY = Number(other.frameY) || 0;
            this.frames = Math.max(Number(other.frames) || 0, 1);
            this.fps = Number(other.fps) || 15;
            return this;
        }
        clone() {
            return new SpriteClip().copy(this);
        }
    }
    exports.SpriteClip = SpriteClip;
    class Sprite {
        constructor(image, options) {
            this.isPlaying = false;
            this.clipDefault = new SpriteClip("default");
            this.clipPlaying = new SpriteClip("playing");
            this.clips = {};
            this.time = 0;
            this.frame = 0;
            this.lastFrameTime = 0;
            this.image = image;
            options = options || {};
            this.clipRect = options.clipRect || new Rect_4.Rect(0, 0, image.width, image.height);
            this.anchor = options.anchor || new Point_4.Point();
            this.alpha = 1;
            this.setDefaultClip(options.clip || new SpriteClip("default", 0, 0));
        }
        get frameX() { return this.clipPlaying.frameX; }
        get frameY() { return this.clipPlaying.frameY; }
        setDefaultClip(clip) {
            this.clipDefault.copy(clip);
            this.clipPlaying.copy(clip);
        }
        addClip(key, clip, makeDefault = false) {
            this.clips[key] = new SpriteClip(key).copy(clip);
            if (makeDefault) {
                this.setDefaultClip(clip);
            }
        }
        setClip(clipOrClipName, play = true) {
            if (typeof clipOrClipName === "string") {
                clipOrClipName = this.getClip(clipOrClipName);
            }
            if (!clipOrClipName) {
                clipOrClipName = this.clipDefault;
            }
            if (clipOrClipName.name === this.clipPlaying.name) {
                return;
            }
            this.clipPlaying.copy(clipOrClipName);
            if (play) {
                this.play();
            }
            else {
                this.stop();
            }
        }
        play() {
            this.isPlaying = true;
            this.time = 0;
        }
        stop() {
            this.isPlaying = false;
        }
        getClip(clipName) {
            return this.clips[clipName] || null;
        }
        animate() {
            const now = performance.now();
            const dt = now - this.lastFrameTime;
            const frameDuration = this.clipPlaying.fps > 0 ? 1000 / this.clipPlaying.fps : 0;
            const frameCount = Math.max(this.clipPlaying.frames, 1);
            const totalDuration = frameCount * frameDuration;
            this.frame = totalDuration == 0 ? 0 : Math.floor(this.time / totalDuration * frameCount);
            if (this.isPlaying && totalDuration > 0) {
                this.time += dt;
                this.time = this.time % totalDuration;
            }
            this.lastFrameTime = now;
        }
        render(r, t, anchorOverride) {
            this.animate();
            if (!this.image) {
                return;
            }
            let c = r.context;
            c.globalAlpha = this.alpha;
            const anchor = new Point_4.Point().copy(anchorOverride || this.anchor);
            const rect = this.clipRect.clone();
            rect.move((this.clipPlaying.frameX + this.frame) * this.clipRect.width, (this.clipPlaying.frameY) * this.clipRect.height);
            anchor.x = anchor.x * rect.width;
            anchor.y = anchor.y * rect.height;
            if (r.isSmoothing) {
                anchor.x = Math.round(anchor.x);
                anchor.y = Math.round(anchor.y);
            }
            let appliedScaleX = t.scale.x;
            let appliedScaleY = t.scale.y;
            if (r.isSmoothing === false) {
                const nearestWidth = Math.round(this.clipRect.width * t.scale.x);
                appliedScaleX = nearestWidth / this.clipRect.width;
                const nearestHeight = Math.round(this.clipRect.height * t.scale.y);
                appliedScaleY = nearestHeight / this.clipRect.height;
            }
            let x = t.p.x / appliedScaleX - anchor.x;
            let y = t.p.y / appliedScaleY - anchor.y;
            let w = this.clipRect.width;
            let h = this.clipRect.height;
            if (r.isSmoothing === false) {
                x = Math.round(x / appliedScaleX) * appliedScaleX;
                y = Math.round(y / appliedScaleY) * appliedScaleY;
                w = Math.round(w);
                h = Math.round(h);
            }
            c.scale(appliedScaleX, appliedScaleY);
            c.drawImage(this.image, rect.left, rect.top, rect.width, rect.height, x, y, w, h);
            c.resetTransform();
        }
        getRect() {
            return this.clipRect.clone().move(this.clipRect.width * -this.anchor.x, this.clipRect.height * -this.anchor.y);
        }
        copy(sprite) {
            this.image = sprite.image;
            this.clipRect.copy(sprite.clipRect);
            this.anchor.copy(sprite.anchor);
            this.alpha = sprite.alpha;
            this.clipDefault.copy(sprite.clipDefault);
            this.clips = {};
            for (const key in sprite.clips) {
                this.clips[key] = sprite.clips[key].clone();
            }
            this.clipPlaying.copy(sprite.clipPlaying);
            return this;
        }
        clone() {
            return new Sprite(this.image).copy(this);
        }
        toString() {
            return (this.image ? "Image" : "No Image") + ": " + this.clipRect.left + "," + this.clipRect.top + " " + this.clipRect.width + "x" + this.clipRect.height;
        }
    }
    exports.Sprite = Sprite;
});
define("lad/src/tiles/Tileset", ["require", "exports", "lad/src/display/Sprite", "lad/src/math/Rect"], function (require, exports, Sprite_1, Rect_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BlockType;
    (function (BlockType) {
        BlockType[BlockType["Empty"] = 0] = "Empty";
        BlockType[BlockType["Solid"] = 1] = "Solid";
        BlockType[BlockType["Entity"] = 2] = "Entity";
    })(BlockType = exports.BlockType || (exports.BlockType = {}));
    class Tileset {
        constructor(tilesize, layer) {
            this.tilesize = tilesize;
            this.layer = layer;
            this.blocks = [];
        }
        static fromJson(json, image, layer) {
            const tileset = new Tileset(json.tilesize || 32, layer);
            tileset.image = image;
            tileset.blocks = [];
            const parseBlock = (tileset, index, json) => {
                const fill = json instanceof Array ? json : json.fill;
                let type = BlockType.Empty;
                switch ((json.type || "").toLowerCase()) {
                    case "solid":
                        type = BlockType.Solid;
                        break;
                }
                const layer = tileset.layer || 0;
                const name = json.name;
                const block = Object.assign({ index,
                    name,
                    type,
                    fill,
                    layer }, json);
                return block;
            };
            for (const key in json.blocks) {
                const blockJson = json.blocks[key];
                blockJson.name = blockJson.name || key;
                const parsed = parseBlock(tileset, tileset.blocks.length, blockJson);
                tileset.blocks.push(parsed);
            }
            return tileset;
        }
        getBlock(indexOrName) {
            let index = -1;
            if (typeof indexOrName === "number") {
                if (indexOrName >= 0 && indexOrName < this.blocks.length) {
                    index = indexOrName;
                }
            }
            else {
                index = this.blocks.findIndex(x => x.name.toLowerCase().trim() === indexOrName.toLowerCase().trim());
            }
            if (index < 0) {
                return null;
            }
            return this.blocks[index];
        }
        createSprite(name) {
            let block = this.blocks[0];
            if (name) {
                block = this.getBlock(name);
                if (!block) {
                    return null;
                }
            }
            return new Sprite_1.Sprite(this.image, {
                clipRect: new Rect_5.Rect(0, 0, this.tilesize[0], this.tilesize[1]),
                clip: {
                    frameX: block.fill[0],
                    frameY: block.fill[1]
                }
            });
        }
    }
    exports.Tileset = Tileset;
});
define("lad/src/utils/Factory", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Factory {
        constructor() {
            this.builders = {};
        }
        canMake(key) {
            return Boolean(this.builders[key]);
        }
        make(key, props) {
            const builder = this.builders[key];
            const entity = builder();
            return entity;
        }
        addMakers(makers) {
            for (var key in makers) {
                this.addMaker(key, makers[key]);
            }
        }
        addMaker(key, type) {
            this.builders[key] = type;
        }
    }
    exports.Factory = Factory;
});
define("lad/src/scene/EntityPlaceholder", ["require", "exports", "lad/src/scene/Entity", "lad/src/input/PointerManager", "lad/src/collision/RectCollider"], function (require, exports, Entity_5, PointerManager_2, RectCollider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EntityPlaceholder extends Entity_5.Entity {
        constructor(data, entity) {
            super();
            this.data = data;
            this.entity = entity;
            this.collider = null;
        }
        start() {
            PointerManager_2.pointerManager.onChange.listen(this, this.handlePointer);
        }
        handlePointer(e) {
            if (e.isDown) {
                this.collider = this.entity.getComponent(RectCollider_1.RectCollider);
            }
        }
        remove() {
            PointerManager_2.pointerManager.onChange.unlistenAll(this);
            super.remove();
        }
        callRender(r) {
            super.callRender(r);
            this.entity.scene = this.scene;
            this.entity.parent = this;
            this.entity.calculateRenderTransform(r);
            this.entity.render(r);
        }
    }
    exports.EntityPlaceholder = EntityPlaceholder;
});
define("lad/src/tiles/Tilemap", ["require", "exports", "lad/src/tiles/Mapset", "lad/src/tiles/Tileset", "lad/src/scene/Entity", "lad/src/math/Point", "lad/src/math/Rect", "lad/src/collision/RectCollider", "lad/src/scene/EntityPlaceholder"], function (require, exports, Mapset_1, Tileset_1, Entity_6, Point_5, Rect_6, RectCollider_2, EntityPlaceholder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ILayer {
    }
    exports.ILayer = ILayer;
    class IEntityData {
    }
    exports.IEntityData = IEntityData;
    class BlockInfo {
        constructor(rect, block) {
            this.rect = rect;
            this.block = block;
        }
    }
    exports.BlockInfo = BlockInfo;
    class Tilemap extends Entity_6.Entity {
        constructor() {
            super(...arguments);
            this.layers = [];
            this.entities = [];
            this.tilesize = [32, 32];
            this.tilesX = 0;
            this.tilesY = 0;
            this.factoryEntitys = [];
        }
        setTileset(tileset, layerIndex) {
            if (!this.layers[layerIndex]) {
                const tiles = new Mapset_1.Mapset();
                this.tilesize = tileset.tilesize;
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
        getBlockAt(p) {
            const [tx, ty] = this.getBlockOrds(p);
            let block = null;
            for (const layer of this.layers) {
                const index = layer.tiles.getTile(tx, ty);
                block = layer.tileset.getBlock(index);
                if (block) {
                    break;
                }
            }
            const x = tx * this.tilesize[0];
            const y = ty * this.tilesize[1];
            return new BlockInfo(new Rect_6.Rect(x, y, this.tilesize[0], this.tilesize[1]), block);
        }
        getBlockOrds(p) {
            return [
                Math.floor(p.x / this.tilesize[0]),
                Math.floor(p.y / this.tilesize[1])
            ];
        }
        getBlockPoint(tx, ty) {
            const x = tx * this.tilesize[0];
            const y = ty * this.tilesize[1];
            return new Point_5.Point(x, y);
        }
        getBlocks(x, y) {
            const result = [];
            for (const layer of this.layers) {
                const index = layer.tiles.getTile(x, y);
                if (index !== Mapset_1.Mapset.EMPTY) {
                    result.push(null);
                    continue;
                }
                if (index === Tilemap.BLOCK_INVISIBLE.index) {
                    result.push(Tilemap.BLOCK_INVISIBLE);
                    continue;
                }
                const block = layer.tileset.getBlock(index);
                if (block) {
                    result.push(block);
                }
            }
            return result;
        }
        setBlock(x, y, block) {
            for (const layer of this.layers) {
                layer.tiles.setTile(x, y, Mapset_1.Mapset.EMPTY);
            }
            if (block) {
                const layer = this.layers[block.layer] ? this.layers[block.layer] : this.layers[0];
                layer.tiles.setTile(x, y, block.index);
            }
        }
        setSize(tilesX, tilesY, offsetX = 0, offsetY = 0) {
            this.tilesX = tilesX;
            this.tilesY = tilesY;
            for (const layer of this.layers) {
                layer.tiles.setSize(tilesX, tilesY, offsetX, offsetY);
            }
        }
        placeEntity(e, tx, ty) {
            let x = (tx + 0.5) * this.tilesize[0];
            let y = (ty + 0.5) * this.tilesize[1];
            const collider = e instanceof EntityPlaceholder_1.EntityPlaceholder
                ? e.entity.collider
                : e.collider;
            if (collider instanceof RectCollider_2.RectCollider) {
                const rect = collider.rect;
                x -= rect.center.x;
                y -= rect.center.y;
            }
            e.transform.p.setValue(x, y);
        }
        clear() {
            for (const layer of this.layers) {
                for (let i = 0; i < layer.tiles.tiles.length; i++) {
                    layer.tiles.tiles[i] = Mapset_1.Mapset.EMPTY;
                }
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
            if (!block) {
                return;
            }
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
            const ts = layer.tileset.tilesize;
            const tx = tile[0] * ts[0];
            const ty = tile[1] * ts[1];
            const rsx = rt.scale.x * ts[0];
            const rsy = rt.scale.y * ts[1];
            const rx = x * ts[0] * rt.scale.x + rt.p.x;
            const ry = y * ts[1] * rt.scale.y + rt.p.y;
            r.context.drawImage(layer.tileset.image, tx, ty, ts[0], ts[1], rx, ry, rsx, rsy);
        }
        getData() {
            const layers = [];
            for (const layer of this.layers) {
                let tilesetName = layer.tileset.image.name;
                const dotI = tilesetName.indexOf(".");
                if (dotI > 0) {
                    tilesetName = tilesetName.substr(0, dotI);
                }
                const tilesetTiles = layer.tileset.blocks.map(x => x.name);
                const tileset = {
                    name: tilesetName,
                    tiles: tilesetTiles
                };
                layers.push({
                    tileset,
                    tiles: layer.tiles.getDataString()
                });
            }
            return {
                layers,
                entities: this.entities
            };
        }
        getDataString() {
            const lines = [];
            for (const layer of this.layers) {
                lines.push(layer.tiles.getDataString());
            }
            return lines.join("\n");
        }
        setDataString(str) {
            const lines = str.split("\n");
            let tilesX = 0;
            let tilesY = 0;
            for (let i = 0; i < lines.length; i++) {
                const layer = this.layers[i];
                if (!layer)
                    continue;
                layer.tiles.setDataString(lines[i]);
                tilesX = Math.max(tilesX, layer.tiles.tilesX);
                tilesY = Math.max(tilesY, layer.tiles.tilesY);
            }
            this.setSize(tilesX, tilesY);
        }
        setData(data) {
            if (!data || !data.layers) {
                return;
            }
            let tilesX = 0;
            let tilesY = 0;
            for (let i = 0; i < this.layers.length; i++) {
                const dataLayer = data.layers[i];
                if (!dataLayer) {
                    continue;
                }
                const layer = this.layers[i];
                layer.tiles.setDataString(dataLayer.tiles);
                tilesX = Math.max(tilesX, layer.tiles.tilesX);
                tilesY = Math.max(tilesY, layer.tiles.tilesY);
            }
            this.setSize(tilesX, tilesY);
            this.entities = data.entities || [];
        }
        removeAdjoining(tx, ty) {
            const block = this.getBlocks(tx, ty)[0];
            if (!block) {
                return;
            }
            this.setBlock(tx, ty, null);
            for (let y = ty - 1; y <= ty + 1; y++) {
                for (let x = tx - 1; x <= tx + 1; x++) {
                    const b = this.getBlocks(x, y)[0];
                    if (b && b.name === block.name) {
                        this.removeAdjoining(x, y);
                    }
                }
            }
        }
        runFactory(factory) {
            if (this.factoryEntitys.length > 0) {
                for (const e of this.factoryEntitys) {
                    e.remove();
                }
                this.factoryEntitys = [];
            }
            for (const data of this.entities) {
                if (factory.canMake(data.name) === false) {
                    continue;
                }
                const entity = factory.make(data.name);
                this.placeEntity(entity, data.tile[0], data.tile[1]);
                this.factoryEntitys.push(entity);
                this.scene.add(entity);
            }
        }
        getRect() {
            return new Rect_6.Rect(0, 0, this.tilesX * this.tilesize[0], this.tilesY * this.tilesize[0]);
        }
    }
    exports.Tilemap = Tilemap;
    Tilemap.BLOCK_INVISIBLE = {
        index: Mapset_1.Mapset.EMPTY - 1,
        type: Tileset_1.BlockType.Solid,
        name: "invisible",
        layer: 0,
        fill: [0, 0]
    };
});
define("lad/src/collision/TilemapCollider", ["require", "exports", "lad/src/collision/Collider", "lad/src/math/Rect", "lad/src/collision/RectCollider"], function (require, exports, Collider_2, Rect_7, RectCollider_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TilemapCollision {
    }
    exports.TilemapCollision = TilemapCollision;
    class TilemapCollider extends Collider_2.Collider {
        constructor(tilemap) {
            super(tilemap);
            this.tilemap = tilemap;
            this.rect = new Rect_7.Rect();
            tilemap.collider = this;
        }
        checkCollision(other) {
            if (typeof other.onCollision !== "function") {
                return;
            }
            if (other instanceof RectCollider_3.RectCollider) {
                const rect = other.rect.clone().addPos(other.entity.transform.p);
                const centerX = (rect.topLeft.x + rect.bottomRight.x) * 0.5;
                const centerY = (rect.topLeft.y + rect.bottomRight.y) * 0.5;
                const parseContact = (x, y) => {
                    const target = this.tilemap.getBlockAt({ x, y });
                    if (!target.block) {
                        return null;
                    }
                    const rect = target.rect.clone();
                    return { rect, target };
                };
                const c = new TilemapCollision();
                c.bottom = parseContact(centerX, rect.bottomRight.y);
                c.left = parseContact(rect.topLeft.x, centerY);
                c.right = parseContact(rect.bottomRight.x, centerY);
                c.top = parseContact(centerX, rect.topLeft.y);
                c.contacts = [c.bottom, c.left, c.right, c.top].filter(x => Boolean(x));
                for (const contact of c.contacts) {
                    other.handleCollision(Object.assign({}, contact));
                }
                return;
            }
        }
        render(r) {
            const c = r.context;
            c.beginPath();
            c.strokeStyle = "blue";
            c.lineWidth = 1;
            const p = this.tilemap.renderTransform.p;
            for (let y = 0; y < this.tilemap.tilesY; y++) {
                for (let x = 0; x < this.tilemap.tilesX; x++) {
                    const { rect, block } = this.tilemap.getBlockAt(this.tilemap.getBlockPoint(x, y));
                    rect.addPos(this.entity.scene.renderTransform.p);
                    if (!block) {
                        continue;
                    }
                    rect.move(p.x, p.y);
                    c.moveTo(rect.left, rect.top);
                    c.lineTo(rect.right, rect.top);
                    c.lineTo(rect.right, rect.bottom);
                    c.lineTo(rect.left, rect.bottom);
                    c.lineTo(rect.left, rect.top);
                }
            }
            c.stroke();
        }
    }
    exports.TilemapCollider = TilemapCollider;
});
define("lad/src/display/ClipGroup", ["require", "exports", "lad/src/math/Rect"], function (require, exports, Rect_8) {
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
            let rect = new Rect_8.Rect();
            if (i > 0) {
                rect.copy(this.clips[0].getRect());
                while (i-- > 1) {
                    rect.encapsulate(this.clips[i].getRect());
                }
            }
            return rect;
        }
    }
    exports.ClipGroup = ClipGroup;
});
define("lad/src/display/Path", ["require", "exports", "lad/src/math/Rect"], function (require, exports, Rect_9) {
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
                const cos = Math.cos(t.rotation) * t.scale.x;
                const sin = Math.sin(t.rotation) * t.scale.y;
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
        getRect() {
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
                return new Rect_9.Rect(l, t, r - l, b - t);
            }
            return new Rect_9.Rect();
        }
    }
    exports.Path = Path;
});
define("lad/src/events/Subject", ["require", "exports", "lad/src/events/Dispatcher"], function (require, exports, Dispatcher_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Subject extends Dispatcher_2.Dispatcher {
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
define("lad/src/html/HTMLComponent", ["require", "exports", "lad/src/scene/Entity"], function (require, exports, Entity_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HTMLComponent extends Entity_7.Entity {
        constructor(element) {
            super();
            this.element = element;
        }
        start() {
            this.game.renderer.overlay.appendChild(this.element);
        }
        remove() {
            this.element.remove();
            super.remove();
        }
    }
    exports.HTMLComponent = HTMLComponent;
});
define("lad/src/input/AInput", ["require", "exports", "lad/src/events/Dispatcher", "lad/src/LAD"], function (require, exports, Dispatcher_3, LAD_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AInput extends Dispatcher_3.Dispatcher {
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
                action.frame = LAD_2.LAD.game.frames;
                this.pressed[action.name] = true;
                this.dispatch(action);
            }
            else {
                this.dispatch({ button: button, down: true, deviceName: this.deviceName, frame: LAD_2.LAD.game.frames });
            }
        }
        release(button) {
            this.pressed[button] = false;
            if (this.buttons.hasOwnProperty(button)) {
                let action = this.actions[this.buttons[button]];
                action.down = false;
                action.frame = LAD_2.LAD.game.frames;
                this.pressed[action.name] = false;
                this.dispatch(action);
            }
            else {
                this.dispatch({ button: button, down: false, deviceName: this.deviceName, frame: LAD_2.LAD.game.frames });
            }
        }
        isPressed(actionNameOrButton) {
            return this.pressed[actionNameOrButton] === true;
        }
        nowPressed(actionNameOrButton) {
            return this.pressed[actionNameOrButton] === true
                && this.actions[actionNameOrButton].frame === LAD_2.LAD.game.frames;
        }
        anyPressed(...args) {
            let i = args.length;
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
define("lad/src/input/PointerInput", ["require", "exports", "lad/src/input/AInput", "lad/src/input/PointerManager"], function (require, exports, AInput_2, PointerManager_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PointerInput extends AInput_2.AInput {
        constructor() {
            super("pointer");
            this.x = 0.0;
            this.y = 0.0;
            this.isDown = false;
            PointerManager_3.pointerManager.onChange.listen(this, this.handlePointerChange);
            PointerManager_3.pointerManager.onMove.listen(this, this.handlePointerMove);
        }
        handlePointerMove(e) {
            this.x = e.pos.x;
            this.y = e.pos.y;
        }
        handlePointerChange(e) {
            if (e.button !== 0) {
                return;
            }
            this.isDown = e.isDown;
            this.x = e.pos.x;
            this.y = e.pos.y;
            if (this.isDown) {
                this.press(e.button + "");
            }
            else {
                this.release(e.button + "");
            }
        }
    }
    exports.PointerInput = PointerInput;
});
define("lad/src/input/MultiInput", ["require", "exports", "lad/src/input/AInput", "lad/src/input/KeyboardInput", "lad/src/input/PointerInput"], function (require, exports, AInput_3, KeyboardInput_1, PointerInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MultiInput extends AInput_3.AInput {
        constructor(name, devices) {
            super(name || "multiinput");
            this.devices = devices || [
                new KeyboardInput_1.KeyboardInput(),
                new PointerInput_1.PointerInput()
            ];
            for (const device of this.devices) {
                device.listen(this, this.dispatch);
            }
        }
        hasAction(name) {
            for (const device of this.devices) {
                if (device.hasAction(name)) {
                    return true;
                }
            }
            return false;
        }
        isPressed(actionNameOrButton) {
            for (const device of this.devices) {
                if (device.isPressed(actionNameOrButton)) {
                    return true;
                }
            }
            return false;
        }
        nowPressed(actionNameOrButton) {
            for (const device of this.devices) {
                if (device.nowPressed(actionNameOrButton)) {
                    return true;
                }
            }
            return false;
        }
        anyPressed(...args) {
            for (const actionNameOrButton of args) {
                if (this.isPressed(actionNameOrButton)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.MultiInput = MultiInput;
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
            return new Promise((resolve, reject) => {
                this.loadPromise().then(data => {
                    this.data = data;
                    if (this.onComplete) {
                        this.onComplete();
                    }
                    else {
                        resolve(data);
                    }
                }).catch(e => {
                    if (this.onError) {
                        this.onError(e);
                    }
                    else {
                        reject(e);
                    }
                });
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
define("lad/src/utils/Compression", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const PREFIX_COMPRESS = "LADC:";
    const PREFIX_PACKAGE = "LADP:";
    class Compression {
        static isCompressed(s) {
            return s && s.startsWith(PREFIX_COMPRESS);
        }
        static compress(s) {
            let dictionary = {};
            let uncompressed = s;
            let dictSize = 256;
            for (let i = 0; i < 256; i += 1) {
                dictionary[String.fromCharCode(i)] = i;
            }
            let w = "";
            let ASCII = "";
            for (let i = 0; i < uncompressed.length; i += 1) {
                const c = uncompressed.charAt(i);
                let wc = w + c;
                if (dictionary.hasOwnProperty(wc)) {
                    w = wc;
                }
                else {
                    ASCII += String.fromCharCode(dictionary[w]);
                    dictionary[wc] = dictSize++;
                    w = String(c);
                }
            }
            if (w !== "") {
                ASCII += String.fromCharCode(dictionary[w]);
            }
            return PREFIX_COMPRESS + ASCII;
        }
        static decompress(s) {
            if (this.isCompressed(s) === false) {
                return null;
            }
            s = s.substr(PREFIX_COMPRESS.length);
            let dictionary = [];
            let compressed;
            let entry = "";
            let dictSize = 256;
            for (let i = 0; i < 256; i += 1) {
                dictionary[i] = String.fromCharCode(i);
            }
            const tmp = [];
            for (let i = 0; i < s.length; i += 1) {
                tmp.push(s[i].charCodeAt(0));
            }
            compressed = tmp;
            let w = String.fromCharCode(compressed[0]);
            let result = w;
            for (let i = 1; i < compressed.length; i += 1) {
                let k = compressed[i];
                if (dictionary[k]) {
                    entry = dictionary[k];
                }
                else {
                    if (k === dictSize) {
                        entry = w + w.charAt(0);
                    }
                    else {
                        return null;
                    }
                }
                result += entry;
                dictionary[dictSize++] = w + entry.charAt(0);
                w = entry;
            }
            return result;
        }
        static isPacked(s) {
            return s && s.startsWith(PREFIX_PACKAGE);
        }
        static safePack(str) {
            str = this.compress(str);
            str = encodeURIComponent(str);
            str = unescape(str);
            str = btoa(str);
            return PREFIX_PACKAGE + str;
        }
        static safeUnpack(str) {
            if (this.isPacked(str) === false) {
                return null;
            }
            str = str.substr(PREFIX_COMPRESS.length);
            str = atob(str);
            str = escape(str);
            str = decodeURIComponent(str);
            str = this.decompress(str);
            return str;
        }
    }
    exports.Compression = Compression;
});
define("lad/src/utils/MapUtils", ["require", "exports", "lad/src/utils/Compression"], function (require, exports, Compression_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapUtils {
        static loadLocalMapData(key) {
            const mapData = MapUtils.jsonFromString(window.localStorage.getItem(key));
            if (mapData && mapData.map) {
                return mapData;
            }
            return null;
        }
        static mapToString(mapData) {
            const outStr = Compression_1.Compression.compress(JSON.stringify(mapData));
            return outStr;
        }
        static mapFromString(str) {
            if (Compression_1.Compression.isCompressed(str)) {
                str = Compression_1.Compression.decompress(str);
            }
            return this.jsonFromString(str);
        }
        static jsonFromString(str) {
            if (!str) {
                return null;
            }
            let json = null;
            try {
                json = JSON.parse(str);
            }
            catch (e) { }
            return json;
        }
        static jsonToString(obj) {
            return JSON.stringify(obj);
        }
        static jsonFromPacked(compressed) {
            const str = Compression_1.Compression.safeUnpack(compressed);
            return this.jsonFromString(str);
        }
        static jsonToPacked(obj) {
            const str = this.jsonToString(obj);
            const compressed = Compression_1.Compression.safePack(str);
            return compressed;
        }
        static jsonFromLZ(compressed) {
            const str = Compression_1.Compression.decompress(compressed);
            return this.jsonFromString(str);
        }
        static jsonToLZ(obj) {
            const str = this.jsonToString(obj);
            const compressed = Compression_1.Compression.compress(str);
            return compressed;
        }
        static jsonRequest(url, data = null) {
            return new Promise((resolve, reject) => {
                const dataStr = data ? this.jsonToString(data) : null;
                const xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.onload = () => {
                    const str = xhr.responseText;
                    let response = null;
                    if (str) {
                        response = this.jsonFromString(str);
                        if (!response) {
                            reject("Couldn't parse JSON from " + url);
                        }
                    }
                    resolve(response);
                };
                xhr.onerror = () => {
                    reject({ error: xhr.responseText });
                };
                xhr.send(dataStr);
            });
        }
        static resizePNG(dataString, scale) {
            return new Promise((resolve, reject) => {
                const img = document.createElement("img");
                img.onload = () => {
                    const srcCanvas = document.createElement("canvas");
                    const srcCtx = srcCanvas.getContext("2d");
                    const srcW = img.naturalWidth;
                    const srcH = img.naturalHeight;
                    srcCanvas.width = srcW;
                    srcCanvas.height = srcH;
                    srcCtx.drawImage(img, 0, 0, srcW, srcH);
                    const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;
                    const dstCanvas = document.createElement("canvas");
                    const dstCtx = dstCanvas.getContext("2d");
                    const dstW = srcW * scale;
                    const dstH = srcH * scale;
                    dstCanvas.width = dstW;
                    dstCanvas.height = dstH;
                    for (let y = 0; y < srcH; y++) {
                        for (let x = 0; x < srcW; x++) {
                            const dataI = (y * srcW + x) * 4;
                            const r = srcData[dataI];
                            const g = srcData[dataI + 1];
                            const b = srcData[dataI + 2];
                            const a = srcData[dataI + 3];
                            dstCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
                            dstCtx.fillRect(x * scale, y * scale, scale, scale);
                        }
                    }
                    resolve(dstCanvas.toDataURL());
                };
                img.onerror = (e) => reject(e);
                img.src = dataString;
            });
        }
    }
    exports.MapUtils = MapUtils;
});
define("lad/src/utils/Pak", ["require", "exports", "lad/src/tiles/Tileset", "lad/src/utils/MapUtils"], function (require, exports, Tileset_2, MapUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Pak {
        constructor(data) {
            this.data = data;
        }
        getNode(path) {
            const node = this.data[path] || null;
            return node;
        }
        extractTileset(jsonPath, layer) {
            return __awaiter(this, void 0, void 0, function* () {
                const jsonNode = this.getNode(jsonPath);
                if (!jsonNode) {
                    return null;
                }
                const jsonData = jsonNode.data;
                const imagePath = jsonData.image;
                const image = yield this.extractImage(imagePath, jsonData.rescale);
                const tileset = Tileset_2.Tileset.fromJson(jsonData, image, layer);
                return tileset;
            });
        }
        extractImage(imagePath, scale) {
            return __awaiter(this, void 0, void 0, function* () {
                const imageNode = this.getNode(imagePath);
                const mimeType = "image/" + imageNode.type;
                const image = yield new Promise(resolve => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    let dataString = `data:${mimeType};base64,${imageNode.data}`;
                    if (scale && scale != 1) {
                        MapUtils_1.MapUtils.resizePNG(dataString, scale).then(newString => {
                            image.src = newString;
                        });
                    }
                    else {
                        image.src = dataString;
                    }
                });
                return image;
            });
        }
    }
    exports.Pak = Pak;
});
define("lad/src/load/PakLoader", ["require", "exports", "lad/src/load/ALoader", "lad/src/utils/Pak"], function (require, exports, ALoader_3, Pak_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PakLoader extends ALoader_3.ALoader {
        loadPromise() {
            return new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.setAttribute("type", "text/javascript");
                script.src = this.url;
                document.head.appendChild(script);
                let attempts = 100;
                const checkTimer = setInterval(() => {
                    const win = window;
                    if (win && win.ladpaks) {
                        let pakKey = this.url.replace(/\\/g, "/");
                        pakKey = pakKey.substr(pakKey.lastIndexOf("/") + 1);
                        const data = win.ladpaks[pakKey];
                        if (data) {
                            console.log("ladpak", data);
                            clearInterval(checkTimer);
                            return resolve(new Pak_1.Pak(data));
                        }
                    }
                    attempts--;
                    if (attempts < 0) {
                        clearInterval(checkTimer);
                        return reject("Ladpak " + this.url + " couldn't be loaded.");
                    }
                }, 100);
            });
        }
    }
    exports.PakLoader = PakLoader;
});
define("lad/src/load/SpriteLoader", ["require", "exports", "lad/src/load/ALoader", "lad/src/load/JSONLoader", "lad/src/load/ImageLoader", "lad/src/display/Sprite", "lad/src/math/Rect"], function (require, exports, ALoader_4, JsonLoader_1, ImageLoader_1, Sprite_2, Rect_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SpriteLoader extends ALoader_4.ALoader {
        constructor(url) {
            super(url);
        }
        loadPromise() {
            return __awaiter(this, void 0, void 0, function* () {
                const data = yield new JsonLoader_1.JSONLoader(this.url).loadPromise();
                let imageUrl = data.image;
                const jsonPath = this.url.replace(/\\/g, "/");
                const jsonFolder = jsonPath.substr(0, jsonPath.lastIndexOf("/") + 1);
                imageUrl = jsonFolder + "/" + imageUrl;
                imageUrl = imageUrl.replace(/\/\//g, "/");
                const image = yield new ImageLoader_1.ImageLoader(imageUrl).loadPromise();
                const tilesizeX = data.tilesize[0];
                const tilesizeY = data.tilesize[1];
                const sprite = new Sprite_2.Sprite(image, {
                    clipRect: new Rect_10.Rect(0, 0, tilesizeX, tilesizeY)
                });
                return sprite;
            });
        }
    }
    exports.SpriteLoader = SpriteLoader;
});
define("lad/src/load/TilesetLoader", ["require", "exports", "lad/src/load/ALoader", "lad/src/tiles/Tileset", "lad/src/load/JSONLoader", "lad/src/load/ImageLoader"], function (require, exports, ALoader_5, Tileset_3, JsonLoader_2, ImageLoader_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TilesetLoader extends ALoader_5.ALoader {
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
                return Tileset_3.Tileset.fromJson(data, image, this.layer);
            });
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
        function clamp(value, low, high) {
            if (value < low)
                return low;
            if (value > high)
                return high;
            return value;
        }
        MathUtils.clamp = clamp;
        function clampMag(value, mag) {
            mag = mag > 0 ? mag : -mag;
            return clamp(value, -mag, mag);
        }
        MathUtils.clampMag = clampMag;
        function lerp(a, b, t) {
            t = clamp(t, 0, 1);
            return a * t + b * (1 - t);
        }
        MathUtils.lerp = lerp;
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
define("lad/src/utils/Base36", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function uintToBase36(n) {
        n = Number(n);
        if (isNaN(n))
            throw new Error("input is NaN");
        if (Math.floor(n) !== n)
            throw new Error("input must be an integer");
        if (n < 0)
            throw new Error("input must be positive");
        let result = "";
        do {
            const x = n % 36;
            result = (x < 10 ? x.toString() : String.fromCharCode(55 + x)) + result;
            n = Math.floor(n / 36);
        } while (n > 0);
        return result;
    }
    function uintFromBase36(s) {
        if (typeof s !== "string") {
            throw new Error("input must be a string");
        }
        s = s.toUpperCase();
        let result = 0;
        for (let i = 0, len = s.length; i < len; i++) {
            const c = s.charCodeAt(i);
            const x = c < 65 ? c - 48 : c - 55;
            result += Math.pow(36, len - i - 1) * x;
            if (result > Number.MAX_SAFE_INTEGER) {
                throw new RangeError("Can't decode string, exceeds Number.MAX_SAFE_INTEGER");
            }
        }
        return result;
    }
    function uintArrayToBase36(uints, segmentLength) {
        if (uints instanceof Array === false)
            throw new Error("input needs to be an array of uints");
        let result = "";
        for (let i = 0; i < uints.length; i++) {
            let s = uintToBase36(uints[i]);
            if (s.length > segmentLength) {
                throw new RangeError("Can't encode string, as segment length isn't long enough");
            }
            while (s.length < segmentLength) {
                s = "0" + s;
            }
            result += s;
        }
        return result;
    }
    function uintArrayFromBase36(s, segmentLength) {
        if (typeof s !== "string")
            throw new Error("input needs to be string");
        if (typeof segmentLength !== "number" || isNaN(segmentLength) || segmentLength < 2)
            throw new Error("len needs to be number greater than 1");
        let result = [];
        for (let i = 0; i < s.length; i += segmentLength) {
            result.push(uintFromBase36(s.substr(i, segmentLength)));
        }
        return result;
    }
    exports.Base36 = {
        uintToBase36,
        uintFromBase36,
        uintArrayToBase36,
        uintArrayFromBase36
    };
    exports.default = exports.Base36;
});
define("lad/src/tiles/TilemapUtils", ["require", "exports", "lad/src/utils/Base36", "lad/src/tiles/Mapset"], function (require, exports, Base36_1, Mapset_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TilemapUtils {
        static mapToObject(map) {
            const layers = [];
            for (const layer of map.layers) {
                const uints = [...layer.tiles.tiles];
                const uniqueUints = [...new Set(uints)];
                uniqueUints.sort((a, b) => a < b ? -1 : 1);
                const setBlocks = layer.tileset.blocks.filter(x => uniqueUints.includes(x.index));
                setBlocks.sort((a, b) => a.index < b.index ? -1 : 1);
                const set = setBlocks.map(x => x.name);
                const remappedUints = uints.map(x => uniqueUints.indexOf(x));
                let map = layer.tiles.tilesX + ":";
                map += Base36_1.default.uintArrayToBase36(remappedUints, 2);
                layers.push({ set, map });
            }
            const entities = map.entities;
            return {
                layers,
                entities
            };
        }
        static applyMapObject(map, obj) {
            map.setSize(0, 0);
            for (let i = 0; i < map.layers.length; i++) {
                const mapLayer = map.layers[i];
                const dataLayer = obj.layers[i];
                const colonI = dataLayer.map.indexOf(":");
                const tilesX = parseInt(dataLayer.map.substr(0, colonI), 10);
                const mapStr = dataLayer.map.substr(colonI + 1);
                const unmappedUints = Base36_1.default.uintArrayFromBase36(mapStr, 2);
                const tilesY = Math.ceil(unmappedUints.length / tilesX);
                if (map.tilesX < tilesX || map.tilesY < tilesY) {
                    map.setSize(Math.max(map.tilesX, tilesX), Math.max(map.tilesY, tilesY));
                }
                const uints = unmappedUints.map(x => {
                    let index = mapLayer.tileset.blocks.findIndex(b => b.name === dataLayer.set[x]);
                    if (index < 0) {
                        index = Mapset_2.Mapset.EMPTY;
                    }
                    return index;
                });
                mapLayer.tiles.setTiles(tilesX, tilesY, new Uint8Array(uints));
            }
            map.entities = obj.entities;
        }
    }
    exports.TilemapUtils = TilemapUtils;
});
define("lad/src/ui/IBoxStyle", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lad/src/ui/UIPanel", ["require", "exports", "lad/src/scene/EntityContainer", "lad/src/math/Point", "lad/src/math/Rect"], function (require, exports, EntityContainer_2, Point_6, Rect_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIPanel extends EntityContainer_2.EntityContainer {
        constructor() {
            super(...arguments);
            this.size = new Point_6.Point();
            this.bgStyle = null;
        }
        setRect(rect) {
            this.transform.p.copy(rect.topLeft);
            this.size.setValue(rect.width, rect.height);
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
            const rr = rl + this.renderTransform.scale.x * size.x;
            const rt = this.renderTransform.p.y;
            const rb = rt + this.renderTransform.scale.y * size.y;
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
            const rw = this.renderTransform.scale.x * this.size.x;
            const rh = this.renderTransform.scale.y * this.size.y;
            return new Rect_11.Rect(rx, ry, rw, rh);
        }
    }
    exports.UIPanel = UIPanel;
});
define("lad/src/ui/UIButton", ["require", "exports", "lad/src/ui/UIPanel", "lad/src/input/PointerManager"], function (require, exports, UIPanel_1, PointerManager_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIButton extends UIPanel_1.UIPanel {
        constructor() {
            super(...arguments);
            this.isPressed = false;
            this.downTime = 0;
        }
        start() {
            PointerManager_4.pointerManager.onChange.listen(this, this.handlePointer);
        }
        update() {
            if (this.isPressed && this.onContext && (performance.now() - this.downTime) > 500) {
                this.isPressed = false;
                this.downTime = 0;
                this.onContext();
            }
        }
        remove() {
            super.remove();
            PointerManager_4.pointerManager.onChange.unlisten(this, this.handlePointer);
        }
        handleClick() {
            if (typeof this.onClick === "function") {
                this.onClick();
            }
        }
        handlePress() {
            if (typeof this.onPress === "function") {
                this.onPress();
            }
        }
        handleRelease() {
            if (typeof this.onRelease === "function") {
                this.onRelease();
            }
        }
        handlePointer(e) {
            if (e.button !== 0) {
                return;
            }
            const bounds = this.getBounds();
            if (bounds.isWithin(e.pos)) {
                if (e.isDown) {
                    this.downTime = performance.now();
                    e.cancelled = true;
                    this.isPressed = true;
                    this.handlePress();
                }
                else if (this.isPressed) {
                    this.handleClick();
                    e.cancelled = true;
                }
            }
            else if (e.isDown === false) {
                if (this.isPressed) {
                    this.handleRelease();
                }
                this.isPressed = false;
            }
        }
    }
    exports.UIButton = UIButton;
});
define("lad/src/ui/UIGrid", ["require", "exports", "lad/src/ui/UIPanel", "lad/src/scene/Entity"], function (require, exports, UIPanel_2, Entity_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIGrid extends UIPanel_2.UIPanel {
        constructor(tileSize, padding) {
            super();
            this.alignH = "left";
            this.alignV = "top";
            this.order = "forwards";
            this.fitToParent = false;
            this.tileSize = tileSize;
            this.padding = padding || { x: 0, y: 0 };
        }
        add(entity, index = -1) {
            if (this.isGriddable(entity) === false) {
                throw new Error("UIGrid must be contain UIPanels or UIGrid.BREAK");
            }
            return super.add(entity, index);
        }
        isGriddable(entity) {
            return entity instanceof UIPanel_2.UIPanel || entity === UIGrid.BREAK;
        }
        callRender(r) {
            const size = this.fitToParent && this.parent instanceof UIPanel_2.UIPanel ? this.parent.size : this.size;
            const children = this.entities.filter(x => this.isGriddable(x));
            const maxChildrenPerRow = Math.floor((size.x + this.padding.x) / (this.tileSize.x + this.padding.x));
            const rows = [[]];
            for (let i = 0; i < children.length; i++) {
                const row = rows[rows.length - 1];
                const childI = this.order === "reverse" ? children.length - i - 1 : i;
                const child = children[childI];
                if (child === UIGrid.BREAK) {
                    rows.push(row);
                    continue;
                }
                row.push(child);
                if (row.length >= maxChildrenPerRow) {
                    rows.push(row);
                }
            }
            const totalHeight = rows.length * (this.tileSize.y + this.padding.y) - this.padding.y;
            for (let y = 0; y < rows.length; y++) {
                const row = rows[y];
                const rowWidth = row.length * (this.tileSize.x + this.padding.x) - this.padding.x;
                for (let x = 0; x < row.length; x++) {
                    const child = row[x];
                    let px = this.padding.x + x * (this.tileSize.x + this.padding.x);
                    if (this.alignH === "right") {
                        px = (size.x - rowWidth) + px - this.padding.x * 2;
                    }
                    else if (this.alignH === "center") {
                        px = (size.x - rowWidth) * 0.5 + px - this.padding.x;
                    }
                    child.transform.p.x = px;
                    let py = this.padding.y + y * (this.tileSize.y + this.padding.y);
                    if (this.alignV === "bottom") {
                        py = (size.y - totalHeight) + py - this.padding.y * 2;
                    }
                    else if (this.alignV === "middle") {
                        py = (size.y - totalHeight) * 0.5 + py - this.padding.y;
                    }
                    child.transform.p.y = py;
                    const panel = child;
                    panel.size.copy(this.tileSize);
                }
            }
            super.callRender(r);
        }
    }
    exports.UIGrid = UIGrid;
    UIGrid.BREAK = new Entity_8.Entity();
});
define("lad/src/ui/UIScreen", ["require", "exports", "lad/src/scene/Scene", "lad/src/math/Rect"], function (require, exports, Scene_2, Rect_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIScreen extends Scene_2.Scene {
        constructor() {
            super(...arguments);
            this.rect = new Rect_12.Rect();
        }
    }
    exports.UIScreen = UIScreen;
});
define("lad/src/ui/UISprite", ["require", "exports", "lad/src/ui/UIPanel"], function (require, exports, UIPanel_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UISprite extends UIPanel_3.UIPanel {
        constructor(sprite) {
            super();
            this.sprite = sprite.clone();
        }
        render(r) {
            super.render(r);
            const st = this.renderTransform.clone();
            const scale = Math.min(this.sprite.clipRect.width / this.size.x, this.sprite.clipRect.height / this.size.y);
            st.scale.setValue(scale, scale);
            st.p.move(this.size.x * 0.5, this.size.y * 0.5);
            this.sprite.render(r, st, { x: 0.5, y: 0.5 });
        }
    }
    exports.UISprite = UISprite;
});
define("lad/src/ui/UISpriteButton", ["require", "exports", "lad/src/ui/UIButton", "lad/src/math/Point", "lad/src/math/Rect"], function (require, exports, UIButton_1, Point_7, Rect_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UISpriteButton extends UIButton_1.UIButton {
        constructor(sprite, tile) {
            super();
            this.padding = 0;
            this.anchor = new Point_7.Point();
            this.sprite = sprite.clone();
            this.size.setValue(40, 40);
            this.sprite.setDefaultClip({ frameX: tile[0], frameY: tile[1] });
        }
        render(r) {
            super.render(r);
            this.renderIcon(r);
        }
        renderIcon(r) {
            const t = this.renderTransform.clone();
            t.p.move(this.padding, this.padding);
            t.p.move(this.anchor.x * -this.size.x, this.anchor.y * -this.size.y);
            const scale = Math.min((this.size.x - this.padding * 2) / this.sprite.clipRect.width, (this.size.y - this.padding * 2) / this.sprite.clipRect.height);
            t.scale.setValue(scale, scale);
            this.sprite.render(r, t);
        }
        getBounds() {
            const rx = this.renderTransform.p.x + this.anchor.x * -this.size.x;
            const ry = this.renderTransform.p.y + this.anchor.y * -this.size.y;
            const rw = this.renderTransform.scale.x * this.size.x;
            const rh = this.renderTransform.scale.y * this.size.y;
            return new Rect_13.Rect(rx, ry, rw, rh);
        }
    }
    exports.UISpriteButton = UISpriteButton;
});
define("lad/src/utils/Keycode", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Keycode;
    (function (Keycode) {
        Keycode[Keycode["Backspace"] = 8] = "Backspace";
        Keycode[Keycode["Tab"] = 9] = "Tab";
        Keycode[Keycode["Enter"] = 13] = "Enter";
        Keycode[Keycode["Shift"] = 16] = "Shift";
        Keycode[Keycode["Ctrl"] = 17] = "Ctrl";
        Keycode[Keycode["Alt"] = 18] = "Alt";
        Keycode[Keycode["PauseBreak"] = 19] = "PauseBreak";
        Keycode[Keycode["CapsLock"] = 20] = "CapsLock";
        Keycode[Keycode["Escape"] = 27] = "Escape";
        Keycode[Keycode["Space"] = 32] = "Space";
        Keycode[Keycode["PageUp"] = 33] = "PageUp";
        Keycode[Keycode["PageDown"] = 34] = "PageDown";
        Keycode[Keycode["End"] = 35] = "End";
        Keycode[Keycode["Home"] = 36] = "Home";
        Keycode[Keycode["LeftArrow"] = 37] = "LeftArrow";
        Keycode[Keycode["UpArrow"] = 38] = "UpArrow";
        Keycode[Keycode["RightArrow"] = 39] = "RightArrow";
        Keycode[Keycode["DownArrow"] = 40] = "DownArrow";
        Keycode[Keycode["Insert"] = 45] = "Insert";
        Keycode[Keycode["Delete"] = 46] = "Delete";
        Keycode[Keycode["Zero"] = 48] = "Zero";
        Keycode[Keycode["ClosedParen"] = 48] = "ClosedParen";
        Keycode[Keycode["One"] = 49] = "One";
        Keycode[Keycode["ExclamationMark"] = 49] = "ExclamationMark";
        Keycode[Keycode["Two"] = 50] = "Two";
        Keycode[Keycode["AtSign"] = 50] = "AtSign";
        Keycode[Keycode["Three"] = 51] = "Three";
        Keycode[Keycode["PoundSign"] = 51] = "PoundSign";
        Keycode[Keycode["Hash"] = 51] = "Hash";
        Keycode[Keycode["Four"] = 52] = "Four";
        Keycode[Keycode["DollarSign"] = 52] = "DollarSign";
        Keycode[Keycode["Five"] = 53] = "Five";
        Keycode[Keycode["PercentSign"] = 53] = "PercentSign";
        Keycode[Keycode["Six"] = 54] = "Six";
        Keycode[Keycode["Caret"] = 54] = "Caret";
        Keycode[Keycode["Hat"] = 54] = "Hat";
        Keycode[Keycode["Seven"] = 55] = "Seven";
        Keycode[Keycode["Ampersand"] = 55] = "Ampersand";
        Keycode[Keycode["Eight"] = 56] = "Eight";
        Keycode[Keycode["Star"] = 56] = "Star";
        Keycode[Keycode["Asterik"] = 56] = "Asterik";
        Keycode[Keycode["Nine"] = 57] = "Nine";
        Keycode[Keycode["OpenParen"] = 57] = "OpenParen";
        Keycode[Keycode["A"] = 65] = "A";
        Keycode[Keycode["B"] = 66] = "B";
        Keycode[Keycode["C"] = 67] = "C";
        Keycode[Keycode["D"] = 68] = "D";
        Keycode[Keycode["E"] = 69] = "E";
        Keycode[Keycode["F"] = 70] = "F";
        Keycode[Keycode["G"] = 71] = "G";
        Keycode[Keycode["H"] = 72] = "H";
        Keycode[Keycode["I"] = 73] = "I";
        Keycode[Keycode["J"] = 74] = "J";
        Keycode[Keycode["K"] = 75] = "K";
        Keycode[Keycode["L"] = 76] = "L";
        Keycode[Keycode["M"] = 77] = "M";
        Keycode[Keycode["N"] = 78] = "N";
        Keycode[Keycode["O"] = 79] = "O";
        Keycode[Keycode["P"] = 80] = "P";
        Keycode[Keycode["Q"] = 81] = "Q";
        Keycode[Keycode["R"] = 82] = "R";
        Keycode[Keycode["S"] = 83] = "S";
        Keycode[Keycode["T"] = 84] = "T";
        Keycode[Keycode["U"] = 85] = "U";
        Keycode[Keycode["V"] = 86] = "V";
        Keycode[Keycode["W"] = 87] = "W";
        Keycode[Keycode["X"] = 88] = "X";
        Keycode[Keycode["Y"] = 89] = "Y";
        Keycode[Keycode["Z"] = 90] = "Z";
        Keycode[Keycode["LeftWindowKey"] = 91] = "LeftWindowKey";
        Keycode[Keycode["RightWindowKey"] = 92] = "RightWindowKey";
        Keycode[Keycode["SelectKey"] = 93] = "SelectKey";
        Keycode[Keycode["Numpad0"] = 96] = "Numpad0";
        Keycode[Keycode["Numpad1"] = 97] = "Numpad1";
        Keycode[Keycode["Numpad2"] = 98] = "Numpad2";
        Keycode[Keycode["Numpad3"] = 99] = "Numpad3";
        Keycode[Keycode["Numpad4"] = 100] = "Numpad4";
        Keycode[Keycode["Numpad5"] = 101] = "Numpad5";
        Keycode[Keycode["Numpad6"] = 102] = "Numpad6";
        Keycode[Keycode["Numpad7"] = 103] = "Numpad7";
        Keycode[Keycode["Numpad8"] = 104] = "Numpad8";
        Keycode[Keycode["Numpad9"] = 105] = "Numpad9";
        Keycode[Keycode["Multiply"] = 106] = "Multiply";
        Keycode[Keycode["Add"] = 107] = "Add";
        Keycode[Keycode["Subtract"] = 109] = "Subtract";
        Keycode[Keycode["DecimalPoint"] = 110] = "DecimalPoint";
        Keycode[Keycode["Divide"] = 111] = "Divide";
        Keycode[Keycode["F1"] = 112] = "F1";
        Keycode[Keycode["F2"] = 113] = "F2";
        Keycode[Keycode["F3"] = 114] = "F3";
        Keycode[Keycode["F4"] = 115] = "F4";
        Keycode[Keycode["F5"] = 116] = "F5";
        Keycode[Keycode["F6"] = 117] = "F6";
        Keycode[Keycode["F7"] = 118] = "F7";
        Keycode[Keycode["F8"] = 119] = "F8";
        Keycode[Keycode["F9"] = 120] = "F9";
        Keycode[Keycode["F10"] = 121] = "F10";
        Keycode[Keycode["F11"] = 122] = "F11";
        Keycode[Keycode["F12"] = 123] = "F12";
        Keycode[Keycode["NumLock"] = 144] = "NumLock";
        Keycode[Keycode["ScrollLock"] = 145] = "ScrollLock";
        Keycode[Keycode["SemiColon"] = 186] = "SemiColon";
        Keycode[Keycode["Equals"] = 187] = "Equals";
        Keycode[Keycode["Comma"] = 188] = "Comma";
        Keycode[Keycode["Dash"] = 189] = "Dash";
        Keycode[Keycode["Period"] = 190] = "Period";
        Keycode[Keycode["UnderScore"] = 189] = "UnderScore";
        Keycode[Keycode["PlusSign"] = 187] = "PlusSign";
        Keycode[Keycode["ForwardSlash"] = 191] = "ForwardSlash";
        Keycode[Keycode["Tilde"] = 192] = "Tilde";
        Keycode[Keycode["GraveAccent"] = 192] = "GraveAccent";
        Keycode[Keycode["OpenBracket"] = 219] = "OpenBracket";
        Keycode[Keycode["ClosedBracket"] = 221] = "ClosedBracket";
        Keycode[Keycode["Quote"] = 222] = "Quote";
    })(Keycode = exports.Keycode || (exports.Keycode = {}));
});
define("lad/src/utils/Types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("shapeships/src/SSEntity", ["require", "exports", "lad/src/scene/Entity"], function (require, exports, Entity_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSEntity extends Entity_9.Entity {
        constructor() {
            super(...arguments);
            this.hitRadius = 5;
            this.enemy = false;
        }
        onCollision(e) { }
    }
    exports.SSEntity = SSEntity;
});
define("shapeships/src/SSSmokePart", ["require", "exports", "lad/src/scene/Entity", "lad/src/math/Point", "lad/src/display/Path"], function (require, exports, Entity_10, Point_8, Path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSSmokePart extends Entity_10.Entity {
        constructor() {
            super();
            this.move = new Point_8.Point();
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
define("shapeships/src/SSPlayerShip", ["require", "exports", "shapeships/src/SSShip", "shapeships/src/SSSmokePart", "lad/src/math/Point", "lad/src/display/ClipGroup", "lad/src/display/Path"], function (require, exports, SSShip_1, SSSmokePart_1, Point_9, ClipGroup_1, Path_2) {
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
            this.move = new Point_9.Point();
            this.frame = 0;
            this.shootAngle = 0;
        }
        awake() {
            this.input = this.game.input;
            this.input.keyboard.addActions(this.game.keys);
            this.input.pointer.addActions(this.game.mouse);
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
define("shapeships/src/SSInput", ["require", "exports", "lad/src/input/MultiInput", "lad/src/input/PointerInput", "lad/src/input/KeyboardInput"], function (require, exports, MultiInput_1, PointerInput_2, KeyboardInput_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSInput extends MultiInput_1.MultiInput {
        constructor(player) {
            super("ssinput");
            this.player = player || null;
            this.pointer = this.devices.find(x => x instanceof PointerInput_2.PointerInput);
            this.keyboard = this.devices.find(x => x instanceof KeyboardInput_2.KeyboardInput);
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
                    let dx = this.pointer.x - t.p.x;
                    let dy = this.pointer.y - t.p.y;
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
define("shapeships/src/SSChaserShip", ["require", "exports", "shapeships/src/SSShip", "lad/src/math/Point", "lad/src/display/ClipGroup", "lad/src/display/Path"], function (require, exports, SSShip_2, Point_10, ClipGroup_2, Path_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSChaserShip extends SSShip_2.SSShip {
        constructor() {
            super();
            this.speed = 10;
            this.hitRadius = 15;
            this.move = new Point_10.Point(0, -1);
            this.moveDelta = new Point_10.Point(0, -1);
            this.origin = new Point_10.Point();
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
define("shapeships/src/SSExplosionPart", ["require", "exports", "shapeships/src/SSEntity", "lad/src/math/Point", "lad/src/display/Path"], function (require, exports, SSEntity_1, Point_11, Path_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSExplosionPart extends SSEntity_1.SSEntity {
        constructor() {
            super();
            this.move = new Point_11.Point();
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
define("shapeships/src/SSExplosion", ["require", "exports", "lad/src/scene/Entity", "shapeships/src/SSExplosionPart"], function (require, exports, Entity_11, SSExplosionPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSExplosion extends Entity_11.Entity {
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
                    || action.deviceName === "pointer") {
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
define("shapeships/src/SSGame", ["require", "exports", "shapeships/src/SSInput", "shapeships/src/SSWave", "shapeships/src/SSScore", "shapeships/src/SSHUD", "lad/src/Game", "shapeships/src/SSScreenTitle", "shapeships/src/SSScreenEnd", "shapeships/src/SSScene"], function (require, exports, SSInput_1, SSWave_1, SSScore_1, SSHUD_1, Game_1, SSScreenTitle_1, SSScreenEnd_1, SSScene_2) {
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
                fpsRender: 120,
                autoSize: true
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
define("shapeships/src/SSGrid", ["require", "exports", "lad/src/scene/Entity", "lad/src/display/Path"], function (require, exports, Entity_12, Path_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSGrid extends Entity_12.Entity {
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
define("shapeships/src/SSScene", ["require", "exports", "lad/src/scene/Scene", "shapeships/src/SSGame", "shapeships/src/SSGrid", "shapeships/src/SSPlayerShip", "shapeships/src/SSEntity", "shapeships/src/SSShip", "shapeships/src/SSExplosion", "lad/src/math/Point"], function (require, exports, Scene_3, SSGame_3, SSGrid_1, SSPlayerShip_1, SSEntity_2, SSShip_3, SSExplosion_3, Point_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSScene extends Scene_3.Scene {
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
            p.x = (r.width * 0.5 - this.ship.transform.p.x - this.ship.move.x) / t.scale.x;
            p.y = (r.height * 0.5 - this.ship.transform.p.y - this.ship.move.y) / t.scale.y;
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
            let p = new Point_12.Point();
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
define("shapeships/src/SSShip", ["require", "exports", "shapeships/src/SSEntity", "lad/src/math/Point", "lad/src/display/Path"], function (require, exports, SSEntity_3, Point_13, Path_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSShip extends SSEntity_3.SSEntity {
        constructor() {
            super(...arguments);
            this.speed = 10;
            this.move = new Point_13.Point(0, -1);
            this.moveDelta = new Point_13.Point(0, -1);
            this.origin = new Point_13.Point();
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
define("shapeships/src/SSBouncerShip", ["require", "exports", "shapeships/src/SSShip", "lad/src/math/Point", "lad/src/display/ClipGroup", "lad/src/display/Path"], function (require, exports, SSShip_4, Point_14, ClipGroup_3, Path_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SSBounceShip extends SSShip_4.SSShip {
        constructor() {
            super();
            this.direction = 0;
            this.speed = 10;
            this.hitRadius = 15;
            this.origin = new Point_14.Point();
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
define("shapeships/src/main", ["require", "exports", "shapeships/src/SSGame", "lad/src/LAD"], function (require, exports, SSGame_4, LAD_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    LAD_3.LAD.init(SSGame_4.SSGame, "gameCanvas");
});
//# sourceMappingURL=shapeships.js.map