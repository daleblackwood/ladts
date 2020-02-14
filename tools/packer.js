const path = require("path");
const fs = require("fs-extra");
const argparse = require("argparse");
const recursiveReadDir = require("recursive-readdir");

const packer = {};
const parsers = {};

packer.pack = async function(folder, outfile) {
    const outData = {};
    const packName = path.basename(outfile);
    const folderFiles = await recursiveReadDir(folder);
    for (const file of folderFiles) {
        const fileData = await packer.parseFile(file);
        const fileName = path.relative(folder, file);
        outData[fileName] = fileData;
    }
    let outStr = `;window.ladpaks=window.ladpaks||{};window.ladpaks["${packName}"]=`;
    outStr += JSON.stringify(outData);
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
    const data = JSON.parse(text);
    return data;
};

parsers.png = async function(file) {
    const blob = await fs.readFile(file);
    return blob.toString("base64");
};

module.exports = packer;

if (!module.parent) {
    const parser = new argparse.ArgumentParser({ addHelp: true });
    parser.addArgument(["--folder", "-f"], { help: "The asset folder to pack", required: true });
    parser.addArgument(["--outfile", "-o"], { help: "The name of the package", required: true });
    const args = parser.parseArgs();
    packer.pack(args.folder, args.outfile).catch(e => console.log("Packer Error", e));
}