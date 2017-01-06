import * as riot from 'riot';

export default function register(WrappedComponent) {

	if (!WrappedComponent.originName) {
		throw new Error(`register decorator expected a origin name.`)
	}

	if (!WrappedComponent.prototype.tmpl) {
		throw new Error(`register decorator expected a template.`)
	}

	let tag = riot.tag(
		WrappedComponent.originName,
		WrappedComponent.prototype.tmpl,
		WrappedComponent.prototype.css || '',
		WrappedComponent.prototype.attrs || '',
		WrappedComponent.prototype.onCreate || function noop(){}
	)
	
	return WrappedComponent;
}