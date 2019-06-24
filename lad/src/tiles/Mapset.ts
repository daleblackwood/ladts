import { Tileset } from "./Tileset";

function validateSize(x: number, y: number) {
    if (isNaN(x) || isNaN(y) || x < 1 || y < 1) {
        throw new Error("Invalid map dimensions (" + x + "*" + y + ")");
    }
    if (Math.floor(x) !== x || Math.floor(y) !== y) {
        throw new Error("Int map dimensions only: got (" + x + "*" + y + ")");
    }
}

export class Mapset {

    static readonly EMPTY = 255;

    tiles = new Uint8Array();
    tilesX = 0;
    tilesY = 0;

    getTile(x: number, y: number): number {
        const index = this.getIndex(x, y);
        if (index >= 0 && index < this.tiles.length) {
            return this.tiles[index];
        }
        return Mapset.EMPTY;
    }

    setTile(x: number, y: number, tile: number): void {
        const index = this.getIndex(x, y);
        if (index >= 0 && index < this.tiles.length) {
            this.tiles[index] = tile;
        }
    }

    getIndex(x: number, y: number): number {
        return x + y * this.tilesX;
    }

    setSize(tilesX: number, tilesY: number) {
        validateSize(tilesX, tilesY);

        // clone old to copy over
        let prevMapSet: Mapset | null = null;
        const prevTiles = this.tiles;
        if (prevTiles && prevTiles.length > 0) {
            prevMapSet = this.clone();
        }

        // create new
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        const size = tilesX * tilesY;
        this.tiles = new Uint8Array(size);
        for (let i=0; i<size; i++) {
            this.tiles[i] = Mapset.EMPTY;
        }

        // copy over old
        if (prevMapSet) {
            this.copyOver(prevMapSet);
        }
    }

    copyOver(mapset: Mapset) {
        const limX = Math.min(this.tilesX, mapset.tilesX);
        const limY = Math.min(this.tilesY, mapset.tilesY);
        for (let y = 0; y < limY; y++) {
            for (let x = 0; x < limX; x++) {
                const tile = mapset.getTile(x, y);
                this.setTile(x, y, tile);
            }
        }
    }

    setTiles(tilesX: number, tilesY: number, tiles: Uint8Array) {
        validateSize(tilesX, tilesY);
        if (tiles && tiles.length !== tilesX * tilesY) {
            throw new Error("tiles provided are incorrect length");
        }
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        this.tiles = tiles;
    }

    clone() {
        const result = new Mapset();
        result.setTiles(this.tilesX, this.tilesY, this.tiles);
        return result;
    }
}