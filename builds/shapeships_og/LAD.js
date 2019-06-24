/*
	LAD.js: Little HTML Dynamo
	--------------------------
	Version 1.0
	Copyright (c) 2012, Dale J Williams
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions
	are met:
	* Redistributions of source code must retain the above copyright
	  notice, this list of conditions and the following disclaimer.
	* Redistributions in binary form must reproduce the above copyright
	  notice, this list of conditions and the following disclaimer in
	  the documentation and/or other materials provided with the 
	  distribution.
	* Neither the name of the author nor the names of any contributors
	  may be used to endorse or promote products derived from this 
	  software  without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
	"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
	LIMITED TO, THE IMPLIED	WARRANTIES OF MERCHANTABILITY AND FITNESS 
	FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
	DALE J WILLIAMS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
	SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
	LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF 
	USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
	OR TORT	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT 
	OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF 
	SUCH DAMAGE.
*/

"use strict";
/*
	LAD is an object that acts as a namespace for all classes in the 
	LAD framework.
*/
var LAD = {
	debug: false,
	isFunction: function(object) {
		// returns true if the object is a function
		return (typeof object) == "function";
	},
	log: function() {
		// an internal logging function
		if (console) console.log(arguments);
	},
	error: function() {
		// an internal error logging function
		if (console) console.error(arguments);
	}
};

/*
	LAD.Class injects an inheritance pattern into Javascript's existing 
	prototype pattern, augmenting classes with uber (in place of super) 
	and an extend method. 
	This method was based on the inheritance pattern found at:
	http://ejohn.org/blog/simple-javascript-inheritance/
*/
LAD.Class =  function(){};
LAD.Class.extend = function(props) {
	var uber = this.prototype;
	LAD.constructing = true;
	var prototype = new this();
	LAD.constructing = false;
	for (var name in props) {
		if (LAD.isFunction(props[name]) && LAD.isFunction(uber[name])) {
			prototype[name] = (function(name, f){ 
			return function() {				
				var s = this.uber;
				this.uber = uber[name];
				var result = f.apply(this, arguments);        
				this.uber = s;
				return result;
			};})(name, props[name]);
		} else prototype[name] = props[name];
	}
	function Class() {
		if (LAD.constructing) return;
		if (LAD.isFunction(this.init)) this.init.apply(this, arguments);
	}
	Class.prototype = prototype;
	Class.prototype.constructor = Class;
	Class.extend = LAD.Class.extend;
	return Class;
};

/*
	LAD.Math is an object used to enclose useful mathematical methods.
*/
LAD.Math = {
	randomRange: function(min, max) {
		return Math.random() * (max-min) + min;
	},
	scatter: function(number, percent) {
		return number + (Math.random() - 0.5) * number * percent;
	},
	limit: function(value, low, high) {
		if (value < low) return low;
		if (value > high) return high;
		return value;
	}
};

