"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionManager = void 0;
const fs = require("fs");
const YAML = require("yaml");
class ExtensionManager {
    constructor(dir, extConfigPath) {
        this.arr = [];
        this.dir = dir;
        console.log('Initializing extensions from', this.dir);
        fs.readdirSync(this.dir).forEach((i) => {
            if (!fs.lstatSync(this.dir + '/' + i).isDirectory())
                return;
            const data = YAML.parse(String(fs.readFileSync(this.dir + '/' + i + '/extension.yml')));
            var cfg = JSON.parse(String(fs.readFileSync(extConfigPath)));
            if (cfg[data.nameCompressed]) {
                cfg = cfg[data.nameCompressed];
            }
            else {
                cfg[data.nameCompressed] = {};
                fs.writeFileSync(extConfigPath, JSON.stringify(cfg, null, '\t'));
                cfg = cfg[data.nameCompressed];
            }
            this.arr.push({
                dir: this.dir + '/' + i,
                data: data,
                config: cfg
            });
        });
    }
    event(name, args) {
        this.arr.forEach((i) => {
            if (!i.data.extension)
                return;
            if (i.data.events[name]) {
                try {
                    const _ext = require(i.dir + '/' + i.data.events[name]);
                    _ext(...args);
                }
                catch (err) {
                    console.log(`{ESC}[31;1mEXTENSION ERROR:{ESC}[0m ${err}
\tCaused by: {ESC}[1m${i.data.name}{ESC}[0m
\t{ESC}[2mOn event: {ESC}[1m${name}{ESC}[0m`
                        .split('{ESC}').join('\x1b'));
                }
            }
        });
    }
    getHtmlTable() {
        var str = `<table>
		<thead>
		<tr>
		<td>Package name</td>
		<td>Author</td>
		<td>Status</td>
		<tr></thead>
		<tbody>`;
        this.arr.forEach((i) => {
            str += '<tr>';
            str += `<td>${i.data.name}</td>`;
            str += `<td>${i.data.author}</td>`;
            str += `<td>${(i.data.extension) ? 'Active' : 'Not active'}</td>`;
            str += '</tr>';
        });
        str += '</tbody></table>';
        return str;
    }
    init(data) {
        this.arr.forEach((i) => {
            if (i.data.init && i.data.extension) {
                try {
                    data.config = i.config;
                    const _ext = require(i.dir + '/' + i.data.init).__init;
                    _ext(data);
                }
                catch (err) {
                    console.log(`{ESC}[31;1mEXTENSION ERROR:{ESC}[0m ${err}
\tCaused by: {ESC}[1m${i.data.name}{ESC}[0m
\t{ESC}[2mOn event: {ESC}[1minit{ESC}[0m`
                        .split('{ESC}').join('\x1b'));
                }
            }
        });
    }
}
exports.ExtensionManager = ExtensionManager;
