import addrActions from '../address/address.actions';
import Cookies from '../../framework/cookie';
import Wechat from '../wechat/wechat.api';
import moment from '../../framework/moment';
import commActions from '../commodity/commodity.actions';

// const enterGrouopInfoJoin = opts => async (dispatch, getState) => {
//     dispatch({type: 'changeTitle', payload: '参团'});
//     dispatch({type: 'setDeliveryPayment', payload: null});
//     dispatch({type: 'setJoinGroupAddrStic', payload: {}});
//     dispatch({type: 'setJoinGroupAddrHad', payload: false});
//     let user = getState().user;
//     if(user){
//         initJoinGroupAddress(user);
//     }
//     dispatch(loadJoinGroupAddress());
//     let _loadGroupByIdAndInitArea = (id, done) => dispatch(loadGroupByIdAndInitArea(id, done));
//     let loadGroupByIdAndInitAreaAsync = app.context.util.promisify(_loadGroupByIdAndInitArea);
//     await loadGroupByIdAndInitAreaAsync(opts.id);
//     let group = getState().group;
//     if(group.commodity && group.commodity.scene){
//         let scene = null;
//         switch(group.commodity.scene){
//             case 'poi':
//                 scene = 'poi';
//                 break;
//             case 'logistics':
//                 scene = 'logistics';
//                 break;
//             case 'collection':
//                 scene = 'collection';
//                 break;
//             case 'virtual':
//                 scene = 'virtual';
//                 break;
//         }
//         dispatch(selectScene(scene));
//     }
//     group = getState().group;
//     if(group
//     && group.commodity
//     && group.commodity.scene
//     && group.commodity.scene.split('_').length
//     && group.commodity.scene.split('_').length > 1
//     ){
//         dispatch(selectScene('poi'));
//     }
// }

const enterGroupDetailView = next => async (dispatch, getState) => {
    let group = getState().group;
    let comm = group.commodity;
    let txtDetail = htmlToPlaintext(comm.info.name);
    let diff = group.commodity.partakers - group.num_order;
    let end_time_str = "已结束";
    let diffStr = null;
    let img = null;
    let title = comm.info.name;
    let colonel = group.address.name;
    let group_name = colonel.substr(0,4) + '的团';
    let price = "原　价: " + comm.price + "元";
    let discount = "拼团价: " + comm.discount + "元";
    let desc = '';
    let timeline = title.substr(0,16) + '~' + group_name + ',' + diffStr;
    let detail = comm.info.detail.replace(/img1.ifindu.cn\/photo/g, 'photo.91pintuan.com');
    detail = $.util.filter.htmlSafe(detail);
    // detail = detail.replace(/<script/g, '<p style="display:none;" ');
    // detail = detail.replace(/script>/g, 'p>');
    if(diff > 0){
        diffStr = "还差" + diff + "人成团";
    }else{
        diffStr = "已有" + group.num_order + "人参团";
    }
    if (group.isBefore) {
        end_time_str = "剩余时间: " + (Math.ceil(parseInt(moment(group.time_end).fromNow())/(3600*24*1000)) + '天内');
    }
    if(comm.info.cover){
        img = app.config.phtUri + comm.info.cover + app.config.phtStl120;
    }else{
        img = undefined;
    }
    dispatch({type: 'refreshCommDetail', payload: detail});
    dispatch({type: 'scrollTop', payload: true});
    dispatch({type: 'changeTitle', payload: group.address.name + '的团'});
    dispatch({type: 'groupCommDetailLoading', payload: '<p class="text-center"><i class="fa fa-spinner fa-pulse fa-2x"></i></p>'});
    dispatch({type: 'changeCommId', payload: comm.id});
    Cookies.set('commId',comm.id);
    let getCommInfoAlbumsWrapper = (id, done) => dispatch(commActions.getCommInfoAlbums(id, done));
    let getCommInfoAlbums = app.context.util.promisify(getCommInfoAlbumsWrapper);
    await getCommInfoAlbums(comm.id);
    
    if(comm.model === 'ladder'){
        desc = '';
        timeline = title.substr(0,16);
        diffStr = "已有" + group.num_order + "人参团";
        let money = comm.ladder.prices.reduce((acc, price, i) => {
            if(i < 3){
                desc += `${price.people}人价:${price.price}元\n`;
                timeline += ` ${price.people}人价${price.price}元`;
            }
            if(group.num_order >= price.people){
                return {
                    key: i,
                    price: price.price,
                    people: price.people,
                    order: group.num_order
                }
            }else{
                return acc; 
            }
        }, undefined);
        dispatch({type: 'groupCommLadderMoney', payload: money});
    }
    
    desc = group_name + '\n' + diffStr + '\n' + end_time_str;
    timeline = group_name + ',' + diffStr+'['+title+']';
    
    setTimeout(() => {
        Wechat.ready({url: window.location.href, title: title, desc: desc, timeline: timeline, img:img});
    }, 50)
    
    next();

    function htmlToPlaintext(text) {
	  return String(text).replace(/<[^>]+>/gm, '');
	}
}

