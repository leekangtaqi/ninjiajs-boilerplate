import * as riot from 'riot';
import { Ninjia, router, connect, provider, view, form } from '../../framework/ninjiajs/src/index';

@form({
	username: {
		required: true,
		maxlength: 10
	},
	sex: {
		required: true
	}
})
@view
@connect(state => ({
	test: '111'
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
			<p if="{opts.forms &&  opts.forms.userForm.$submitted && opts.forms.userForm.username.$error.required}">姓名必填</p>
			<select ref="sex">
				<option>请选择</option>
				<option value="0">男</option>
				<option value="1">女</option>
			</select>
			<p if="{opts.forms &&  opts.forms.userForm.$submitted && opts.forms.userForm.sex.$error.required}">性别必填</p>
			<button>提交</button>
		</form>
		<div>CommodityList begin</div>
		<div>{ opts.$show }</div>
		<div>{ opts.test }</div>
		<div>{ opts.forms && opts.forms.userForm.$dirty }</div>
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
		console.warn(this.refs['username'].value);
		console.warn(this.refs['sex'].value);
	}
}