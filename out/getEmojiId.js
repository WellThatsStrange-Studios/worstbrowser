"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmojiId = void 0;
const cp = require("child_process");
function getEmojiId() {
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
	`);
    const id = String(_id).trim();
    return id;
}
exports.getEmojiId = getEmojiId;
