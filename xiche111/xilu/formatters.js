/**
 * 公共格式化工具函数
 * 通过 Vue.mixin 全局注入，所有页面/组件可直接使用 this.formatPrice() / this.formatCountdown()
 */

/**
 * 格式化金额（千分位 + 两位小数）
 * @param {Number} price 金额
 * @returns {String} 如 "1,234.56"
 */
const formatPrice = function(price) {
	if (!price && price !== 0) return '0.00';
	return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 格式化倒计时秒数为 HH:MM:SS
 * @param {Number} seconds 剩余秒数
 * @returns {String} 如 "72:00:00"
 */
const formatCountdown = function(seconds) {
	if (!seconds || seconds <= 0) return '00:00:00';
	let h = Math.floor(seconds / 3600);
	let m = Math.floor((seconds % 3600) / 60);
	let s = seconds % 60;
	return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
};

/**
 * 格式化金额为简写（万）
 * @param {Number} price 金额
 * @returns {String} 如 "3.2万" 或 "1,234.56"
 */
const formatShortPrice = function(price) {
	if (price >= 10000) {
		return (price / 10000).toFixed(1) + '万';
	}
	return formatPrice(price);
};

/**
 * 打开协议/规则页面
 * @param {String} configKey 全局配置 key，如 'platform_agreement'、'deposit_rule'
 */
const openAgreement = function(configKey) {
	let id = getApp().globalData.config[configKey] || 0;
	uni.navigateTo({ url: '/pages/rich_mp/rich_mp?id=' + id });
};

module.exports = {
	formatPrice: formatPrice,
	formatCountdown: formatCountdown,
	formatShortPrice: formatShortPrice,
	openAgreement: openAgreement
};
