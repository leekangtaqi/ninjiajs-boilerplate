import { createAction } from 'redux-actions';

const update = json => ({type: 'commodity/update', payload: json});

const delay = () => new Promise((resolve, reject) => {
	setTimeout(() => {
		resolve({type: 'xxx', payload: '222'})
	}, 100)
})

const test = json => async (dispatch, getState) => {
	await dispatch(delay());
	// ....
	await dispatch
}

const add = async json => async (dispatch, getState) => {
	await dispatch(test())
	dispatch(update({name: '222'}));
	dispatch({type: 'commodity/add', payload: json})
}

export default { update, add };
export { update, add }