export function removeTabs(str: string) {
	var out = ''
	var isThisStart = true

	str.split('').forEach((i) => {
		if (isThisStart && i === '\t') {}
		else if (isThisStart && i != '\t') {
			isThisStart = false
			out += i
		} else if (!isThisStart) out += i
	})

	return out
}