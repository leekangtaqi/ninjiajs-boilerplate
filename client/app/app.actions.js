const maskShow = id => ({type: 'maskShow', payload: true});
const maskHidden = id => ({type: 'maskHidden', payload: true});

export default {
	maskShow,
	maskHidden
}