import * as riot from 'riot';
import { register } from '../../framework/ninjiajs/src/index';

@register
export default class CommodityNest extends riot.Tag {
	static originName = 'commodity-nest'
	get name() {
		return 'commodity-nest'
	}
	onCreate(){

	}
	get tmpl() {
		return `<div>commodity nest</div>`
	}
}