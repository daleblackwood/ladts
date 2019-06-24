import { TextLoader } from "./TextLoader";

export class JSONLoader<T = any> extends TextLoader<T> {

    async loadPromise(): Promise<T> {
        const text = await this.loadText();
        try {
            return JSON.parse(text) as T;
        }
        catch {
            throw new Error("Couldn't parse JSON from " + this.url);
        }
    }

}