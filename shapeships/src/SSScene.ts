import { Scene } from "lad/scene/Scene";
import { SSGame, SSScreens } from "./SSGame";
import { SSGrid } from "./SSGrid";
import { SSPlayerShip } from "./SSPlayerShip";
import { Renderer } from "lad/display/Renderer";
import { SSEntity } from "./SSEntity";
import { Entity } from "lad/scene/Entity";
import { SSShip } from "./SSShip";
import { SSExplosion } from "./SSExplosion";
import { Point } from "lad/math/Point";

/*
	SSScene extends Scene to include game-specific collision
	detection, spawning and other map-level operations.
*/
export class SSScene extends Scene {

    game: SSGame;
    grid = new SSGrid();
    ship = new SSPlayerShip();
    ableState = "";
    frames = 0;
    deadFrames = 0;

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
		if (p.x > 100) p.x = 100;
		if (p.y > 100) p.y = 100;
		let xmax = r.width - this.grid.width - 100;
		let ymax = r.height - this.grid.height - 100;
		if (p.x < xmax) p.x = xmax;
		if (p.y < ymax) p.y = ymax;
		
		this.frames++;
		
		// handle states
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
    
	render(r: Renderer) {
		this.game.hud.render(
            r, 
            this.game.score.score, 
            this.game.score.multi, 
            this.game.wave.wave, 
            this.game.score.lives
        );
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
		let colliders: SSEntity[] = this.entities.filter(e => e instanceof SSEntity && e.hitRadius > 0) as SSEntity[];
		i = colliders.length;
		while (i-- > 0) {
			ea = colliders[i];
			j = i;
			while (j-- > 0) {
				eb = colliders[j];
				if (!ea.scene || !eb.scene) return;
				if (!ea.transform.p.isWithinDistance(eb.transform.p, ea.hitRadius + eb.hitRadius)) continue;
				ea.onCollision(eb);
				eb.onCollision(ea);
			}
		}
    }
    
	updateSpawn() {
		if (this.ableState == "dead") return;
		if (this.game.wave.enemiesKilled >= this.game.wave.enemies) {
			this.game.wave.next();
			return;
		}
		if (this.game.wave.enemiesSpawned >= this.game.wave.enemies) return;
		if (this.frames % this.game.wave.spawnFrames == 0) this.spawnEnemy();
    }
    
	updateDead() {
		if (this.deadFrames-- > 0) return;
		if (this.game.score.lives > 0) this.respawn();
		else this.game.setScene(SSScreens.end);
    }
    
	spawnPlayer() {
		if (this.ableState == "dead") return;
		this.add(this.ship);
		this.ship.reset();
		this.ship.transform.p.x = this.grid.width * 0.5;
		this.ship.transform.p.y = this.grid.height * 0.5;
    }
    
	spawnEnemy() {
		let p
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
    
	kill(e: Entity) {
		this.game.score.score += 100 * this.game.score.multi;
		this.explode(e);
		this.game.wave.enemiesKilled++;
    }
    
	explode(e: Entity) {
        if (e instanceof SSShip === false) {
            return;
        }
		let parts = Math.ceil(Math.random()*8)+4;
        let speed = 10;
        let explosion = new SSExplosion(parts, speed);
        explosion.transform.p.copy(e.transform.p);
        e.remove();
        this.add(explosion);
    }
    
	die() {
		if (this.ableState == "dead") return;
		this.ableState = "dead";
		for (let i = 0; i < this.entities.length; i++) {
			this.explode(this.entities[i]);
		}
		this.deadFrames = 80;
		this.game.score.lives--;
    }
    
	getRandomWallPosition() {
		let p = new Point();
		if (Math.random() > 0.5) {
			p.x = Math.random() * this.grid.width;
			p.y = Math.random() > 0.5 ? 0 : this.grid.height;
		} else {
			p.y = Math.random() * this.grid.height;
			p.x = Math.random() > 0.5 ? 0 : this.grid.width;
		}
		return p;
    }
    
	constrain(e: Entity) {
		if (e.transform.p.x < 0) e.transform.p.x = 0;
		if (e.transform.p.y < 0) e.transform.p.y = 0;
		if (e.transform.p.x > this.grid.width) e.transform.p.x = this.grid.width;
		if (e.transform.p.y > this.grid.height) e.transform.p.y = this.grid.height;
    }
    
	isWithin(e: Entity) {
		return e.transform.p.x > 0 
			&& e.transform.p.y > 0 
			&& e.transform.p.x < this.grid.width 
			&& e.transform.p.y < this.grid.height;
	}
}