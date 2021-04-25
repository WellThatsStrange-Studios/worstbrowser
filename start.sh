#!/bin/bash
function run() {
	tsc 1>&2
	_resp=$?

	if [[ $_resp -ne 0 ]]; then
		return $_resp
	fi

	node out/main.js \
		"./config.json" \
		"./history.json" 
	_resp=$?

	if [[ $_resp -ne 0 ]]; then
		return $_resp
	fi

	return 0
}

function cleanLogs() {
	for i in logs/*.log; do
		echo -e "Removing \e[31m$i\e[0m"
		rm -rf "$i"
	done
}

function testFiles() {
	req=(
		"assets/128.png"
		"pages/home.html"
		"pages/debug.html"
		"pages/apple_disallowed.html"
		"./config.json"
		"./history.json"
	)

	for i in ${req[@]}; do
		if [[ -f "$i" ]]; then
			echo -e "\e[1m$i\e[0m \e[32meixsts!\e[0m"
		else
			echo -e "\e[1m$i\e[0m \e[31mdoes not exist!\e[0m It will be created"
			touch "$i"

			if [[ $i == *.json ]]; then
				echo '{}' > "$i"
			elif [[ $i == *.html ]]; then
				echo '<html></html>' > "$i"
			else
				echo -e "\e[31mE:\e[0m The filetype was not recognized or cant be generated. Please import \e[1m$i\e[0m manually"
			fi
		fi
	done
}

# Parse and run
cmd=$1

if [[ -z $1 ]]; then
	cmd='run'
fi

if [[ $(type -t $cmd) != 'function' ]]; then
	echo -e "Command \e[1m$cmd\e[0m does \e[31mnot exist!\e[0m"
	exit 1
fi

shift

echo -e "Starting :\e[1m$cmd\e[0m"

errlog="logs/$(date | sed -e 's/ /-/g')-err.log"

$cmd $@ 2>"$errlog"
resp=$?

if [[ -z $(cat "$errlog") ]]; then
	rm -rf "$errlog"
fi

if [[ $resp -eq 0 ]]; then
	echo -e "Finnished running \e[32;1m:$cmd\e[0;2m in \e[34m${SECONDS}s\e[0m"
	exit 0
else
	echo -e "Failed running \e[31;1m:$cmd\e[0;2m in \e[34m${SECONDS}s\e[0m"
	echo -e "Error log can be found in \e[1m$errlog\e[0m"
	exit $resp
fi