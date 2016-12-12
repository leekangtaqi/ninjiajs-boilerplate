import * as riot from 'riot';

export default class App extends riot.Tag {
	get name() {
		return 'app'
	}
	get tmpl() {
		return `
		<div>grating riot 3!!</div>
		<ul>
			<li><a href="/">commodity list</a></li>
			<li><a href="/about">about us</a></li>
		</ul>
		<router-outlet></router-outlet>
		`
	}
	get attrs() {
		return 'class="{ className }"'
	}
	get css() {
		return 'my-tag p{ color: blue; }'
	}
	onCreate(opts) {
		this.message = opts.message
	}
	click() {
		this.message = 'goodbye'
	}
}