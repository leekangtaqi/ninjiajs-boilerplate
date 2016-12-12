'use strict';

let apiUriDev = {};
apiUriDev['wx.dev.91pintuan.com'] = 'https://apidev.91pintuan.com';
apiUriDev['99.dev.91pintuan.com'] = 'https://api99dev.91pintuan.com';

let apiUriPro = {};
apiUriPro['wx.91pintuan.com'] = 'https://api.91pintuan.com';
apiUriPro['91pintuan.com']    = 'https://api.91pintuan.com';
apiUriPro['99.91pintuan.com'] = 'https://api99.91pintuan.com'; 

let commons = {
  phtStlList: '@1e_1c_0o_0l_300h_430w_100q.src',
  phtStlList2: '@1e_1c_0o_0l_100sh_240h_360w_90q.src',
  phtStlList3: '@1e_1c_0o_0l_100sh_125h_180w_90q.src', 
  phtStlList4: '@1e_1c_0o_0l_100sh_85h_120w_90q.src',  
  phtStlComm: '@1e_1c_0o_0l_600h_860w_100q.src',
  phtStlSmll: '@1e_1c_0o_1l_399sh_84h_120w_100q.src',
  phtStl120: '@1e_1c_0o_0l_100sh_120h_120w_90q.src',
  phtStl500: '@0o_1l_500w_90q.src'
}

let config = {
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

mixin(config.development, commons);
mixin(config.production, commons);

function mixin(t, s){
  for(var p in s){
    t[p] = s[p]
  }
}

export default config[process.env.NODE_ENV];
