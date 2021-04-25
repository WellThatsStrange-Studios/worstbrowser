"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHtmlFromMd = void 0;
const MdIt = require("markdown-it");
const md = new MdIt();
function buildHtmlFromMd(raw) {
    const head = `
	<head>
	<style>
	html, body {
		font-family: 'Trebuchet MS', sans-serif;
		width: 70%;
	}
	</style>
	<title>[MARKDOWN]</title>
	</head>
	`;
    const html = `
	<html>
	${head}
	<body>
	${md.render(raw)}
	</body>
	</html>
	`;
    return html;
}
exports.buildHtmlFromMd = buildHtmlFromMd;
