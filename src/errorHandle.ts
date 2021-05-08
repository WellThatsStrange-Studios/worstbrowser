import * as cp from 'child_process'

export function errorHandle(err: string, origin: string) {
	cp.execSync(`zenity --error --text "[!] An uncaught error has occured.\\nLog can be found in ${process.env.WORSTBROWSER_ERRORLOG}" \\
	--width 300`)

	console.error('ERROR:', err)
	process.exit(2)
}