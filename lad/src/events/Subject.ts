import { Dispatcher, IListener, Handler } from "./Dispatcher";

export class Subject<T> extends Dispatcher<T> {

    constructor(public value: T) {
        super();
    }

    listen(scope: object, handler: Handler<T>, options: { immediate?: boolean, once?: boolean } = {}): IListener<T> {
        const listener = super.listen(scope, handler, { once: options.once });
        if (options.immediate !== false) {
            listener.boundHandler(this.value);
        }
        return listener;
    }

    setValue(newValue: T, forceUpdate: boolean = false) {
        if (newValue === this.value && !forceUpdate) {
            return;
        }
        this.value = newValue;
        this.dispatch(this.value);
    }
}