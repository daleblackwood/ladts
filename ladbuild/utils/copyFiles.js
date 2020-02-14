const includeFiles = require("./includeFiles");
const fs = require("fs-extra");
const path = require("path");

async function copyFiles(files, destFolder, overwrite = true) {
    const promises = [];
    for (const file of files) {
        const destName = path.basename(file);
        promises.push(copyFile(file, path.join(destFolder, destName), overwrite));
    }
    return await Promise.all(promises);
}

async function copyFile(src, dest, overwrite = true) {
    if (overwrite !== true) {
        if (await fs.exists(dest)) {
            return;
        }
    }
    await fs.copyFile(src, dest);
}

module.exports = copyFiles;