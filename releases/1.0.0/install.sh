#!/bin/bash
function exit_sucess() {
	[[ -d "$dir" ]] && rm -rf "$dir"

	echo -e "\e[32mSuccess: \e[0m$1"
	echo -e "In \e[33m$SECONDS\e[0m seconds"
	exit $2
}

function exit_failure() {
	[[ -d "$dir" ]] && rm -rf "$dir"

	# Remove all the browser files

	# //

	echo -e "\e[31mFailed: \e[0m$1"
	echo -e "In \e[33m$SECONDS\e[0m seconds"
	exit $2
}

function version_check() {
	if [[ $1 == $2 ]]; then
		return 0
	fi

	if [[ $1 == $(echo -e "$1\n$2" | sort -V | head -n1) ]]; then
		return 0
	fi

	return 1
}

function start() { echo -e "\e[33m[$1]\e[0m $2"; }
function end() { echo -e "\e[33m[$1]\e[0;32m[DONE]\e[0m $2 \e[2m($SECONDS)\e[0m"; }

function make_json_key() {
	if [[ -z $3 ]]; then
		echo "\"$1\": \"$2\","
	else
		echo "\"$1\": \"$2\""
	fi
}

echo -e "\e[36;1mWorstBrowser instllation\e[0m"
echo -e "Welcome to the worstbrowser installation script. Thank you for choosing worstbrowser. You are likely to be asked (by sudo) for your password during the instllation."

start 1 "Checking versions"

version_check "7.9.0" $(npm --version) || exit_failure "You need to have npm >= 7.9.0"
version_check "3.28.1" $(zenity --version) || exit_failure "You need to have zenity >= 3.28.1"
version_check "14.15.1" $(node --version | cut -c2-) \
	|| exit_failure "You need to have node >= 14.15.1"

end 1 "Checking versions"
start 2 "Downloading assets"

dir="$(date | sed 's/ /-/g')-worstbrowserinstall"
mkdir "$dir"
dir=$(realpath "$dir")

echo "Source: "
wget 'https://cdn.discordapp.com/attachments/835171063251206205/835225079960961053/1.0.0-src.zip' -O "$dir/src.zip" -q --show-progress

echo "Modules: "
wget 'https://cdn.discordapp.com/attachments/835171063251206205/835227497992814592/1.0.0-modules.zip' -O "$dir/modules.zip" -q --show-progress

end 2 "Downloading assets"
start 3 "Extracting source"

sudo mkdir '/usr/share/worstbrowser'
sudo unzip -oq -d '/usr/share/worstbrowser' "$dir/src.zip"

end 3 "Extracting source"
start 4 "Installing packages"

sudo unzip -oq -d '/usr/share/worstbrowser' "$dir/modules.zip"

end 4 "Installing packages"
start 5 "Creating unprotected folder structure"

mkdir "$HOME/.worstbrowser"
mkdir "$HOME/.worstbrowser/extensions"

touch "$HOME/.worstbrowser/lock.json"
touch "$HOME/.worstbrowser/notes.json"
touch "$HOME/.worstbrowser/config.json"
touch "$HOME/.worstbrowser/history.json"
touch "$HOME/.worstbrowser/extensions/config.json"

end 5 "Creating unprotected folder structure"
start 6 "Configuring"

echo '{
	"dark": false,
	"homepage": "worstbrowser:home",
	"bookmarks": {},' > "$HOME/.worstbrowser/config.json"

make_json_key "defultPagesDir" "/usr/share/worstbrowser/pages" \
	>> "$HOME/.worstbrowser/config.json"

make_json_key "assetsFolder" "/usr/share/worstbrowser/assets" \
	>> "$HOME/.worstbrowser/config.json"

make_json_key "securityFile" "$HOME/.worstbrowser/lock.json" \
	>> "$HOME/.worstbrowser/config.json"

make_json_key "extensions" "$HOME/.worstbrowser/extensions" \
	>> "$HOME/.worstbrowser/config.json"

make_json_key "extensionsConfig" "$HOME/.worstbrowser/extensions/config.json" \
	>> "$HOME/.worstbrowser/config.json"

make_json_key "notes" "$HOME/.worstbrowser/notes.json" "ř" \
	>> "$HOME/.worstbrowser/config.json"

echo "}" >> "$HOME/.worstbrowser/config.json"

echo "{}" >> "$HOME/.worstbrowser/lock.json"
echo "{}" >> "$HOME/.worstbrowser/notes.json"
echo "[]" >> "$HOME/.worstbrowser/history.json"
echo "{}" >> "$HOME/.worstbrowser/extensions/config.json"

end 6 "Configuring"
start 7 "Creating .desktop file"

while read -r line; do
	sudo echo "$line" >> "$HOME/.local/share/applications/worstbrowser.desktop"
done << '::EOF'
[Desktop Entry]
Type=Application

Name=WorstBrowser
Categories=Network;WebBrowser

X-GNOME-FullName=WorstBrowser
Comment=Microsoft certified browser #1

Icon=/usr/share/worstbrowser/assets/128.png
NoDisplay=false

::EOF

sudo echo \
	"Exec=node '/usr/share/worstbrowser/out/main.js' '$HOME/.worstbrowser/config.json' '$HOME/.worstbrowser/history.json'" >> "$HOME/.local/share/applications/worstbrowser.desktop"

while read -r line; do
	sudo echo "$line" >> "$HOME/.local/share/applications/worstbrowser.desktop"
done << '::EOF'
Path=
Terminal=false
X-GNOME-UsesNotifications=false
::EOF

end 7 "Creating .desktop file"

exit_sucess "Installed worstbrowser"