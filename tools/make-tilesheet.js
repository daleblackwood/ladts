const argparse = require("argparse");
const fs = require("fs-extra");
const path = require("path");
const recursiveReadDir = require("recursive-readdir");
const Jimp = require("jimp");
const utils = require("./utils");

async function makeTilesheet(imageFolders, outFile, options) {
    if (typeof imageFolders === "string") {
        imageFolders = [imageFolders];
    }
    const files = [];
    for (const imageFolder of imageFolders) {
        if (fs.statSync(imageFolder).isDirectory() === false) {
            throw new Error(imageFolder + " isn't a directory");
        }
        const folderFiles = await recursiveReadDir(imageFolder);
        for (const ff of folderFiles) {
            files.push(ff);
        }
    }
    if (files.length < 1) {
        throw new Error("Nothing in folder");
    }
    files.sort((a, b) => a < b ? -1 : 1);

    const width = options.width || 512;
    const height = options.height || 512;
    let tilesizeX = 32;
    let tilesizeY = 32;
    if (Number(options.tilesize)) {
        tilesizeX = tilesizeY = Number(options.tilesize);
    }
    else if (options.tilesize instanceof Array) {
        tilesizeX = options.tilesize[0] || tilesizeX;
        tilesizeY = options.tilesize[1] || tilesizeY;
    }
    const tilesize = options.tilesize || 32;
    const writeJSON = true;//Boolean(options.writeJSON);
    const image = await Jimp.create(width, height);

    const vertical = Boolean(options.vertical);

    const patterns = options.patterns;

    const jsonMap = {};
    let prevFolder = "";
    let ta = 0;
    let tb = 0;
    for (const file of files) {
        const basename = path.basename(file, path.extname(file));
        const firstword = utils.toWords(basename)[0].toLowerCase();
        const folder = path.basename(path.dirname(file));
        let name = basename;
        if (patterns) {
            let matched = false;
            for (const patternKey in patterns) {
                let rePattern = patternKey.replace(/{folder}/gi, folder);
                rePattern = rePattern.replace(/{file}/gi, basename);
                let re;
                try {
                    re = new RegExp(rePattern, "gi");
                }
                catch (e) {
                    throw new Error("invalid regex '" + rePattern + "'");
                }
                const extensionless = file.substr(0, file.lastIndexOf("."));
                if (extensionless.match(re)) {
                    matched = true;
                    name = patterns[patternKey].replace(/{folder}/gi, folder.toLowerCase());
                    name = name.replace(/{file}/gi, basename.toLowerCase());
                    name = name.replace(/{first}/gi, firstword);
                    if (options.split) {
                        name = name.replace(new RegExp("\\" + options.split), ".");
                    }
                    break;
                }
            }
            if (matched === false) {
                continue;
            }
        }
        if (folder != prevFolder) {
            prevFolder = folder;
            if (ta !== 0) {
                ta = 0;
                tb++;
            }
        }
        const tx = vertical ? tb : ta;
        const ty = vertical ? ta : tb;
        const px = tx * tilesizeX;
        const py = ty * tilesizeY;
        let tileImage;
        const ext = path.extname(file).toLowerCase().replace(".", "");
        switch (ext) {
            case "png":
            case "jpg":
            case "bmp":
            case "gif":
                tileImage = await Jimp.read(file);
                break;
        }
        if (! tileImage) {
            continue;
        }
        await copyTileImage(tileImage, image, px, py, tilesizeX, tilesizeY);

        // add metadata
        if (name !== "{skip}") {
            const setKey = name;
            utils.objectLookup(jsonMap, setKey, [tx, ty]);
        }

        const wrap = (vertical && py + tilesizeY * 2 >= height)
            || (!vertical && px + tilesizeX * 2 >= width);
        if (wrap) {
            ta = 0;
            tb++;
        }
        else {
            ta++;
        }
    }

    if (outFile) {
        console.log("writing tilesheet: " + outFile);
        await image.write(outFile);
    }

    const imageData = await image;

    const result = {
        image: outFile ? path.basename(outFile) : "image",
        tilesize: [tilesizeX, tilesizeY],
        blocks: jsonMap
    };

    // json output
    const basename = path.basename(outFile, path.extname(outFile));
    const jsonPath = path.join(path.dirname(outFile), basename + ".tiles.json");
    const json = utils.toJSON(result);
    if (writeJSON) {
        fs.writeFileSync(jsonPath, json);
    }

    return result;
}

async function copyTileImage(srcImage, destImage, x, y, width, height) {
    const resized = srcImage.clone().resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR);
    await destImage.composite(resized, x, y);
}

module.exports = makeTilesheet;

if (!module.parent) {
    const parser = new argparse.ArgumentParser({ addHelp: true });
    parser.addArgument(["--path", "-p"], { help: "The image folder to import (resursive)", required: true });
    parser.addArgument(["--file", "-f"], { help: "The file to export to (png)", required: true });
    parser.addArgument(["--tilesize", "-ts"], { help: "(optional) The size of the tiles" });
    parser.addArgument(["--folder-breaks", "-fb"], { help: "(optional) Break line on new folder" });
    parser.addArgument(["--width", "-iw"], { help: "(optional) texture width" });
    parser.addArgument(["--height", "-ih"], { help: "(optional) texture height" });
    parser.addArgument(["--json"], { help: "Generate JSON attributes" });
    const args = parser.parseArgs();
    makeTilesheet(args.path, args.file, { ...args }).catch(e => console.log("Tilesheet Error", e));
}