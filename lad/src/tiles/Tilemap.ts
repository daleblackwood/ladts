import { Mapset } from "./Mapset";
import { IBlock, Tileset, BlockType } from "./Tileset";
import { Renderer } from "../display/Renderer";
import { Entity } from "../scene/Entity";
import { IPoint, Point } from "lad/math/Point";
import { Rect } from "lad/math/Rect";
import { Factory } from "lad/utils/Factory";
import { CollidableEnity } from "lad/collision/Collider";
import { RectCollider } from "lad/collision/RectCollider";
import { EntityPlaceholder } from "lad/scene/EntityPlaceholder";

export class ILayer {
    tileset: Tileset;
    tiles: Mapset;
}

export class IEntityData {
    id: string;
    name: string;
    tile: [number, number];
    modifiers?: string[];
}

export class BlockInfo {
    constructor(
        public rect: Rect,
        public block: IBlock|null
    ) {}
}

export class Tilemap extends Entity {

    static BLOCK_INVISIBLE: IBlock = {
        index: Mapset.EMPTY - 1,
        type: BlockType.Solid,
        name: "invisible",
        layer: 0,
        fill: [0, 0]
    };

    public layers: ILayer[] = [];
    public entities: IEntityData[] = [];
    public tilesize: [number, number] = [32, 32];
    public tilesX = 0;
    public tilesY = 0;

    private factoryEntitys: Entity[] = [];

