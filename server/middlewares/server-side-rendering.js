import router from '../../client/framework/lean-router/index';
import riot from 'riot';
import fetch from 'node-fetch';
import appCreator from '../ssr-main';

export default (req, res, next) => {

	let origin = req.hostname.replace(req.hostname.split('.')[0], '').slice(1);
	let app = appCreator({ req, res, origin });
	
	// * after matches, serval components returned.
	// * require each and invoke fetch data method
	// * and set show true and update. 

	// console.warn("req originalUrl 2............");
	// console.warn(router.hub.matches({location: req.originalUrl}));
	// let appTag = require('../../client/app/app.tag');
	// console.warn(appTag);
	// let html = riot.render(appTag, {store: app.store});
	// console.warn(html);
	next();
}