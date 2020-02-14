const verifyProject = require("./utils/verifyProject");
const tscCompile = require("./utils/tscCompile");
const packAssets = require("./utils/packAssets");
const copyTemplates = require("./utils/copyTemplates");

async function taskBuild(project) {
    await verifyProject(project);
    await copyTemplates(project);
    await packAssets(project);
    await tscCompile(project);
}

module.exports = taskBuild;