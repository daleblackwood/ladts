const fs = require("fs-extra");
const strs = require("./strings");

async function verifyProject(path) {
    if (! path) {
        throw new Error("No path specified.\n" + strs.HELP_INIT);
    }
    if (! (await fs.exists(path))) {
        throw new Error("Path '" + path + "' does not exist.\n" + strs.HELP_INIT);
    }
    return true;
}

module.exports = verifyProject;