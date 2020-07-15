const AdmZip = window.require("adm-zip");
const fs = window.require("fs");

export class ZipBetter {
    constructor(scope, zip) {
        this.scope = scope || "";
        this.admZip = zip || new AdmZip();
        this.size = 0;
    }

    nameToPath(name, isDir) {
        let p = this.scope + name;

        if (isDir && !p.endsWith("/"))
            p += "/";
        if (!isDir && p.endsWith("/"))
            p = p.substring(0, p.length - 1);
        return p;
    }

    addFile(name, content) {
        this.admZip.addFile(this.nameToPath(name, false), content);
        this.size++;
    }

    addFolder(name) {
        let path = this.nameToPath(name, true);
        this.admZip.addFile(path, "");
        this.size++;
        return new ZipBetter(path, this.admZip);
    }

    importFolder(localPath, zipName) {
        let zipPath = this.nameToPath(zipName, true);
        this.size++;
        this.admZip.addLocalFolder(localPath, zipPath);
    }

    importFile(localPath, zipName, pre) {
        //let zipPath = this.nameToPath(zipName, false);
        this.size++;
        this.addFile(zipName, pre + fs.readFileSync(localPath).toString());
    }

    isEmpty() {
        return this.size > 0;
    }

    hasFolder(name) {
        return this.admZip.getEntries().some(x => x.entryName === "/" + name);
    }

    write(filePath) {
        this.admZip.writeZip(filePath);
    }
}
