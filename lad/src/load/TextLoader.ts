import { ALoader } from "./ALoader";

/*
    LAD.TextLoader extends LAD.AbstractLoader to implement methods for
    loading text files.
*/
export class TextLoader<T = string> extends ALoader<T> {

    async loadPromise(): Promise<any> {
        return await this.loadText();
    }

    async loadText(): Promise<string> {
        const res = await fetch(this.url + "?" + Math.random());
        const text = await res.text();
        return text;
    }

    /*
    async loadText(): Promise<string> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", this.url, false);
            xhr.onload = function() {
                resolve(this.statusText);
            };
            xhr.onerror = function() {
                reject(this.responseText);
            };
            xhr.send(null);
        });
    }
    */
    
}