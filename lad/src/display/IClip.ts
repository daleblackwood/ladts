import { Renderer } from "./Renderer";
import { Transform } from "../math/Transform";
import { Rect } from "../math/Rect";

export interface IClip {
    render(r: Renderer, t: Transform): void;
    getRect(): Rect;
}