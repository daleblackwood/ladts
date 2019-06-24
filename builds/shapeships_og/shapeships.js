/*
	LAD.js DEMO: SHAPESHIPS
	-----------------------
	Version 0.9
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
	SS is an object that acts as a namespace for all classes in the 
	Shapeships demo.
*/
let SS = {};

/*
	SS.Game extends LAD.Game to include key bindings, mouse binding,
	input and some game specific properties.
*/
SS.Game = LAD.Game.extend({
	init: function(canvasName) {
		this.uber(canvasName, 120);
		this.hud = new SS.HUD(this);	
		this.keys = {
			up: 87, // W
			left: 65, // A
			down: 83, // S
			right: 68, // D
			shootUp: 38, // UP
			shootDown: 40, // DOWN
			shootLeft: 37, // LEFT
			shootRight: 39, // RIGHT
			shootStraight: 32, //SPACE
			confirm: 13, // ENTER
		};
		this.mouse = {
			shoot: 0
		};
		this.input = new SS.Input();
		this.wave = new SS.Wave();
		this.score = new SS.Score();
		this.setScene(new SS.TitleScreen());
	}
});

/*
	SS.Input extends LAD.MultiInput to include anglular detect on
	multiple devices.
*/
SS.Input = LAD.MultiInput.extend({	
	init: function(player) {
		this.uber();
		this.player = player;
	},
	getMoveAngle: function() {
		return this.getAngle("left", "up", "right", "down");
	},
	getShootAngle: function() {
		if (!this.isPressed("shoot")) {
			return this.getAngle("shootLeft", "shootUp", "shootRight", "shootDown");
		} else {
			let t = this.player.renderTransform;
			let dx = this.mouse.x - t.x;
			let dy = this.mouse.y - t.y;
			return Math.atan2(dy, dx);
		}
	},
	getAngle: function(leftName, upName, rightName, downName) {
		let left = this.isPressed(leftName),
			up = this.isPressed(upName),
			right = this.isPressed(rightName),
			down = this.isPressed(downName);
		if (up && left) return Math.PI * -0.75;
		if (up && right) return Math.PI * -0.25;
		if (down && left) return Math.PI * 0.75;
		if (down && right) return Math.PI * 0.25;
		if (up) return Math.PI * -0.5;
		if (down) return Math.PI * 0.5;
		if (left) return Math.PI;
		if (right) return 0;
		return NaN;
	},
});

/*
	SS.Score keeps track of the player's current score, lives and 
	multiplier.
*/
SS.Score = LAD.Class.extend({
	init: function() {
		this.reset();
	},
	reset: function() {
		this.score = 0;
		this.multi = 1;
		this.lives = 3;
	},
	increaseMulti: function() {
		this.multi++;
	}
});

/*
	SS.Wave determines the number of enemies, their spawn speed and
	which types are displayed for each wave in the game.
*/
SS.Wave = LAD.Class.extend({
	init: function() {
		this.reset();
	},
	reset: function() {
		this.setWave(1);
	},
	next: function() {
		this.setWave(this.wave + 1);
	},
	prev: function() {
		this.setWave(this.wave - 1);
	},
	again: function() {
		this.setWave(this.wave);
	},
	setWave: function(wave) {
		this.spawnFrames = this.getSpawnFrames();
		this.enemies = Math.floor(wave*0.5) + 3;
		this.enemiesSpawned = 0;
		this.enemiesKilled = 0;
		this.enemySpeed = 5 + (wave * 0.3);
		this.wave = wave;
		this.enemyTypes = this.getEnemyTypes();
	},
	getSpawnFrames: function() {
		let wave = this.wave;
		if (wave < 2) return 80;
		if (wave < 5) return 60;
		if (wave < 8) return 40;
		if (wave < 10) return 30;
		if (wave < 15) return 20;
		if (wave < 20) return 15;
		if (wave < 30) return 10;
		return 5;
	},
	getEnemyTypes: function() {
		let wave = this.wave;
		let result = [SS.BounceShip];
		if (wave > 3) result.push(SS.ChaserShip);
		return result;
	},
	getRandomEnemy: function() {
		return this.enemyTypes[Math.floor(Math.random()*this.enemyTypes.length)];
	},
	getSuccess: function() {
		let wave = this.wave;
		if (wave > 2) {
			let type;
			if (wave > 30) type = "IMPOSSIBLE";
			else if (wave > 20) type = "IMPROBABLE";
			else if (wave > 15) type = "AMAZING";
			else if (wave > 10) type = "GREAT";
			else if (wave > 8) type = "GOOD";
			else if (wave > 5) type = "DECENT";
			else if (wave > 5) type = "SOME";
			else type = "FLEETING";
			return "YOU LASTED " + (wave-1) + " WAVES - " + type + " SUCCESS!"
		} else if (wave == 2) {
			return "YOU MADE IT THROUGH A SINGLE WAVE";
		} else {
			return "YOU COULDN'T LAST A SINGLE WAVE";
		}
	}
});

