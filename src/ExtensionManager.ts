import * as fs from 'fs'
import * as YAML from 'yaml'

export interface ExtensionData {
	name: string
	nameCompressed: string
	author: string
	extension: boolean
	events: {
		onBrowserStart?: string
		onBrowserQuit?: string
  	onPageLoaded?: string
	}
	init?: string
}

export interface ExtensionCache {
	dir: string
	data: ExtensionData
	config: any
}

export class ExtensionManager {
	private dir: string
	private arr: ExtensionCache[] = []

	constructor(dir: string, extConfigPath: string) {
		this.dir = dir

		console.log('Initializing extensions from', this.dir)

		fs.readdirSync(this.dir).forEach((i) => {
			if (!fs.lstatSync(this.dir + '/' + i).isDirectory()) return

			const data: ExtensionData = YAML.parse(String(
				fs.readFileSync(this.dir + '/' + i + '/extension.yml')
			))

			var cfg = JSON.parse(String(fs.readFileSync(extConfigPath)))

			if (cfg[data.nameCompressed]) {
				cfg = cfg[data.nameCompressed]
			} else {
				cfg[data.nameCompressed] = {}
				fs.writeFileSync(extConfigPath, JSON.stringify(cfg, null, '\t'))
				cfg = cfg[data.nameCompressed]
			}

			this.arr.push({
				dir: this.dir + '/' + i,
				data: data,
				config: cfg
			})
		})
	}

	public event(name: string, args: any[]) {
		this.arr.forEach((i) => {
			if (!i.data.extension) return

			if (i.data.events[name]) {
				try {
					const _ext = require(i.dir + '/' + i.data.events[name])
					_ext(...args)
				} catch (err) {
					console.log(
						`{ESC}[31;1mEXTENSION ERROR:{ESC}[0m ${err}
\tCaused by: {ESC}[1m${i.data.name}{ESC}[0m
\t{ESC}[2mOn event: {ESC}[1m${name}{ESC}[0m`
							.split('{ESC}').join('\x1b')
					)
				}
			}
		})
	}

	public getHtmlTable() {
		var str = `<table>
		<thead>
		<tr>
		<td>Package name</td>
		<td>Author</td>
		<td>Status</td>
		<tr></thead>
		<tbody>`

		this.arr.forEach((i) => {
			str += '<tr>'
			str += `<td>${i.data.name}</td>`
			str += `<td>${i.data.author}</td>`
			str += `<td>${(i.data.extension) ? 'Active' : 'Not active'}</td>`
			str += '</tr>'
		})

		str += '</tbody></table>'

		return str
	}

	public init(data: any) {
		this.arr.forEach((i) => {
			if (i.data.init && i.data.extension) {
				try {
					data.config = i.config

					const _ext = require(i.dir + '/' + i.data.init).__init
					_ext(data)
				} catch (err) {
					console.log(
						`{ESC}[31;1mEXTENSION ERROR:{ESC}[0m ${err}
\tCaused by: {ESC}[1m${i.data.name}{ESC}[0m
\t{ESC}[2mOn event: {ESC}[1minit{ESC}[0m`
							.split('{ESC}').join('\x1b')
					)
				}
			}
		})
	}
}