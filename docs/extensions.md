# worstbrowser extensions api
Extensions are written in javascript, that has acces to node js features. Your extension will have its own slot for config object in the configuration file.

### How to make an extension
Each extension has the following file structure
```
extension.yml
# All your js files
```

`extension.yml` is the core of your extension:
```yml
name: 'My first package!' # Your package name
nameCompresses: 'my-first-package' # Minified name for config file
author: 'Me!' # Your name
extension: true # Has to be true

# Scripts
events:
  onBrowserStart: 'onBrowserStart.js' # When browser starts
  onBrowserQuit: 'onBrowserQuit.js' # When browsers exits
  onPageLoaded: 'onPageLoaded.js' # When page is loaded
  onPopup: 'onPopup.js' # On a popup
  onLoadChange: 'onLoadChange.js' # When the load state change

init: 'init.js' # The initialize function, this is important
```

In the scripts part, you can see that filenames are specified. There is 2 types of scripts: init script and events script. The init script has the following structure:

```js
function init(initData) {
	// Your init function
}

exports.__init = init // Function is exported under __init. This is to allow more exports
```

Unlike in the init script, the even scripts are exported under `module.exports`

```js
function onPageLoaded() {
	// Your code here
}

module.exports = onPageLoaded
```

Keep in mind the function names can be whatever you want, the important thing is for them to be exported correctly.
The init function recieves some data as a json, more about that in the api section. You will most likely want to export the data:

```js
function init(data) {
	console.log('Hello') // Log something
	exports.data = data // Export the data
}

exports.__init = init // Export the function
```

You can then acces the data in other files like this:

```js
const { data } = require('./init')

// Here you can acces the init data
```

### API

#### `init()`
```js
function init(data) {
```
> Called by
```ts
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
```

This function recieves data from the main proces, once the `main` function is called
*__Arguments:__*
`data` - A json object of important objects from the main process. *The contents are visible in the "called by" part*

#### `onBrowserStart()`
```js
function onBrowserStart(win) {
```
> Called by
```ts
extensions.event('onBrowserStart', [ win ])
```
*__Arguments:__*
`win` - Gtk.Window

#### `onBrowserQuit()`
```js
function onBrowserQuit() {
```
> Called by
```ts
extensions.event('onBrowserQuit', [])
```
*__Arguments:__*
*none*

#### `onPageLoaded()`
```js
function onPageLoaded(webView, win) {
```
> Called by
```ts
extensions.event('onPageLoaded', [ webView, win ])
```
*__Arguments:__*
`webView` - WebKit2.WebView
`win` - Gtk.Window

#### `onPopup()`
```js
function onPopup(id, status) {
```
> Called by
```ts
extensions.event('onPopup', ['emoji', 'OPEN'])
// Multiple more
```
*__Arguments:__*
`id` - Popup name
`status` - `OPEN` / `CLOSE`
> `START` / `STOP` for series

#### `onLoadChange()`
```js
function onLoadChange() {
```
> Called by
```ts
extensions.event('onLoadChange', [ loadEvent, webView, win ])
```
*__Arguments:__*
`loadEvent` - WebKitLoadEvent
`webView` - WebKit2.WebView
`win` - Gtk.Window

### Helpful resources
[Gtk classes reference](https://lazka.github.io/pgi-docs/Gtk-3.0/classes.html)

[WebKit2 WebView class reference](https://lazka.github.io/pgi-docs/WebKit2-4.0/classes/WebView.html)

> Keep in mind that the 2 above use `_<loweracse>` instead of `<uppercase>` in their function names, so eg. `set_text()` is actually `setText()`

[Google](https://google.com/)

### Examples
Set the urlbar text to `This is an annoying extension` on each page load
```js
// Assumes you have exported the data from init (as described above)
const { data } = require('./init')

function onPageLoaded(webView, win) {
	data.layout.urlBar.setText('This is an annoying extension')
}

module.exports = onPageLoaded
```

Change default window size
```js
function onBrowserStart(win) {
	win.setDefaultSize(640, 480)
}

module.exports = onBrowserStart
```

#### More examples comming soon™️
