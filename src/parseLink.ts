import * as fs from 'fs'

import { url } from './url'

export function parseLink(href: string) {
	// console.log(`Parsing '${href}'`)
	const config = JSON.parse(String(fs.readFileSync(process.argv[2])))

	if (String(href).startsWith('worstbrowser:')) {
		var pagename = String(href).substring('worstbrowser:'.length) + '.html'

		if (fs.existsSync(`${config.defultPagesDir}/${pagename}`)) {
			return {
				href: `file://${config.defultPagesDir}/${pagename}`,
				title: `WorstBrowser/${String(href).substring('worstbrowser:'.length)}`
			}
		} else {
			throw new Error(`WBERR: No page ${pagename}`)
		}
		
	} else if (/^(http:\/\/|https:\/\/|file:\/\/)([a-z]|[1-9])([a-z]|[1-9]|-)*([a-z]|[1-9])\.[a-z]+(.*)?$/gm.test(href)) {
		// console.log('Full link')
		return href
	} else if (String(href).startsWith('file://')) {
		return href
	}	else if (/^([a-z]|[1-9])([a-z]|[1-9]|-)*([a-z]|[1-9])\.[a-z]+$/gm.test(href)) {
		// console.log('URL\'d the link!')
		return url(href)
	} else {
		// console.log('searching')
		return `https://duckduckgo.com/?q=${href}&ia=web`
	}
}