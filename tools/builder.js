const spawn = require("child_process").spawn;
const process = require("process");
const fs = require("fs-extra");
const path = require("path");

const modes = { install, start, build };
const LOG_COLOR = {
    RESET: "\x1b[0m",
    YELLOW: "\x1b[33m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    CYAN: "\x1b[36m"
}

const DEBUG = false;

function run() {
    let args = process.argv;
    let modeI = -1;
    let mode = null;
    for (const key in modes) {
        const argI = args.indexOf(key);
        if (argI >= 0) {
            args = args.slice(modeI);
            mode = key;
            break;
        }
    }
    if (!mode) {
        console.log("Unknown option '" + mode + "'.\nOptions are: " + Object.keys(modes).join(", "));
    }

    const cwd = args[0];
    const method = modes[mode];
    const options = {
        cwd
    };
    if (typeof method === "function") {
        return method(options);
    }
}

function install() {
    runProcess("install", "npm", ["install", "typescript", "static-server", "-g"]);
}

function build(options) {
    runProcess("tsc", "tsc", {
        ...options,
        onLog: logTsc
    });
}

async function start(options) {
    runProcess("tsc", "tsc", ["-w"], {
        cwd: path.join(options.cwd),
        onLog: logTsc,
        onExit: () => exit(1)
    });
    await sleep(1000);
    runProcess("server", "static-server", ["-p", "7777"], {
        cwd: path.join(options.cwd, "/dist"), 
        onLog: logServe,
        onExit: () => exit(1)
    });
}

function runProcess(name, command, args, options) {
    options = options || {};
    let cwd = options.cwd;
    if (cwd) {
        if (fs.existsSync(cwd) === false) {
            return exit(1, "path " + cwd + " path doesn't exist");
        }
        const stat = fs.statSync(cwd);
        if (stat.isDirectory() === false) {
            return exit(1, "path " + cwd + " is not a directory");
        }
    }
    
    const onLog = options.onLog || log;
    function handleLog(str, options) {
        str = str.trim();
        if (str) {
            onLog(str, options);
        }
    }

    console.log("Starting " + name + (cwd ? " in " + cwd : "") + "...");
    console.log(" > " + command + " " + args.join(" "));
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
        console.log(name + " exited (" + code + ")");
        if (options.onExit) {
            options.onExit();
        }
    });
}

async function sleep(time) {
    time = Math.max(time || 0, 1);
    return new Promise(resolve => setTimeout(resolve, time));
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
        logColor = LOG_COLOR.CYAN;
    }
    if (str.indexOf("compilation") >= 0 || str.indexOf("watch") >= 0) {
        logColor = LOG_COLOR.YELLOW;
    }
    const errorCount = parseInt((str.match(/(?<=Found )(\d+)(?= error)/g) || [])[0]);
    if (isNaN(errorCount) === false) {
        logColor = errorCount > 0 ? LOG_COLOR.RED : LOG_COLOR.GREEN;
    }
    log("tsc > " + str, logColor);
}

function logServe(str) {
    let logColor = undefined;
    const prefix = str.substr(0, 3);
    if (prefix === "<--" || prefix === "-->") {
        return;
    }
    if (str.indexOf("Serving ") >= 0) {
        logColor = LOG_COLOR.YELLOW;
    }
    log("serve > " + str, logColor);
}

function log(msg, color) {
    let args = [];
    if (color) {
        args.push(color + "%s" + LOG_COLOR.RESET);
    }
    args.push(msg);
    console.log.apply(console, args);
}

function exit(code, message) {
    if (code === 0) {
        console.log(message);
    }
    else {
        console.error(message);
    }
    process.exit(code);
}

process.on("exit", ()=> console.log(LOG_COLOR.RESET));

try {
    run();
}
catch (e) {
    if (DEBUG) {
        exit(1, e);
    }
    else {
        exit(1, "Error: " + e.message);
    }
}