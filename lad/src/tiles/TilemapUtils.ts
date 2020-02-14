import { Tilemap } from "./Tilemap";
import Base36 from "../utils/Base36";
import { Mapset } from "./Mapset";

export class TilemapUtils {

    static mapToObject(map: Tilemap) {
        const layers = [];
        for (const layer of map.layers) {
            const uints = [ ...layer.tiles.tiles ];
            const uniqueUints = [...new Set(uints)];
            uniqueUints.sort((a, b) => a < b ? -1 : 1);

            const setBlocks = layer.tileset.blocks.filter(x => uniqueUints.includes(x.index));
            setBlocks.sort((a, b) => a.index < b.index ? -1 : 1);
            const set = setBlocks.map(x => x.name);

            const remappedUints = uints.map(x => uniqueUints.indexOf(x));
            let map = layer.tiles.tilesX + ":";
            map += Base36.uintArrayToBase36(remappedUints, 2);

            layers.push({ set, map });
        }

        const entities = map.entities;

        return {
            layers,
            entities
        };
    }

    static applyMapObject(map: Tilemap, obj: any) {
        map.setSize(0, 0);
        for (let i=0; i<map.layers.length; i++) {
            const mapLayer = map.layers[i];
            const dataLayer = obj.layers[i];
            const colonI = dataLayer.map.indexOf(":");
            const tilesX = parseInt(dataLayer.map.substr(0, colonI), 10);
            const mapStr = dataLayer.map.substr(colonI + 1);
            const unmappedUints = Base36.uintArrayFromBase36(mapStr, 2);
            const tilesY = Math.ceil(unmappedUints.length / tilesX);
            if (map.tilesX < tilesX || map.tilesY < tilesY) {
                map.setSize(Math.max(map.tilesX, tilesX), Math.max(map.tilesY, tilesY));
            }
            const uints = unmappedUints.map(x => {
                let index = mapLayer.tileset.blocks.findIndex(b => b.name ===dataLayer.set[x]);
                if (index < 0) {
                    index = Mapset.EMPTY;
                }
                return index;
            });
            mapLayer.tiles.setTiles(tilesX, tilesY, new Uint8Array(uints));
        }
        map.entities = obj.entities;
    }

}