const nextPage = () => (dispatch, getState) => {
    if(getState().groups.busy) return;
    dispatch({type: 'groupsBusy', payload: true});
    let params = getState().groups.params;
    Object.assign(params, {limit: getState().groups.limit, page: getState().groups.page});
    $.get(`/group?${$.util.querystring.stringify(params)}`).then(data=>{
        let count = data[0];
        var items = data[1];
        dispatch({type: 'setGroupsCount', payload: count});
        dispatch({type: 'addGroup', payload: items});
        dispatch({type: 'groupsNextPage'});
        if((getState().partakers.items.length + items.length) >= count){
            dispatch({type: 'groupsBusy', payload: true});
            return;
        }
        dispatch({type: 'groupsUnBusy', payload: true});
    })
}

const initGroups = json => dispatch => dispatch({type: 'initGroups', payload: json});

const changeJoinGroupProvince = newVal => async (dispatch, getState) => {
    let prevProvince =  getState().joinGroupAddress.province;
    let province = newVal ? (typeof newVal === 'object' ? newVal : JSON.parse(newVal)) : null;
    dispatch({type: 'selectJoinGroupProvince', payload: province});
    dispatch({type: 'updateJoinGroupAddress', payload: {province: province}});
    dispatch({type: 'selectJoinGroupCity', payload: null});
    dispatch({type: 'setDeliveryPayment', payload: 0})
    if(!province){
        dispatch({type: 'updateJoinGroupAddress', payload: {province: null, city: null, district: null}});
        return dispatch({type: 'setJoinGroupCities', payload: null});
    };
    let state = getState();
    let group = state.group;
    let promise = null;
    let isLimitPurchase = group.commodity && group.commodity.logistic && group.commodity.logistic.type === '1' || false;
    if(isLimitPurchase){
        promise = $.get(`/logistic/tpl/${group.commodity.logistic.template.id}/addr/city?pid=${province.id}`);
    }else{
        promise = $.get('/address/city?province=' + province.py);
    }
    let cities = await promise;
    if(isLimitPurchase){
        let districts = null;
        dispatch({type: 'setJoinGroupCities', payload: cities});
        if(cities.length){
            districts = await $.get(`/logistic/tpl/${group.commodity.logistic.template.id}/addr/district?cities=${JSON.stringify(cities.map(c=>c.id))}`);
            districts.map(res => {
                dispatch({type: 'setJoinGroupDistricts', payload: {cid: res.cid, districts: res.districts}});
            })
        }
    }else{
        dispatch({type: 'setJoinGroupCities', payload: cities.city})
    }
    getState().joinGroupCities.map((city, key) => {
        let cityInProfile = getState().joinGroupAddress.city;
        if(cityInProfile && (city.id == cityInProfile.id)){
            dispatch({type: 'selectJoinGroupCity', payload: city});
            city.district && city.district.map((val,key) => {
                if(state.joinGroupAddress.district && 
                val.id === getState().joinGroupAddress.district.id){
                    dispatch({type: 'selectJoinGroupDistrict', payload: val});
                }
            });
        }
    })
}

