const fs = require("fs-extra");
const spawn = require("child_process").spawn;
const logger = require("./Logger").logger;

function runProcess(name, command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        let cwd = options.cwd;
        if (cwd) {
            if (fs.existsSync(cwd) === false) {
                return reject("path " + cwd + " path doesn't exist");
            }
            const stat = fs.statSync(cwd);
            if (stat.isDirectory() === false) {
                return reject("path " + cwd + " is not a directory");
            }
        }
        
        const onLog = options.onLog || logger.info;
        function handleLog(str, options) {
            str = str.trim();
            if (str) {
                onLog(str, options);
            }
        }

        if (options.mute !== true) {
            console.log("Starting process " + name + (cwd ? " in " + cwd : "") + "...");
            console.log(" > " + command + " " + args.join(" "));
        }
        const ls = spawn(command, args || [], {
            cwd,
            env: process.env
        });
        ls.stdout.on("data", data => {
            handleLog(data.toString(), options);
        });
        ls.stderr.on("data", data => {
            handleLog(data.toString(), options);
        });
        ls.on("close", code => {
            if (options.mute !== true) {
                console.log("Process " + name + " closed (" + code + ")");
            }
            if (options.onExit) {
                options.onExit();
            }
            else {
                resolve(code);
            }
        });
    });
}

module.exports = runProcess;