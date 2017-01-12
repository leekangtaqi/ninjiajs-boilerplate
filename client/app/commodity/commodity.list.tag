<button onclick="{ click }">reset form</button>
<button onclick="{ resetUsername }">reset username</button>

<div>{ message }</div>
<form ref="userForm" onsubmit="{ onSubmit }">
	<input ref="username" value="{ opts.forms['userForm']['username'].$val }">
	<p if="{ opts.forms.userForm.$submitted && opts.forms.userForm.username.$error.maxlength}">长度过长</p>
	<p if="{ opts.forms.userForm.$submitted && opts.forms.userForm.username.$error.required}">姓名必填</p>
	<select ref="sex">
		<option></option>
		<option value="0" selected="{ opts.forms['userForm']['sex'].$val === '0' }">男</option>
		<option value="1" selected="{ opts.forms['userForm']['sex'].$val === '1' }">女</option>
	</select>
	<p if="{ opts.forms.userForm.$submitted && opts.forms.userForm.sex.$error.required}">性别必填</p>
	<button>提交</button>
</form>

<div>CommodityList begin</div>

<div each="{c in opts.commodity}">
	<span>{ c.id }</span>
	<span>{ c.name }</span>
</div>

<commodity-nest></commodity-nest>

<div>CommodityList end</div>