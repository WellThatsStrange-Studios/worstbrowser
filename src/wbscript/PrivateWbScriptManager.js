"use strict";
exports.__esModule = true;
exports.PrivateWbScriptManager = void 0;
var fs = require("fs");
var cp = require("child_process");
var YAML = require("yaml");
var PrivateWbScriptManager = /** @class */ (function () {
    function PrivateWbScriptManager(data) {
        this.config = data.config;
        this.webView = data.webView;
        this.extensions = data.extensions;
    }
    PrivateWbScriptManager.prototype.load = function (data) {
        this.data = data;
    };
    PrivateWbScriptManager.prototype.exec = function () {
        var _this = this;
        this.extensions.event('onScriptExecute', [YAML.stringify(this.data)]);
        this.data.commands.forEach(function (_cmd) {
            var __cmd = {
                cmd: (typeof _cmd.cmd === 'string') ? _cmd.cmd : _this.getVarData(_cmd.cmd.data),
                args: []
            };
            if (_cmd.args)
                _cmd.args.forEach(function (i) {
                    if (i.data) {
                        __cmd.args.push(_this.getVarData(i.data));
                    }
                    else {
                        __cmd.args.push(i);
                    }
                });
            var command = __cmd;
            switch (command.cmd) {
                case 'ext-install':
                    _this.extensions.installFromLink(command.args[0]);
                    break;
                case 'save-bookmark':
                    _this.save_bookmark();
                    break;
                case 'notify':
                    _this.notify(command.args);
                    break;
                case 'popup':
                    _this.popup(command.args);
                    break;
                default:
                    _this.err(command.cmd + ' >> Command not found');
                    break;
            }
        });
    };
    PrivateWbScriptManager.prototype.getVarData = function (varName) {
        return this.data.data[varName];
    };
    PrivateWbScriptManager.prototype.err = function (str) {
        console.log('\x1b[31m[!]\x1b[0m '
            + this.webView.getUri()
            + ' has \x1b[1merrored\x1b[0m:'
            + '\n'
            + '\t\x1b[3;1m' + str + '\x1b[0m'
            + '\n'
            + '\t\x1b[2mOriginated from: '
            + '\x1b[1mPrivateWbScript\x1b[0m');
    };
    PrivateWbScriptManager.prototype.save_bookmark = function () {
        this.config.bookmarks[this.webView.getTitle()] = this.webView.getUri();
        fs.writeFileSync(process.argv[2], JSON.stringify(this.config, null, '\t'));
    };
    PrivateWbScriptManager.prototype.notify = function (args) {
        var cmd = 'notify-send';
        cmd += " \"" + args[0] + "\"";
        cmd += " \"" + args[1] + "\"";
        try {
            var res = cp.execSync(cmd);
            var str = String(res);
        }
        catch (err) {
            this.err(err);
        }
    };
    PrivateWbScriptManager.prototype.popup = function (args) {
        var cmd = 'zenity --info';
        cmd += " --text \"" + args[0] + "\"";
        cmd += " --width " + (args[1] || '200');
        try {
            var res = cp.execSync(cmd);
            var str = String(res);
        }
        catch (err) {
            this.err(err);
        }
    };
    return PrivateWbScriptManager;
}());
exports.PrivateWbScriptManager = PrivateWbScriptManager;
