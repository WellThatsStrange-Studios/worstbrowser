"use strict";
exports.__esModule = true;
exports.getWbScript = void 0;
var YAML = require("yaml");
var removeTabs_1 = require("../removeTabs");
function getWbScript(raw) {
    var raw_yml_arr = [];
    var yml_string_arr = [];
    var yml_arr = [];
    var regex = /<!--\[WBSCRIPT\].+\[\/WBSCRIPT\]-->/gms;
    do {
        var m = regex.exec(raw);
        if (m)
            raw_yml_arr.push(m[0]);
    } while (m);
    raw_yml_arr.forEach(function (i) {
        var _clean = i.slice('<!--[WBSCRIPT]'.length, -('[/WBSCRIPT]-->'.length));
        var clean_ = [];
        _clean.split('\n').forEach(function (j) {
            clean_.push(removeTabs_1.removeTabs(j));
        });
        var clean = clean_.join('\n');
        yml_string_arr.push(clean);
    });
    yml_string_arr.forEach(function (i) {
        yml_arr.push(YAML.parse(i));
    });
    return yml_arr;
}
exports.getWbScript = getWbScript;
