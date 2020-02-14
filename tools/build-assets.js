const argparse = require("argparse");
const fs = require("fs-extra");
const path = require("path");
const makeTilesheet = require("./make-tilesheet");

async function buildAssets(manifestFile, outPath) {
    if ((await fs.exists(manifestFile)) === false) {
        throw new Error("Manifest '" + manifestFile + "' not found.");
    }
    if ((await fs.stat(manifestFile)).isFile() === false) {
        throw new Error("Manifest '" + manifestFile + "' is not a file.");
    }
    if ((await fs.exists(outPath)) === false) {
        throw new Error("Out folder '" + outPath + "' not found.");
    }
    if ((await fs.stat(outPath)).isDirectory() === false) {
        throw new Error("Out folder '" + outPath + "' is not a directory.");
    }
    const manifestStr = fs.readFileSync(manifestFile, { encoding: "utf-8" });
    const manifest = JSON.parse(manifestStr);
    const manifestDir = path.dirname(manifestFile);

    for (const set of manifest.tilesheets) {
        if (! set.name) {
            throw new Error("tilesheet set requires name property");
        }
        const outFile = path.join(outPath, set.name + ".png");
        const options = {
            tilesize: set.tilesize,
            width: set.width || 512,
            height: set.height || 512,
            json: true,
            patterns: set.patterns,
            vertical: set.vertical,
            split: set.split,
            baseDir: path.join(manifestDir, set.baseDir || "")
        };
        const folder = manifestDir + "/" + set.folder;
        const tilesheet = await makeTilesheet(folder, outFile, options);
        //writeTilesheetMetaData(set, tilesheet);
    }
}

function writeTilesheetMetaData(meta, tilesheet) {
    const outMap = {};
    for (let key in tilesheet.map) {
        const tiles = tilesheet.map[key];
        const folderBits = key.split("/");
        const topFolder = folderBits[0];
        const setKey = Object.keys(meta.folders).find(x => x.indexOf(topFolder) >= 0);
        const set = meta.folders[setKey];
        const patterns = set.patterns;
        if (patterns) {
            for (var patternKey in patterns) {
                const re = new RegExp(patternKey, "gi");
                if (key.match(re)) {
                    key = key.replace(re, "-" + patterns[patternKey]);
                }
            }
        }
        else {
            continue;
        }
        outMap[key] = tiles;
    }
}

module.exports = buildAssets;

if (!module.parent) {
    const parser = new argparse.ArgumentParser({ addHelp: true });
    parser.addArgument(["--manifest", "-m"], { help: "The image folder to import (resursive)", required: true });
    parser.addArgument(["--outpath", "-o"], { help: "The file to export to (png)", required: true });
    const args = parser.parseArgs();
    buildAssets(args.manifest, args.outpath);//.catch(e => console.log("Asset Error", e));
}