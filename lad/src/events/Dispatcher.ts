/*
    LAD.Dispatcher dispatches objects, messages or values to registered
    listeners. Unlike event dispatchers, LAD.Dispatcher has no type and
    will dispatch to all methods registered to it.
*/
export type Handler<T = any> = (message: T) => void;

export interface IListener<T = any> {
    scope: any;
    handler: Handler<T>;
    boundHandler: Handler<T>;
    once: boolean;
}

export class Dispatcher<T = any> {

    listeners = Array<IListener<T>>();
    
    listen(scope: object, handler: Handler<T>, options: { once?: boolean } = {}): IListener {
        // adds a listener function to the list
        const existingIndex = this.indexOf(scope, handler);
        if (existingIndex >= 0) {
            return this.listeners[existingIndex];
        }
        const boundHandler = handler.bind(scope);
        const listener = { 
            scope, 
            handler, 
            boundHandler, 
            once: options.once === true 
        };
        this.listeners.push(listener);
        return listener;
    }
    
    unlisten(scope: object, handler: Handler<T>) {
        // takes a listener function out of the list
        const index = this.indexOf(scope, handler);
        if (index < 0) {
            return;
        }
        this.listeners.splice(index, 1);
    }
    
    unlistenAll(scope: object) {
        let i = this.listeners.length;
        while (i-- > 0) {
            const listener = this.listeners[i];
            if (listener.scope === scope) {
                this.listeners.splice(i, 1);
            }
        }
    }
    
    hasListener(scope: object, handler: Handler<T>) {
        // returns true if the listener is in the list
        return this.indexOf(scope, handler) >= 0;
    }

    indexOf(scope: object, handler: Handler<T>) {
        let i = this.listeners.length;
        while (i-- > 0) {
            const listener = this.listeners[i];
            if (listener.scope === scope && listener.handler === handler) {
                return i;
            }
        }
        return -1;
    }
    
    dispatch(message: T) {
        for (const listener of this.listeners) {
            listener.boundHandler(message);
        }
        this.removeOnces();
    }

    removeOnces() {
        for (let i=this.listeners.length - 1; i >= 0; i--) {
            if (this.listeners[i].once) {
                this.listeners.splice(i, 1);
            }
        }
    }
}