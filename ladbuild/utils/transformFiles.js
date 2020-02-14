const includeFiles = require("./includeFiles");
const fs = require("fs-extra");
const path = require("path");

async function transformFiles(transformFunc, files, destFolder, options = {}) {
    const promises = [];
    for (const file of files) {
        const destName = path.basename(file);
        promises.push(transformFile(transformFunc, file, path.join(destFolder, destName), options));
    }
    return await Promise.all(promises);
}

async function transformFile(transformFunc, src, dest, options = {}) {
    if (options.overwrite !== true) {
        if (await fs.exists(dest)) {
            return;
        }
    }
    const encoding = options.encoding || "utf-8";
    const input = await fs.readFile(src, { encoding });
    const output = transformFunc(input, src, dest, options);
    return await fs.writeFile(dest, output, { encoding });
}

module.exports = transformFiles;