/*
	LAD.Game runs all control for the game. It sets the frames and 
	updates per second (seperately). It allows the game to be started or 
	stopped and calls update and render upon the active scene.
*/
LAD.Game = LAD.Class.extend({
	init: function(canvasName, fps) {
		var canvas = document.getElementById(canvasName);
		this.renderer = new LAD.Renderer(canvas);
		var ups = 30;
		this.updateTime = 1000 / ups; 
		this.setFramerate(fps);
		this.parseParams();
	},
	parseParams: function() {
		// parses hash parameters (#) to the game instance.
		this.params = {};
		var paramPairs = window.location.hash.substr(1).split(",");
		if (paramPairs.length == 0) return;
		var pair;
		var i = paramPairs.length;
		while (i-- > 0) {
			pair = paramPairs[i].split("=");
			this.params[pair[0]] = pair[1];
		}
	},
	setFramerate: function(fps) {
		// sets the frame udpate rate in frames per second
		if (isNaN(fps)) fps = 30;
		this.renderTime = 1000 / fps;
	},
	start: function() {
		// starts the active scene, begins the update timers
		if (!this.scene) return;
		this.scene.callStart();
		this.timeUpdate();
		this.timeRender();
		this.playing = true;
	},
	stop: function() {
		// stops the active scene, pauses the update timers
		clearTimeout(this.updateTimer);
		clearTimeout(this.renderTimer);
		this.playing = false;
	},
	setScene: function(scene) {
		// unloads the current scene, replaces it with new one
		if (scene == this.scene) return;
		this.stop();
		if (this.scene) this.scene.game = null;
		this.scene = scene;
		scene.game = this;
		this.start();
	},
	timeUpdate: function() {
		// schedules an update call at specified update time
		this.updateTimer = setTimeout(this.callUpdate.bind(this), 
		this.updateTime);
	},
	callUpdate: function() {
		// calls scene update then schedules next
		this.scene.callUpdate();
		this.lastUpdate = new Date().getTime();
		this.timeUpdate();
	},
	timeRender: function() {
		// schedules a render call at specified update time
		this.renderTimer = setTimeout(this.callRender.bind(this), 
			this.renderTime);
	},
	callRender: function() {		
		// clears the canvas, calls scene render then schedules next
		this.renderer.clear();
		this.timeDelta = new Date().getTime() - this.lastUpdate;
		this.renderer.percent = this.timeDelta / this.updateTime;
		this.scene.callRender(this.renderer);
		this.timeRender();
	}
});

LAD.Renderer = LAD.Class.extend({
	init: function(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.width = canvas.width;
		this.height = canvas.height;
		this.percent = 1;
	},
	clear: function() {
		this.context.clearRect(0, 0, this.width, this.height);
	}
});

/*
	LAD.List extends the native Array and augments it with methods 
	useful for collection management.
*/
LAD.List = (function() {
	function List(){
		var list = Object.create(Array.prototype);
		list = (Array.apply(list, arguments) || list);
		list.add = function(item, index) {
			// add an item to the list
			if (isNaN(index)) index = this.length;
			if (this.contains(item)) this.remove(item);
			return Array.prototype.splice.call(this, index, 0, item);
		};
		list.remove = function(item) {
			// remove an item from the list
			var i = this.length;
			while (i-- > 0) if (this[i] == item) 
				return Array.prototype.splice.call(this, i, 1);
			return null;
		}
		list.contains = function(item) {
			// check to see if list contains item
			var i = this.length;
			while (i-- > 0) if (this[i] == item) return true;
			return false;
		};
		return list;
	}
	List.extend = LAD.Class.extend;
	return List;
})();

/*
	LAD.Pool creates a finite collection of the specified type, allowing
	access to the last used item first.
*/
LAD.Pool = LAD.Class.extend({
	init: function(type, size) {
		this.type = type;
		this.size = size;
		this.items = [];
		this.index = 0;
		while (size-- > 0) {
			this.items.push(new type());
		}
	},
	getNext: function() {
		// pulls the last used item from the bottom of the stack
		this.index++;
		if (this.index >= this.size) this.index = 0;
		return this.items[this.index];
	}
});

/*
	LAD.Dispatcher dispatches objects, messages or values to registered
	listeners. Unlike event dispatchers, LAD.Dispatcher has no type and
	will dispatch to all methods registered to it.
*/
LAD.Dispatcher = LAD.Class.extend({
	init: function() {
		this.listeners = new LAD.List();
	},
	addListener: function(handler) {
		// adds a listener function to the list
		if (!this.listeners) this.init();
		if (this.hasListener(handler)) return;
		this.listeners.add(handler);
	},
	removeListener: function(handler) {
		// takes a listener function out of the list
		this.listeners.remove(handler);
	},
	hasListener: function(handler) {
		// returns true if the listener is in the list
		return this.listeners.contains(handler);
	},
	dispatch: function(message) {
		// sends the message or object to all handle functions
		var i = this.listeners.length;
		while (i-- > 0) {
			this.listeners[i](message);
		}
	}
});

