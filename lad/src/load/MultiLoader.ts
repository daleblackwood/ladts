import { ALoader } from "./ALoader"
import { ImageLoader } from "./ImageLoader";
import { TextLoader } from "./TextLoader";
import { JSONLoader } from "./JsonLoader";

export class MultiLoader extends ALoader<any> {

    queue: ALoader<any>[] = [];
    loaded: ALoader<any>[] = [];
	assets: {[url: string]: any } = {};
	
	constructor() {
		super("");
	}

	add(...args: string[]) {
		// adds a url to the load queue
		let i = args.length;
		while (i-- > 0) {
			const url = arguments[i];
			const ext = String(url.substr(url.lastIndexOf(".")+1)).toUpperCase();
			console.log(url, ext);
			switch (ext) {
				case "JPG":
				case "PNG":
				case "GIF":
				case "BMP":
				case "JPEG":
					this.queue.push(new ImageLoader(url));
					break;
				case "JSON":
					this.queue.push(new JSONLoader(url));
					break;
				default:
					this.queue.push(new TextLoader(url));
					break;
			}
			this.queue.push();
		}
    }
    
	load() {
		this.loadNext();
	}

	loadNext() {
		// dummy load call to be overridden
		if (this.queue.length <= 0) {
			return this.onComplete();
		}
		
		this.isComplete = false;

		const next = this.queue.shift();
		next.onLoaded.listen(this, () => {
			this.assets[next.url] = next.data;
			this.loadNext();
		}, { once: true });
		next.load();
    }
    
	getAsset<T>(url: string) {
		// returns the laoded asset
		return this.assets[url] as T;
	}
}