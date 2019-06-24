import { Transform } from "../math/Transform";
import { Renderer } from "./Renderer";
import { Rect } from "../math/Rect";
import { IClip } from "./IClip";

/*
    LAD.Group is used to combine multiple paths into a single render
    operation.
*/
export class ClipGroup {

    clips: IClip[] = [];

    constructor(paths?: IClip[]) {
        this.clips = paths || [];
    }
    
    add(path: IClip): IClip {
        this.remove(path);
        this.clips.push(path);
        return path;
    }
    
    remove(path: IClip): IClip|null {
        // removes the path from the group
        let i = -1, len = this.clips.length;
        while (++i < len) {
            if (this.clips[i] != path) continue;
            this.clips.splice(i, 1);
            break;
        }
        return path || null;
    }
    
    render(r: Renderer, t: Transform) {
        // renders all paths
        let i = -1, len = this.clips.length;
        while (++i < len) {
            this.clips[i].render(r, t);
        }
    }
    
    getBounds() {
        // returns a new rectangle with the boundaries of this group
        let i = this.clips.length;
        let rect = new Rect();
        if (i > 0) {
            rect.copy(this.clips[0].getBounds());
            while (i-- > 1) {
                rect.encapsulate(this.clips[i].getBounds());
            }
        }
        return rect;
    }
    
}