/*
	LAD.AbstractInput is extended by various input classes to map
	buttons to actions
*/
LAD.AbstractInput = LAD.Dispatcher.extend({
	init: function(device) {
		this.uber();
		this.device = device;
		this.window = window;
		this.actions = {};
		this.buttons = {};
		this.pressed = {};
	},
	addAction: function(name, button) {
		// maps an action to a button
		this.actions[name] = {name: name, button: button, down: false};
		this.buttons[button] = name;
	},
	addActions: function(keymap) {
		// maps an object of key/value pairs where the key is the
		// action and the value is the button
		for (var key in keymap) this.addAction(key, keymap[key]);
	},
	removeAction: function(name) { 
		// deletes an action from the list
		if (!this.hasAction(name)) return;
		delete this.buttons[this.actions[name].button];
		delete this.actions[name];
	},
	hasAction: function(name) {
		// returns true if the action is mapped
		return this.actions[name] != null;
	},
	getAction: function(actionNameOrButton) {
		// returns the action matching the action or button name
		// specified as the argument
		if (this.actions.hasOwnProperty(actionNameOrButton))
			return this.actions[actionNameOrButton];
		if (this.buttons.hasOwnProperty(actionNameOrButton))
			return this.actions[this.buttons[actionNameOrButton]];
		return null;
	},
	press: function(button) {
		// sets the button to pressed, dispatches press event
		this.pressed[button] = true;
		if (this.buttons.hasOwnProperty(button)) {
			var action = this.actions[this.buttons[button]];
			action.down = true;
			this.pressed[action.name] = true;
			this.dispatch(action);
		} else this.dispatch({button: button, down: true})
	},
	release: function(button) {
		// sets the button to unpressed, dispatches release event
		this.pressed[button] = false;
		if (this.buttons.hasOwnProperty(button)) {
			var action = this.actions[this.buttons[button]];
			action.down = false;
			this.pressed[action.name] = false;
			this.dispatch(action);
		} else this.dispatch({button: button, down: false})
	},
	isPressed: function(actionNameOrButton) {
		// returns true if the action or button is pressed
		return this.pressed[actionNameOrButton] == true;
	},
	anyPressed: function() {
		// returns true if any of the buttons in the args are pressed
		// if no args returns true if anything at all is pressed
		var i = arguments.length;
		if (arguments.length < 1) {
			for (var key in this.pressed)
				if (this.pressed[key] == true) return true;
				return false;
		}
		var actionNameOrButton;
		while (i-- > 0) {
			actionNameOrButton = arguments[i];
			if (this.pressed[actionNameOrButton] == true) return true;
		}
		return false;
	}
});

/*
	LAD.KeyboardInput extends LAD.AbstractInput to handle the pressing
	of keyboard keys.
*/
LAD.KeyboardInput = LAD.AbstractInput.extend({
	init: function() {
		this.uber("keyboard");
		var handler = this.handleInput.bind(this);
		window.addEventListener("keydown", handler);
		window.addEventListener("keyup", handler);
	},
	handleInput: function(e) {
		switch (e.type) {
			case "keydown":
				this.press(e.keyCode);
				break;
			case "keyup":
				this.release(e.keyCode);
				break;
		}
	}
});

/*
	LAD.MouseInput extends LAD.AbstractInput to handle the pressing
	of mouse buttons and track the mouse position.
*/
LAD.MouseInput = LAD.AbstractInput.extend({
	init: function() {
		this.uber("mouse");
		this.x = this.y = 0;
		var handler = this.handleInput.bind(this);
		window.addEventListener("mousedown", handler);
		window.addEventListener("mouseup", handler);
		window.addEventListener("mousemove", handler);
	},
	handleInput: function(e) {
		switch (e.type) {
			case "mousedown":
				this.press(0);
				break;
			case "mouseup":
				this.release(0);
				break;
			case "mousemove":
				this.x = e.offsetX;
				this.y = e.offsetY;
				break;
		}
	}
});

