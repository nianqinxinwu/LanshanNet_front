/**
 * 居间人端 Mock 数据集中管理
 * 后端 API 未就绪时的前端兜底数据
 */

// ============ 商品数据（jj_product_detail / jj_buyer_form 共享） ============

const MOCK_PRODUCT_DETAIL_MAP = {
	1: { id: 1, name: '高强度螺纹钢 HRB400', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 4280.00, unit: '吨', commission: 3.5, stock: 500, factoryName: '鑫达钢铁有限公司', factoryRate: 96, craftStandard: 'GB/T 1499.2-2018', status: 1 },
	2: { id: 2, name: '聚氯乙烯树脂 SG-5', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 6850.00, unit: '吨', commission: 4.2, stock: 200, factoryName: '华源化工集团', factoryRate: 92, craftStandard: 'GB/T 5761-2006', status: 1 },
	3: { id: 3, name: 'CNC精密加工中心 VMC850', categoryId: 3, categoryName: '机械', coverImage: '/static/images/icon_upload_logo.png', price: 185000.00, unit: '台', commission: 2.0, stock: 15, factoryName: '精锐数控设备厂', factoryRate: 98, craftStandard: 'JB/T 8801.4', status: 1 },
	4: { id: 4, name: '工业级连接器 DB25', categoryId: 4, categoryName: '电子', coverImage: '/static/images/icon_upload_logo.png', price: 12.50, unit: '个', commission: 8.0, stock: 50000, factoryName: '联创电子科技', factoryRate: 94, craftStandard: 'GB/T 11918', status: 1 },
	5: { id: 5, name: '涤纶长丝 DTY 150D/48F', categoryId: 5, categoryName: '纺织', coverImage: '/static/images/icon_upload_logo.png', price: 8900.00, unit: '吨', commission: 3.0, stock: 300, factoryName: '恒通纺织集团', factoryRate: 90, craftStandard: 'FZ/T 54007', status: 1 },
	6: { id: 6, name: '普通硅酸盐水泥 P.O 42.5', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 480.00, unit: '吨', commission: 2.5, stock: 2000, factoryName: '华润水泥有限公司', factoryRate: 97, craftStandard: 'GB 175-2007', status: 1 },
	7: { id: 7, name: '环氧树脂 E-51', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 22000.00, unit: '吨', commission: 5.0, stock: 80, factoryName: '巴陵石化', factoryRate: 95, craftStandard: 'GB/T 13657', status: 1 },
	8: { id: 8, name: '液压油缸 HOB-63/35', categoryId: 3, categoryName: '机械', coverImage: '/static/images/icon_upload_logo.png', price: 1280.00, unit: '台', commission: 6.5, stock: 120, factoryName: '力源液压设备厂', factoryRate: 91, craftStandard: 'GB/T 15622', status: 1 },
	9: { id: 9, name: 'LED工业照明灯 200W', categoryId: 4, categoryName: '电子', coverImage: '/static/images/icon_upload_logo.png', price: 320.00, unit: '套', commission: 7.0, stock: 3000, factoryName: '光盛照明科技', factoryRate: 93, craftStandard: 'GB/T 24908', status: 1 },
	10: { id: 10, name: '全棉坯布 40s×40s', categoryId: 5, categoryName: '纺织', coverImage: '/static/images/icon_upload_logo.png', price: 15.80, unit: '米', commission: 4.0, stock: 100000, factoryName: '鲁泰纺织', factoryRate: 96, craftStandard: 'FZ/T 13001', status: 1 },
	11: { id: 11, name: '镀锌方管 40×40×2.0', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 5200.00, unit: '吨', commission: 3.2, stock: 350, factoryName: '天津钢管集团', factoryRate: 94, craftStandard: 'GB/T 3094', status: 1 },
	12: { id: 12, name: '丙烯酸乳液 BA-35', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 9800.00, unit: '吨', commission: 4.5, stock: 150, factoryName: '万华化学', factoryRate: 97, craftStandard: 'HG/T 4567', status: 1 }
};

/**
 * 获取商品简要信息（用于 buyer_form）
 */
