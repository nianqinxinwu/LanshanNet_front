/**
 * 倒计时 Mixin
 * 提供通用的 setInterval/clearInterval 倒计时管理，自动在 onHide/onUnload 时清理。
 *
 * 使用方式：
 *   import countdownMixin from '@/xilu/countdown-mixin.js';
 *   export default {
 *     mixins: [countdownMixin],
 *     methods: {
 *       startMyCountdown() {
 *         this.countdownStart(() => {
 *           this.remainTime--;
 *           if (this.remainTime <= 0) return true; // 返回 true 停止
 *           return false;
 *         });
 *       }
 *     }
 *   }
 */
module.exports = {
	data() {
		return {
			_cdTimer: null
		};
	},
	methods: {
		/**
		 * 启动倒计时
		 * @param {Function} tickFn 每秒执行的函数，返回 true 时停止倒计时
		 * @param {Number} interval 间隔毫秒数，默认 1000
		 */
		countdownStart(tickFn, interval) {
			this.countdownStop();
			this._cdTimer = setInterval(() => {
				let shouldStop = tickFn.call(this);
				if (shouldStop) this.countdownStop();
			}, interval || 1000);
		},
		/**
		 * 停止倒计时
		 */
		countdownStop() {
			if (this._cdTimer) {
				clearInterval(this._cdTimer);
				this._cdTimer = null;
			}
		}
	},
	onHide() {
		this.countdownStop();
	},
	onUnload() {
		this.countdownStop();
	}
};