/*
	LAD.MultiInput extends LAD.AbstractInput to combine keyboard, mouse
	and gamepad inputs.
*/
LAD.MultiInput = LAD.Dispatcher.extend({
	init: function() {
		this.uber("keymouse");
		this.keyboard = new LAD.KeyboardInput();
		this.mouse = new LAD.MouseInput();
		var handler = this.handleInput.bind(this)
		this.keyboard.addListener(handler);
		this.mouse.addListener(handler);
	},
	handleInput: function(o) {
		this.dispatch(o);
	},
	hasAction: function(name) {
		// checks each device to discern whether the action is registed
		if (this.keyboard.hasAction(name)) return true;
		if (this.mouse.hasAction(name)) return true;
		return false;
	},
	isPressed: function(actionNameOrButton) {
		// checks each device to discern whether the action is pressed
		if (this.keyboard.isPressed(actionNameOrButton)) return true;
		if (this.mouse.isPressed(actionNameOrButton)) return true;
		return false;
	},
	anyPressed: function() {
		// checks all actions in arguments against each device
		var i = arguments.length;
		var actionNameOrButton;
		while (i-- > 0) {
			actionNameOrButton = arguments[i];
			if (this.keyboard.isPressed(actionNameOrButton)) return true;
			if (this.mouse.isPressed(actionNameOrButton)) return true;
		}
		return false;
	}
});

/*
	LAD.AbstractLoader provides a consistant abstract class for loading
	multiple files.
*/
LAD.AbstractLoader = LAD.Class.extend({
	init: function() {
		this.cue = [];
		this.loaded = [];
		this.assets = {};
	},
	add: function() {
		// adds a url to the load cue
		var i = arguments.length;
		while (i-- > 0) {
			this.cue.push(arguments[i]);
		}
	},
	load: function(onComplete) {
		// dummy load call to be overridden
		onComplete();
	},
	getAsset: function(url) {
		// returns the laoded asset
		return this.assets[url];
	}
});

/*
	LAD.ImageLoader extends LAD.AbstractLoader to implement methods for
	loading images.
*/
LAD.ImageLoader = LAD.AbstractLoader.extend({
	init: function() {
		this.uber();
	},	
	load: function(onComplete) {
		// loads each image in the cue
		var image, url;
		if (this.cue.length > 0) {
			url = this.cue.shift();
			image = new Image();
			image.onload = (function() {
				this.loaded.push(url);
				this.assets[url] = image;
				this.load(onComplete);
			}).bind(this);
			image.src = url;
		} else onComplete();
	}
});

/*
	LAD.Point is used for positioning. It contains x ans y values and
	methods to operate on multiple points.
*/
LAD.Point = LAD.Class.extend({
	init: function(x, y) {
		this.setPosition(x, y);
	},
	reset: function() {
		// returns the point to origin (0, 0)
		this.x = this.y = 0;
		return this;
	},
	move: function(x, y) {
		// shifts the position by x, y
		this.x += x;
		this.y += y;
		return this;
	},
	add: function(p) {
		// adds two points together
		this.x += p.x;
		this.y += p.y;
		return this;
	},
	subtract: function(p) {
		// subtracts the given point from this
		this.x -= p.x;
		this.y -= p.y;
		return this;
	},
	multiply: function(value) {
		// multiplies each axis by the given value
		this.x *= value;
		this.y *= value;
		return this;
	},
	divide: function(value) {
		// divides each axis by the given value
		this.x /= value;
		this.y /= value;
		return this;
	},
	distanceTo: function(p) {
		// determines the distance between two points
		return Math.sqrt(this.distanceTo2(p));
	},
	distanceTo2: function(p) {
		// determines the distance squared between two points
		// (useful for faster operations)
		var dx = this.x - p.x,
			dy = this.y - p.y;
		return dx * dx + dy * dy;
	},
	isWithinDistance: function(p, d) {
		// returns true if the point is within the given distance
		if (isNaN(d)) return false;
		var dx = this.x - p.x,
			dy = this.y - p.y;
		return d * d > dx * dx + dy * dy;
	},
	isZero: function() {
		// returns true if both axis' are zero
		return this.x == 0 && this.y == 0;
	},
	isAlmostZero: function(thresh) {
		// returns true if both axis' are within the given threshhold
		if (isNaN(thresh)) thresh = 0.0001;
		return Math.abs(this.x) < thresh && Math.abs(this.y) < thresh;
	},
	directionTo: function(p) {
		// calculates the angle between two points
		return Math.atan2(p.y - this.y, p.x - this.x);
	},
	setPosition: function(x, y) {
		// repositions the point
		if (isNaN(x)) x = 0;
		if (isNaN(y)) y = 0;
		this.x = x;
		this.y = y;
		return this;
	},
	gridSnap: function(pixels) {
		// locks the item to a designated grid size
		this.x = Math.round(this.x / pixels) * pixels;
		this.y = Math.round(this.y / pixels) * pixels;
		return this;
	},
	ease: function(dest, percent) {
		// moves the given percentage towards the specified point
		this.x = dest.x * percent + this.x * (1 - percent);
		this.y = dest.y * percent + this.y * (1 - percent); 
	},
	copy: function(p) {
		// repositions the point to match the given point
		this.x = p.x;
		this.y = p.y;
		return this;
	},
	clone: function() {
		// returns a duplicate of this point
		return new LAD.Point(this.x, this.y);
	},
	toString: function() {
		return "("+ this.x + "," + this.y + ")";
	}
});