    setTileset(tileset: Tileset, layerIndex: number) {
        if (!this.layers[layerIndex]) {
            const tiles = new Mapset();
            this.tilesize = tileset.tilesize;
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

    getBlockAt(p: IPoint): BlockInfo  {
        const [tx, ty] = this.getBlockOrds(p);
        let block: IBlock|null = null;
        for (const layer of this.layers) {
            const index = layer.tiles.getTile(tx, ty);
            block = layer.tileset.getBlock(index);
            if (block) {
                break;
            }
        }
        const x = tx * this.tilesize[0];
        const y = ty * this.tilesize[1];
        return new BlockInfo(
            new Rect(x, y, this.tilesize[0], this.tilesize[1]),
            block
        );
    }

    getBlockOrds(p: IPoint): [number, number] {
        return [
            Math.floor(p.x / this.tilesize[0]),
            Math.floor(p.y / this.tilesize[1])
        ];
    }

    getBlockPoint(tx: number, ty: number): Point {
        const x = tx * this.tilesize[0];
        const y = ty * this.tilesize[1];
        return new Point(x, y);
    }
    
    getBlocks(x: number, y: number): IBlock[] {
        const result: IBlock[] = [];
        for (const layer of this.layers) {
            const index = layer.tiles.getTile(x, y);
            if (index !== Mapset.EMPTY) {
                result.push(null);
                continue;
            }
            if (index === Tilemap.BLOCK_INVISIBLE.index) {
                result.push(Tilemap.BLOCK_INVISIBLE);
                continue;
            }
            const block = layer.tileset.getBlock(index);
            if (block) {
                result.push(block);
            }
        }
        return result;
    }

    setBlock(x: number, y: number, block: IBlock|null): void {
        for (const layer of this.layers) {
            layer.tiles.setTile(x, y, Mapset.EMPTY);
        }
        if (block) {
            const layer = this.layers[block.layer] ? this.layers[block.layer] : this.layers[0];
            layer.tiles.setTile(x, y, block.index);
        }
    }

    setSize(tilesX: number, tilesY: number, offsetX: number = 0, offsetY: number = 0) {
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        for (const layer of this.layers) {
            layer.tiles.setSize(tilesX, tilesY, offsetX, offsetY);
        }
    }

    placeEntity(e: Entity, tx: number, ty: number) {
        let x = (tx + 0.5) * this.tilesize[0];
        let y = (ty + 0.5) * this.tilesize[1];
        const collider = e instanceof EntityPlaceholder
            ? (e.entity as CollidableEnity).collider
            : (e as CollidableEnity).collider;
        if (collider instanceof RectCollider) {
            const rect = collider.rect;
            x -= rect.center.x;
            y -= rect.center.y;
        }
        e.transform.p.setValue(x, y);
    }

    clear() {
        for (const layer of this.layers) {
            for (let i=0; i<layer.tiles.tiles.length; i++) {
                layer.tiles.tiles[i] = Mapset.EMPTY;
            }
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
        if (! block) {
            return;
        }
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
        const ts = layer.tileset.tilesize;
        const tx = tile[0] * ts[0];
        const ty = tile[1] * ts[1];
        const rsx = rt.scale.x * ts[0];
        const rsy = rt.scale.y * ts[1];
        const rx = x * ts[0] * rt.scale.x + rt.p.x;
        const ry = y * ts[1] * rt.scale.y + rt.p.y;

        r.context.drawImage(layer.tileset.image, 
            tx, ty, ts[0], ts[1], 
            rx, ry, rsx, rsy
        );
    }

    public getData() {
        const layers = [];
        for (const layer of this.layers) {
            let tilesetName = layer.tileset.image.name;
            const dotI = tilesetName.indexOf(".");
            if (dotI > 0) {
                tilesetName = tilesetName.substr(0, dotI);
            }
            const tilesetTiles = layer.tileset.blocks.map(x => x.name);
            const tileset = {
                name: tilesetName,
                tiles: tilesetTiles
            };
            layers.push({
                tileset,
                tiles: layer.tiles.getDataString()
            });
        }
        return {
            layers,
            entities: this.entities
        };
    }

    public getDataString() {
        const lines = [];
        for (const layer of this.layers) {
            lines.push(layer.tiles.getDataString());
        }
        return lines.join("\n");
    }

    public setDataString(str: string) {
        const lines = str.split("\n");
        let tilesX = 0;
        let tilesY = 0;
        for (let i=0; i<lines.length; i++) {
            const layer = this.layers[i];
            if (! layer) continue;
            layer.tiles.setDataString(lines[i]);
            tilesX = Math.max(tilesX, layer.tiles.tilesX);
            tilesY = Math.max(tilesY, layer.tiles.tilesY);
        }   
        this.setSize(tilesX, tilesY);
    }

    public setData(data: any) {
        if (!data || !data.layers) {
            return;
        }
        let tilesX = 0;
        let tilesY = 0;
        for (let i = 0; i < this.layers.length; i++) {
            const dataLayer = data.layers[i];
            if (! dataLayer) {
                continue;
            }
            const layer = this.layers[i];
            layer.tiles.setDataString(dataLayer.tiles);
            tilesX = Math.max(tilesX, layer.tiles.tilesX);
            tilesY = Math.max(tilesY, layer.tiles.tilesY);
        }
        this.setSize(tilesX, tilesY);
        this.entities = data.entities || [];
    }

    removeAdjoining(tx: number, ty: number) {
        const block = this.getBlocks(tx, ty)[0];
        if (!block) {
            return;
        }
        this.setBlock(tx, ty, null);
        for (let y = ty-1; y <= ty + 1; y++) {
            for (let x = tx-1; x <= tx + 1; x++) {
                const b = this.getBlocks(x, y)[0]
                if (b && b.name === block.name) {
                    this.removeAdjoining(x, y);
                }
            }
        }
    }

    public runFactory(factory: Factory<Entity>) {
        if (this.factoryEntitys.length > 0) {
            for (const e of this.factoryEntitys) {
                e.remove();
            }
            this.factoryEntitys = [];
        }
        for (const data of this.entities) {
            if (factory.canMake(data.name) === false) {
                continue;
            }
            const entity = factory.make(data.name);
            this.placeEntity(entity, data.tile[0], data.tile[1]);
            this.factoryEntitys.push(entity);
            this.scene.add(entity);
        }
    }

    public getRect(): Rect {
        return new Rect(0, 0, this.tilesX * this.tilesize[0], this.tilesY * this.tilesize[0]);
    }

}