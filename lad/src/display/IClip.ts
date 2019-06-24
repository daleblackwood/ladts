import { Renderer } from "./Renderer";
import { Transform } from "../math/Transform";
import { Rect } from "lad/math/Rect";

export interface IClip {
    render(r: Renderer, t: Transform): void;
    getBounds(): Rect;
}