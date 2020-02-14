const { walk } = require("watch");
const fs = require("fs-extra");
const path = require("path");

async function includeFiles(includePattern, basePath) {
    if (typeof includePattern !== "string") throw new Error("Path must be string, got " + includePattern.toString());

    let folder = includePattern;
    const asteriskI = includePattern.indexOf("*");
    if (asteriskI >= 0) {
        folder = includePattern.substr(0, asteriskI);
    }

    if (basePath) {
        folder = path.join(basePath, folder);
    }

    if ((await fs.exists(folder)) === false) {
        throw new Error("folder '" + folder + "' doesn't exist");
    }

    const fileStats = await new Promise((resolve, reject) => {
        walk(folder, {
            ignoreDotFiles: true
        }, (err, res) => err ? reject(err) : resolve(res));
    });

    let files = Object.keys(fileStats);

    if (asteriskI >= 0) {
        let pattern = includePattern.substr(asteriskI);
        pattern = pattern.replace(/\*\*/g, ".*");
        pattern = pattern.replace(/\*/g, ".*");
        pattern = pattern.replace(/\./g, "\\.");
        const patternRe = new RegExp(pattern, "g");
        files = files.filter(x => Boolean(x.match(patternRe)));
    }

    if (basePath) {
        files = files.map(x => path.join(basePath, x));
    }

    for (let i=files.length-1; i>=0; i--) {
        const fstat = await fs.stat(files[i]);
        if (fstat.isDirectory()) {
            files.splice(i, 1);
        }
    }

    return files;
}

module.exports = includeFiles;