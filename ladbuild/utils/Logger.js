const LogColor = {
    RESET: "\x1b[0m",
    YELLOW: "\x1b[33m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    CYAN: "\x1b[36m"
}

class Logger {

    highlight(message) {
        this.log(message, LogColor.CYAN);
    }

    error(message) {
        this.log(message, LogColor.RED);
    }

    warn(message) {
        this.log(message, LogColor.YELLOW);
    }

    ok(message) {
        this.log(message, LogColor.GREEN);
    }

    info(message) {
        this.log("* " + message);
    }

    log(message, color) {
        const args = [];
        if (color) {
            args.push(color + "%s" + LogColor.RESET);
        }
        args.push(message);
        console.log.apply(console, args);
    }

}

const logger = global.logger || new Logger();

module.exports = { LogColor, Logger, logger };