/*
	LAD.Vector extends LAD.Point to include methods for vector math
	operations. eg. length and angle operations.
*/
LAD.Vector = LAD.Point.extend({
	init: function(x, y) {
		this.uber(x, y);
	},
	setVector: function(angle, length) {
		// sets the x and y according to length and angle from 0,0
		this.x = Math.cos(angle) * length;
		this.y = Math.sin(angle) * length;
		return this;
	},
	getLength: function() {
		// returns the distance to 0,0
		return Math.sqrt(this.getLength2());
	},
	getLength2: function() {
		// returns the distance, squared to 0,0
		// faster for comparison usage
		return this.x * this.x + this.y * this.y;
	},
	setLength: function(length) {
		// sets x and y according to current angle at new length
		return this.setVector(this.getAngle(), length);
	},
	getAngle: function() {
		// returns the angle of x and y from 0,0
		return Math.atan2(this.y, this.x);
	},
	setAngle: function(angle) {
		// sets the new angle of x and y at current length
		return this.setVector(angle, this.getLength());
	},
	invert: function() {
		// turns the vector around
		this.x *= -1;
		this.y *= -1;
		return this;
	},
	clone: function() {
		// returns a duplicate of this vector
		return new LAD.Vector(this.x, this.y);
	}
});

/*
	LAD.Transform extends LAD.Point to include scale and rotation
	properties.
*/
LAD.Transform = LAD.Point.extend({
	init: function(x, y, scale, rotation) {
		this.uber(x, y);
		if (isNaN(scale)) scale = 1;
		if (isNaN(rotation)) rotation = 0;
		this.scale = scale;
		this.rotation = rotation;
	},
	reset: function() {
		// returns values to their unaffected, default state
		this.uber();
		this.scale = 1;
		this.rotation = 0;
		return this;
	},
	add: function(t) {
		// adds a transform to this
		this.uber(t);
		if (!isNaN(t.scale)) this.scale *= t.scale;
		if (!isNaN(t.rotation)) this.rotation += t.rotation;
		return this;
	},
	subtract: function(t) {
		// subtracts a transform from this
		this.uber(t);
		if (!isNaN(t.scale)) this.scale /= t.scale;
		if (!isNaN(t.rotation)) this.rotation -= t.rotation;
		return this;
	},
	copy: function(t) {
		// copies all properties from another transform
		this.uber(t);
		if (!isNaN(t.scale)) this.scale = t.scale;
		if (!isNaN(t.rotation)) this.rotation = t.rotation;
		return this;
	},
	copyPosition: function(p) {
		// copies only the position of the given point
		this.x = p.x;
		this.y = p.y;
		return this;
	},
	ease: function(dest, percent) {
		// moves all properties the given percentage towards the 
		// given destination
		this.uber(dest, percent);
		if (!isNaN(dest.scale)) {
			this.scale = dest.scale * percent + this.scale * (1-percent);
		}
		if (!isNaN(dest.rotation)) {
			if (Math.abs(dest.rotation - this.rotation) > Math.PI)
				this.rotation += dest.rotation > this.rotation ? Math.PI*2 : Math.PI*-2;
			this.rotation = dest.rotation * percent + this.rotation * (1-percent);
		}
		return this;
	},
	clone: function() {
		// returns a duplicate of this transform
		return new LAD.Transform(this.x, this.y, this.scale, this.rotation);
	}
});

