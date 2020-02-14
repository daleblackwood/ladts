import { Tileset } from "lad/tiles/Tileset";
import { MapUtils } from "lad/utils/MapUtils";

export interface IPakNode {
    type: string;
    data: any;
}

export class Pak {

    constructor(public data: any) {}

    getNode(path: string): IPakNode|null {
        const node = this.data[path] || null;
        return node;
    }

    async extractTileset(jsonPath: string, layer: number): Promise<Tileset|null> {
        const jsonNode = this.getNode(jsonPath);
        if (! jsonNode) {
            return null;
        }
        const jsonData = jsonNode.data;
        const imagePath = jsonData.image;
        const image = await this.extractImage(imagePath, jsonData.rescale);
        const tileset = Tileset.fromJson(jsonData, image, layer);
        return tileset;
    }

    async extractImage(imagePath: string, scale?: number) {
        const imageNode = this.getNode(imagePath);
        const mimeType = "image/" + imageNode.type;
        const image = await new Promise<HTMLImageElement>(resolve => {
            const image = new Image();
            image.onload = () => resolve(image);
            let dataString = `data:${mimeType};base64,${imageNode.data}`;
            if (scale && scale != 1) {
                MapUtils.resizePNG(dataString, scale).then(newString => {
                    image.src = newString;
                });
            } else {
                image.src = dataString;
            }
        });
        return image;
    }

}