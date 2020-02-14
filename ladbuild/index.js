const taskBuild = require("./taskBuild");
const taskStart = require("./taskStart");
const logger = require("./utils/Logger").logger;

const tasks = {
    "build": taskBuild,
    "start": taskStart
}

async function run() {
    logger.highlight("\n- - - LadBuild - - -");
    const args = process.argv.slice(2);
    const taskName = (args.shift() || "").toLowerCase();
    const task = tasks[taskName];
    if (! task) {
        const taskNames = Object.keys(tasks).join(", ");
        throw "Unrecognised task " + taskName + "!\n - options are: " + taskNames;
    }
    const path = args.shift() || process.cwd();
    logger.info("Project path: " + path);
    logger.info("Running task: " + taskName + "...");
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = await task(path);
    logger.info("LadBuild task " + taskName + " completed");
    return result;
}   

module.exports = run;

if (! module.parent) {
    run().then(() => {
        //process.exit(0);
    }).catch(e => {
        let message = typeof e === "string" ? e : e.message;
        message = message.replace(/UnhandledPromiseRejectionWarning\: /g, "");
        const errorMsg = (e.message + (e.stack ? "\n" + e.stack : "")).substr(0, 500);
        logger.error(errorMsg);
        process.exit(1);
    });
}