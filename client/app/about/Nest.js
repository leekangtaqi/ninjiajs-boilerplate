import * as riot from 'riot';
import { Ninjia, router, connect, provider, view } from '../../framework/ninjiajs/src/index';

@view
export default class Nest extends riot.Tag {
	get name() {
		return 'nest'
	}
	get tmpl() {
		return `<div>nest</div>`
	}
	onCreate(opts) {
		this.mixin('router')
		this.on('update', () => {
			console.warn(">>>>>>>>>>>>>>");
			console.warn(this);
			console.warn(this.opts.$show);
			console.warn("nest updated");
		})
		this.message = opts.message
	}
	click() {
		this.message = 'goodbye'
	}
}