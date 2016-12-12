@router()
@connect(
	state => ({
		group: state.group,
		stateView: state.joinGroupViewMeta,
		merchant: state.merchant,
		deliveryPayment: state.deliveryPayment,
		isLimitPurchase: isLimitPurchase(state.group),
		totalFee: totalFee(state.group)
	}),
	dispatch => bindActionCreators(actions, dispatch)
)
class GroupInfoComponent extends riot.Tag {
	static fetchData({ store }){
			return store.dispatch(actions.enter());
	}
	get name(){
		return 'group-info'
	}
	get tmpl(){
		return $.util.template.stringify('./group.info.html');
	}
	onCreate(opts){
		this.onChangePoi = e => e.target.value && opts.updateJoinGroupAddress({poi: JSON.parse(e.target.value)});
    this.onChangeTelephone = e => opts.updateJoinGroupAddress({telephone: e.target.value});
    this.onChangeName = e => opts.updateJoinGroupAddress({name: e.target.value});
    this.onChangeRemark = e => opts.updateJoinGroupAddress({remark: e.target.value});
    this.onChangeAddress = e => opts.updateJoinGroupAddress({address: e.target.value});
		this.onClickSelectScene = e => opts.selectScene(e.currentTarget.getAttribute('value'))
    this.onSelectJoinGroupProvince = e => opts.changeJoinGroupProvince(e.target.value, this);
		this.on('mount', () => opts.enter(opts));
	}
}