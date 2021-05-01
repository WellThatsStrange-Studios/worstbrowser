import * as gi from 'node-gtk'
import * as fs from 'fs'
import * as clipboardy from 'clipboardy'
import * as notifier from 'node-notifier'
import * as load from 'audio-loader'
import * as play from 'audio-play'
import * as open from 'open'
import * as cp from 'child_process'

import { parseLink } from './parseLink'
import { Toolbar } from './types/Toolbar'
import { ProgressBar } from './types/ProgressBar'
import { Spinner } from './types/Spinner'
import { Label } from './types/Label'
import { ToolButton } from './types/ToolButton'
import { Box } from './types/Box'
import { ComboBoxText } from './types/ComboBoxText'
import { WebView } from './types/WebView'
import { WebKitLoadEvent } from './types/misc/WebKitLoadEvent'
import { appleCheck } from './appleCheck'
import { getEmojiId } from './getEmojiId'
import { ExtensionManager } from './ExtensionManager'
import { buildHtmlFromMd } from './buildHtmlFromMd'
import { RichPresence } from './RichPresence'
import { notes } from './notes'
import { getPageName } from './getPageName'
import { arrToString } from './arrToString'
import { getWbScript } from './wbscript/getWbScript'
import { getPublicWbScript } from './wbscript/getPublicWbScript'
import { PrivateWbScriptManager } from './wbscript/PrivateWbScriptManager'
import { PublicWbScriptManager } from './wbscript/PublicWbScriptManager'
import { Lock } from './Lock'
import { installCertificate } from './installCertificate'

const Gtk = gi.require('Gtk', '3.0')
const WebKit2 = gi.require('WebKit2')

const config = JSON.parse(String(fs.readFileSync(process.argv[2])))
const history = JSON.parse(String(fs.readFileSync(process.argv[3])))

const extensions = new ExtensionManager(config.extensions, config.extensionsConfig)
const presence = new RichPresence()
const lock = new Lock(config.lockFile)

var setUri = true
var ignoreChange = false
var musicPaused = false
var playback: play.AudioPlayHandle
var extraToolbarVisible = true

/*
This browser is free from CIA niggers
https://danik-owns.aslave.store/HYmMSYly_

Join the TempleOS discord: https://discord.gg/Fhk7ymbfyd
*/

function sleep(ms: number) {
	var before = Date.now()
	while ((Date.now() - before) < ms) {
		continue
	}
}

gi.startLoop()
Gtk.init()

const win = new Gtk.Window({
	type: Gtk.WindowType.TOPLEVEL,
	title: 'Browser'
})

const webView: WebView = new WebKit2.WebView()
const toolbar: Toolbar = new Gtk.Toolbar()
const extendedToolbar: Toolbar = new Gtk.Toolbar()
const progress: ProgressBar = new Gtk.ProgressBar()

const spinner: Spinner = new Gtk.Spinner()
const infoLabel: Label = new Gtk.Label({ label: 'OK' })

interface ToolbarButtonsObject {
	back: ToolButton
	forward: ToolButton
	refresh: ToolButton
	home: ToolButton
	emoji: ToolButton
	music: ToolButton
	note: ToolButton
	toggleExtraToolbar: ToolButton

	add_bookmark: ToolButton
	remove_bookmark: ToolButton
}

const buttons: ToolbarButtonsObject = {
	// Control
	back: Gtk.ToolButton.newFromStock(Gtk.STOCK_GO_BACK),
  forward: Gtk.ToolButton.newFromStock(Gtk.STOCK_GO_FORWARD),
  refresh: Gtk.ToolButton.newFromStock(Gtk.STOCK_REFRESH),
	home: Gtk.ToolButton.newFromStock(Gtk.STOCK_HOME),
	emoji: Gtk.ToolButton.newFromStock(Gtk.STOCK_SELECT_COLOR),
	music: Gtk.ToolButton.newFromStock(Gtk.STOCK_MEDIA_RECORD),
	note: Gtk.ToolButton.newFromStock(Gtk.STOCK_EDIT),
	toggleExtraToolbar: Gtk.ToolButton.newFromStock(Gtk.STOCK_GO_DOWN),

	// Bookmarks
	add_bookmark: Gtk.ToolButton.newFromStock(Gtk.STOCK_ADD),
	remove_bookmark: Gtk.ToolButton.newFromStock(Gtk.STOCK_REMOVE)
}

interface ExtendedToolbarButtons {
	extensions: ToolButton
	options: ToolButton
	extension: ToolButton
	start_rpc: ToolButton
	end_rpc: ToolButton
	add_cert: ToolButton
}

