import * as fs from 'fs'
import * as cp from 'child_process'

export function notes(page: string, notesFile: string) {
	var notes = JSON.parse(String(fs.readFileSync(notesFile)))
	if (!notes[page]) notes[page] = ''

	try {
		const buff = cp.execSync(`echo -n ${JSON.stringify(notes[page])} | \\
		zenity --width 250 --height 150 --text-info --editable`)
		const str = String(buff)

		notes[page] = str

		fs.writeFileSync(notesFile, JSON.stringify(notes))
	} catch (err) {
		console.log(
			`{ESC}[31;1mERROR:{ESC}[0m ${err}
\tCaused by: {ESC}[1mbrowser{ESC}[0m
\t{ESC}[2mOn event: {ESC}[1mpopup{ESC}[0m`
				.split('{ESC}').join('\x1b')
		)
	}
}