const path = require("path");
const fs = require("fs-extra");
const includeFiles = require("./includeFiles");
const logger = require("./Logger").logger;

const packer = {};
const parsers = {};

packer.packFolders = async function(parentFolder, outFolder) {
    logger.highlight("Pakking folders in " + parentFolder + "...");
    let folders = [];

    const folderExists = await fs.exists(parentFolder);
    if (folderExists) {
        folders = await fs.readdir(parentFolder);
        folders = folders.filter(x => x.charAt(0) !== ".");
        folders = folders.map(x => parentFolder + "/" + x);
        folders = folders.filter(async x => (await fs.stat(x)).isDirectory());
    }
    
    for (const folder of folders) {
        const pakName = path.basename(folder);
        await packer.pack(folder, path.join(outFolder, pakName + ".pak.js"));
    }
}

packer.pack = async function(folder, outfile) {
    const outData = {};
    const packName = path.basename(outfile);
    const folderFiles = await includeFiles(folder);
    const printFolderName = path.relative(path.dirname(folder) + "/../../", folder);
    if (folderFiles.length < 1) {
        logger.info("Nothing to pak in " + printFolderName + ". Skipping...");
        return;
    }
    for (const file of folderFiles) {
        const fileData = await packer.parseFile(file);
        const fileName = path.relative(folder, file);
        outData[fileName] = fileData;
    }
    let outStr = `;window.ladpaks=window.ladpaks||{};window.ladpaks["${packName}"]=`;
    outStr += JSON.stringify(outData, null, "  ");
    const printOutFile = path.relative(path.dirname(outfile) + "/../../../", outfile);
    logger.ok("Pakked " + folderFiles.length + " file(s) into " + printOutFile);
    await fs.writeFile(outfile, outStr, { encoding: "utf-8" });
};

packer.parseFile = async function(source) {
    const ext = path.extname(source);
    if (!ext) {
        console.warn(`No parser without extension on file '${source}'`);
        return;
    }
    const type = ext.substr(1).toLowerCase();
    const parser = parsers[type];
    if (!parser) {
        console.warn(`No parser for ${type} file '${source}'`);
        return;
    }
    const data = await parser(source);
    return {
        type,
        data
    };
};

parsers.json = async function(file) {
    const text = await fs.readFile(file, { encoding: "utf-8" });
    let data = null;
    try {
        data = JSON.parse(text);
    }
    catch (e) {
        throw new Error("Couldn't parse " + file + "\n" + e.message); 
    }
    return data;
};

parsers.png = async function(file) {
    const blob = await fs.readFile(file);
    return blob.toString("base64");
};

module.exports = packer;