const extraButtons: ExtendedToolbarButtons = {
	extensions: Gtk.ToolButton.newFromStock(Gtk.STOCK_EXECUTE),
	options: Gtk.ToolButton.newFromStock(Gtk.STOCK_PREFERENCES),
	extension: Gtk.ToolButton.newFromStock(Gtk.STOCK_INDEX),
	start_rpc: Gtk.ToolButton.newFromStock(Gtk.STOCK_MEDIA_PLAY),
	end_rpc: Gtk.ToolButton.newFromStock(Gtk.STOCK_MEDIA_STOP),
	add_cert: Gtk.ToolButton.newFromStock(Gtk.STOCK_APPLY)
}

const urlBar = new Gtk.Entry('Enter search or domain')
const scrollWindow = new Gtk.ScrolledWindow({})

const hbox: Box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL })
const urlbox: Box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL })
const vbox: Box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL })

scrollWindow.add(webView)

for (const i in buttons) { toolbar.add(buttons[i]) }
for (const i in extraButtons) { extendedToolbar.add(extraButtons[i]) }

const bookmarkBox: ComboBoxText = new Gtk.ComboBoxText()
const bookmarkLabel: Label = new Gtk.Label({ label: 'Bookmark: ' })

for (var i in config.bookmarks) {
	bookmarkBox.appendText(i)
}

hbox.packStart(toolbar, false, false, 0)
hbox.packStart(spinner, false, false, 4)
hbox.packStart(bookmarkLabel, false, false, 8)
hbox.packStart(bookmarkBox, true, true, 1)
// hbox.packStart(urlBar, true, true, 4)

urlbox.packStart(urlBar, true, true, 0)

vbox.packStart(urlbox, false, true, 0)
vbox.packStart(hbox, false, true, 0)
vbox.packStart(extendedToolbar, false, true, 0)
vbox.packStart(progress, false, true, 0)
vbox.packStart(scrollWindow, true, true, 0)
vbox.packStart(infoLabel, false, true, 1)

win.setDefaultSize(985, 562)
win.setResizable(true)
win.add(vbox)

win.setIconFromFile(`${config.assetsFolder}/128.png`)

buttons.back.on('clicked', () => { webView.goBack() })
buttons.forward.on('clicked', () => { webView.goForward() })
buttons.refresh.on('clicked', () => { webView.reload() })

bookmarkBox.on('changed', () => {
	if (!ignoreChange) {
		var text = bookmarkBox.getActiveText()

		var href = parseLink(config.bookmarks[text])
		// console.log(config.bookmarks[text])

		if (typeof href === 'string') {
			urlBar.setText(href)
			webView.loadUri(href)
		} else {
			urlBar.setText(href.title)
			webView.loadUri(href.href)

			setUri = false
		}
	}

	ignoreChange = false
})

buttons.home.on('clicked', () => {
	var href = parseLink(config.homepage)

	if (typeof href === 'string') {
		urlBar.setText('')
		webView.loadUri(href)
	} else {
		urlBar.setText('')
		webView.loadUri(href.href)
	}
	
	setUri = false
})

buttons.add_bookmark.on('clicked', () => {
	config.bookmarks[webView.getTitle()] = webView.getUri()
	fs.writeFileSync(process.argv[2], JSON.stringify(config, null, '\t'))

	ignoreChange = true

	bookmarkBox.removeAll()
	for (var i in config.bookmarks) {
		bookmarkBox.appendText(i)
	}
})

buttons.remove_bookmark.on('clicked', () => {
	config.bookmarks[webView.getTitle()] = undefined
	fs.writeFileSync(process.argv[2], JSON.stringify(config, null, '\t'))

	ignoreChange = true

	bookmarkBox.removeAll()
	for (var i in config.bookmarks) {
		bookmarkBox.appendText(i)
	}
})

buttons.emoji.on('clicked', () => {
	extensions.event('onPopup', ['emoji', 'OPEN'])
	const emoji = getEmojiId()
	extensions.event('onPopup', ['emoji', 'CLOSE'])

	clipboardy.writeSync(emoji)

	notifier.notify({
		title: 'Emoji ready',
		message: 'Press Ctrl+V to paste your selected emoji',
		icon: 'face-angel'
	})
})

buttons.note.on('clicked', () => {
	extensions.event('onPopup', [ 'notes', 'OPEN' ])
	notes(getPageName(webView.getUri()), config.notes)
	extensions.event('onPopup', [ 'notes', 'CLOSE' ])
})

