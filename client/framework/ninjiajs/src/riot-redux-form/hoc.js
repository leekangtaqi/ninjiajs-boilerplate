import { getProvider } from '../riot-redux/components/provider';
import _ from '../util';

let validators = {};

let buildinValidators = [
    {
        name: "required",
        fn: function(val){
            return val.trim() === ""
        }
    },
    {
        name: 'max',
        fn: function(val, expected){
            return parseInt(val.trim(), 10) > expected;
        }
    },
    {
        name: 'min',
        fn: function(val, expected){
            return parseInt(val.trim(), 10) < expected;
        }
    },
    {
        name: 'maxlength',
        fn: function(val, expected){
            return val.length > expected;
        }
    },
    {
        name: 'minlength',
        fn: function(val, expected){
            return val.length < expected;
        }
    },
    {
        name: 'pattern',
        fn: function(val, expected){
            return !(new RegExp(expected)).test(val.trim());
        }
    }
];

/**
 * register build-in validators
 */
buildinValidators.map(function(validator){
    registerValidators(validator.name, validator.fn);
});

function registerValidators(name, fn){
    validators[name] = fn;
}



/**
 * HOC:
 * this: $inputs 
 * opts: forms, $validate, addClass
 */
export default function form(inputRulePairs) {
	return function wrapComponent (WrappedComponent) {
		return class Form extends WrappedComponent {
			get name() {
				return 'form-' + (super.name || WrappedComponent.name);
			}
			onCreate(opts) {
				super.onCreate(opts);
				this.options = inputRulePairs;
				this.on('updated', this.onUpdated);
				this.on('unmount', this.onUnmount);
				this.mapDispatchToOpts();
			}

			mapDispatchToOpts() {
				let store = this.getStore();
				this.opts.submit = (formName) => {
					if (!this.refs[formName]) {
						console.warn(`failed to submit the form, can not find the form [name]${formName}`)
					}
					store.dispatch({type: 'form/submit', payload: formName})
				}
			}

			unMapDispatchToOpts() {

				delete this.opts['forms']
				delete this.opts['submit']
			}

			/**
			 * listen input change dispatch to store, and do validating.
			 * when updated, check input modify or not, if it is, set rule again.
			 */
			onUpdated() {
				let store = this.getStore();
				if (!this.refs) {
					return;
				}
				let formNames  = this.extractFormNamesFromRef();
				if (!formNames || !formNames.length) {
					return;
				}
				// the forms struct changed ?
				this.refDiff(this.extractFormsFromRef());
				
			}

			extractFormNamesFromRef() {
				return Object.keys(this.refs).filter(r => this.refs[r].nodeName === 'FORM')
			}

			extractFormsFromRef() {
				return this.extractFormNamesFromRef().map(n => this.refs[n])
			}

			extractInputsNames() {
				return Object.keys(this.refs).filter(r => this.refs[r].nodeName === ('INPUT' || 'SELECT'))
			}

			extractInputsFromRefs() {
				return Object.keys(this.refs).filter(r => this.refs[r].nodeName === ('INPUT' || 'SELECT')).map(f => this.refs[f])
			}

			extractInputsFromForm(form) {
				return Object.keys(this.refs).filter(r => this.refs[r].form === form)
			}

			getStore() {
				return getProvider(this).opts.store;
			}

			getInputs(form) {
				return Object.keys(this.refs).filter(r => this.refs[r].form === form).map(k => this.refs[k])
			}

			refDiff(forms) {
				let store = this.getStore();
				let formsInStore = store.getState().forms;
				let { adds, dels } = this.distinctForm(forms, formsInStore, f =>  f.attributes["ref"].value);
				let remainForms = this.extractFormNamesFromRef().filter(formName => adds.indexOf(formName) < 0 && dels.indexOf() < 0);

				// resolve adds
				if (adds && adds.length) {
					let formsToUpdate = [];
					adds.forEach(f => {
						this.addForm(store, f)
						let inputs = this.getInputs(this.refs[f])
						let inputsToUpdate = inputs.map(input => this.addInput(store, input, f));
						formsToUpdate.push({ form: f, inputs: inputsToUpdate })
					})
					formsToUpdate.length && store.dispatch({type: 'forms/inputs/add', payload: formsToUpdate});
				}

				// resolve dels remove all listen handlers
				if (dels && dels.length) {
					let formsToRemove = [];
					dels.forEach(f => {
						this.delForm(store, f)
						this.getInputs(this.refs[f]).forEach(i => this.delInput(i));
						formsToRemove.push({ form: f })
					})
					store.dispatch({type: 'forms/remove', payload: formsToRemove});
				}

				// extract not add and del form, check input struct
				if (remainForms && remainForms.length) {
					let { adds, dels } = this.resolveInputsInFormLoop(remainForms);

					if (adds && adds.length) {
						let formsToUpdate = [];

						adds.forEach((formName, inputs) => {

							if (inputs && inputs.length) {
								let inputsToUpdate = inputs.map(input => this.addInput(store, this.refs[input], f));
								formsToUpdate.push({ form: formName, inputs: inputsToUpdate })
							}
						})
						formsToUpdate.length && store.dispatch({type: 'forms/inputs/add', payload: formsToUpdate});
					}

					if (dels && dels.length) {
						let formsToRemove = [];

						dels.forEach((formName, inputs) => {
							if (inputs && inputs.length) {
								inputs.forEach(inputName => {
									this.refs[inputName].forEach(input => this.delInput(input));
								})
								
								formsToRemove.push({ form: formName,  inputs})
							}
						})
						formsToRemove.length && store.dispatch({type: 'forms/inputs/remove', payload: formsToRemove});
					}
					
				}
			}

			resolveInputsInFormLoop(formsNames) {
				let store = this.getStore();
				let formsInStore = store.getState().forms;
				let finalAdds = [];
				let finalDels = [];

				for (let formName of formsNames) {
					let inputObjMap = extractField(formsInStore[formName]);
					let inputObjArr = Object.keys(inputObjMap).map(k => inputObjMap[k].$name);
					let { adds, dels } = this.distinctInput(this.extractInputsFromForm(this.refs[formName]), inputObjArr, i =>  i.attributes["ref"].value)
					finalAdds = finalAdds.concat({ formName, inputs: adds });
					finalDels = finalDels.concat({ formName, inputs: dels });
				}

				return { adds: finalAdds, dels: finalDels }
			}

			distinctForm(curr, allPrev, fn) {
				let prev  = Object.keys(allPrev).filter(p => allPrev[p].$meta._riot_id === this._riot_id).map(k => allPrev[k])
				let prevFormNames = prev.map(p => p.$name);
				let adds = [];
				let dels = [];

				for (let i=0, len=curr.length; i<len; i++) {
					let form = curr[i];
					let index = prevFormNames.indexOf(fn(form));
					if (index >= 0) {
						prevFormNames.splice(index, 1)
						continue;
					} else {
						adds.push(fn(form))
					}
				}
				prevFormNames.length && ( dels = prevFormNames )

				return { adds, dels }
			}

			distinctInput(curr, allPrev, fn) {
				let adds = [];
				let dels = [];
				let prevs = _.clone(allPrev);

				for (let i=0, len=curr.length; i<len; i++) {
					let inputName = curr[i];
					let inputEl = this.refs[inputName]
					let index = prevs.indexOf(fn(inputEl));
					if (index >= 0) {
						prevs.splice(index, 1)
						continue;
					} else {
						adds.push(fn(inputEl))
					}
				}
				prevs.length && ( dels = prevs )

				return { adds, dels }
			}

			addInput(store, input, formName) {
				let inputName = this.getInputName(input);
				let rulesMap = this.options[inputName];
				let rules = Object.keys(rulesMap).map(k => ({name: k, value: rulesMap[k]}));
				let inputInstance = this.getInputInstance(input, formName);
				rules.map(r => this.addInputRule(inputInstance, r))
				this.bindInputChange(input);
				return inputInstance
			}

			bindInputChange(input) {
				if (!this.$form) {
					this.$form = {handlers: []};
				}
				let handler = e => {
					let val = e.target.value;
					this.validate(input, val)
				}
				handler.input = input;
				this.$form.handlers.push(handler);
				input.addEventListener('change', handler.bind(this))
			}

			unbindInputChange(input) {
				let handlers = this.$form.handlers.filter(h => h.input === input);
				input.removeEventListeners(handlers);
			}

			validate(input, val) {
				let store = this.getStore()
				let formName = input.form.attributes['ref'].value;
				let form = store.getState().forms[formName];
				let inputJson = form[input.attributes['ref'].value];
				let rules = inputJson.$rule;
				let inputsToUpdate = [];

				Object.keys(rules).map(ruleName => {
					let validVal = rules[ruleName];
					let validator = validators[ruleName]
					let invalid = validator(val, rules[ruleName])
					let inputToUpdate = null;
					
					if (!invalid) {
						inputToUpdate = this.inputValid(input, inputJson, ruleName, val)
					} else {
						inputToUpdate = this.inputInvalid(input, inputJson, ruleName, val)
					}

					this.resolveClass(inputJson, input)
					
					inputsToUpdate.push(inputToUpdate);
				})
				
				store.dispatch({type: 'forms/inputs/update', payload: {form: formName, inputs: inputsToUpdate}})
			}

			inputValid(inputEl, inputJson, ruleName, val) {
				inputJson.$valid = true;
				inputJson.$invalid = false;
				if (inputJson.$error[ruleName]) {
					delete inputJson.$error[ruleName]
				}
				if (val != inputJson.$originVal) {
					inputJson.$dirty = true;
				}
				inputJson.$pristine = !inputJson.$dirty;
				return inputJson;
			}

			inputInvalid(inputEl, inputJson, ruleName, val) {
				inputJson.$valid = false;
				inputJson.$invalid = true;
				inputJson.$error[ruleName] = true

				if (val != inputJson.$originVal) {
					inputJson.$dirty = true;
				}
				inputJson.$pristine = !inputJson.$dirty;
				return inputJson;
			}

			resolveClass(field, input) {
				if(Object.keys(field.$error).length > 0){
					removeClass(input, 'f-valid');
					addClass(input, 'f-invalid');
				}else{
					removeClass(input, 'f-invalid');
					addClass(input, 'f-valid');
				}
				if(field.$dirty) {
					addClass(input, 'f-dirty');
					removeClass(input, 'f-pristine');
				}
				if(field.$pristine){
					addClass(input, 'f-pristine');
					removeClass(input, 'f-dirty');
				}
			}

			getInputInstance(input, formName) {
				let inputPersisted = null;
				let inputName = this.getInputName(input);
				let state = this.getStore().getState();
				let formInStore = state.forms[formName];
				inputPersisted = formInStore[inputName];
				if (!inputPersisted) {
					inputPersisted = {
						$name: inputName,
						$dirty: false,
						$pristine: true,
						$valid: true,
						$invalid: false,
						$error: {},
						$rule: {},
						$originVal: input.value
					};
				}
				return inputPersisted;
			}

			addInputRule(input, rule) {
				input.$rule[rule.name] = rule.value;
				return input;
			}

			getInputName(input) {
				return input.attributes['ref'].value;
			}

			delForm(formName) {
				this.extractInputsFromForm(this.refs[formName]).map(n => this.refs[n]).forEach(input => {
					this.unbindInputChange(input)
				})
			}

			delInput(inputName, formName) {
				this.unbindInputChange(this.refs[inputName])
			}

			addForm(store, formName) {
				let validated = false;
				let form = {
					$meta: {
						_riot_id: this._riot_id
					},
					$name: formName,
					$dirty: false,
					$pristine: true,
					$valid: false,
					$invalid: true,
					$submitted: false,
					$error: {},
					$ok: function(){
						let o = extractField(this);
						let errors = Object.keys(o).filter(field => o && o[field].$error && Object.keys(o[field].$error).length > 0);
						if(errors.length){
								return false;
						}
						return true;
					},
					$allPristine: function(){
						let o = extractField(this);
						return Object.keys(o).map(field => o && o[field].$pristine).reduce((acc, curr) => acc && curr, true);
					},
					$allDirty: function(){
						let o = extractField(this);
						return Object.keys(o).map(field => o[field].$dirty).reduce((acc, curr) => acc && curr, true);
					},
					$validate: function(){
						if(!validated){
							validated = !validated;
							let o = extractField(this);
							let allInputExist = !!Object.keys(o).map(fieldKey => {
								return tag[fieldKey];
							}).reduce((acc, curr) => {
								if(!curr){
									return undefined;
								}
								return acc;
							}, {});
							if(allInputExist){
								Object.keys(o).map((fieldKey) => {
									let field = o[fieldKey];
									if (field.$rule.required === "") {
										if(tag[fieldKey] && Array.isArray(tag[fieldKey])){
											tag[fieldKey] = document.getElementsByName(tag[fieldKey][0].getAttribute('name'))[0];
										}
										validateField(tag[fieldKey].value, tag[fieldKey], field, tag);
									}
								});
							}
						}
						return this.$ok();
					}
				};
				
				store.dispatch({type: 'form/add', payload: form});
			}

			trySubscribe() {
				super.trySubscribe()
				let store = this.getStore();
				this.subscribe = store.subscribe(() => {
					let state =  store.getState();
					let lastAction = state.lastAction
					
					if (
						(lastAction.type === 'forms/inputs/update' && 
						this.extractFormNamesFromRef().indexOf(lastAction.payload.form) >= 0) ||
						(lastAction.type === 'form/submit' && 
						this.extractFormNamesFromRef().indexOf(lastAction.payload) >= 0
						)
					) {
						this.opts.forms = state.forms
						this.update();
					}
				})
			}

			unSubscribe() {
				super.unSubscribe()
				if(this.subscribe) {
					this.subscribe()
					return true;
				}
				else {
					return false;
				}
			}

		} 
	}
}

function extractField(o){
    return exclude(o,
        "$name",
        "$dirty",
        "$pristine",
        "$valid",
        "$invalid",
        "$submitted",
        "$error",
        "$ok",
        "$allPristine",
        "$allDirty",
        "$validate",
		"$meta"
    );
}

function exclude(){
    var args = [].slice.apply(arguments);
    var o = args[0];
    var props = args.slice(1);
    var res = {};
    for(var p in o){
        if(props.indexOf(p) < 0){
            res[p] = o[p]
        }
    }
    return res;
}

function hasClass(el, className) {
	if (el.classList)
		return el.classList.contains(className);
	else
		return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
	if (el.classList)
		el.classList.add(className);
	else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
	if (el.classList)
		el.classList.remove(className);
	else if (hasClass(el, className)) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		el.className=el.className.replace(reg, ' ')
	}
}