const fs = require("fs-extra");
const path = require("path");
const includeFiles = require("./includeFiles");

const TEMP_DIR = path.resolve(__dirname, "../node_modules/.temp");

async function writeTemp(name, data, options) {
    if ((await fs.exists(TEMP_DIR)) === false) {
        fs.mkdirSync(TEMP_DIR);
        fs.chmodSync(TEMP_DIR, "0777");
    }
    const filePath = getPath(name);
    if ((await fs.existsSync(filePath))) {
        const existing = await fs.readFile(filePath, options);
        if (existing === data) {
            return;
        }
    }
    await fs.writeFile(filePath, data, options);
    await fs.chmod(filePath, "0777");
}

function getPath(name) {
    return path.join(TEMP_DIR, name);
}

async function readTemp(name, options) {
    const filePath = getPath(name);
    const result = await fs.readFile(filePath, options);
    return result;
}

async function removeAll() {
    await fs.emptyDir(TEMP_DIR);
}

module.exports = { getPath, writeTemp, readTemp, removeAll };