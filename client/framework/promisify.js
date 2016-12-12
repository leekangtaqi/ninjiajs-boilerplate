const promisify = fn =>
	(...args) => {
		let me = this;
		return new Promise((resolve, reject) => {
			let cb = res => resolve(res);
			fn.apply(me, [...args, cb]);
		})
	}

const promisifyAll = o => {
	let proxy = {};
	for(let i=0, len = Object.keys(o).length; i<len; i++){
		let k = Object.keys(o)[i];	
		if(typeof o[k] === 'function'){
			proxy[`${k}Async`] = promisify(o[k]);
		}
	}
	return proxy;
};

export {promisify, promisifyAll}
export default {promisify, promisifyAll};