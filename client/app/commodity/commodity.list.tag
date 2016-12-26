<div onclick="{ click }">hello</div>
<div>{ message }</div>
<form ref="userForm" onsubmit="{ onSubmit }">
	<input ref="username">
	<p if="{opts.forms &&  opts.forms.userForm.$submitted && opts.forms.userForm.username.$error.maxlength}">长度过长</p>
	<p if="{opts.forms &&  opts.forms.userForm.$submitted && opts.forms.userForm.username.$error.required}">姓名必填</p>
	<select ref="sex">
		<option></option>
		<option value="0">男</option>
		<option value="1">女</option>
	</select>
	<p if="{opts.forms &&  opts.forms.userForm.$submitted && opts.forms.userForm.sex.$error.required}">性别必填</p>
	<button>提交</button>
</form>

<div>CommodityList begin</div>

<div each="{c in opts.commodity}">
	<span>{ c.id }</span>
	<span>{ c.name }</span>
</div>

<div ref="commodity-nest"></div>

<div>CommodityList end</div>