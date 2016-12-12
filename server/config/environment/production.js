'use strict';

module.exports = {
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,
  port:     9185,
  api: {
    uri: 'https://api.91pintuan.com/api',
    component:'5581117b5f225e4c401c9259',
    from:'client'
  },
  debug:{
  	wechat:false
  }
};
