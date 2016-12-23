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
	get attrs() {
		return 'if="{ opts.$show }"'
	}
	onCreate(opts) {
		this.mixin('router')
		this.on('update', () => {
			console.warn("about updated");
		})
		this.message = opts.message
	}
	click() {
		this.message = 'goodbye'
	}
}