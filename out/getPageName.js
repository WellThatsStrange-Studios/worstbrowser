"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageName = void 0;
function getPageName(url) {
    if (url.startsWith('https://'))
        url = url.slice(8);
    else if (url.startsWith('http://'))
        url = url.slice(7);
    else if (url.startsWith('file://'))
        url = url.slice(7);
    url = url.split('/')[0];
    return url;
}
exports.getPageName = getPageName;
