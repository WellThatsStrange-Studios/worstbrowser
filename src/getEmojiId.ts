import * as cp from 'child_process'

export function getEmojiId() {
	const _id = cp.execSync(`
		zenity \\
		--list \\
		--radiolist \\
		--text "Please select emoji" \\
		--height 210 --width 250 \\
		--column "Select" --column "Emoji" \\
		TRUE 🙂️ \\
		FALSE 😥️ \\
		FALSE 👍️ \\
		FALSE 😳️ \\
		FALSE 💩️
	`)

	const id = String(_id).trim()

	return id
}