extraButtons.extension.on('clicked', () => {
	webView.loadHtml(`
	<html><head>
	<title>Extensions</title>
	<link rel="stylesheet" href="${config.assetsFolder}/extensions_styles.css">
	</head><body>
	` + extensions.getHtmlTable() + '</body></html>', 'WorstBrowser/extensions')
})

buttons.music.on('clicked', async () => {
	if (musicPaused) {
		playback.play()
	} else {
		playback.pause()
	}

	musicPaused = !musicPaused
})

extraButtons.extensions.on('clicked', async () => {
	await open(config.extensions)
})

extraButtons.options.on('clicked', async () => {
	await open(process.argv[2])
})

extraButtons.add_cert.on('clicked', async () => {
	extensions.event('onPopup', [ 'certificates', 'START' ])
	const resp = await installCertificate(lock)
	extensions.event('onPopup', [ 'certificates', 'STOP' ])

	if (resp === false) {
		cp.execSync(`notify-send "Not installed" "Certificate was not installed, either it was canceled by user or certificate is invalid" -i emblem-unreadable`)
	} else {
		extensions.event('onCertificateInstall', [])
	}
})

buttons.toggleExtraToolbar.on('clicked', () => {
	if (extraToolbarVisible) {
		extendedToolbar.hide()
	} else {
		extendedToolbar.show()
	}

	extraToolbarVisible = !extraToolbarVisible
})

extraButtons.start_rpc.on('clicked', () => {
	extraButtons.start_rpc.setSensitive(!presence.isActive)
	extraButtons.end_rpc.setSensitive(presence.isActive)

	presence.start()

	extraButtons.start_rpc.setSensitive(!presence.isActive)
	extraButtons.end_rpc.setSensitive(presence.isActive)
})

extraButtons.end_rpc.on('clicked', () => {
	extraButtons.start_rpc.setSensitive(!presence.isActive)
	extraButtons.end_rpc.setSensitive(presence.isActive)

	presence.end()

	extraButtons.start_rpc.setSensitive(!presence.isActive)
	extraButtons.end_rpc.setSensitive(presence.isActive)
})

webView.on('load-changed', (loadEvent: WebKitLoadEvent) => {
	extensions.event('onLoadChange', [ loadEvent, webView, win ])

  switch (loadEvent) {
		case WebKit2.LoadEvent.STARTED:
			spinner.start()
			spinner.show()

			progress.setFraction(0)

			infoLabel.label = `Loading... ${webView.getUri()}`

			break

    case WebKit2.LoadEvent.COMMITTED:
      if (setUri) urlBar.setText(webView.getUri())

      buttons.back.setSensitive(webView.canGoBack())
      buttons.forward.setSensitive(webView.canGoForward())

			for (let i = 0; i < 5; i++) {
				progress.setFraction(webView.getEstimatedLoadProgress())
				sleep(10)
			}

			win.title = `WorstBrowser: [Loading a page]`
			setUri = true

			infoLabel.label = `Loading... ${webView.getUri()} | Almost there`

      break

		case WebKit2.LoadEvent.FINISHED:
			// console.log(`Title: ${webView.getTitle()}`)
			win.title = `WorstBrowser: ${webView.getTitle()}`

			progress.setFraction(1)
			// console.log(webView.getEstimatedLoadProgress())

			var a = []

			for (let i in config.bookmarks) {
				a.push(config.bookmarks[i])
			}

			if (a.includes(webView.getUri())) {
				buttons.add_bookmark.setSensitive(false)
				buttons.remove_bookmark.setSensitive(true)

				buttons.add_bookmark.hide()
				buttons.remove_bookmark.show()
			} else {
				buttons.add_bookmark.setSensitive(true)
				buttons.remove_bookmark.setSensitive(false)

				buttons.add_bookmark.show()
				buttons.remove_bookmark.hide()
			}


			history.push({
				url: webView.getUri(),
				timestamp: Date.now()
			})
			fs.writeFileSync(process.argv[3], JSON.stringify(history))

			spinner.stop()
			spinner.hide()

			infoLabel.label = `Loaded ${webView.getTitle()} | OK`

			// Apple check
			if (/https?:\/\/(www\.)?apple\.com\/.*/gm.test(webView.getUri())) {
				extensions.event('onPopup', ['apple-series', 'START'])
				const allowedForApple = appleCheck(lock)
				extensions.event('onPopup', ['apple-series', 'STOP'])

				if (!allowedForApple) {
					var href = parseLink('worstbrowser:apple_disallowed')

					if (typeof href === 'string') {
						urlBar.setText(href)
						webView.loadUri(href)
					} else {
						urlBar.setText(href.title)
						webView.loadUri(href.href)

						setUri = false
					}
				}
			}

			// Anti-chrome
			if (webView.getUri().includes('chrome')) {
				var href = parseLink('worstbrowser:anti_danger_browser')

				if (typeof href === 'string') {
					urlBar.setText(href)
					webView.loadUri(href)
				} else {
					urlBar.setText(href.title)
					webView.loadUri(href.href)

					setUri = false
				}
			}

			if (webView.getUri().startsWith('file://')
		   && webView.getUri().endsWith('.md')) {
				setUri = false
				const html = buildHtmlFromMd(String(fs.readFileSync(webView.getUri().slice(7))))
				webView.loadHtml(html, 'WorstBrowser: Markdown')
			}

			const mainResource = webView.getMainResource()
			mainResource.getData(null, (resource, result) => {
				const data = arrToString(resource.getDataFinish(result))

				if (!lock.read('privateWbScript')) {
					lock.write('privateWbScript', [])
					lock.save()
				}

				if (lock.read('privateWbScript').includes(getPageName(webView.getUri()))) {
					const scripts = getWbScript(data)

					const scriptsManager = new PrivateWbScriptManager({
						config: config,
						webView: webView,
						extensions: extensions
					})
	
					scripts.forEach((i) => {
						scriptsManager.load(i)
						scriptsManager.exec()
					})
				}

				const scripts = getPublicWbScript(data)

				const scriptsManager = new PublicWbScriptManager({
					config: config,
					webView: webView,
					extensions: extensions
				})
	
				scripts.forEach((i) => {
					scriptsManager.load(i)
					scriptsManager.exec()
				})
				
			}, null)

			presence.setUrl(webView.getUri())

			extensions.event('onPageLoaded', [ webView, win ])
			
			break
  }
})