/*
	LAD.Rectangle is used for bounds and rectangle operations.
*/
LAD.Rectangle = LAD.Class.extend({
	init: function(x, y, width, height) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
	},
	getLeft: function() {
		// returns the leftmost side of the rectangle
		return this.x < this.width ? this.x : this.width;
	},
	getRight: function() {
		// returns the rightmost side of the rectangle
		return this.x > this.width ? this.x : this.width;
	},
	getTop: function() {
		// returns the topmost side of the rectangle
		return this.y < this.height ? this.y : this.height;
	},
	getBottom: function() {
		// returns the bottommost side of the rectangle
		return this.y > this.height ? this.y : this.height;
	},
	isWithin: function(p) {
		// returns true if the given point is within this rectangle
		return p.x > this.left 
			&& p.y > this.top
			&& p.x < this.right
			&& p.y < this.bottom;
	}
});

/*
	LAD.Path is used to render vector paths. Paths are given fill
	colors, line colors, line widths and a series of points.
*/
LAD.Path = LAD.Class.extend({
	init: function(fillColor, lineColor, lineWidth, points, closed){
		this.fillColor = fillColor;
		this.lineColor = lineColor || "black";
		this.lineWidth = lineWidth > 0 ? lineWidth : 0;
		this.points = points;
		this.closed = closed || false;
	},
	add: function(px, py, index) {
		// adds a point to the path at the specifed (or next) index
		var p;
		if (!isNaN(px)) {
			p = new LAD.Point();
			p.x = px;
			p.y = py;
		} else p = px;
		if (!this.points) this.points = [];
		if (index >= 0) this.points.splice(index, 0, p);
		else this.points.push(p);
		return p;
	},
	remove: function(p){
		// removes a point from the path
		var i = this.points.length;
		while (i-- > 0) {
			if (this.points[i] != p) continue;
			this.points.splice(i, 1);
			break;
		}
		return p || null;
	},
	addCircle: function(x, y, radius, points) {
		// creates a circle with given points (or 16) with given radius
		if (isNaN(points)) points = 16;
		var ang = Math.PI * 2,
			seg = ang / points;
		while (ang > 0) {
			this.add(Math.cos(ang)*radius + x, Math.sin(ang)*radius + y);
			ang -= seg;
		}
	},
	addBox: function(x, y, width, height) {
		// creates a rectangle (four points)
		this.add(x, y);
		this.add(x + width, y);
		this.add(x + width, y + height);
		this.add(y, y + height);
	},
	render: function(r, t) {
		// renders the path
		if (this.points.length < 2) return;
		var cos, sin, c = r.context;
		
		var filling = this.fillColor != null,
			stroking = this.lineWidth > 0,		
			cos = Math.cos(t.rotation) * t.scale;
			sin = Math.sin(t.rotation) * t.scale;
		
		if (filling) c.fillStyle = this.fillColor;
		if (stroking) c.strokeStyle = this.lineColor;
		c.beginPath();
		
		var points = this.points.slice();
		if (closed) points.push(points[0]);
		var p, px, py, len = points.length, i = -1;
		while(++i < len) {
			p = points[i];
			px = p.x * cos - p.y * sin + t.x;
			py = p.x * sin + p.y * cos + t.y;
			if (i == 0) c.moveTo(px, py);
			else c.lineTo(px, py);
		}
		if (filling) c.fill();
		if (stroking) c.stroke();
	},
	getBounds: function() {
		// returns a new rectangle with the boundaries of this path
		var l, r, b, t, i = this.points.length;
		if (i > 0) {
			var p;
			while (i-- > 0) {
				p = points[i];
				if (isNaN(l) || p.x < l) l = p.x;
				if (isNaN(r) || p.x > r) r = p.x;
				if (isNaN(t) || p.y < t) t = p.y;
				if (isNaN(b) || p.y > b) b = p.y;
			}
			return new LAD.Rectangle(l, t, r-l, b-t);
		} else return new LAD.Rectangle();
	}
});

