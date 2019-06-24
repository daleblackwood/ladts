/*
    SSScore keeps track of the player's current score, lives and 
    multiplier.
*/
export class SSScore {

    score = 0;
    multi = 1;
    lives = 3;

    constructor() {
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