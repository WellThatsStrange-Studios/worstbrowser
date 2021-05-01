import * as cp from 'child_process'
import * as fs from 'fs'
import * as _fetch from 'node-fetch'

import { Lock } from './Lock'
const fetch = _fetch.default

export async function installCertificate(lock: Lock) {
	const file = String(
		cp.execSync(`zenity --file-selection --text "Select certificate file" --file-filter "*.wbc"`)
	).trim()

	if (!file || !fs.existsSync(file)) return false

	const obj = JSON.parse(String(fs.readFileSync(file)))

	if (obj.official) {
		const raw = await fetch('https://pastebin.com/raw/6PnUuVzM')
		const text = await raw.text()

		const data = JSON.parse(text)
		const pagename = data[obj.official]

		if (!pagename) return false

		try {
			const zenitydata = String(
				cp.execSync(`zenity --question --text "[ Certificate instalation ]\\nPage: ${pagename}\\nThis page is trusted by the worstbrowser team and is safe to install its ceritificate" --width 250`)
			)

			if (!lock.read('privateWbScript')) {
				lock.write('privateWbScript', [])
				lock.save()
			}

			var sitesBefore = lock.read('privateWbScript')
			sitesBefore.push(pagename)

			lock.write('privateWbScript', sitesBefore)
			lock.save()

			cp.execSync(`notify-send "Installed" "Certificate was installed sucesfully" -i emblem-default`)

			return true
		} catch {
			return false
		}
	} else {
		try {
			const zenitydata = String(
				cp.execSync(`zenity --question --text "[ Certificate instalation ]\\nPage: ${obj.unofficial}\\nThis page is not verified by the worstbrowser team. Are you sure you want to add its certificate?\\n---\\nName: ${obj.data.site.name}\\nDescription: ${obj.data.site.desc}\\nCerificate issued by: ${obj.data.issuedBy}" --width 250`)
			)

			if (!lock.read('privateWbScript')) {
				lock.write('privateWbScript', [])
				lock.save()
			}

			var sitesBefore = lock.read('privateWbScript')
			sitesBefore.push(obj.unofficial)

			lock.write('privateWbScript', sitesBefore)
			lock.save()

			cp.execSync(`notify-send "Installed" "Certificate was installed sucesfully" -i emblem-default`)

			return true
		} catch {
			return false
		}
	}
}