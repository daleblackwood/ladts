import { Mapset } from "./Mapset";
import { IBlock, Tileset } from "./Tileset";
import { Renderer } from "lad/display/Renderer";
import { Entity } from "lad/scene/Entity";

export class ILayer {
    tileset: Tileset;
    tiles: Mapset;
}

export class Tilemap extends Entity {

    layers: ILayer[] = [];

    public tileSize = 32;
    public tilesX = 0;
    public tilesY = 0;

    setTileset(tileset: Tileset, layerIndex: number) {
        if (!this.layers[layerIndex]) {
            const tiles = new Mapset();
            tiles.setSize(this.tilesX, this.tilesY);
            this.layers[layerIndex] = {
                tileset,
                tiles
            };
        }
        if (this.layers[layerIndex].tileset != tileset) {
            this.layers[layerIndex].tileset = tileset;
        }
    }
    
    getBlocks(x: number, y: number): IBlock[] {
        const result: IBlock[] = [];
        for (const layer of this.layers) {
            const index = layer.tiles.getTile(x, y);
            const block = layer.tileset.getBlock(index);
            result.push(block);
        }
        return result;
    }

    setBlock(x: number, y: number, block: IBlock|null): void {
        for (const layer of this.layers) {
            layer.tiles.setTile(x, y, Mapset.EMPTY);
        }
        if (block) {
            const layer = this.layers[block.tileset.layer] || this.layers[0];
            layer.tiles.setTile(x, y, block.index);
        }
    }

    setSize(tilesX: number, tilesY: number) {
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        for (const layer of this.layers) {
            layer.tiles.setSize(tilesX, tilesY);
        }
    }

    render(r: Renderer) {
        if (this.layers.length < 1) {
            return;
        }
        for (const layer of this.layers) {
            for (let y = 0; y < this.tilesY; y++) {
                for (let x = 0; x < this.tilesX; x++) {
                    this.renderBlock(r, layer, x, y);
                }
            }
        }
    }

    renderBlock(r: Renderer, layer: ILayer, x: number, y: number) {
        const rt = this.renderTransform;
        const blockI = layer.tiles.getTile(x, y);
        if (blockI === Mapset.EMPTY) {
            return;
        }
        const block = layer.tileset.getBlock(blockI);
        let tile = block.fill;
        const capT = layer.tiles.getTile(x, y - 1) !== blockI;
        const capL = layer.tiles.getTile(x - 1, y) !== blockI;
        const capR = layer.tiles.getTile(x + 1, y) !== blockI;
        const capB = layer.tiles.getTile(x, y + 1) !== blockI;
        if (block.solo && capT && capL && capR && capB) {
            tile = block.solo;
        }
        else if (block.t && capT) {
            if (block.tl && capL) {
                tile = block.tl;
            }
            else if (block.tr && capR) {
                tile = block.tr;
            }
            else {
                tile = block.t;
            }
        }
        else if (block.b && capB) {
            if (block.bl && capL) {
                tile = block.bl;
            }
            else if (block.br && capR) {
                tile = block.br;
            }
            else {
                tile = block.b;
            }
        }
        else if (block.l && capL) {
            tile = block.l;
        }
        else if (block.r && capR) {
            tile = block.r;
        }
        const ts = layer.tileset.tileSize;
        const tx = tile[0] * ts;
        const ty = tile[1] * ts;
        const rs = rt.scale * ts;
        const rx = x * ts * rt.scale + rt.p.x;
        const ry = y * ts * rt.scale + rt.p.y;

        r.context.drawImage(layer.tileset.image, 
            tx, ty, ts, ts, 
            rx, ry, rs, rs
        );
    }

}