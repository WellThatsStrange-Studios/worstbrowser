import * as YAML from 'yaml'

import { removeTabs } from '../removeTabs'

export function getPublicWbScript(raw: string) {
	var raw_yml_arr: string[] = []
	var yml_string_arr: string[] = []
	var yml_arr: any[] = []

	const regex = /<!--\{WBSCRIPT\}.+\{\/WBSCRIPT\}-->/gms

	do {
		var m = regex.exec(raw)
		if (m) raw_yml_arr.push(m[0])
	} while (m)

	raw_yml_arr.forEach((i) => {
		const _clean = i.slice('<!--[WBSCRIPT]'.length, -('[/WBSCRIPT]-->'.length))
		var clean_: string[] = []

		_clean.split('\n').forEach((j) => {
			clean_.push(removeTabs(j))
		})

		const clean = clean_.join('\n')
		yml_string_arr.push(clean)
	})

	yml_string_arr.forEach((i) => {
		yml_arr.push(YAML.parse(i))
	})

	return yml_arr
}