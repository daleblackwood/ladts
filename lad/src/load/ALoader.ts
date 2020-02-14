import { Dispatcher } from "../events/Dispatcher";

/*
	LAD.AbstractLoader provides a consistant abstract class for loading
	multiple files.
*/
export class LoaderError extends Error {
	constructor(public loader: ALoader<any>, message: string) {
		super(message);
	}
}

export class ALoader<T> {

	onLoaded = new Dispatcher<T>();
	data: T | null = null;
	isComplete = false;
    
	constructor(public url: string) {
		this.data = null;
		this.isComplete = false;
	}

	load() {
		return new Promise((resolve, reject) => {
			this.loadPromise().then(data => {
				this.data = data;
				if (this.onComplete) {
					this.onComplete();
				}
				else {
					resolve(data);
				}
			}).catch(e => {
				if (this.onError) {
					this.onError(e);
				}
				else {
					reject(e);
				}
			});
		});
	}
	
	async loadPromise(): Promise<T> {
		throw new LoaderError(this, "Cannot load from ALoader");
	}

	onComplete() {
		this.isComplete = true;
		this.onLoaded.dispatch(this.data);
	}

	onError(e?: Error) {
		const typeName = this.constructor.name;
		let message = typeName + " (" + this.url + ") ";
		if (e) {
			message += e.message;
		}
		else {
			message += "couldn't load.";
		}
		throw new LoaderError(this, message);
	}
}