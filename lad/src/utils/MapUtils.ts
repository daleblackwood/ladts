import { Compression } from "lad/utils/Compression";

export class MapUtils {

    static loadLocalMapData(key: string) {
        const mapData = MapUtils.jsonFromString(window.localStorage.getItem(key));
        if (mapData && mapData.map) {
            return mapData;
        }
        return null;
    }

    static mapToString(mapData: any): string {
        const outStr = Compression.compress(JSON.stringify(mapData));
        return outStr;
    }

    static mapFromString(str: string): any {
        if (Compression.isCompressed(str)) {
            str = Compression.decompress(str);
        }
        return this.jsonFromString(str);
    }

    static jsonFromString(str: string): any {
        if (! str) {
            return null;
        }
        let json = null;
        try {
            json = JSON.parse(str);
        }
        catch (e) {}
        return json;
    }

    static jsonToString(obj: any): string {
        return JSON.stringify(obj);
    }

    static jsonFromPacked(compressed: string): any {
        const str = Compression.safeUnpack(compressed);
        return this.jsonFromString(str);
    }

    static jsonToPacked(obj: any): string {
        const str = this.jsonToString(obj);
        const compressed = Compression.safePack(str);
        return compressed;
    }

    static jsonFromLZ(compressed: string): any {
        const str = Compression.decompress(compressed);
        return this.jsonFromString(str);
    }

    static jsonToLZ(obj: any): string {
        const str = this.jsonToString(obj);
        const compressed = Compression.compress(str);
        return compressed;
    }

    static jsonRequest<T extends any>(url: string, data: any = null):Promise<T> {
        return new Promise((resolve, reject) => {
            const dataStr = data ? this.jsonToString(data) : null;
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.onload = () => {
                const str = xhr.responseText;
                let response = null;
                if (str) {
                    response = this.jsonFromString(str);
                    if (! response) {
                        reject("Couldn't parse JSON from " + url);
                    }
                }
                resolve(response);
            };
            xhr.onerror = () => {
                reject({ error: xhr.responseText });
            };
            xhr.send(dataStr);
        });
    }

    static resizePNG(dataString: string, scale: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            img.onload = () => {        
                const srcCanvas = document.createElement("canvas");
                const srcCtx = srcCanvas.getContext("2d");
                const srcW = img.naturalWidth;
                const srcH = img.naturalHeight;
                srcCanvas.width = srcW;
                srcCanvas.height = srcH;
                srcCtx.drawImage(img, 0, 0, srcW, srcH);
                const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;
                
                const dstCanvas = document.createElement("canvas");
                const dstCtx = dstCanvas.getContext("2d");
                const dstW = srcW * scale;
                const dstH = srcH * scale;
                dstCanvas.width = dstW;
                dstCanvas.height = dstH;
                for (let y = 0; y < srcH; y++) {
                    for (let x = 0; x < srcW; x++) {
                        const dataI = (y * srcW + x) * 4;
                        const r = srcData[dataI];
                        const g = srcData[dataI + 1];
                        const b = srcData[dataI + 2];
                        const a = srcData[dataI + 3];
                        dstCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
                        dstCtx.fillRect(x * scale, y * scale, scale, scale);
                    }
                }
                resolve(dstCanvas.toDataURL());
            };
            img.onerror = (e) => reject(e);
            img.src = dataString;
        });
    }
}