/*
	SS.Grid displays a grid for the map (behind the player).
*/
SS.Grid = LAD.Entity.extend({
	init: function() {
		this.uber();
		let gridSize = 80;
		let cols = 15;
		let rows = 15;
		let odd = false;
		let width = gridSize * cols;
		let height = gridSize * rows;
		
		let p = new LAD.Path(null, "#ACE", 2);
		let a, b;
		let pos = gridSize;
		while (pos <= width) {
			odd = !odd;
			a = odd ? height : 0;
			b = odd ? 0 : height;
			p.add(pos, a);
			p.add(pos, b);
			pos += gridSize;
		}
		pos = height;
		while (pos > 0) {
			
			a = odd ? width : 0;
			b = odd ? 0 : width;
			p.add(a, pos);
			p.add(b, pos);
			pos -= gridSize;
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
		this.gridSize = gridSize;
	}
});

/*
	SS.Ship acts as a base class for all ships and bullets in the game.
*/
SS.Ship = LAD.Entity.extend({
	init: function() {
		this.uber();
		this.speed = 10;
		this.enemy = false;
		this.ship = true;
		this.move = new LAD.Vector(0, -1);
		this.moveDelta = new LAD.Vector(0, -1);
		this.origin = new LAD.Point();
		this.hitRadius = 20;
	},
	update: function() {
		this.transform.add(this.move);
	},
	onCollision: function(e) {}
});

SS.Bullet = SS.Ship.extend({
	init: function() { 
		this.uber(); 
		this.hitRadius = 20;
		this.enemy = false;
		
		let p = new LAD.Path("#468");
		p.add(-5,-3);
		p.add(0, -7);
		p.add(5,-3);
		p.add(5, 5);
		p.add(-5, 5);
		p.closed = true;
		this.clip = p;
	},
	go: function(angle, speed) {
		this.move.setVector(angle, speed);
		this.transform.rotation = angle + Math.PI * 0.5;
	},
	update: function() {
		this.uber();
		if (this.scene.isWithin(this)) return;
		this.scene.remove(this);
	},
	onCollision: function(e) {
		if (e == this.scene.ship || e.enemy != true) return;
		this.scene.kill(e);
	}
});

/*
	SS.PlayerShip extends SS.Ship to include player control and input
	responses.
*/
SS.PlayerShip = SS.Ship.extend({
	init: function() {
		this.uber();
		this.speed = 16;
		this.fireSpeed = 30;
		this.shootFrames = 4;
		this.smokeFrames = 4;
		this.hitRadius = 24;
		this.enemy = false;
		this.bullets = [];
		this.smokes = [];
	},
	awake: function() {
		this.input = this.game.input;
		this.input.keyboard.addActions(this.game.keys);
		this.input.mouse.addActions(this.game.mouse);
		this.input.player = this;
		this.draw();
	},
	draw: function() {
		let s = new LAD.Group();
	
		let p = new LAD.Path("#DDA", "#999", 1);
		p.add(-16, 24);
		p.add(0, -24);
		p.add(16, 24);
		p.add(0, 18);
		p.add(-16, 24);
		p.closed = true;
		s.add(p);
		
		p = new LAD.Path("#FFF");
		p.add(-10, 12);
		p.add(-16, 24);
		p.add(0,0);
		p.closed = true;
		s.add(p);
		
		p = new LAD.Path("#FFF");
		p.add(10, 12);
		p.add(16, 24);
		p.add(0,0);
		p.closed = true;
		s.add(p);
		
		p = new LAD.Path("#AAA");
		p.add(0, -24);
		p.add(-1, 24);
		p.add(1, 24);
		p.closed = true;
		s.add(p);
		
		this.clip = s;
	},
	start: function() {
		this.reset();
	},
	reset: function() {
		this.transform.rotation = 0;
		this.move.setPosition(0, -1);
		this.moveDelta.copy(this.move);
		this.frame = 0;
	},
	update: function() {
		let moveAngle = this.game.input.getMoveAngle();
		
		if (isNaN(moveAngle)) this.moveDelta.reset();
		else this.moveDelta.setVector(moveAngle, this.speed);
		this.move.ease(this.moveDelta, 0.2);
		
		let rot = this.origin.directionTo(this.move);
		this.transform.rotation = rot + Math.PI * 0.5;
		this.transform.add(this.move);
		
		this.scene.constrain(this);
		
		// shoot
		let shootAngle = this.game.input.isPressed("shootStraight") ? rot : this.game.input.getShootAngle();	
		if (shootAngle && !this.shootAngle) this.shootAngle = shootAngle;
		if (shootAngle && this.shootAngle) shootAngle = (shootAngle*7 + this.shootAngle) * 0.125;
		
		if (this.frame % this.shootFrames == 0 && !isNaN(shootAngle)) {
			if (this.shootAngle - shootAngle > Math.PI) this.shootAngle -= Math.PI * 2;
			this.shoot(shootAngle);
		}
		this.shootAngle = shootAngle;
		
		//smoke
		if (this.frame % this.smokeFrames == 0 && !isNaN(moveAngle)) this.smoke();
		
		this.frame++;
	},
	shoot: function(angle) {
		let bullet = this.bullets.length > 10 ? this.bullets.shift() : new SS.Bullet();
		bullet.transform.copy(this.prevTransform);
		bullet.go(angle, this.fireSpeed);
		if (!bullet.scene) this.scene.add(bullet, 1);
		this.bullets.push(bullet);
	},
	smoke: function() {
		let smoke = this.smokes.length > 8 ? this.smokes.shift() : new SS.SmokePart();
		smoke.go(this.transform.rotation + Math.PI * 0.5)
		smoke.transform.copy(this.prevTransform);
		if (!smoke.scene) this.scene.add(smoke, 1);
		this.smokes.push(smoke);
	}
});

/*
	SS.ChaserShip is an enemy ship that follows the player's ship.
*/
SS.ChaserShip = SS.Ship.extend({
	init: function() {
		this.uber();
		this.speed = 10;
		this.hitRadius = 15;
		this.move = new LAD.Point(0, -1);
		this.moveDelta = new LAD.Point(0, -1);
		this.origin = new LAD.Point();
		this.enemy = true;
		this.draw();
	},
	draw: function() {
		let s = new LAD.Group();
		
		let p = new LAD.Path("#E44", 0, 0);
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
		
		p = new LAD.Path("#666", 0, 0);
		p.add(0,10);
		p.add(10,0);
		p.add(0,-10);
		p.add(-10,0);
		p.closed = true;
		s.add(p);
		
		this.clip = s;
	},
	update: function() {
		let target = this.scene.ship;
		let moveAngle = target.transform.directionTo(this.transform) + Math.PI;
		
		this.moveDelta.x = Math.cos(moveAngle) * this.speed;
		this.moveDelta.y = Math.sin(moveAngle) * this.speed;

		this.move.x = (this.move.x * 4 + this.moveDelta.x) * 0.2;
		this.move.y = (this.move.y * 4 + this.moveDelta.y) * 0.2;
		
		let rot = this.origin.directionTo(this.move);
		this.transform.rotation = rot + Math.PI * 0.5;
		this.transform.add(this.move);
		
		this.scene.constrain(this);
	},
	onCollision: function(e) {
		if (!this.scene) return;
		if (e == this.scene.ship) {
			this.scene.die();
			return;
		}
		if (e.enemy == true) {
			let r = e.transform.directionTo(this.transform);
			this.transform.x += Math.cos(r) * this.speed * 0.3;
			this.transform.y += Math.sin(r) * this.speed * 0.3;
		}
	}
});

/*
	SS.BounceShip is an enemy ship that travels diagonally from wall
	to wall, turning 90 degrees at each wall collision.
*/
SS.BounceShip = SS.Ship.extend({
	init: function() {
		this.uber();
		this.speed = 10;
		this.hitRadius = 15;
		this.origin = new LAD.Point();
		this.enemy = true;
		this.draw();
	},
	draw: function() {
		let s = new LAD.Group();
		
		let p = new LAD.Path("#44E", 0, 0);
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
		
		p = new LAD.Path("#999", 0, 0);
		p.addCircle(0,0,8);
		p.closed = true;
		s.add(p);
		
		this.clip = s;
	},
	start: function() {
		this.setRandomDirection();
	},
	update: function() {
		this.moveDelta.setVector(this.direction, this.speed);
		this.move.ease(this.moveDelta, 0.2);
		
		this.transform.rotation += 0.2;
		this.transform.add(this.move);
		
		if (this.scene.isWithin(this)) return;
		this.scene.constrain(this);
		this.setRandomDirection();
	},
	setRandomDirection: function() {
		this.direction = Math.floor(Math.random() * 4) * Math.PI * 0.5 + Math.PI * 0.25;
	},
	onCollision: function(e) {
		if (!this.scene) return;
		if (e == this.scene.ship) {
			this.scene.die();
			return;
		}
		if (e.enemy == true) {
			this.direction = e.transform.directionTo(this.transform);
		}
	}
});

/*
	SS.Explosion causes a particle explosion at a specified point.
*/
SS.Explosion = LAD.Entity.extend({
	init: function(parts, speed){
		this.uber();
		this.parts = parts;
		this.speed = speed;
	},
	start: function(){
		let g = Math.floor(Math.random() * 150 + 30);
		let b = Math.floor(Math.random() * 150 + 100);
		if (!this.color) this.color = "rgb(125," + g + "," + b + ")";
		let part;
		let ang = Math.PI * 2;
		let seg = ang / this.parts;
		while (ang > 0) {
			part = new SS.ExplosionPart();
			if (!isNaN(this.life)) part.life = this.life;
			part.go(ang, this.speed, this.color);
			part.transform.x = this.transform.x;
			part.transform.y = this.transform.y;
			this.scene.add(part, 1);
			ang -= seg;
		}
		this.scene.remove(this);
	}
});

/*
	SS.ExplosionPart is a single particle from a particle explosion.
*/
SS.ExplosionPart = LAD.Entity.extend({
	init: function() { 
		this.uber();
		this.move = new LAD.Vector();
		this.magnetDistance = 150;
		
		let p = new LAD.Path();
		p.addCircle(0, 0, 4, 6);
		p.closed = true;
		this.clip = p;		
	},
	go: function(angle, speed, color) {		
		this.speed = speed;
		if (isNaN(this.life)) this.life = Math.random()*60+60;
		this.lived = 0;
		this.clip.fillColor = color;

		this.move.setVector(angle, speed);
		
		this.transform.rotation = angle;
		this.hitRadius = 5;
	},
	update: function() {
		if (this.magnetic && this.scene.state == "alive") {
			this.speed += 0.5;
			let ang = this.transform.directionTo(this.scene.ship.transform);
			this.move.setVector(ang, this.speed);
		} else {
			if (this.scene.ship) this.magnetic = this.lived > 10 && this.transform.isWithinDistance(this.scene.ship.transform, this.magnetDistance);
			this.move.multiply(0.95);
		}
		this.transform.add(this.move);
		this.scene.constrain(this);
		if (this.lived++ < this.life) return;
		this.scene.remove(this);
	},
	onCollision: function (e) {
		if (!this.scene) return;
		if (e != this.scene.ship) return;
		this.game.score.increaseMulti();
		this.scene.remove(this);
	}
});

/*
	SS.SmokePart is the trail behind the  player's ship.
*/
SS.SmokePart = LAD.Entity.extend({
	init: function() {
		this.uber();
		this.move = new LAD.Point();
		let alpha = Math.random()*0.3+0.2;
		let p = new LAD.Path("rgba(150,150,150,"+alpha+")");
		p.add(-15, 5);
		p.add(0, -8);
		p.add(15, 5);
		p.add(15, 8);
		p.add(0, -5);
		p.add(-15, 8);
		p.closed = true;
		this.clip = p;
	},
	go: function(rotation) { 
		let speed = 3;
		this.move.setPosition(Math.cos(rotation)*speed, Math.sin(rotation)*speed);
		this.transform.rotation = rotation - Math.PI * 0.5;
		this.life = 8;
	},
	start: function() {
		this.transform.x += this.move.x * 3;
		this.transform.y += this.move.y * 3;
	},
	update: function() {
		this.transform.x += this.move.x;
		this.transform.y += this.move.y;
		if (this.life-- > 0) return;
		this.scene.remove(this);
	}
});

/*
	SS.Scene extends LAD.Scene to include game-specific collision
	detection, spawning and other map-level operations.
*/
SS.Scene = LAD.Scene.extend({
	init: function() {
		this.uber();
		
		this.grid = new SS.Grid();
		this.add(this.grid);
		
		this.ship = new SS.PlayerShip();
	},
	start: function() {
		this.restart();
	},
	update: function() {
		let t = this.transform;
		let r = this.game.renderer;
		t.x = (r.width * 0.5 - this.ship.transform.x - this.ship.move.x) / t.scale;
		t.y = (r.height * 0.5 - this.ship.transform.y - this.ship.move.y) / t.scale;
		if (t.x > 100) t.x = 100;
		if (t.y > 100) t.y = 100;
		let xmax = r.width - this.grid.width - 100;
		let ymax = r.height - this.grid.height - 100;
		if (t.x < xmax) t.x = xmax;
		if (t.y < ymax) t.y = ymax;
		
		this.frames++;
		
		// handle states
		switch (this.state) {
			case "alive":
				this.detectCollisions();
				this.updateSpawn();
				break;
			case "dead":
				this.updateDead();
				break;
		}
	},
	render: function(r) {
		this.game.hud.render(r, this.game.score.score, this.game.score.multi, this.game.wave.wave, this.game.score.lives);
	},
	restart: function() {
		this.respawn();
		this.frames = 0;
		this.game.score.reset();
		this.game.wave.reset();
	},
	respawn: function() {
		this.state = "alive";
		this.spawnPlayer();
		this.game.wave.again();
	},
	detectCollisions: function() {
		let ea, eb, hitDistance, i, j;
		let colliders = this.entities.slice();
		i = colliders.length;
		while (i-- > 0) {
			ea = colliders[i];
			j = i;
			while (j-- > 0) {
				eb = colliders[j];
				if (!ea.scene || !eb.scene) return;
				if (!ea.transform.isWithinDistance(eb.transform, ea.hitRadius + eb.hitRadius)) continue;
				ea.onCollision(eb);
				eb.onCollision(ea);
			}
		}
	},
	updateSpawn: function() {
		if (this.state == "dead") return;
		if (this.game.wave.enemiesKilled >= this.game.wave.enemies) {
			this.game.wave.next();
			return;
		}
		if (this.game.wave.enemiesSpawned >= this.game.wave.enemies) return;
		if (this.frames % this.game.wave.spawnFrames == 0) this.spawnEnemy();
	},
	updateDead: function() {
		if (this.deadFrames-- > 0) return;
		if (this.game.score.lives > 0) this.respawn();
		else this.game.setScene(new SS.EndScreen());
	},
	spawnPlayer: function() {
		if (this.state == "dead") return;
		this.add(this.ship);
		this.ship.reset();
		this.ship.transform.x = this.grid.width * 0.5;
		this.ship.transform.y = this.grid.height * 0.5;
	},
	spawnEnemy: function() {
		let p
		do {
			p = this.getRandomWallPosition();
		} while (p.isWithinDistance(this.ship, 200));
		
		let enemyType = this.game.wave.getRandomEnemy();
		let enemy = new enemyType();
		enemy.transform.setPosition(p.x, p.y);
		enemy.speed = this.game.wave.enemySpeed;
		this.add(enemy, 1);
		this.game.wave.enemiesSpawned++;
	},
	kill: function(e) {
		this.game.score.score += 100 * this.game.score.multi;
		this.explode(e);
		this.game.wave.enemiesKilled++;
	},
	explode: function(e) {
		let parts = Math.ceil(Math.random()*8)+4;
		let speed = 10;
		let explosion = new SS.Explosion(parts, speed);
		explosion.transform.x = e.transform.x;
		explosion.transform.y = e.transform.y;
		this.remove(e);
		this.add(explosion);
	},
	die: function() {
		if (this.state == "dead") return;
		for (let i = 1; i < this.entities.length; i++) {
			if (this.entities[i].ship != true) continue;
			this.explode(this.entities[i]);
		}
		this.state = "dead";
		this.deadFrames = 80;
		this.game.score.lives--;
	},
	getRandomWallPosition: function() {
		let p = new LAD.Point();
		if (Math.random() > 0.5) {
			p.x = Math.random() * this.grid.width;
			p.y = Math.random() > 0.5 ? 0 : this.grid.height;
		} else {
			p.y = Math.random() * this.grid.height;
			p.x = Math.random() > 0.5 ? 0 : this.grid.width;
		}
		return p;
	},
	constrain: function(e) {
		if (e.transform.x < 0) e.transform.x = 0;
		if (e.transform.y < 0) e.transform.y = 0;
		if (e.transform.x > this.grid.width) e.transform.x = this.grid.width;
		if (e.transform.y > this.grid.height) e.transform.y = this.grid.height;
	},
	isWithin: function(e) {
		return e.transform.x > 0 
			&& e.transform.y > 0 
			&& e.transform.x < this.grid.width 
			&& e.transform.y < this.grid.height;
	}
});

/*
	SS.HUD displays the score, multi, etc.
*/
SS.HUD = LAD.Class.extend({
	init: function(game) {
		this.game = this;
	},
	render: function(r, score, multi, wave, lives) {
		if (this.score == score 
			&& this.wave == wave 
			&& this.lives == lives
			&& this.multi == multi) return;
			
		let w = r.width,
			h = r.height,
			c = r.context;
		
		// text
		c.fillStyle = "#468";
		c.strokeStyle = "#234";
		c.font = "24px serif";
		c.textClassline = "bottom";
		c.textAlign = "left";
		c.strokeText("SCORE: " + score, 30, 50);
		c.strokeText("MULTI: " + multi + "x", w - 500, 50);
		c.strokeText("WAVE: " + wave, w - 300, 50);
		c.strokeText("LIVES: " + lives, w - 140, 50);
	}
});

/*
	SS.MenuScreen acts as a base class for the various menu screens
	displayed before and after the game.
*/
SS.MenuScreen = LAD.Scene.extend({
	init: function(nextScreen) {
		this.uber();
		this.nextScreen = nextScreen;
	},
	start: function() {
		if (this.nextScreen) {
			this.handleInputBind = this.handleInput.bind(this);
			this.game.input.addListener(this.handleInputBind);
		}
	},
	handleInput: function() {
		this.game.input.removeListener(this.handleInputBind);
		this.game.setScene(this.nextScreen);
	},
	update: function() {
		if (isNaN(this.frame)) this.frame = 1;
		if (this.frame-- > 0) return;
		let explosion = new SS.Explosion(16, 10),
			r = this.game.renderer;
		explosion.transform.x = Math.random() * r.width;
		explosion.transform.y = Math.random() * r.height;
		explosion.life = Math.random()*8+8;
		explosion.color = "#ACE";
		this.add(explosion);
		this.frame = NaN;
	},
	constrain: function(e) {}
})

/*
	SS.TitleScreen is displayed before the game starts, showing many
	explosions and title text.
*/
SS.TitleScreen = SS.MenuScreen.extend({
	init: function() {
		this.uber(new SS.Scene());
	},
	update: function() {
		if (isNaN(this.frame)) this.frame = 1;
		if (this.frame-- > 0) return;
		let explosion = new SS.Explosion(16, 10),
			r = this.game.renderer;
		explosion.transform.x = Math.random() * r.width;
		explosion.transform.y = Math.random() * r.height;
		explosion.life = Math.random()*8+8;
		explosion.color = "#ACE";
		this.add(explosion);
		this.frame = NaN;
	},
	render: function(r) {
		this.uber(r);
		
		let w = r.width,
			h = r.height,
			c = r.context;
		
		c.fillStyle = "#468";
		c.strokeStyle = "#234";
		c.font = "72px serif";
		c.textClassline = "bottom";
		c.textAlign = "center";
		c.strokeText("SHAPESHIPS", w * 0.5, h * 0.5 - 65);
		
		c.font = "28px serif";
		c.strokeText("A CANVAS POWERED SHOOTER", w * 0.5, h * 0.5 - 45);
		
		c.font = "32px serif";
		c.strokeText("CLICK TO START", w * 0.5, h * 0.5 + 160);
		
		c.font = "14px serif";
		c.fillText("� 2012 DALE J WILLIAMS", w * 0.5, h - 25);
	}
});

/*
	SS.EndScreen is displayed after the match is complete, giving a
	summary of score and performance.
*/
SS.EndScreen = SS.MenuScreen.extend({
	init: function() {
		this.uber(new SS.TitleScreen());
	},
	render: function(r) {
		this.uber(r);
		
		let w = r.width,
			h = r.height,
			c = r.context;
		
		c.fillStyle = "#468";
		c.strokeStyle = "#234";
		c.font = "72px serif";
		c.textClassline = "bottom";
		c.textAlign = "center";
		c.strokeText("SHAPESHIPS", w * 0.5, h * 0.5 - 65);
		
		c.font = "24px serif";
		c.strokeText(this.game.wave.getSuccess(), w * 0.5, h * 0.5 + 70);
		c.font = "32px serif";
		c.strokeText("YOU GOT " + this.game.score.score + " POINTS", w * 0.5, h * 0.5 + 110);
		c.strokeText("AND A " + this.game.score.multi + "x MULTIPLIER", w * 0.5, h * 0.5 + 150);
		
		c.font = "14px serif";
		c.fillText("� 2012 DALE J WILLIAMS", w * 0.5, h - 25);
	}
});