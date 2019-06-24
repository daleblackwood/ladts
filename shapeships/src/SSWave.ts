import { SSShip } from "./SSShip";
import { SSBounceShip } from "./SSBouncerShip";
import { SSChaserShip } from "./SSChaserShip";

type SSEnemyType = new () => SSShip;
/*
    SSWave determines the number of enemies, their spawn speed and
    which types are displayed for each wave in the game.
*/
export class SSWave {

    spawnFrames = 0;
    enemies = 0;
    enemiesSpawned = 0;
    enemiesKilled = 0;
    enemySpeed = 0;
    wave = 0;
    enemyTypes: SSEnemyType[] = [];

    constructor() {
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
    
    setWave(wave: number) {
        this.spawnFrames = this.getSpawnFrames();
        this.enemies = Math.floor(wave*0.5) + 3;
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
        let result: SSEnemyType[] = [SSBounceShip];
        if (wave > 3) result.push(SSChaserShip);
        return result;
    }
    
    getRandomEnemy() {
        return this.enemyTypes[Math.floor(Math.random()*this.enemyTypes.length)];
    }
    
    getSuccess() {
        let wave = this.wave;
        if (wave > 2) {
            let type: string;
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
    
}