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
        return Tileset.fromJson(data, image, this.layer);
    }
    
}