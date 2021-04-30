export function arrToString(arr: number[]) {
	var str = ''

	arr.forEach((i) => {
		str += String.fromCharCode(i)
	})

	return str
}