function getProductSummary(id) {
	let d = MOCK_PRODUCT_DETAIL_MAP[id];
	if (!d) return null;
	return { id: d.id, name: d.name, coverImage: d.coverImage, price: d.price, unit: d.unit, commission: d.commission };
}

// ============ 竞标数据（jj_bid_board / jj_bid_detail 共享） ============

const MOCK_BID_LIST = [
	{
		id: 1, bidSn: 'BID20260208001', categoryName: '高强度螺纹钢 HRB400',
		quantity: 500, unit: '吨', expectDelivery: '2026-03-01', targetCommission: 15000,
		factoryCount: 3, quotedCount: 2, status: 1, remainTime: 36 * 3600,
		createTime: '2026-02-08 10:00',
		buyerInfo: { companyName: '鑫盛建设集团', address: '上海市浦东新区张江高科技园区', contactName: '张经理', contactPhone: '13800001111' },
		quotes: [
			{ factoryId: 101, factoryName: '鑫达钢铁有限公司', status: 1, contractPrice: 4280, deliveryDate: '2026-02-28', commissionAmount: 14980, fulfillRate: 96, selected: false },
			{ factoryId: 102, factoryName: '华北钢铁集团', status: 1, contractPrice: 4150, deliveryDate: '2026-03-05', commissionAmount: 14525, fulfillRate: 92, selected: false },
			{ factoryId: 103, factoryName: '中原特钢有限公司', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 88, selected: false }
		]
	},
	{
		id: 2, bidSn: 'BID20260207002', categoryName: '聚氯乙烯树脂 SG-5',
		quantity: 200, unit: '吨', expectDelivery: '2026-02-25', targetCommission: 8000,
		factoryCount: 2, quotedCount: 2, status: 2, remainTime: 0,
		createTime: '2026-02-07 14:30',
		buyerInfo: { companyName: '恒通化工科技', address: '江苏省南京市江宁区科创路88号', contactName: '李总', contactPhone: '13900002222' },
		quotes: [
			{ factoryId: 201, factoryName: '齐鲁石化工业', status: 1, contractPrice: 6850, deliveryDate: '2026-02-22', commissionAmount: 8220, fulfillRate: 95, selected: true },
			{ factoryId: 202, factoryName: '长江化工集团', status: 1, contractPrice: 7100, deliveryDate: '2026-02-24', commissionAmount: 7810, fulfillRate: 90, selected: false }
		]
	},
	{
		id: 3, bidSn: 'BID20260205003', categoryName: 'CNC精密加工中心 VMC850',
		quantity: 5, unit: '台', expectDelivery: '2026-03-15', targetCommission: 0,
		factoryCount: 4, quotedCount: 1, status: 3, remainTime: 0,
		createTime: '2026-02-05 09:00',
		buyerInfo: { companyName: '精工机械制造', address: '广东省深圳市宝安区工业园', contactName: '王工', contactPhone: '13700003333' },
		quotes: [
			{ factoryId: 301, factoryName: '沈阳机床集团', status: 1, contractPrice: 185000, deliveryDate: '2026-03-10', commissionAmount: 18500, fulfillRate: 94, selected: false },
			{ factoryId: 302, factoryName: '大连数控设备', status: 2, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 91, selected: false },
			{ factoryId: 303, factoryName: '济南重工机械', status: 2, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 87, selected: false },
			{ factoryId: 304, factoryName: '武汉精密制造', status: 2, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 93, selected: false }
		]
	},
	{
		id: 4, bidSn: 'BID20260208004', categoryName: '环氧树脂 E-51',
		quantity: 100, unit: '吨', expectDelivery: '2026-03-10', targetCommission: 12000,
		factoryCount: 5, quotedCount: 0, status: 1, remainTime: 68 * 3600,
		createTime: '2026-02-08 08:00',
		buyerInfo: { companyName: '新材料科技有限公司', address: '浙江省杭州市滨江区科技园', contactName: '陈经理', contactPhone: '13600004444' },
		quotes: [
			{ factoryId: 401, factoryName: '蓝星化工研究院', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 97, selected: false },
			{ factoryId: 402, factoryName: '巴陵石化树脂', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 93, selected: false },
			{ factoryId: 403, factoryName: '南亚环氧科技', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 89, selected: false },
			{ factoryId: 404, factoryName: '黄山化工集团', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 91, selected: false },
			{ factoryId: 405, factoryName: '岳阳兴长石化', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 86, selected: false }
		]
	}
];

