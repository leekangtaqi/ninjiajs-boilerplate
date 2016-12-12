import fetch from 'node-fetch';
import { promisify, promisifyAll } from '../client/framework/promisify';
import riot from 'riot';
import { provide } from '../client/framework/riot-redux';
import router from '../client/framework/lean-router';
import Application from './client.application';
import config from '../client/app/app.config';
import originConfig from './config/environment/shared';

//todo css

/**
 * @param obj {Object}
 *  req
 *  res
 *  origin
 * @returns app
 */
module.exports = function({req, res, origin}){
    global.fetch = fetch;
	require('../client/framework/jQueryLean');
	var app = Application(global);
	app.config = config;

	app.set('env', process.env.NODE_ENV ? process.env.NODE_ENV : 'development');

	app.set('mode', 'browser');

	app.set('context', { store: app.store, hub: router.hub, tags: {}, util: {promisify, promisifyAll}});

	// require('riot-form-mixin');
	// app.mixin('form', form);

	app.router(router);

	/**
	 * application ready callback.
	 */
	app.start(async () => {
		/**
		 * export app to global.
		 */
		global.app = app;

		/**
		 * router interceptors.
		 */
		app.hub.on('history-pending', (from, to, $location, ctx, next) => {
			if(ctx.req.body.authenticate && !req.cookies.token) {
				let query = ctx.req.query;
				let fxer = req.cookies.get('fxer');
				if(fxer && !query.hasOwnProperty('fxer')){
					query['fxer'] = fxer;
				}
				if($location === '/wepay'){
					$location = '/wepay/';
				}
				let referer = Object.keys(query).length ? `${$location}?${$.util.querystring.stringify(query)}` : `${$location}`;
				res.cookie('referer', referer);
				return $.get(`/wechat/client?referer=${referer}`).then(link => res.redirect(link.link));
			}
			next && next();
		});

		app.hub.on('history-resolve', (from, to, ctx, hints) => {
			if(req.cookies.get('fxer') && hints.length === 1){
				router.hub.search('fxer', req.cookies.fxer);
			}
		})

		/**
		 * register widgets.
		 */
		app.registerWidget({
            name: 'alert',
            methods: ['add']
		});

		app.registerWidget({
            name: 'modal',
            methods: ['open']
		});
		
		global.widgets.Alert = app.context.tags['alert'];
		global.widgets.Modal = app.context.tags['modal'];

        await bootstrap(app, {req, res, origin});
		/**
		 * set entry for the application.
         * todo ....
		 */
		app.set('entry', riot.render.tag('app', {store: app.store}));

		/**
		 * set provider for redux.
		 */
		provide(app.store)(app.entry);

        //todo provider.
	});
	return app;
}

/**
 * 1.do some data fetch (user, merchant)
 * 2.set rest api (base, intercept, headers)
 */
const bootstrap = async ({env, store}, {req, res, origin}) => {
    let config = originConfig[env];
    let dispatch = store.dispatch;
    Object.assign($, $.ajax.base(`${config.apiUri[origin]}/api`));
    
    $.setErrorInterceptor((e, chain) => {
        let response = e.response;
        if(!response){
            console.error("[action Failed]")
            console.error(e);
            return;
        }
        if(response && response.status === 401) {
            res.clearCookie('token');
            let route = store.getState().route;
            let referer = route.$location.replace('_', '');
            res.cookie('referer', referer);
            return $.get('/wechat/client?referer=' + referer).then(link => res.redirect(link.link));
        }
        try{
            response.json().then(data => {
                widgets.Alert.add('danger', data.errmsg); 
            });
        }catch(e){
            widgets.Alert.add('danger', '系统错误');
        }
    })

    $.addResponseInterceptor(response => {
        if(response.status === 205) {
            res.clearCookie('token');
            res.redirect(req.get('referer'))
            return;
        }
        if (response.status >= 200 && response.status < 300) {
            return response
        } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error
        }
    })
    
    let headers = {'X-API-From': config.from};

    Object.assign($, $.withProps({headers}));

    let fxer = req.query.fxer;
    if(fxer){res.cookie('fxer', fxer);}
    if(req.cookies.fxer) {
      headers['X-FXER'] = req.cookies.fxer;
    }
    Object.assign($, $.withProps({headers}));

    let code = req.query.code;
    if(code){
        let data = await fetch(`${config.uri}/api/wechat/token?code=${code}`, {
            method: 'get',
            headers: {
                'X-API-From': config.from,
                'X-Component': config.component
            }
        });
        let { token } = await data.json();
        if(token){
            res.cookie('token', token);
        }
        let referer = req.cookies.referer;
        res.redirect(`${origin}${referer}`);
        return;
    }

    let token = req.cookies.token; 

    if(token) {
      headers.Authorization = token;
      Object.assign($, $.withProps({headers}));
      let user = await $.get('/wechat/userinfo');
      dispatch({type: 'user', payload: user});
    }

    /**
     * load merchant info
     */
    $.get('/merchant')
        .then(data => {
            dispatch({type: 'fetchMerchant', payload: data});  
            dispatch({type: 'isAndriod', payload: navigator.userAgent.match(/Android/i)})
        })
}