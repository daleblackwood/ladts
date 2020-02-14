const fs = require("fs-extra");
const path = require("path");
const includeFiles = require("./includeFiles");
const merge = require("./merge");
const { jsonRead, jsonWrite } = require("./json");
const runProcess = require("./runProcess");
const { logger, LogColor } = require("./Logger");
const temp = require("./tempFiles");
const copyFiles = require("./copyFiles");
const transformFiles = require("./transformFiles");

let hasCompiled = false;

async function tscCompile(folder) {
    const project = await loadProject(folder);
    let files = [];
    for (const entry of project.include) {
        const includedFiles = await includeFiles(entry, folder);
        files.push(...includedFiles);
    }

    const tsConfigPath = folder + "/tsconfig.json";
    if ((await fs.exists(tsConfigPath)) === false) {
        jsonWrite(tsConfigPath, project, false);
        logger.info("Exported tsconfig.json");
    }
    
    const result = await compileProjectTSC(folder, project);
    return { output: result };
}

async function compileProjectTSC(folder, project) {
    const isIncremental = hasCompiled === true;
    const op = isIncremental ? "recompiling" : "compiling";
    logger.highlight(`Typescript ${op} ${path.basename(folder)}...`);
    startTime = new Date().getTime();
    const projectTempName = "tsconf.generated.json";
    const outputTempName = path.basename(project.compilerOptions.outFile);
    project.compilerOptions.baseUrl = path.resolve(folder);
    project.compilerOptions.outFile = temp.getPath(outputTempName);
    project.compilerOptions.incremental = true;
    project.include = project.include.map(x => path.resolve(folder + "/" + x));
    const projectStr = JSON.stringify(project, null, "  ");

    await temp.writeTemp(projectTempName, projectStr, { encoding: "utf-8" });
    const tscResult = await tsExec(folder, temp.getPath(projectTempName), isIncremental);
    if (tscResult > 0) {
        logger.error("Typescript compilation failed");
        return;
    }

    const distFolder = folder + "/dist";
    await copyFiles([temp.getPath(outputTempName)], distFolder);

    const mapFilePath = temp.getPath(outputTempName) + ".map";
    if ((await fs.exists(mapFilePath))) {
        await transformFiles(input => {
            input = input.replace(/\\/g, "/").replace(/(\.\.\/){1,}/g, "../../");
            return input;
        }, [mapFilePath], distFolder, { overwrite: true });
    }
    const time = new Date().getTime() - startTime;
    hasCompiled = true;
    logger.ok("Typescript compiled (" + time + "ms)");
    //await temp.removeAll();
}

async function tsExec(folder, projectFile, isIncremental) {
    const compileArgs = [
        "--build", projectFile
    ];
    await runProcess("Typescript", "tsc", compileArgs, {
        onLog: logTsc,
        cwd: folder,
        mute: true
    });
}

function logTsc(str, options) {
    options = options || {};
    let logColor = undefined;

    let file = undefined;
    const fileI = str.indexOf(".ts");
    if (fileI > 0) {
        file = str.substr(0, fileI + 2);
        file = str.substr(file.indexOf(" ") + 1);
    }

    if (str.indexOf("error TS") >= 0) {
        if (options.cwd) {
            str = options.cwd + "/" + str;
        }
        logColor = LogColor.CYAN;
    }
    if (str.indexOf("compilation") >= 0 || str.indexOf("watch") >= 0) {
        logColor = LogColor.YELLOW;
    }
    const errorCount = parseInt((str.match(/(?<=Found )(\d+)(?= error)/g) || [])[0]);
    if (isNaN(errorCount) === false) {
        logColor = errorCount > 0 ? LogColor.RED : LogColor.GREEN;
    }
    logger.log("tsc > " + str, logColor);
}

function getDefaultProjectConfig(folder) {
    const projectName = path.basename(folder);
    const result = {
        "compilerOptions": {
            "module": "amd",
            "target": "es2016",
            "lib": ["es2016", "dom"],
            "noImplicitAny": true,
            "removeComments": true,
            "preserveConstEnums": true,
            "outFile": "./dist/" + projectName + ".js",
            "sourceMap": true,
            "baseUrl": "./",
            "paths": {
                "lad/*": ["../lad/src/*"],
                [projectName + "/*"]: ["./src/*"],
            }
        },
        "include": [
            "../lad/**/*",
            "./src/**/*"
        ]
    }
    return result;
}

async function loadProject(folder) {
    let config = getDefaultProjectConfig(folder);
    const configPath = path.join(folder, "tsconfig.json");
    const loadedConfig = await jsonRead(configPath, true);
    if (loadedConfig) {
        config = merge(config, loadedConfig);
    }
    return config;
}

module.exports = tscCompile;