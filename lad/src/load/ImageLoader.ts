import { ALoader } from "./ALoader";

/*
    LAD.ImageLoader extends LAD.AbstractLoader to implement methods for
    loading images.
*/
export class ImageLoader extends ALoader<HTMLImageElement> {

    async loadPromise(): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            var image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.onerror = () => {
                this.data = null;
                reject();
            }
            image.src = this.url;
        });
    }
    
}