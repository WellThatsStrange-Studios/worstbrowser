import * as Rpc from 'discord-rich-presence'

export class RichPresence {
	public client: Rpc
	public isActive: boolean
	private lastPage: string
	private startTime: number

	constructor() {
		console.log('Initialzing RPC')
		this.client = Rpc('835134227912851516')
		this.startTime = Date.now()
		this.isActive = true

		this.client.updatePresence({
			details: 'Browsing the web',
			state: '... waiting for data ...',

			startTimestamp: this.startTime,

			largeImageKey: 'large',
			largeImageText: 'WorstBrowser',

			smallImageKey: 'small',
			smallImageText: 'Microsoft Certified'
		})
	}

	private getPageName(url: string) {
		if (url.startsWith('https://')) url = url.slice(8)
		else if (url.startsWith('http://')) url = url.slice(7)
		else if (url.startsWith('file://'))	url = url.slice(7)

		url = url.split('/')[0]

		return url
	}

	public setUrl(url: string) {
		url = this.getPageName(url)
		if (url === this.lastPage) return

		this.lastPage = url

		this.client.updatePresence({
			details: 'Browsing the web',
			state: url,

			startTimestamp: this.startTime,

			largeImageKey: 'large',
			largeImageText: 'WorstBrowser',

			smallImageKey: 'small',
			smallImageText: 'Microsoft Certified'
		})
	}

	public resetTime() {
		this.startTime = Date.now()

		this.client.updatePresence({
			details: 'Browsing the web',
			state: this.lastPage,

			startTimestamp: this.startTime,

			largeImageKey: 'large',
			largeImageText: 'WorstBrowser',

			smallImageKey: 'small',
			smallImageText: 'Microsoft Certified'
		})
	}

	public start() {
		console.log('Initialzing RPC')
		this.client = Rpc('835134227912851516')
		this.startTime = Date.now()
		this.isActive = true

		this.client.updatePresence({
			details: 'Browsing the web',
			state: '... waiting for data ...',

			startTimestamp: this.startTime,

			largeImageKey: 'large',
			largeImageText: 'WorstBrowser',

			smallImageKey: 'small',
			smallImageText: 'Microsoft Certified'
		})
	}

	public end() {
		console.log('Ending presence')
		this.client.disconnect()
		this.isActive = false
	}
}