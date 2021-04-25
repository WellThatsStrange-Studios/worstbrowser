"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const gi = require("node-gtk");
const fs = require("fs");
const clipboardy = require("clipboardy");
const notifier = require("node-notifier");
const load = require("audio-loader");
const play = require("audio-play");
const open = require("open");
const parseLink_1 = require("./parseLink");
const appleCheck_1 = require("./appleCheck");
const getEmojiId_1 = require("./getEmojiId");
const ExtensionManager_1 = require("./ExtensionManager");
const buildHtmlFromMd_1 = require("./buildHtmlFromMd");
const RichPresence_1 = require("./RichPresence");
const notes_1 = require("./notes");
const getPageName_1 = require("./getPageName");
const Gtk = gi.require('Gtk', '3.0');
const WebKit2 = gi.require('WebKit2');
const config = JSON.parse(String(fs.readFileSync(process.argv[2])));
const history = JSON.parse(String(fs.readFileSync(process.argv[3])));
const extensions = new ExtensionManager_1.ExtensionManager(config.extensions, config.extensionsConfig);
const presence = new RichPresence_1.RichPresence();
var setUri = true;
var ignoreChange = false;
var musicPaused = false;
var playback;
var extraToolbarVisible = true;
/*
This browser is free from CIA niggers
https://danik-owns.aslave.store/HYmMSYly_

Join the TempleOS discord: https://discord.gg/Fhk7ymbfyd
*/
function sleep(ms) {
    var before = Date.now();
    while ((Date.now() - before) < ms) {
        continue;
    }
}
gi.startLoop();
Gtk.init();
const win = new Gtk.Window({
    type: Gtk.WindowType.TOPLEVEL,
    title: 'Browser'
});
const webView = new WebKit2.WebView();
const toolbar = new Gtk.Toolbar();
const extendedToolbar = new Gtk.Toolbar();
const progress = new Gtk.ProgressBar();
const spinner = new Gtk.Spinner();
const infoLabel = new Gtk.Label({ label: 'OK' });
const buttons = {
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
};
const extraButtons = {
    extensions: Gtk.ToolButton.newFromStock(Gtk.STOCK_EXECUTE),
    options: Gtk.ToolButton.newFromStock(Gtk.STOCK_PREFERENCES),
    extension: Gtk.ToolButton.newFromStock(Gtk.STOCK_INDEX),
    start_rpc: Gtk.ToolButton.newFromStock(Gtk.STOCK_MEDIA_PLAY),
    end_rpc: Gtk.ToolButton.newFromStock(Gtk.STOCK_MEDIA_STOP)
};
const urlBar = new Gtk.Entry('Enter search or domain');
const scrollWindow = new Gtk.ScrolledWindow({});
const hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
const urlbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
const vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
scrollWindow.add(webView);
for (const i in buttons) {
    toolbar.add(buttons[i]);
}
for (const i in extraButtons) {
    extendedToolbar.add(extraButtons[i]);
}
const bookmarkBox = new Gtk.ComboBoxText();
const bookmarkLabel = new Gtk.Label({ label: 'Bookmark: ' });
for (var i in config.bookmarks) {
    bookmarkBox.appendText(i);
}
hbox.packStart(toolbar, false, false, 0);
hbox.packStart(spinner, false, false, 4);
hbox.packStart(bookmarkLabel, false, false, 8);
hbox.packStart(bookmarkBox, true, true, 1);
// hbox.packStart(urlBar, true, true, 4)
urlbox.packStart(urlBar, true, true, 0);
vbox.packStart(urlbox, false, true, 0);
vbox.packStart(hbox, false, true, 0);
vbox.packStart(extendedToolbar, false, true, 0);
vbox.packStart(progress, false, true, 0);
vbox.packStart(scrollWindow, true, true, 0);
vbox.packStart(infoLabel, false, true, 1);
win.setDefaultSize(985, 562);
win.setResizable(true);
win.add(vbox);
win.setIconFromFile(`${config.assetsFolder}/128.png`);
buttons.back.on('clicked', () => { webView.goBack(); });
buttons.forward.on('clicked', () => { webView.goForward(); });
buttons.refresh.on('clicked', () => { webView.reload(); });
bookmarkBox.on('changed', () => {
    if (!ignoreChange) {
        var text = bookmarkBox.getActiveText();
        var href = parseLink_1.parseLink(config.bookmarks[text]);
        // console.log(config.bookmarks[text])
        if (typeof href === 'string') {
            urlBar.setText(href);
            webView.loadUri(href);
        }
        else {
            urlBar.setText(href.title);
            webView.loadUri(href.href);
            setUri = false;
        }
    }
    ignoreChange = false;
});
buttons.home.on('clicked', () => {
    var href = parseLink_1.parseLink(config.homepage);
    if (typeof href === 'string') {
        urlBar.setText('');
        webView.loadUri(href);
    }
    else {
        urlBar.setText('');
        webView.loadUri(href.href);
    }
    setUri = false;
});
buttons.add_bookmark.on('clicked', () => {
    config.bookmarks[webView.getTitle()] = webView.getUri();
    fs.writeFileSync('config.json', JSON.stringify(config, null, '\t'));
    ignoreChange = true;
    bookmarkBox.removeAll();
    for (var i in config.bookmarks) {
        bookmarkBox.appendText(i);
    }
});
buttons.remove_bookmark.on('clicked', () => {
    config.bookmarks[webView.getTitle()] = undefined;
    fs.writeFileSync('config.json', JSON.stringify(config, null, '\t'));
    ignoreChange = true;
    bookmarkBox.removeAll();
    for (var i in config.bookmarks) {
        bookmarkBox.appendText(i);
    }
});
buttons.emoji.on('clicked', () => {
    extensions.event('onPopup', ['emoji', 'OPEN']);
    const emoji = getEmojiId_1.getEmojiId();
    extensions.event('onPopup', ['emoji', 'CLOSE']);
    clipboardy.writeSync(emoji);
    notifier.notify({
        title: 'Emoji ready',
        message: 'Press Ctrl+V to paste your selected emoji',
        icon: 'face-angel'
    });
});
buttons.note.on('clicked', () => {
    notes_1.notes(getPageName_1.getPageName(webView.getUri()), config.notes);
});
extraButtons.extension.on('clicked', () => {
    webView.loadHtml(`
	<html><head>
	<title>Extensions</title>
	<link rel="stylesheet" href="${config.assetsFolder}/extensions_styles.css">
	</head><body>
	` + extensions.getHtmlTable() + '</body></html>', 'WorstBrowser/extensions');
});
buttons.music.on('clicked', () => __awaiter(void 0, void 0, void 0, function* () {
    if (musicPaused) {
        playback.play();
    }
    else {
        playback.pause();
    }
    musicPaused = !musicPaused;
}));
extraButtons.extensions.on('clicked', () => __awaiter(void 0, void 0, void 0, function* () {
    yield open(config.extensions);
}));
extraButtons.options.on('clicked', () => __awaiter(void 0, void 0, void 0, function* () {
    yield open(process.argv[2]);
}));
buttons.toggleExtraToolbar.on('clicked', () => {
    if (extraToolbarVisible) {
        extendedToolbar.hide();
    }
    else {
        extendedToolbar.show();
    }
    extraToolbarVisible = !extraToolbarVisible;
});
extraButtons.start_rpc.on('clicked', () => {
    extraButtons.start_rpc.setSensitive(!presence.isActive);
    extraButtons.end_rpc.setSensitive(presence.isActive);
    presence.start();
    extraButtons.start_rpc.setSensitive(!presence.isActive);
    extraButtons.end_rpc.setSensitive(presence.isActive);
});
extraButtons.end_rpc.on('clicked', () => {
    extraButtons.start_rpc.setSensitive(!presence.isActive);
    extraButtons.end_rpc.setSensitive(presence.isActive);
    presence.end();
    extraButtons.start_rpc.setSensitive(!presence.isActive);
    extraButtons.end_rpc.setSensitive(presence.isActive);
});
webView.on('load-changed', (loadEvent) => {
    extensions.event('onLoadChange', [loadEvent, webView, win]);
    switch (loadEvent) {
        case WebKit2.LoadEvent.STARTED:
            spinner.start();
            spinner.show();
            progress.setFraction(0);
            infoLabel.label = `Loading... ${webView.getUri()}`;
            break;
        case WebKit2.LoadEvent.COMMITTED:
            if (setUri)
                urlBar.setText(webView.getUri());
            buttons.back.setSensitive(webView.canGoBack());
            buttons.forward.setSensitive(webView.canGoForward());
            for (let i = 0; i < 5; i++) {
                progress.setFraction(webView.getEstimatedLoadProgress());
                sleep(10);
            }
            win.title = `WorstBrowser: [Loading a page]`;
            setUri = true;
            infoLabel.label = `Loading... ${webView.getUri()} | Almost there`;
            break;
        case WebKit2.LoadEvent.FINISHED:
            // console.log(`Title: ${webView.getTitle()}`)
            win.title = `WorstBrowser: ${webView.getTitle()}`;
            progress.setFraction(1);
            // console.log(webView.getEstimatedLoadProgress())
            var a = [];
            for (let i in config.bookmarks) {
                a.push(config.bookmarks[i]);
            }
            if (a.includes(webView.getUri())) {
                buttons.add_bookmark.setSensitive(false);
                buttons.remove_bookmark.setSensitive(true);
                buttons.add_bookmark.hide();
                buttons.remove_bookmark.show();
            }
            else {
                buttons.add_bookmark.setSensitive(true);
                buttons.remove_bookmark.setSensitive(false);
                buttons.add_bookmark.show();
                buttons.remove_bookmark.hide();
            }
            history.push({
                url: webView.getUri(),
                timestamp: Date.now()
            });
            fs.writeFileSync('history.json', JSON.stringify(history));
            spinner.stop();
            spinner.hide();
            infoLabel.label = `Loaded ${webView.getTitle()} | OK`;
            // Apple check
            if (/https?:\/\/(www\.)?apple\.com\/.*/gm.test(webView.getUri())) {
                extensions.event('onPopup', ['apple-series', 'START']);
                const allowedForApple = appleCheck_1.appleCheck();
                extensions.event('onPopup', ['apple-series', 'STOP']);
                if (!allowedForApple) {
                    var href = parseLink_1.parseLink('worstbrowser:apple_disallowed');
                    if (typeof href === 'string') {
                        urlBar.setText(href);
                        webView.loadUri(href);
                    }
                    else {
                        urlBar.setText(href.title);
                        webView.loadUri(href.href);
                        setUri = false;
                    }
                }
            }
            // Anti-chrome
            if (webView.getUri().includes('chrome')) {
                var href = parseLink_1.parseLink('worstbrowser:anti_danger_browser');
                if (typeof href === 'string') {
                    urlBar.setText(href);
                    webView.loadUri(href);
                }
                else {
                    urlBar.setText(href.title);
                    webView.loadUri(href.href);
                    setUri = false;
                }
            }
            if (webView.getUri().startsWith('file://')
                && webView.getUri().endsWith('.md')) {
                setUri = false;
                const html = buildHtmlFromMd_1.buildHtmlFromMd(String(fs.readFileSync(webView.getUri().slice(7))));
                webView.loadHtml(html, 'WorstBrowser: Markdown');
            }
            presence.setUrl(webView.getUri());
            extensions.event('onPageLoaded', [webView, win]);
            break;
    }
});
urlBar.on('activate', () => __awaiter(void 0, void 0, void 0, function* () {
    var href = parseLink_1.parseLink(urlBar.getText());
    if (typeof href === 'string') {
        urlBar.setText(href);
        webView.loadUri(href);
    }
    else {
        urlBar.setText(href.title);
        webView.loadUri(href.href);
        setUri = false;
    }
    // console.log(webView.getTitle())
}));
win.on('show', () => { Gtk.main(); });
win.on('destroy', () => { Gtk.mainQuit(); });
win.on('delete-event', () => false);
if (config.dark) {
    var gtkSettings = Gtk.Settings.getDefault();
    gtkSettings.gtkApplicationPreferDarkTheme = true;
    gtkSettings.gtkThemeName = 'Adwaita';
}
function main(argc, args) {
    extensions.init({
        window: win,
        webView: webView,
        config: config,
        gtk: Gtk,
        webkit2: WebKit2,
        urlBar: urlBar
    });
    load(`${config.assetsFolder}/music.mp3`).then((buffer) => {
        playback = play(buffer, {
            //	start: 0,
            //	end: buffer.duration,
            loop: true,
            autoplay: true,
            volume: 1
        }, () => { });
    });
    extendedToolbar.hide();
    extraButtons.start_rpc.setSensitive(!presence.isActive);
    extraButtons.end_rpc.setSensitive(presence.isActive);
    extensions.event('onBrowserStart', [win]);
    var href = parseLink_1.parseLink(process.argv[4] || config.homepage);
    if (typeof href === 'string') {
        urlBar.setText(href);
        webView.loadUri(href);
    }
    else {
        urlBar.setText(href.title);
        webView.loadUri(href.href);
        setUri = false;
    }
    win.showAll();
    playback.pause();
    presence.end();
    extensions.event('onBrowserQuit', []);
}
const __process_args__ = JSON.parse(JSON.stringify(process.argv));
__process_args__.shift();
__process_args__.shift();
main(__process_args__.length, __process_args__);
