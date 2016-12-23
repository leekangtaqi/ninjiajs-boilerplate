import * as riot from 'riot';
import { Ninjia, router, connect, provider, view, form } from '../../framework/ninjiajs/src/index';

@form({
	username: {
		required: true,
		maxlength: 10
	}
})
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
		<form ref="userForm" onsubmit="{ onSubmit }">
			<input ref="username">
			<p if="{opts.forms &&  opts.forms.userForm.$submitted && opts.forms.userForm.username.$error.maxlength}">长度过长</p>
			<p if="{opts.forms &&  opts.forms.userForm.$submitted && opts.forms.userForm.username.$error.required}">必填</p>
			<select>
				<option>a</option>
				<option>b</option>
				<option>c</option>
			</select>
			<button>提交</button>
		</form>
		<div>CommodityList begin</div>
		<div>{ opts.$show }</div>
		<div>{ opts.test }</div>
		<div>CommodityList end</div>
		`
	}
	onCreate(opts) {
		this.mixin('router')
		this.message = opts.message
		this.$use(this.onUse)
	}
	onUse(next) {
		next();
	}
	
	click() {
		console.warn(this.opts.$show);
		this.message = 'goodbye'
	}

	onSubmit(e) {
		e.preventDefault()
		this.opts.submit('userForm')
		
		if (this.opts.forms.userForm.$invalid) {
			return;
		}
		// valid
		console.warn("ok");
		
	}
}