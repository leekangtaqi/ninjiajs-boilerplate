import * as riot from 'riot';
import CommodityNest from './CommodityNest';
import { Ninjia, register, router, connect, provider, view, form } from '../../framework/ninjiajs/src/index';
import actions from './commodity.actions';
import { bindActionCreators } from 'redux'

@register
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
@connect(
	state => ({
		commodity: state.commodity,
		test: true
	}),
	dispatch => ({
		actions: bindActionCreators(actions, dispatch)
	})
)
export default class CommodityList extends riot.Tag {
	static originName = 'commodity-list'
	get name() {
		return 'commodity-list'
	}
	
	get tmpl() {
		return require('./commodity.list.tag')
	}

	onCreate(opts) {
		this.mixin('router')
		this.message = opts.message = 'hello?'
		this.on('mount', this.onMount)
		this.on('unmount', this.onUnmount)
		this.$use(this.onUse)
	}

	async onUse(next) {
		next();
		await this.opts.actions.update({id: 1, name: '333'}); 
		let res = await this.opts.actions.add({id: 2, name: '新品'});
	}
	
	click() {
		this.message = 'goodbye'
		this.resetForm();
		console.warn("reseted ..........");
	}

	resetUsername() {
		this.setRef('username')
	}

	async onSubmit(e) {
		e.preventDefault()
		this.opts.submit('userForm')
		
		if (this.opts.forms.userForm.$invalid) {
			return;
		}
		// valid
		console.warn("ok");
		await this.opts.actions.add({id: 3, name: this.refs['username'].value}); 
	}
}