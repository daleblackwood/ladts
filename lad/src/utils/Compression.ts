
const PREFIX_COMPRESS = "LADC:";
const PREFIX_PACKAGE = "LADP:";

export class Compression {

    static isCompressed(s: string) {
        return s && s.startsWith(PREFIX_COMPRESS);
    }

    // LZW-compress a string
    static compress(s: string) {
        let dictionary: { [key: string]: number } = {};
        let uncompressed = s;
        let dictSize = 256;

        for (let i = 0; i < 256; i += 1) {
            dictionary[String.fromCharCode(i)] = i;
        }

        let w = "";
        let ASCII = "";
        for (let i = 0; i < uncompressed.length; i += 1) {
            const c = uncompressed.charAt(i);
            let wc = w + c;
            //Do not use dictionary[wc] because javascript arrays
            //will return values for array['pop'], array['push'] etc
            if (dictionary.hasOwnProperty(wc)) {
                w = wc;
            } else {
                ASCII += String.fromCharCode(dictionary[w]);
                // Add wc to the dictionary.
                dictionary[wc] = dictSize++;
                w = String(c);
            }
        }

        // Output the code for w.
        if (w !== "") {
            ASCII += String.fromCharCode(dictionary[w]);
        }
        return PREFIX_COMPRESS + ASCII;
    }

    // Decompress an LZW-encoded string
    static decompress(s: string) {
        if (this.isCompressed(s) === false) {
            return null;
        }
        s = s.substr(PREFIX_COMPRESS.length);
        let dictionary = [];
        let compressed: number[];
        let entry = "";
        let dictSize = 256;

        for (let i = 0; i < 256; i += 1) {
            dictionary[i] = String.fromCharCode(i);
        }

        const tmp: number[] = [];
        // convert string into Array.
        for(let i = 0; i < s.length; i += 1) {
            tmp.push(s[i].charCodeAt(0));
        }
        compressed = tmp;

        let w = String.fromCharCode(compressed[0]);
        let result = w;
        for (let i = 1; i < compressed.length; i += 1) {
            let k = compressed[i] as number;
            if (dictionary[k]) {
                entry = dictionary[k];
            } else {
                if (k === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }

            result += entry;

            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);

            w = entry;
        }
        return result;
    }

    static isPacked(s: string) {
        return s && s.startsWith(PREFIX_PACKAGE);
    }

    static safePack(str: string) {
        str = this.compress(str);
        str = encodeURIComponent(str);
        str = unescape(str);
        str = btoa(str); 
        return PREFIX_PACKAGE + str;
    }

    static safeUnpack(str: string) {
        if (this.isPacked(str) === false) {
            return null;
        }
        str = str.substr(PREFIX_COMPRESS.length);
        str = atob(str);
        str = escape(str);
        str = decodeURIComponent(str);
        str = this.decompress(str);
        return str;
    }
}