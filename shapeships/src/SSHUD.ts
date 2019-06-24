import { SSGame } from "./SSGame";
import { Renderer } from "lad/display/Renderer";

/*
    SSHUD displays the score, multi, etc.
*/
export class SSHUD {

    score = 0;
    wave = 0;
    lives = 0;
    multi = 0;

    constructor(public game: SSGame) {}

    render(r: Renderer, score: number, multi: number, wave: number, lives: number) {
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
        c.textBaseline = "bottom";
        c.textAlign = "left";
        c.strokeText("SCORE: " + score, 30, 50);
        c.strokeText("MULTI: " + multi + "x", w - 500, 50);
        c.strokeText("WAVE: " + wave, w - 300, 50);
        c.strokeText("LIVES: " + lives, w - 140, 50);
    }
    
}