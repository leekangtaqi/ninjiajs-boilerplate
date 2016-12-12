const widget = {
	Alert: {
		add: (...args) => {
			let alertWidget = context.tags['alert'];
			alertWidget.add.apply(alertWidget, args);
		}
	},
	Modal: {
		open: (...args) => {
			let modalWidget = context.tags['modal'];
			console.warn(context);
			console.warn(context.tags);
			return modalWidget.open.apply(modalWidget, args)
		}
	}
}

export default widget;