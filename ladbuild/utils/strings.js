const path = require("path");

const strings = {};

strings.PRODUCT = "LadBuilder";
strings.EXEC = "node ladbuild";
strings.VERSION = "1.0.0";
strings.HELP_INIT = `To initialise a new ${strings.PRODUCT} project, run '${strings.EXEC} init (project name)'`;

strings.printProjectPath = (project, folder) => {
    return path.relative(project + "/../", project + "/" + folder);
};

module.exports = strings;