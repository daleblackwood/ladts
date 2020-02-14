const http = require("http");
const fs = require("fs");
const path = require("path");
const logger = require("./Logger").logger;

const CONTENT_TYPES = {
    "js": "text/javascript",
    "css": "text/css",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpg",
    "wav": "audio/wav",
    "ogg": "audio/ogg",
    "mp3": "audio/mp3",
    "htm": "text/html",
    "html": "text/html"
};

class Server {

    constructor(project, port = 7777) {
        this.project = project;
        this.port = port;
        this.start(port);
    }

    start() {
        const basePath = this.project + "/dist";
        this.server = http.createServer((request, response) => {
            let filePath = "." + request.url;
            if (filePath == "./") {
                filePath = "./index.html";
            }

            const queryI = filePath.indexOf("?");
            if (queryI >= 0) {
                filePath = filePath.substr(0, queryI);
            }
        
            const extname = path.extname(filePath).substr(1).toLowerCase();
            const contentType = Server.CONTENT_TYPES[extname] || "text/plain";
        
            const fullPath = path.join(basePath, filePath);
            fs.readFile(fullPath, function(error, content) {
                if (error) {
                    if (error.code == "ENOENT"){
                        fs.readFile(path.join(basePath, "/index.html"), (error, content) => {
                            response.writeHead(404, { "Content-Type": "text/html" });
                            response.end(content, "utf-8");
                        });
                    }
                    else {
                        response.writeHead(500);
                        response.end("Sorry, check with the site admin for error: "+error.code+" ..\n");
                        response.end(); 
                    }
                }
                else {
                    response.writeHead(200, { "Content-Type": contentType });
                    response.end(content, "utf-8");
                }
            });
        
        }).listen(this.port);
        logger.ok("Serving " + this.project + " on http://localhost:" + this.port + "/");
    }

    stop() {
        this.server.stop();
    }

}

Server.CONTENT_TYPES = CONTENT_TYPES;

module.exports = Server;