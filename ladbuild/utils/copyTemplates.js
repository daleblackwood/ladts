const includeFiles = require("./includeFiles");
const fs = require("fs-extra");
const path = require("path");
const logger = require("./Logger").logger;

async function copyTemplates(project, overwrite = false) {
    const projectBase = path.basename(project);
    await copyTemplateFiles(path.join(__dirname, "../templates"), path.join(project, "/dist"), {
        PROJECT: projectBase,
        OUTFILE: projectBase + ".js",
        BUILD: Math.random()
    }, overwrite);
}

async function copyTemplateFiles(src, dest, params, overwrite = true) {
    logger.info("Copying templates...");
    const files = await includeFiles(src);
    for (const file of files) {
        const destFile = path.join(dest, path.basename(file))
        await copyTemplate(file, destFile, params, overwrite);
    }
}

async function copyTemplate(src, dest, params, overwrite = true) {
    if (overwrite !== true) {
        if (await fs.exists(dest)) {
            return;
        }
    }
    let file = await fs.readFile(src, { encoding: "utf-8" });
    for (const key in params) {
        const re = new RegExp("\{" + key + "\}", "g");
        file = file.replace(re, params[key]);
    }
    console.log("writing template " + dest);
    await fs.writeFile(dest, file);
}

module.exports = copyTemplates;