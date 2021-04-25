"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.url = void 0;
function url(href) {
    return /^([a-z]{2,}):/.test(href) ? href : ('http://' + href);
}
exports.url = url;
