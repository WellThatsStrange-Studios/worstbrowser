import * as fs from 'fs'
import * as cp from 'child_process'

export function appleCheck(): boolean {
	const config = JSON.parse(String(fs.readFileSync(process.argv[2])))
	const lock = JSON.parse(String(fs.readFileSync(config.securityFile)))

	const banned = [
		'BeeTrout',
		'Tomáš Tatyrek'
	]

	if (lock.apple
	 && (lock.apple.valid === lock.apple._valid)
	 && lock.apple.type === 'XNOR'
	 && lock.apple.until > Date.now()) {
		return true
	}

	const _name = cp.execSync(`zenity --entry --text "Whats your name?" --width 250`)
	const name = String(_name).trim()

	if (banned.includes(name)) { return false }

	const _devices = cp.execSync(
		`zenity --entry --text "How many apple devices do you have?" --width 250`
	)
	const devices = Number(String(_devices).trim())

	const _totalDevices = cp.execSync(
		`zenity --entry --text "How many devices in total do you have?" --width 250`
	)
	const totalDevices = Number(String(_totalDevices).trim())

	if (((totalDevices / 100) * 85) > devices) { return false }

	const appleData = {
		type: 'XNOR',
		valid: true, _valid: true,
		until: Date.now() + (14 * 24 * 60 * 60 * 1000)
	}

	lock.apple = appleData
	fs.writeFileSync(config.securityFile, JSON.stringify(lock))

	return true
}