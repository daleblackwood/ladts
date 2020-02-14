import { Sprite } from "lad/display/Sprite";
import { Rect } from "lad/math/Rect";

export type ITilePos = [number, number];

export enum BlockType {
    Empty,
    Solid,
    Entity
}

export interface IBlock {
    name: string;
    index: number;
    type: BlockType;
    layer: number;
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

    static fromJson(json: any, image: HTMLImageElement, layer: number) {
        const tileset = new Tileset(json.tilesize || 32, layer);
        tileset.image = image;
        tileset.blocks = [];

        const parseBlock = (tileset: Tileset, index: number, json: any): IBlock => {
            const fill = json instanceof Array ? json : json.fill;
            let type = BlockType.Empty;
            switch ((json.type || "").toLowerCase()) {
                case "solid":
                    type = BlockType.Solid;
                    break;
            }
            const layer = tileset.layer || 0;
            const name = json.name;
            const block = {
                index,
                name,
                type,
                fill,
                layer,
                ...json
            };
            return block;
        }

        for (const key in json.blocks) {
            const blockJson = json.blocks[key];
            blockJson.name = blockJson.name || key;
            const parsed = parseBlock(tileset, tileset.blocks.length, blockJson);
            tileset.blocks.push(parsed);
        }

        return tileset;
    }

    file: string;
    image: HTMLImageElement;
    blocks: IBlock[] = [];

    constructor(public tilesize: [number, number], public layer: number) {}

    getBlock(indexOrName: number|string): IBlock|null {
        let index = -1;
        if (typeof indexOrName === "number") {
            if (indexOrName >= 0 && indexOrName < this.blocks.length) {
                index = indexOrName;
            }
        }
        else {
            index = this.blocks.findIndex(x => x.name.toLowerCase().trim() === indexOrName.toLowerCase().trim())
        }
        if (index < 0) {
            return null;
        }
        return this.blocks[index];
    }

    createSprite(name?: string): Sprite|null {
        let block = this.blocks[0];
        if (name) {
            block = this.getBlock(name);
            if (! block) {
                return null;
            }
        }
        return new Sprite(this.image, {
            clipRect: new Rect(0, 0, this.tilesize[0], this.tilesize[1]),
            clip: { 
                frameX: block.fill[0], 
                frameY: block.fill[1]
            }
        });
    }
}