/**
 * 获取竞标详情 Map（用于 bid_detail 按 ID 查找）
 */
function getBidMap() {
	let map = {};
	MOCK_BID_LIST.forEach(function(item) {
		map[item.id] = item;
	});
	return map;
}

// ============ 佣金数据 ============

const MOCK_COMMISSIONS = [
	{ id: 1, orderNo: 'JJ202602080001', productName: '高强度螺纹钢 HRB400', companyName: '鑫达建设有限公司', amount: 15808.60, rate: 3.5, baseCommission: 14980.00, factoryBonus: 500.00, logisticsRebate: 299.60, pkBonus: 29.00, redPacket: 0, status: 'pending', settledTime: '', createTime: '2026-02-08 10:30', showDetail: false },
	{ id: 2, orderNo: 'JJ202602070002', productName: '聚氯乙烯树脂 SG-5', companyName: '华源化工采购部', amount: 30208.50, rate: 4.2, baseCommission: 28770.00, factoryBonus: 800.00, logisticsRebate: 575.40, pkBonus: 63.10, redPacket: 0, status: 'pending', settledTime: '', createTime: '2026-02-07 14:20', showDetail: false },
	{ id: 3, orderNo: 'JJ202602030003', productName: 'CNC精密加工中心 VMC850', companyName: '精锐机械制造厂', amount: 3959.00, rate: 2.0, baseCommission: 3700.00, factoryBonus: 200.00, logisticsRebate: 59.00, pkBonus: 0, redPacket: 0, status: 'settled', settledTime: '2026-02-06 08:00', createTime: '2026-02-03 09:15', showDetail: false },
	{ id: 4, orderNo: 'JJ202601280004', productName: '工业级连接器 DB25', companyName: '联创电子科技', amount: 5280.00, rate: 8.0, baseCommission: 5000.00, factoryBonus: 200.00, logisticsRebate: 80.00, pkBonus: 0, redPacket: 0, status: 'settled', settledTime: '2026-02-01 08:00', createTime: '2026-01-28 16:40', showDetail: false },
	{ id: 5, orderNo: 'JJ202601200005', productName: '涤纶长丝 DTY 150D/48F', companyName: '恒通纺织集团', amount: 27906.00, rate: 3.0, baseCommission: 26700.00, factoryBonus: 600.00, logisticsRebate: 534.00, pkBonus: 72.00, redPacket: 0, status: 'settled', settledTime: '2026-01-25 08:00', createTime: '2026-01-20 11:00', showDetail: false },
	{ id: 6, orderNo: 'JJ202601150006', productName: '普通硅酸盐水泥 P.O 42.5', companyName: '华润建材采购', amount: 12540.00, rate: 2.5, baseCommission: 12000.00, factoryBonus: 300.00, logisticsRebate: 240.00, pkBonus: 0, redPacket: 0, status: 'settled', settledTime: '2026-01-20 08:00', createTime: '2026-01-15 08:50', showDetail: false }
];

// ============ 红包数据 ============

const MOCK_PACKETS = [
	{ id: 1, orderNo: 'JJ202602080001', amount: 50.00, status: 'pending', time: '2026-02-08 10:30' },
	{ id: 2, orderNo: 'JJ202602070002', amount: 50.00, status: 'pending', time: '2026-02-07 14:20' },
	{ id: 3, orderNo: 'JJ202602030003', amount: 50.00, status: 'received', time: '2026-02-03 09:15' },
	{ id: 4, orderNo: 'JJ202601280004', amount: 50.00, status: 'received', time: '2026-01-28 16:40' },
	{ id: 5, orderNo: 'JJ202601200005', amount: 50.00, status: 'received', time: '2026-01-20 11:00' },
	{ id: 6, orderNo: 'JJ202601150006', amount: 50.00, status: 'received', time: '2026-01-15 08:50' },
	{ id: 7, orderNo: 'JJ202601100007', amount: 50.00, status: 'received', time: '2026-01-10 13:30' },
	{ id: 8, orderNo: 'JJ202601050008', amount: 50.00, status: 'received', time: '2026-01-05 15:10' }
];