/*
	LAD.Group is used to combine multiple paths into a single render
	operation.
*/
LAD.Group = LAD.Class.extend({
	init: function(paths) {
		this.paths = paths || [];
	},
	add: function(path, index){
		// adds a path at the given (or next) index
		if (!this.paths) this.paths = [];
		if (index >= 0) this.paths.splice(index, 0, path);
		else this.paths.push(path);
		return path;
	},
	remove: function(path){
		// removes the path from the group
		var i = -1, len = this.paths.length;
		while (++i < len) {
			if (this.paths[i] != path) continue;
			this.paths.splice(i, 1);
			break;
		}
		return path || null;
	},
	render: function(r, t) {
		// renders all paths
		var i = -1, len = this.paths.length;
		while (++i < len) {
			this.paths[i].render(r, t);
		}
	},
	getBounds: function() {
		// returns a new rectangle with the boundaries of this group
		var l, r, b, t, i = paths.length;
		if (i > 0) {
			var rect;
			while (i-- > 0) {
				rect = paths[i].getBounds();
				if (isNaN(l) || rect.getLeft() < l) l = rect.getLeft();
				if (isNaN(t) || rect.getTop() < t) t = rect.getTop();
				if (isNaN(r) || rect.getRight() > r) r = rect.getRight();
				if (isNaN(b) || rect.getBottom() > b) b = rect.getBottom();
			}
			return new LAD.Rectangle(l, t, r, b);
		} else return new LAD.Rectangle();
	}
});

/*
	LAD.Sprite is used to render portions of a spritesheet. It uses a
	transform object, bounds rectangle and anchor point to discern
	what and where to render.
*/
LAD.Sprite = LAD.Class.extend({
	init: function(image, clipRect, anchor) {
		this.image = image;
		this.clipRect = clipRect;
		this.anchor = anchor || new LAD.Point();
		this.alpha = 1;
	},
	render: function(r, t) {
		// renders the sprite with the given transformation
		if (!this.image) return;
		var c = r.context;
		c.globalAlpha = this.alpha;
		c.drawImage(this.image, 
			this.clipRect.x, 
			this.clipRect.y, 
			this.clipRect.width, 
			this.clipRect.height, 
			Math.round(t.x - this.anchor.x),
			Math.round(t.y - this.anchor.y),
			this.clipRect.width, 
			this.clipRect.height);
	},
	toString: function() {
		return (this.image ? "Image" : "No Image") + ": " + this.clipRect.x + "," + this.clipRect.y + " " + this.clipRect.width + "x" + this.clipRect.height;
	}
});

/*
	LAD.SpriteGrid allow for a collection of sprites on a given
	spritesheet to be rendered according to column and row. All sprites
	must be the same dimensions and placed in sequence along their
	respective axis'.
*/
LAD.SpriteGrid = LAD.Class.extend({
	init: function(image, frameRect, numCols, numRows, anchor) {
		this.numCols = numCols > 1 ? numCols : 1;
		this.numRows = numRows > 1 ? numRows : 1;
		this.frameRect = frameRect;
		this.anchor = anchor;
		this.col = 0;
		this.row = 0;	
		this.sprites = [];
		this.alpha = 1;
		var sprite, x, y, c, r;		
		for (r = 0; r < numRows; r++)
		for (c = 0; c < numCols; c++) {
			x = frameRect.x + frameRect.width * c;
			y = frameRect.y + frameRect.height * r;
			sprite = new LAD.Sprite(image, new LAD.Rectangle(x, y, frameRect.width, frameRect.height), anchor);
			this.sprites.push(sprite);
		}
	},
	getSprite: function(col, row) {
		// returns the sprite at the given grid co-ordinates
		if (isNaN(col)) col = this.col;
		if (isNaN(row)) row = this.row;
		return this.sprites[row * this.numCols + col];
	},
	render: function(r, t) {
		// renders the current sprite with the given transformation
		var sprite = this.getSprite(this.col || 0, this.row || 0);
		sprite.alpha = this.alpha;
		sprite.render(r, t);
	},
});

