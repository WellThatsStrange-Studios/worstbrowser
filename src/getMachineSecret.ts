import * as cp from 'child_process'

export function getMachineSecret() {
	const raw = cp.execSync(`cat /etc/machine-id`)
	const data = String(raw).trim()

	const arr = [
		data.slice(0, -16),
		data.slice(16)
	]

	return arr
}