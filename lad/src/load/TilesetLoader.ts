import { ALoader } from "./ALoader";
import { Tileset, IBlock, BlockType } from "../tiles/Tileset";
import { JSONLoader } from "./JsonLoader";
import { ImageLoader } from "./ImageLoader";

/*
	LAD.TextLoader extends LAD.AbstractLoader to implement methods for
	loading text files.
*/
export class TilesetLoader extends ALoader<Tileset> {

    constructor(url: string, public layer: number) {
        super(url);
    }

    async loadPromise(): Promise<Tileset> {
        const data = await new JSONLoader(this.url).loadPromise();
        let imageUrl = data.image;

        const jsonPath = this.url.replace(/\\/g, "/");
        const jsonFolder = jsonPath.substr(0, jsonPath.lastIndexOf("/") + 1);

        imageUrl = jsonFolder + "/" + imageUrl;
        imageUrl = imageUrl.replace(/\/\//g, "/");

        const image = await new ImageLoader(imageUrl).loadPromise();

        const tileset = new Tileset(data.tilesize || 32, this.layer);
        tileset.image = image;
        tileset.blocks = [];

        for (const key in data.blocks) {
            const blockJson = data.blocks[key];
            blockJson.name = blockJson.name || key;
            const parsed = this.parseBlock(tileset, tileset.blocks.length, blockJson);
            tileset.blocks.push(parsed);
        }

        return tileset;
    }

    parseBlock(tileset: Tileset, index: number, json: any): IBlock {
        const fill = json instanceof Array ? json : json.fill;
        let type = BlockType.Empty;
        switch ((json.type || "").toLowerCase()) {
            case "solid":
                type = BlockType.Solid;
                break;
        }
        const name = json.name;
        return {
            index,
            name,
            type,
            fill,
            tileset,
            ...json
        };
    }
    
}