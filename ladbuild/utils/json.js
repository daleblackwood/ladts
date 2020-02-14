const fs = require("fs-extra");

async function jsonRead(path, ignoreErrors = false) {
    const exists = await fs.exists(path);
    if (! exists) {
        if (ignoreErrors !== true) {
            throw new Error("JSON '" + path + "' doesn't exist");
        }
        return null;
    }
    const str = await fs.readFile(path, { encoding: "utf-8" });
    let json = null;
    try {
        json = JSON.parse(str);
    }
    catch (e) {
        if (ignoreErrors !== true) {
            throw new Error("JSON '" + path + "' invalid");
        }
    }
    return json;
}

function jsonToString(json, condensed) {
    const jsonstr = JSON.stringify(json, null, condensed ? "" : "  ");
    let result = "";
    const arraySplits = jsonstr.split(/(\[[^\[\{]*?\])/g);
    if (condensed !== true) {
        for (let i=0; i<arraySplits.length; i++) {
            let line = arraySplits[i];
            if ((i % 2) > 0) {
                line = line.replace(/\s+/g, " ");
                line = line.replace(/((?<=\[)\s)|(\s(?=\]))/g, "");
            }
            result += line;
        }
    }
    return result;
}

async function jsonWrite(path, json, condensed = true) {
    const jsonstr = jsonToString(json, condensed);
    await fs.writeFile(path, jsonstr, { encoding: "utf-8" });
    return jsonstr;
}

module.exports = { jsonRead, jsonWrite };