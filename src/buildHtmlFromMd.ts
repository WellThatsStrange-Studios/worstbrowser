import * as MdIt from 'markdown-it'

const md = new MdIt()

export function buildHtmlFromMd(raw: string) {
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
	`

	const html = `
	<html>
	${head}
	<body>
	${md.render(raw)}
	</body>
	</html>
	`

	return html
}