/*
	LAD.Entity is the base class for any object that is to be added to
	the scene. LAD.Entity classes are called each update and render.
	The following methods are automatically called:
		- awake: the first time the entity is added
		- start: each time the engine resumes
		- update: every game update tick
		- render: each frame
*/
LAD.Entity = LAD.Class.extend({
	init: function() {
		this.transform = new LAD.Transform();	
		this.prevTransform = this.transform.clone();		
		this.renderTransform = new LAD.Transform();
	},
	callStart: function() {
		// calls awake on first run only
		if (this.isAwake != true) {
			// declares whether updateable and/or renderable
			this.hasUpdate = LAD.isFunction(this.update);
			this.hasRender = LAD.isFunction(this.render);
			if (LAD.isFunction(this.awake)) this.awake();
			this.isAwake = true;
		}
		// calls start each run
		if (LAD.isFunction(this.start)) this.start();
		this.prevTransform.copy(this.transform);
	},
	callUpdate: function() {
		// calls the update function, if it exists
		if (this.hasUpdate) this.update();
		this.prevTransform.copy(this.transform);
	},
	callRender: function(r) {
		// calls the render function, if it exists
		this.calcRender(r);
		if (this.hasRender) this.render(r);
	},
	calcRender: function(r) {
		// calculates the render transformation 
		// (interpolates between previous and current transformation)
		var t = this.renderTransform;
		t.copy(this.prevTransform).ease(this.transform, r.percent);
		if (this.parent) t.add(this.parent.renderTransform);
	},
	onCollision: function(entity) {
		// a blank collision handler for overriding
	},
	render: function(r) {
		// renders a clip, if specified with the render transfromation
		if (this.clip == null) return;
		this.clip.render(r, this.renderTransform);
	}
});

/*
	LAD.Scene is used to contain all entity objects. It automatically
	calls awake, start, update and render on all objects within.
*/
LAD.Scene = LAD.Entity.extend({
	init: function() {
		this.uber();
		this.entities = [];
	},
	add: function(entity, index) {
		// adds the entity to the scene at the given (or next) index
		if (entity.parent == this) return;
		if (entity.parent) entity.parent.remove(entity);
		entity.scene = this;
		entity.parent = this;
		entity.game = this.game;
		if (this.game && this.game.playing) entity.callStart();
		if (index >= 0) this.entities.splice(index, 0, entity);
		else this.entities.push(entity);
		return entity;
	},
	remove: function(entity) {
		// removes the entity from the scene
		var i = this.entities.length;
		while (i-- > 0) {
			if (this.entities[i] != entity) continue;
			this.entities.splice(i, 1);
			entity.scene = null;
			entity.parent = null;
			break;
		}
		return entity;
	},
	callStart: function() {
		// calls start on scene, then entities within
		this.uber();
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].callStart();
		}		
	},
	callUpdate: function() {
		// calls update on scene, then entities within
		this.uber();
		var updating = this.entities.slice();
		var i = updating.length;
		while (i-- > 0) {
			updating[i].callUpdate();
		}
	},
	callRender: function(r) {
		// calls render on scene, then entities within
		this.uber(r);
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].callRender(r);
		}
	},
	replace: function(oldEntity, entity) {
		// replaces an entity in the scene with one not in the scene
		var i = this.entities.length;
		while (i-- > 0) {
			if (this.entities[i] != oldEntity) continue;
			this.remove(oldEntity)
			return this.add(entity, i);
		}
		return null;
	},
	contains: function(entity) {
		// returns true if the scene contains the entit
		var i = this.entities.length;
		while (i-- > 0) {
			if (this.entities[i] == entity) return true;
		}
		return false;
	}
});