urlBar.on('activate', async () => {
	var href = parseLink(urlBar.getText())

	if (typeof href === 'string') {
		urlBar.setText(href)
		webView.loadUri(href)
	} else {
		urlBar.setText(href.title)
		webView.loadUri(href.href)

		setUri = false
	}

	// console.log(webView.getTitle())
})

win.on('show', () => { Gtk.main() })
win.on('destroy', () => { Gtk.mainQuit() })
win.on('delete-event', () => false)

if (config.dark) {
	var gtkSettings = Gtk.Settings.getDefault()
  gtkSettings.gtkApplicationPreferDarkTheme = true
  gtkSettings.gtkThemeName = 'Adwaita'
}

function main(argc: number, args: string[]) {
	extensions.init({
		window: win, // Gtk.Window
		webView: webView, // WebKit2.WebView
		config: config, // Browser config
		Gtk: Gtk, // Gtk object
		WebKit2: WebKit2, // WebKit2 object
		layout: {
			buttons: buttons, // Json object of default buttons
			extraButtons: extraButtons, // Json object of extra buttons
			toolbar: toolbar, // The toolbar for holding default buttons: Gtk.Toolbar
			progressBar: progress, // The loading progress bar: Gtk.ProgressBar
			spinner: spinner, // Gtk.Spinner
			infoLabel: infoLabel, // The label at the bottom: Gtk.Label
			urlBar: urlBar, // Urlbar entry
			extendedToolbar: extendedToolbar // The toolbar that holds extra buttons
		},
		instances: {
			ExtensionsManager: extensions, // The class instance that handles extensions
			RichPresence: presence // The class that handles discord rpc
		}
	})

	load(`${config.assetsFolder}/music.mp3`).then((buffer: AudioBuffer) => {
		playback = play(buffer, {
	//	start: 0,
	//	end: buffer.duration,
			loop: true,
			autoplay: true,
			volume: 1
		}, () => {})
	})

	extendedToolbar.hide()
	extraButtons.start_rpc.setSensitive(!presence.isActive)
	extraButtons.end_rpc.setSensitive(presence.isActive)

	extensions.event('onBrowserStart', [ win ])

	var href = parseLink(process.argv[4] || config.homepage)

	if (typeof href === 'string') {
		urlBar.setText(href)
		webView.loadUri(href)
	} else {
		urlBar.setText(href.title)
		webView.loadUri(href.href)
		setUri = false
	}

	win.showAll()

	playback.pause()
	presence.end()

	extensions.event('onBrowserQuit', [])
}

const __process_args__: string[] = JSON.parse(JSON.stringify(process.argv))
__process_args__.shift()
__process_args__.shift()
main(__process_args__.length, __process_args__)
