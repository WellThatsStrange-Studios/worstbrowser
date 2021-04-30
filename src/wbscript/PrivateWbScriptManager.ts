import * as fs from 'fs'
import * as cp from 'child_process'
import * as YAML from 'yaml'

import { WebView } from '../types/WebView'
import { ExtensionManager } from '../ExtensionManager'

export interface PrivateWbScriptInitData {
	config: any
	webView: WebView
	extensions: ExtensionManager
}

export interface Command {
	cmd: string | { data: string }
	args?: any[]
}

export class PrivateWbScriptManager {
	private config: any
	private webView: WebView
	private extensions: ExtensionManager

	private data: any

	constructor(data: PrivateWbScriptInitData) {
		this.config = data.config
		this.webView = data.webView
		this.extensions = data.extensions
	}

	public load(data: any) {
		this.data = data
	}

	public exec() {
		this.extensions.event('onScriptExecute', [ YAML.stringify(this.data) ])
		
		this.data.commands.forEach((_cmd: Command) => {
			var __cmd: Command = {
				cmd: (typeof _cmd.cmd === 'string') ? _cmd.cmd : this.getVarData(_cmd.cmd.data),
				args: []
			}

			if (_cmd.args) _cmd.args.forEach((i) => {
				if (i.data) {
					__cmd.args.push(this.getVarData(i.data))
				} else {
					__cmd.args.push(i)
				}
			})

			const command = __cmd

			switch (command.cmd) {
				case 'ext-install':
					this.extensions.installFromLink(command.args[0])
					break
				case 'save-bookmark':
					this.save_bookmark()
					break
				case 'notify':
					this.notify(command.args)
					break
				case 'popup':
					this.popup(command.args)
					break
				default:
					this.err(command.cmd + ' >> Command not found')
					break
			}
		})
	}

	private getVarData(varName: string) {
		return this.data.data[varName]
	}

	private err(str: string) {
		console.log(
			'\x1b[31m[!]\x1b[0m '
			+ this.webView.getUri()
			+ ' has \x1b[1merrored\x1b[0m:'
			+ '\n'
			+ '\t\x1b[3;1m' + str + '\x1b[0m'
			+ '\n'
			+ '\t\x1b[2mOriginated from: '
			+ '\x1b[1mPrivateWbScript\x1b[0m'
		)
	}

	public save_bookmark() {
		this.config.bookmarks[this.webView.getTitle()] = this.webView.getUri()
		fs.writeFileSync(process.argv[2], JSON.stringify(this.config, null, '\t'))
	}

	public notify(args: any[]) {
		var cmd = 'notify-send'
		cmd += ` "${args[0]}"`
		cmd += ` "${args[1]}"`

		try {
			const res = cp.execSync(cmd)
			const str = String(res)
		} catch (err) {
			this.err(err)
		}
	}

	public popup(args: any[]) {
		var cmd = 'zenity --info'
		cmd += ` --text "${args[0]}"`
		cmd += ` --width ${args[1] || '200'}`

		try {
			const res = cp.execSync(cmd)
			const str = String(res)
		} catch (err) {
			this.err(err)
		}
	}
}