const selectJoinGroupDistrict = (district, isLimitPurchase = true) => async (dispatch, getState) => {
    dispatch({type: 'setDeliveryPayment', payload: 0});
    if(!district){
        return
    }
    district = JSON.parse(district);
    dispatch({type: 'selectJoinGroupDistrict', payload: district});
    if(!isLimitPurchase){
        return;
    }
    let tpl = getState().joinGroupTemplate;
    let payment = await caculateFreight(tpl.id, district.id);
    dispatch({type: 'setDeliveryPayment', payload: payment});
}

const loadGroupByIdAndInitArea = (id, done) => async (dispatch, getState) => {
    loadGroupById(id, async (data) => {
        dispatch({type: 'setJoinGroupProvinces', payload: addrActions.getProvinces()});
        if(data.commodity.logistic
        && data.commodity.logistic.type === '1'
        && data.commodity.logistic.template
        && data.commodity.logistic.template.id
        ){
          let provinces = await $.get(`/logistic/tpl/${data.commodity.logistic.template.id}/addr/province`);
          dispatch({type: 'setJoinGroupTemplate', payload: data.commodity.logistic.template});
          dispatch({type: 'setJoinGroupProvinces', payload: provinces});
        }
        dispatch({type: 'setJoinGroupPoiLoaded', payload: false});
        
        if(data.commodity.status.lbs){
            wx.ready(function(){
                wx.getLocation({
                    success: function (res) {
                        let query = $.util.querystring.stringify({
                            tag: data.commodity.poitag,
                            latitude: res.latitude || 0,
                            longitude: res.longitude || 0
                        }); 
                        $.get('/wechat/poi?' + query).then(pois => {
                          dispatch({type: 'setGroupPois', payload: pois});
                          dispatch({type: 'setJoinGroupPoiLoaded', payload: true});
                        })
                    },
                    cancel: function (res) {widgets.Alert.add('warning','您拒绝授权获取地理位置');},
                    fail: function(res){window.location.reload();}
                });
            });
        }else{
            const url = data.commodity.poitag ? 
                '/wechat/poi?tag=' + data.commodity.poitag :
                '/wechat/poi';
            let pois = await $.get(url);
            dispatch({type: 'setGroupPois', payload: pois});
            dispatch({type: 'setJoinGroupPoiLoaded', payload: true});
        }
        done && done(data);
    })(dispatch)
}

const participate = () => async (dispatch, getState) => {
    dispatch({type: 'setJoinGroupSubmiting', payload: true});
    setTimeout(() => dispatch({type: 'setJoinGroupSubmiting', payload: false}), 5000);
    let state = getState();
    let area = state.selectJoinGroupAddress;
    let group = state.group;
    let addr_stic = state.joinGroupAddrStic;
    let address = state.joinGroupAddress;

    if(area.province){
        dispatch({type: 'updateJoinGroupAddress', payload: {province: $.util.omit(area.province, 'py', 'parent')}});
    }

    if(area.city){
        dispatch({type: 'updateJoinGroupAddress', payload: {city: $.util.omit(area.city, 'districts', 'parent')}});
    }

    if(area.district){
        dispatch({type: 'updateJoinGroupAddress', payload: {district: $.util.omit(area.district, 'city', 'parent')}});
    }

    address.remark && dispatch({type: 'updateJoinGroupAddrStic', payload: {remark: address.remark}});
    
    if (!$.util.deepEqual(address, getState().joinGroupAddrStic)){
        dispatch({type: 'updateJoinGroupAddress', payload: {id: ''}});
    }

    let scene = group.commodity.scene;
    if(scene === 'poi'){
        dispatch({type: 'extractJoinGroupScene', payload: 'poi'})
    }
    else if(scene === 'logistics'){
        dispatch({type: 'extractJoinGroupScene', payload: 'logistics'})
    }
    else if(scene === 'collection'){
        dispatch({type: 'extractJoinGroupScene', payload: 'collection'})
    }

    let multiScene = getState().group.selectScene; 
    if(multiScene){
        if(multiScene === 'poi'){
            dispatch({type: 'extractJoinGroupScene', payload: 'poi'})
        }
        else if(multiScene === 'logistics'){
            dispatch({type: 'extractJoinGroupScene', payload: 'logistics'})
        }
        else if (multiScene === 'collection'){
            dispatch({type: 'extractJoinGroupScene', payload: 'collection'})
        }
    }    
    //添加sku信息
    var key = 'grp_sku_' + group.id;
    var skuCki = Cookies.get(key);
    if(skuCki) dispatch({type: 'updateJoinGroupAddress', payload: {sku: skuCki}});
    let data = await $.post('/group/' + group.id + '/join', getState().joinGroupAddress);
    wx.chooseWXPay({
        timestamp: data.timestamp,
        nonceStr : data.nonceStr,
        package  : data.package,
        signType : data.signType,
        paySign  : data.paySign,
        success  : function(res) {
        //  widgets.Alert.add('warning', '支付成功');
            Cookies.remove(key);//删除sku信息
            riot.route('group/' + data.id)
        },
        cancel   : function(res) {
            widgets.Alert.add('warning', '您取消了支付');
            dispatch({type: 'setJoinGroupSubmiting', payload: false});
            riot.route('group/' + data.id)
        },
        fail     : function(res) {
            widgets.Alert.add('warning', '微信支付失败');
            dispatch({type: 'setJoinGroupSubmiting', payload: false});
            riot.route('group/' + data.id)
        }
    });
}