// ============ 物流时间线 ============

const MOCK_TIMELINE = [
	{ desc: '已签收 - 买方已确认收货', time: '2026-02-08 14:30:00' },
	{ desc: '运输中 - 货物已到达目的地中转站', time: '2026-02-07 18:20:00' },
	{ desc: '运输中 - 货物已从发货地出发', time: '2026-02-06 09:15:00' },
	{ desc: '已发货 - 工厂已将货物交付物流公司', time: '2026-02-05 16:40:00' },
	{ desc: '已下单 - 物流订单已创建', time: '2026-02-05 10:00:00' }
];

// ============ 竞标发布 - 工厂列表 ============

const MOCK_FACTORIES = [
	{ id: 101, name: '鑫达钢铁有限公司', province: '河北', city: '唐山', industry: '建材', fulfillRate: 96, productCount: 12 },
	{ id: 102, name: '华北钢铁集团', province: '河北', city: '邯郸', industry: '建材', fulfillRate: 92, productCount: 8 },
	{ id: 103, name: '中原特钢有限公司', province: '河南', city: '郑州', industry: '建材', fulfillRate: 88, productCount: 6 },
	{ id: 201, name: '齐鲁石化工业', province: '山东', city: '淄博', industry: '化工', fulfillRate: 95, productCount: 15 },
	{ id: 202, name: '长江化工集团', province: '江苏', city: '南京', industry: '化工', fulfillRate: 90, productCount: 20 },
	{ id: 203, name: '蓝星化工研究院', province: '北京', city: '北京', industry: '化工', fulfillRate: 97, productCount: 10 },
	{ id: 301, name: '沈阳机床集团', province: '辽宁', city: '沈阳', industry: '机械', fulfillRate: 94, productCount: 18 },
	{ id: 302, name: '大连数控设备', province: '辽宁', city: '大连', industry: '机械', fulfillRate: 91, productCount: 9 },
	{ id: 303, name: '济南重工机械', province: '山东', city: '济南', industry: '机械', fulfillRate: 87, productCount: 14 },
	{ id: 401, name: '富士康精密电子', province: '广东', city: '深圳', industry: '电子', fulfillRate: 98, productCount: 25 },
	{ id: 402, name: '华星光电科技', province: '广东', city: '深圳', industry: '电子', fulfillRate: 93, productCount: 11 },
	{ id: 501, name: '鲁泰纺织集团', province: '山东', city: '淄博', industry: '纺织', fulfillRate: 89, productCount: 16 },
	{ id: 502, name: '魏桥纺织股份', province: '山东', city: '滨州', industry: '纺织', fulfillRate: 92, productCount: 22 },
	{ id: 601, name: '海螺水泥集团', province: '安徽', city: '芜湖', industry: '建材', fulfillRate: 96, productCount: 7 },
	{ id: 602, name: '华润水泥控股', province: '广东', city: '广州', industry: '建材', fulfillRate: 94, productCount: 5 }
];

const MOCK_PROVINCES = ['全部', '河北', '河南', '山东', '江苏', '北京', '辽宁', '广东', '安徽'];
const MOCK_INDUSTRIES = ['全部', '建材', '化工', '机械', '电子', '纺织'];

module.exports = {
	MOCK_PRODUCT_DETAIL_MAP: MOCK_PRODUCT_DETAIL_MAP,
	getProductSummary: getProductSummary,
	MOCK_BID_LIST: MOCK_BID_LIST,
	getBidMap: getBidMap,
	MOCK_COMMISSIONS: MOCK_COMMISSIONS,
	MOCK_PACKETS: MOCK_PACKETS,
	MOCK_TIMELINE: MOCK_TIMELINE,
	MOCK_FACTORIES: MOCK_FACTORIES,
	MOCK_PROVINCES: MOCK_PROVINCES,
	MOCK_INDUSTRIES: MOCK_INDUSTRIES
};
