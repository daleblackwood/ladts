import { Transform } from "../math/Transform";
import { Renderer } from "../display/Renderer";
import { Scene } from "./Scene";
import { Game } from "./Game";

/*
	LAD.Entity is the base class for any object that is to be added to
	the scene. LAD.Entity classes are called each update and render.
	The following methods are automatically called:
		- awake: the first time the entity is added
		- start: each time the engine resumes
		- update: every game update tick
		- render: each frame
*/
export enum EntityState {
	INIT,
	AWAKE,
	ENABLED,
	DISABLED,
	REMOVING
}

export class Entity {

    public transform = new Transform();	
    public prevTransform = this.transform.clone();		
    public renderTransform = new Transform();
    public parent: Entity | null = null;
    public clip: any = null;
	public scene: Scene | null = null;
	public game: Game | null = null;
	public entityState: EntityState = EntityState.INIT;

	/**
	 * Called when the entity is initiated
	 */
	public awake() {}
	
	/**
	 * Called on the first update for the entity
	 */
	public start() {}
	
	/**
	 * Called every game tick
	 */
    public update() {}
	
	/**
	 * Called every render, renders a clip, if specified with the render transformation
	 */
	public render(r: Renderer) {
		if (this.clip == null) {
			return;
		}
		this.clip.render(r, this.renderTransform);
	}

	public setEnabled(enabled: boolean) {
		this.entityState = enabled ? Math.min(this.entityState, EntityState.ENABLED) : EntityState.DISABLED;
	}
	
	/**
	 * Called every game tick
	 */
	public remove() {
		this.entityState = EntityState.REMOVING;
	}

	/**
	 * Called every collision (placeholder)
	 */
	public onCollision(entity: Entity) {}

	public callAwake() {
		// calls awake on first run only
		if (this.entityState < EntityState.AWAKE) {
            // declares whether updateable and/or renderable
            this.awake();
		}
		this.entityState = EntityState.AWAKE;
		this.prevTransform.copy(this.transform);
    }
    
	public callUpdate() {
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
    
	public callRender(r: Renderer) {
		if (this.entityState != EntityState.ENABLED) {
			return;
		}
		// calls the render function, if it exists
        this.calcRender(r);
        this.render(r);
    }
    
	public calcRender(r: Renderer) {
		// calculates the render transformation 
		// (interpolates between previous and current transformation)
		let rt = this.renderTransform;
		rt.copy(this.prevTransform).ease(this.transform, r.percent);
		if (this.parent) {
			rt.add(this.parent.renderTransform);
		}
    }
}