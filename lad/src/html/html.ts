export type StyleAttributes = Partial<CSSStyleDeclaration>;

export type ElementAttributes = {
    style?: StyleAttributes,
    parentElement?: HTMLElement,
    innerHTML?: string,
    innerText?: string,
    [key: string]: any
}

export class html {

    static create<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: ElementAttributes = {}, children?: HTMLElement[]): HTMLElementTagNameMap[K] {
        const elem = document.createElement(tag);
        this.setAttributes(elem, attrs);
        if (children) {
            for (const child of children) {
                elem.appendChild(child);
            }
        }
        return elem;
    }

    static setAttributes<T extends HTMLElement>(elem: T, attrs: ElementAttributes = {}) {
        let parentElement = null;
        for (const key in attrs) {
            if (key === "style") {
                this.setStyle(elem, attrs[key]);
            }
            else if (key === "parentElement") {
                parentElement = attrs[key];
            }
            else if (key === "innerHTML") {
                elem.innerHTML = attrs[key];
            }
            else if (key === "innerText") {
                elem.innerText = attrs[key];
            }
            else {
                elem.setAttribute(key, attrs[key].toString());
            }
        }
        if (parentElement) {
            parentElement.appendChild(elem);
        }
        return elem;
    }

    static setStyle<T extends HTMLElement>(elem: T, style: { [key: string]: any } = {}) {
        for (const key in style) {
            elem.style[key as any] = style[key];
        }
        return elem;
    }

}