import * as Su from 'string-util-tools'

import { History } from './History'

export function makeHistory(history: History[]) {
	var html = '<table>'

	history.reverse().forEach((i) => {
		html += `
		<tr>
		<td><a href="${i.url}">${(i.url.length > 50) ? Su.shortify(i.url, 50) : i.url }</a></td>
		<td>
		${new Date(i.timestamp).toLocaleDateString('cs-CZ')} : ${
			String(new Date(i.timestamp).getHours()) + ':' +
			String(new Date(i.timestamp).getMinutes()) + ':' +
			String(new Date(i.timestamp).getSeconds())
		}
		</td>
		</tr>
		`
	})

	html += '</table>'

	return html
}