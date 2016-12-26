import * as riot from 'riot';

export default class CommodityNest extends riot.Tag {
	get name() {
		return 'commodity-nest'
	}
	get tmpl() {
		return `<div>commodity nest</div>`
	}
}