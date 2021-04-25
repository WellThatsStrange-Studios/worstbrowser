export function getPageName(url: string) {
	if (url.startsWith('https://')) url = url.slice(8)
	else if (url.startsWith('http://')) url = url.slice(7)
	else if (url.startsWith('file://'))	url = url.slice(7)

	url = url.split('/')[0]

	return url
}