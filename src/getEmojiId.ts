import * as cp from 'child_process'

export function getEmojiId() {
	const _id = cp.execSync(`
		zenity \\
		--list \\
		--radiolist \\
		--text "Please select emoji" \\
		--height 210 --width 250 \\
		--column "Select" --column "Emoji" \\
		TRUE đī¸ \\
		FALSE đĨī¸ \\
		FALSE đī¸ \\
		FALSE đŗī¸ \\
		FALSE đŠī¸
	`)

	const id = String(_id).trim()

	return id
}