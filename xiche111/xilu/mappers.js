/**
 * API 数据映射工具
 * 将后端 snake_case 字段映射为前端 camelCase
 */

/**
 * 映射报价数据（后端 → 前端）
 * @param {Object} q 后端返回的报价对象
 * @returns {Object} 前端使用的报价对象
 */
const mapQuote = function(q) {
	return {
		factoryId: q.factory_id || q.factoryId,
		factoryName: q.factory_name || q.factoryName,
		contractPrice: q.contract_price !== undefined ? Number(q.contract_price) : q.contractPrice,
		deliveryDate: q.delivery_date || q.deliveryDate,
		commissionAmount: q.commission_amount !== undefined ? Number(q.commission_amount) : q.commissionAmount,
		fulfillRate: q.fulfill_rate !== undefined ? Number(q.fulfill_rate) : q.fulfillRate,
		status: q.status,
		selected: q.selected ? true : false
	};
};

module.exports = {
	mapQuote: mapQuote
};
