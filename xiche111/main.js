import App from './App'


import core from './xilu/core.js';
import util from './xilu/util.js';
import responsive from './xilu/responsive.js';
import formatters from './xilu/formatters.js';

// 挂载
Vue.prototype.$core = core; //core
Vue.prototype.$util = util; //util
Vue.mixin(responsive); // 响应式适配（全局注入 isPC/isMobile）
// 全局注入公共格式化方法（formatPrice / formatCountdown / formatShortPrice / openAgreement）
Vue.mixin({
	methods: {
		formatPrice: formatters.formatPrice,
		formatCountdown: formatters.formatCountdown,
		formatShortPrice: formatters.formatShortPrice,
		openAgreement: formatters.openAgreement
	}
});

import uView from '@/uni_modules/uview-ui'
Vue.use(uView)
// #ifndef VUE3
import Vue from 'vue'

import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif