import * as fs from 'fs'
import * as cp from 'child_process'
import { Lock } from './Lock'

export function appleCheck(_lock: Lock): boolean {
	const lock = _lock.read('apple')

	const banned = [
		'BeeTrout',
		'Tomáš Tatyrek'
	]

	if (lock
	 && (lock.valid === lock._valid)
	 && lock.type === 'XNOR'
	 && lock.until > Date.now()) {
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

	_lock.write('apple', appleData)
	_lock.save()

	return true
}