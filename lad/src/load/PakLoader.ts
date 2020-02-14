import { ALoader } from "./ALoader";
import { Pak } from "../utils/Pak";

export class PakLoader extends ALoader<Pak> {

    loadPromise(): Promise<Pak> {
        return new Promise<Pak>((resolve, reject) => {
            const script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.src = this.url;
            document.head.appendChild(script);
            let attempts = 100;
            const checkTimer = setInterval(() => {
                const win = window as any;
                if (win && win.ladpaks) {
                    let pakKey = this.url.replace(/\\/g, "/");
                    pakKey = pakKey.substr(pakKey.lastIndexOf("/") + 1);
                    const data = win.ladpaks[pakKey];
                    if (data) {
                        console.log("ladpak", data);
                        clearInterval(checkTimer);
                        return resolve(new Pak(data));
                    }
                }
                attempts--;
                if (attempts < 0) {
                    clearInterval(checkTimer);
                    return reject("Ladpak " + this.url + " couldn't be loaded.");
                }
            }, 100);
        });
    }

}