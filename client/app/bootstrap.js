import Cookies from '../framework/cookie';
import originConfig from '../../server/config/environment/shared';

const bootstrap = async (app, {origin}) => {
    let {env, store} = app;
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
            
        }
    })

    $.addResponseInterceptor(response => {
        console.warn(response.statusText);
    })

}
export default bootstrap;