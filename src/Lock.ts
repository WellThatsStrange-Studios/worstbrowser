import * as fs from 'fs'
import * as randomstring from 'randomstring'
import Cryptr = require('cryptr')

import { getMachineSecret } from './getMachineSecret'

export class Lock {
	private path: string
	private data: any
	private raw: string
	private machine_secret = getMachineSecret()
	private crypt_a: Cryptr
	private crypt_b: Cryptr

	public static HEADER = 'DO NOT MODIFY THIS FILE OR SHARE IT WITH ANYONE'

	constructor(path: string) {
		this.raw = String(fs.readFileSync(path))
		this.path = path
		this.crypt_a = new Cryptr(this.machine_secret[0])
		this.crypt_b = new Cryptr(this.machine_secret[1])

		const rawjson = this.crypt_a.decrypt(this.raw.split('\n')[2]) // Encrypted with crypt_a

		const key1 = this.crypt_a.decrypt(this.raw.split('\n')[1])
		const key2 = this.crypt_b.decrypt(this.raw.split('\n')[3])

		if (key1 != key2) {
			console.log('There has been an error parsing your lockfile, try to reset it?')
			console.log(`\x1b[2mInsert this into your lockfile \x1b[1m
${Lock.HEADER}
${this.crypt_a.encrypt('{}')}\x1b[0m`)
			throw new Error('WBE: LockFileErr(1)')
		}

		try {
			this.data = JSON.parse(rawjson)
		} catch (err) {
			const rrs = randomstring.generate(32)

			console.log('There has been an error parsing your lockfile, try to reset it?')
			console.log(`\x1b[2mInsert this into your lockfile \x1b[1m
${Lock.HEADER}
${this.crypt_a.encrypt(rrs)}
${this.crypt_a.encrypt('{}')}
${this.crypt_b.encrypt(rrs)}\x1b[0m`)
			throw new Error('WBE: LockFileErr(2)')
		}
	}

	public read(key: string) {
		return this.data[key]
	}

	public write(key: string, data: any) {
		this.data[key] = data
		return this.data[key]
	}

	public save() {
		const rrs = randomstring.generate(32)

		const raw = `${Lock.HEADER}
${this.crypt_a.encrypt(rrs)}
${this.crypt_a.encrypt(JSON.stringify(this.data))}
${this.crypt_b.encrypt(rrs)}`

		fs.writeFileSync(this.path, raw)
	}
}