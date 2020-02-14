const copyFiles = require("./copyFiles");
const includeFiles = require("./includeFiles");

async function copyFolder(src, dest, overwrite = true) {
    const files = await includeFiles(src);
    await copyFiles(files, dest, overwrite);
}

module.exports = copyFolder;