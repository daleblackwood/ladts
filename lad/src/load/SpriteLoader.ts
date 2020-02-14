import { ALoader } from "./ALoader";
import { JSONLoader } from "./JsonLoader";
import { ImageLoader } from "./ImageLoader";
import { Sprite } from "lad/display/Sprite";
import { Rect } from "lad/math/Rect";

/*
	LAD.SpriteLoader extends LAD.AbstractLoader to implement methods for
	loading sprites
*/
export class SpriteLoader extends ALoader<Sprite> {

    constructor(url: string) {
        super(url);
    }

    async loadPromise(): Promise<Sprite> {
        const data = await new JSONLoader(this.url).loadPromise();
        let imageUrl = data.image;

        const jsonPath = this.url.replace(/\\/g, "/");
        const jsonFolder = jsonPath.substr(0, jsonPath.lastIndexOf("/") + 1);

        imageUrl = jsonFolder + "/" + imageUrl;
        imageUrl = imageUrl.replace(/\/\//g, "/");

        const image = await new ImageLoader(imageUrl).loadPromise();

        const tilesizeX = data.tilesize[0];
        const tilesizeY = data.tilesize[1];
        const sprite = new Sprite(image, {
            clipRect: new Rect(0, 0, tilesizeX, tilesizeY)
        });
        return sprite;
    }
    
}