const loadGroupById = (id, done) => dispatch => {
    $.get('/group/' + id).then(data => {
        dispatch({type: 'loadGroupById', payload: data})
        done && done(data);
    });
}

//第四种消费方式
const selectScene = (scene, tag) => async (dispatch, getState) => {
    dispatch({type: 'updateJoinGroupAddress', payload: {scene}});
    dispatch({type: 'selectScene', payload: scene});
    if(scene === 'logistics'){
        let joinGroupAddress = getState().joinGroupAddress;
        let tpl = getState().joinGroupTemplate;
        if(joinGroupAddress.district && tpl && tpl.id){
            let payment = await caculateFreight(tpl.id, joinGroupAddress.district.id);
            dispatch({type: 'setDeliveryPayment', payload: payment});
        }
    }
}

const initJoinGroupAddress = user => {
    return {
        type: 'initJoinGroupAddress',
        payload: {
            name: user ? user.name : '',
            telephone: user ? user.telephone : '',
            address: user ? user.address : '',
            province: user ? user.province : '',
            city: user ? user.city : '',
            district: user ? user.district : '',
        }
    }
}

const loadJoinGroupAddress = () => async (dispatch, getState) => {
    let provinces = getState().commProvinces;
    let data = await $.get('/address');
    dispatch({type: 'initJoinGroupAddress', payload: data});
    dispatch({type: 'setJoinGroupAddrStic', payload: data});
    dispatch({type: 'setJoinGroupAddrHad', payload: true});

    if(data.province){
        provinces.forEach(p => {
            if(p.id === data.province.id){
                dispatch({type: 'setJoinGroupProvince', payload: p});
                dispatch(changeJoinGroupProvince(p));
            }
        })
    }
} 

const replenishment = id => dispatch => {
    $.post(`/group/${id}/order`).then(data => {
        wx.chooseWXPay({
            timestamp: data.timestamp,
            nonceStr : data.nonceStr,
            package  : data.package,
            signType : data.signType,
            paySign  : data.paySign,
            success  : function(res) {
                // var url = $state.href(data.state, {id:data.id});
                // location.href = url;
                riot.route(`/group/${id}`);
            },
            cancel   : function(res) {
                riot.route(`/group/${id}`);
            },
            fail     : function(res) {
                riot.route(`/group/${id}`);
            }
        }); 
    })
}

const updateJoinGroupAddress = address => ({type: 'updateJoinGroupAddress', payload: address});

/**
 * apis
 */
const caculateFreight = async (tplId, districtId) => await $.get(`/logistic/tpl/${tplId}/freight?district=${districtId}`);

export default {
    // enterGrouopInfoJoin,
    enterGroupDetailView,
    nextPage,
    initGroups,
    loadGroupById, 
    initJoinGroupAddress, 
    loadJoinGroupAddress, 
    loadGroupByIdAndInitArea,
    changeJoinGroupProvince,
    updateJoinGroupAddress,
    participate,
    replenishment,
    selectScene,
    selectJoinGroupDistrict
}