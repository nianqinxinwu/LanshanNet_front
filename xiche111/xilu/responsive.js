/**
 * 响应式适配 Mixin
 * 提供 isPC 计算属性 + 窗口尺寸监听
 *
 * 使用方式一（全局注册）：
 *   import responsive from '@/xilu/responsive.js'
 *   Vue.mixin(responsive)
 *
 * 使用方式二（页面单独引入）：
 *   import responsive from '@/xilu/responsive.js'
 *   export default { mixins: [responsive] }
 */

const PC_BREAKPOINT = 768;

module.exports = {
	data() {
		return {
			_windowWidth: 0
		}
	},
	computed: {
		/**
		 * 是否为 PC 端（窗口宽度 >= 768px）
		 */
		isPC() {
			return this._windowWidth >= PC_BREAKPOINT;
		},
		/**
		 * 是否为移动端
		 */
		isMobile() {
			return this._windowWidth < PC_BREAKPOINT;
		}
	},
	created() {
		try {
			var info = uni.getSystemInfoSync();
			this._windowWidth = info.windowWidth || 375;
		} catch (e) {
			this._windowWidth = 375;
		}
		// #ifdef H5
		this._onResizeHandler = () => {
			this._windowWidth = window.innerWidth;
		};
		window.addEventListener('resize', this._onResizeHandler);
		// #endif
	},
	destroyed() {
		// #ifdef H5
		if (this._onResizeHandler) {
			window.removeEventListener('resize', this._onResizeHandler);
		}
		// #endif
	},
	methods: {
		/**
		 * PC 端隐藏 tabBar
		 * 在需要的页面 onShow 中调用
		 */
		handleTabBar() {
			// #ifdef H5
			if (this.isPC) {
				uni.hideTabBar({ animation: false });
			} else {
				uni.showTabBar({ animation: false });
			}
			// #endif
		}
	}
};
