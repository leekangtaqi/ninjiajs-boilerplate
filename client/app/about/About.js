import * as riot from 'riot';
import { Ninjia, router, connect, provider, view } from '../../framework/ninjiajs/src/index';

@view
export default class About extends riot.Tag {
	get name() {
		return 'about'
	}

	get tmpl() {
		return `
			<div>about</div>
			<div>{ opts.$show }</div>
			<div>end about</div>
			<a href="/about/nest">jump to nest</a>
			<router-outlet></router-outlet>
			<div ref="test"></div>
		`
	}

	get attrs() {
		return 'show="{ opts.$show }"'
	}

	onCreate(opts) {
		this.on('update', this.onUpdate)
		this.message = opts.message
	}

	onUpdate() {
		
	}

	click() {
		this.message = 'goodbye'
	}
}