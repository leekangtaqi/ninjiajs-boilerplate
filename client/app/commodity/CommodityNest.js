import * as riot from 'riot';
import { register } from '../../framework/ninjiajs/src/index';

@register
export default class CommodityNest extends riot.Tag {
	static originName = 'commodity-nest'
	get name() {
		return 'commodity-nest'
	}
	get attrs() {
		return 'if="{true}"'
	}
	onCreate() {
		this.on('mount', () => {
			
		})
	}
	get tmpl() {
		return `
			<div>commodity nest grating!
				<input onclick="{click}">
			</div>`
	}
}