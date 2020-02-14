import { Rect } from "../math/Rect";
import { Point, IPoint } from "../math/Point";
import { Renderer } from "./Renderer";
import { Transform } from "../math/Transform";
import { IClip } from "./IClip";
import { EntityComponent } from "lad/scene/Entity";

/*
	LAD.Sprite is used to render portions of a spritesheet. It uses a
	transform object, bounds rectangle and anchor point to discern
	what and where to render.
*/
export interface ISpriteClip {
	name?: string,
	frameX: number;
	frameY: number;
	frames?: number;
	fps?: number;
}

export class SpriteClip implements ISpriteClip {
	constructor(
		public name: string = "default",
		public frameX: number = 0,
		public frameY: number = 0,
		public frames: number = 0,
		public fps: number = 15
	) {}

	copy(other: ISpriteClip) {
		this.name = other.name || this.name;
		this.frameX = Number(other.frameX) || 0;
		this.frameY = Number(other.frameY) || 0;
		this.frames = Math.max(Number(other.frames) || 0, 1);
		this.fps = Number(other.fps) || 15;
		return this;
	}

	clone(): SpriteClip {
		return new SpriteClip().copy(this);
	}
}

export class Sprite implements IClip {

	image: HTMLImageElement;
    clipRect: Rect;
    anchor: Point;
	alpha: number;
	isPlaying = false;
	get frameX() { return this.clipPlaying.frameX }
	get frameY() { return this.clipPlaying.frameY }
	
	public clipDefault = new SpriteClip("default");
	private clipPlaying = new SpriteClip("playing");
	private clips: { [key: string] : SpriteClip } = {};
	private time = 0;
	private frame = 0;
	private lastFrameTime = 0;

	constructor(image: HTMLImageElement, options? : { 
		clipRect?: Rect,
		anchor?: Point,
		alpha?: number,
		clip?: ISpriteClip,
	}) {
		this.image = image;
		options = options || {};
		this.clipRect = options.clipRect || new Rect(0, 0, image.width, image.height);
		this.anchor = options.anchor || new Point();
		this.alpha = 1;
		this.setDefaultClip(options.clip || new SpriteClip("default", 0, 0));
	}
	
	setDefaultClip(clip: ISpriteClip) {
		this.clipDefault.copy(clip);
		this.clipPlaying.copy(clip);
	}
	
	addClip(key: string, clip: ISpriteClip, makeDefault: boolean = false) {
		this.clips[key] = new SpriteClip(key).copy(clip);
		if (makeDefault) {
			this.setDefaultClip(clip);
		}
	}

	setClip(clipOrClipName: SpriteClip|string|null, play: boolean = true) {
		if (typeof clipOrClipName === "string") {
			clipOrClipName = this.getClip(clipOrClipName);
		}
		if (! clipOrClipName) {
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

	getClip(clipName: string): SpriteClip|null {
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
	
	render(r: Renderer, t: Transform, anchorOverride?: IPoint) {
		this.animate();
		// renders the sprite with the given transformation
		if (! this.image) {
			return;
		}
		let c = r.context;
		c.globalAlpha = this.alpha;

		const anchor = new Point().copy(anchorOverride || this.anchor);
		const rect = this.clipRect.clone();
		rect.move(
			(this.clipPlaying.frameX + this.frame) * this.clipRect.width,
			(this.clipPlaying.frameY) * this.clipRect.height
		);
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

		//const ct = c.getTransform();
		c.scale(appliedScaleX, appliedScaleY);
		c.drawImage(this.image, 
			rect.left, rect.top, rect.width, rect.height, 
			x, y, w, h
		);
		c.resetTransform();
	}
	
	getRect(): Rect {
		return this.clipRect.clone().move(
			this.clipRect.width * -this.anchor.x, 
			this.clipRect.height * -this.anchor.y
		);
	}

	copy(sprite: Sprite) {
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

	clone(): Sprite {
		return new Sprite(this.image).copy(this);
	}
    
	toString() {
		return (this.image ? "Image" : "No Image") + ": " + this.clipRect.left + "," + this.clipRect.top + " " + this.clipRect.width + "x" + this.clipRect.height;
	}
}