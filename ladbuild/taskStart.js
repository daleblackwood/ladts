const fs = require("fs-extra");
const verifyProject = require("./utils/verifyProject");
const tscCompile = require("./utils/tscCompile");
const packAssets = require("./utils/packAssets");
const copyTemplates = require("./utils/copyTemplates");
const watchTree = require("watch").watchTree;
const logger = require("./utils/Logger").logger;
const path = require("path");
const Server = require("./utils/Server");
const strings = require("./utils/strings");

async function taskStart(project) {
    await verifyProject(project);
    await copyTemplates(project);

    const compileScripts = async () => {
        await tscCompile(project);
    };

    const buildAssets = async () => {
        await packAssets(project);
    };

    await buildAssets();
    await compileScripts();

    watchFolder("assets", project, "assets", buildAssets);
    watchFolder("project code", project, "src", compileScripts);
    watchFolder("engine code", project, "../lad/src", compileScripts);

    new Server(project);

    while (true) {
        await new Promise(() => setTimeout(() => {}, 1000));
    }
}

function watchFolder(watchName, project, projectFolder, onChange, runOnFirst = false) {
    const folder = path.resolve(project + "/" + projectFolder);

    if (fs.existsSync(folder) === false)
        return;
        
    const folderName = strings.printProjectPath(project, projectFolder);
    logger.highlight("Watching " + watchName + "... (" + folderName + ")");

    const runner = () => {
        let runCount = 0;
        let timer;
        return inFiles => {
            if (runOnFirst || runCount > 0) {
                logger.log(watchName + " change detected");
                clearTimeout(timer);
                timer = setTimeout(() => {
                    clearTimeout(timer);
                    onChange();
                }, 300);
            }
            runCount++;
        };
    };

    watchTree(folder, runner());
}

module.exports = taskStart;