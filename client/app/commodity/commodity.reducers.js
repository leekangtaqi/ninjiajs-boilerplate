import { handleAction } from 'redux-actions'
import { add, update } from './commodity.actions';
import { expect } from 'chai';

const initCommodity = [];

// let commodity = handleAction(update, (state, action) => {
// 	console.warn(action.payload);
// 	return {...state,
// 	commodity: [...state.commodity.commodity, action.payload]}
// }, {commodity: initCommodity})

const commodity = (commodity=initCommodity, action) => {
	switch (action.type) {
		case 'commodity/update':
			return commodity.map(c => {
				if (c.id === action.payload.id) {
					return action.payload
				}
				return c
			})
		case 'commodity/add':
			return [...commodity, action.payload]
		default:
			return commodity;
	}
}

export default { commodity };