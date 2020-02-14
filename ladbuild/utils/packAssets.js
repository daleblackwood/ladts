const fs = require("fs-extra");
const packer = require("./packer");

async function packAssets(project) {
    const assetPath = project + "/assets";
    return await packer.packFolders(assetPath, project + "/dist/assets");
}

module.exports = packAssets;