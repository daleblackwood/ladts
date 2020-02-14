const utils = {};

utils.toWords = function(str) {
    let words = [];
    let word = "";
    let lastChar = "";

    for (let i=0; i<str.length; i++) {
        let char = str[i];
        let wordSplitChar = char === "-" || char === "_" || char === "/";

        let newWord = false;
        if (i !== 0) {
            if (char === " " || wordSplitChar) {
                newWord = true;
            }
            else if (char.toUpperCase() === char && lastChar.toUpperCase() !== lastChar) {
                newWord = true;
            }
        }

        if (newWord) {
            let trimmed = word.trim();
            if (trimmed.length > 0) {
                words.push(trimmed);
            }
            if (wordSplitChar === false) {
                word = char.toUpperCase();
            }
            else {
                word = "";
            }
        }
        else {
            word += char;
        }

        lastChar = char;
    }

    let trimmed = word.trim();
    if (trimmed.length > 0) {
        words.push(trimmed);
    }
    return words;
};

utils.objectLookup = function(obj, dotPath, initializeValue) {
    const path = dotPath.split(".");
    let result = obj;
    while (path.length > 0) {
        let pathbit = path.shift();
        if (!result[pathbit]) {
            if (typeof initializeValue === "undefined" || initializeValue === null) {
                return null;
            }
            result[pathbit] = result[pathbit] || path.length === 0 ? initializeValue : {};
        }
        result = result[pathbit];
    }
    return result;
};

utils.toJSON = function(obj) {
    let jsonstr = JSON.stringify(obj, null, "    ");
    let result = "";
    const arraySplits = jsonstr.split(/(\[[^\[\]]*?\])/g);
    for (let i=0; i<arraySplits.length; i++) {
        result += (i % 2) == 0 ? arraySplits[i] : arraySplits[i].replace(/\s+/g, " ");
    }
    return result;
};

utils.nameToPath = function(name) {
    const path = utils.toWords(name).map(x => x.toLowerCase()).join(".");
    return path;
};

utils.safeName = function(name) {
    const path = utils.toWords(name).map(x => x.toLowerCase()).join("_");
    return path;
};

module.exports = utils;