'use strict';

var apiUriDev = {};
apiUriDev['wx.dev2.91pintuan.com'] = 'https://apidev.91pintuan.com';
apiUriDev['99.dev2.91pintuan.com'] = 'https://api99dev.91pintuan.com';

var apiUriPro = {};
apiUriPro['wx.91pintuan.com'] = 'https://api.91pintuan.com';
apiUriPro['91pintuan.com']    = 'https://api.91pintuan.com';
apiUriPro['99.91pintuan.com'] = 'https://api99.91pintuan.com';
apiUriPro['v2.91pintuan.com'] = 'https://apidev.91pintuan.com';
apiUriPro['cunyoupin.com'] = 'http://api.cunyoupin.com';

exports = module.exports = {
  development:{//开发版
    uri: 'https://apidev.91pintuan.com',
    imgUri:'https://img.91pintuan.com',
    phtUri:'https://photo.91pintuan.com',
    phtUriExotic:'http://photo.91pintuan.com',
    component: '5726bf8700bbe21526c4ccbe',
    apiUri: apiUriDev,
    debug:true,
    from:'client'
  },
  production:{//产品版本
    uri: 'https://api.91pintuan.com',
    imgUri:'https://img.91pintuan.com',
    phtUri:'https://photo.91pintuan.com',
    phtUriExotic:'http://photo.91pintuan.com',
    component: '5581117b5f225e4c401c9259',
    apiUri: apiUriPro,
    debug:false,
    from:'client'
  }
};
