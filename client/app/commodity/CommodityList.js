import * as riot from 'riot';
import { Ninjia, router, connect, provider, view } from '../../framework/ninjiajs/src/index';

@view
@connect(state => ({
	test: true
}))
export default class CommodityList extends riot.Tag {
	get name() {
		return 'commodity-list'
	}
	get attrs() {
		return 'show="{ opts.$show }"'
	}
	get tmpl() {
		return `
		<div>CommodityList begin</div>
		<div>{ opts.$show }</div>
		<div>CommodityList end</div>
		`
	}
	onCreate(opts) {
		this.mixin('router')
		this.message = opts.message
		// this.$use(this.onUse)
	}
	onUse(next) {
		next();
	}
	
	click() {
		console.warn(this.opts.$show);
		this.message = 'goodbye'
	}
}