import { Sprite } from "lad/display/Sprite";

export type ITilePos = [number, number];

export enum BlockType {
    Empty,
    Solid
}

export interface IBlock {
    name: string;
    index: number;
    type: BlockType;
    tileset: Tileset;
    fill: ITilePos;
    solo?: ITilePos;
    t?: ITilePos;
    tl?: ITilePos;
    tr?: ITilePos;
    l?: ITilePos;
    r?: ITilePos;
    b?: ITilePos;
    bl?: ITilePos;
    br?: ITilePos;
}

export class Tileset {

    image: HTMLImageElement;
    blocks: IBlock[] = [];

    constructor(public tileSize: number, public layer: number) {}

    getBlock(index: number) {
        if (index < 0 || index >= this.blocks.length) {
            return null;
        }
        return this.blocks[index];
    }
}