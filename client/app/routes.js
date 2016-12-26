/**
 * palce children to router-outlet
 */
import CommodityList from './commodity/CommodityList';
import About from './about/About';
import Nest from './about/Nest';
import App from './App';

export default {
	component: App,
	path: '',
	children: [
		{
			path: '/',
			defaultRoute: true,
			component: CommodityList,
		},
		{
			path: '/about',
			defaultRoute: true,
			component: About,
			authenticate: true,
			children: [
				{
					path: '/nest',
					component: Nest
				}
			]
		}
	]
}