<template>
	<view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 汇总卡片 -->
				<view class="summary-box mb30">
					<view class="summary-row">
						<view class="summary-card">
							<view class="fs24" style="color: rgba(255,255,255,0.8);">待结算</view>
							<view class="fs36 fwb colf mt8">¥{{ formatPrice(summary.pending) }}</view>
						</view>
						<view class="summary-card">
							<view class="fs24" style="color: rgba(255,255,255,0.8);">已到账</view>
							<view class="fs36 fwb colf mt8">¥{{ formatPrice(summary.settled) }}</view>
						</view>
						<view class="summary-card">
							<view class="fs24" style="color: rgba(255,255,255,0.8);">累计佣金</view>
							<view class="fs36 fwb colf mt8">¥{{ formatPrice(summary.total) }}</view>
						</view>
					</view>
				</view>

				<!-- 状态Tab -->
				<scroll-view scroll-x="true" class="tab-nav mb30">
					<view class="tab-item" :class="{ active: currentTab === item.value }" v-for="(item, index) in tabList"
						:key="index" @click="onTabChange(item.value)">{{ item.label }}</view>
				</scroll-view>

				<!-- 佣金列表 -->
				<view class="box mb30 commission-item" v-for="(item, index) in commissionList" :key="item.id">
					<view class="flex-box mb15">
						<view class="flex-grow-1 fs24 col9">订单 #{{ item.orderNo }}</view>
						<view class="status-label fs22" :class="item.status === 'settled' ? 'status-settled' : 'status-pending'">
							{{ item.status === 'settled' ? '已到账' : '待结算' }}
						</view>
					</view>
					<view class="flex-box">
						<view class="flex-grow-1">
							<view class="fs28 fwb col1">{{ item.productName }}</view>
							<view class="fs24 col9 mt8">{{ item.companyName }}</view>
						</view>
						<view class="tr">
							<view class="fs32 fwb col4">¥{{ formatPrice(item.amount) }}</view>
							<view class="fs22 col9 mt5">佣金比例 {{ item.rate }}%</view>
						</view>
					</view>

					<!-- 佣金构成明细 -->
					<view class="detail-section mt15" v-if="item.showDetail">
						<view class="detail-line flex-box">
							<view class="fs24 col5">基础佣金</view>
							<view class="flex-grow-1 tr fs24 col1">¥{{ formatPrice(item.baseCommission) }}</view>
						</view>
						<view class="detail-line flex-box" v-if="item.factoryBonus > 0">
							<view class="fs24 col5">厂家奖金</view>
							<view class="flex-grow-1 tr fs24 col1">¥{{ formatPrice(item.factoryBonus) }}</view>
						</view>
						<view class="detail-line flex-box" v-if="item.logisticsRebate > 0">
							<view class="fs24 col5">物流返佣</view>
							<view class="flex-grow-1 tr fs24 col1">¥{{ formatPrice(item.logisticsRebate) }}</view>
						</view>
						<view class="detail-line flex-box" v-if="item.pkBonus > 0">
							<view class="fs24 col5">PK奖池</view>
							<view class="flex-grow-1 tr fs24 col1">¥{{ formatPrice(item.pkBonus) }}</view>
						</view>
						<view class="detail-line flex-box" v-if="item.redPacket > 0">
							<view class="fs24 col5">平台红包</view>
							<view class="flex-grow-1 tr fs24 col1">¥{{ formatPrice(item.redPacket) }}</view>
						</view>
						<view class="detail-line flex-box bb-none" v-if="item.status === 'settled'">
							<view class="fs24 col5">到账时间</view>
							<view class="flex-grow-1 tr fs24 col1">{{ item.settledTime }}</view>
						</view>
						<view class="detail-line flex-box bb-none" v-else>
							<view class="fs24 col5">预计到账</view>
							<view class="flex-grow-1 tr fs24 col4">72h 履约结束后自动打款</view>
						</view>
					</view>
					<view class="toggle-detail mt15 tc" @click="item.showDetail = !item.showDetail">
						<text class="fs24 col4">{{ item.showDetail ? '收起明细' : '查看明细' }}</text>
					</view>
				</view>

				<!-- 空状态 / 加载更多 -->
				<view class="nothing" v-if="moreButton.nothing">
					<view class="tc ptb40">
						<view class="fs28 col9">暂无佣金记录</view>
					</view>
				</view>
				<view class="g-btn3-wrap" v-else>
					<view class="g-btn3 fs26 col9 tc ptb20" @click="loadList">{{ moreButton.text }}</view>
				</view>

				<!-- 说明 -->
				<view class="tip-box mb30">
					<view class="fs24 col9 lh40">
						<text class="fwb">结算说明：</text>
						基础佣金 = 合同价 x 佣金比例。履约完成后系统自动扣除个税后打款至您的银行卡，到账时间约72小时。
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// Mock 佣金数据
	const MOCK_COMMISSIONS = [
		{
			id: 1, orderNo: 'JJ202602080001', productName: '高强度螺纹钢 HRB400', companyName: '鑫达建设有限公司',
			amount: 15808.60, rate: 3.5, baseCommission: 14980.00, factoryBonus: 500.00, logisticsRebate: 299.60, pkBonus: 29.00, redPacket: 0,
			status: 'pending', settledTime: '', createTime: '2026-02-08 10:30', showDetail: false
		},
		{
			id: 2, orderNo: 'JJ202602070002', productName: '聚氯乙烯树脂 SG-5', companyName: '华源化工采购部',
			amount: 30208.50, rate: 4.2, baseCommission: 28770.00, factoryBonus: 800.00, logisticsRebate: 575.40, pkBonus: 63.10, redPacket: 0,
			status: 'pending', settledTime: '', createTime: '2026-02-07 14:20', showDetail: false
		},
		{
			id: 3, orderNo: 'JJ202602030003', productName: 'CNC精密加工中心 VMC850', companyName: '精锐机械制造厂',
			amount: 3959.00, rate: 2.0, baseCommission: 3700.00, factoryBonus: 200.00, logisticsRebate: 59.00, pkBonus: 0, redPacket: 0,
			status: 'settled', settledTime: '2026-02-06 08:00', createTime: '2026-02-03 09:15', showDetail: false
		},
		{
			id: 4, orderNo: 'JJ202601280004', productName: '工业级连接器 DB25', companyName: '联创电子科技',
			amount: 5280.00, rate: 8.0, baseCommission: 5000.00, factoryBonus: 200.00, logisticsRebate: 80.00, pkBonus: 0, redPacket: 0,
			status: 'settled', settledTime: '2026-02-01 08:00', createTime: '2026-01-28 16:40', showDetail: false
		},
		{
			id: 5, orderNo: 'JJ202601200005', productName: '涤纶长丝 DTY 150D/48F', companyName: '恒通纺织集团',
			amount: 27906.00, rate: 3.0, baseCommission: 26700.00, factoryBonus: 600.00, logisticsRebate: 534.00, pkBonus: 72.00, redPacket: 0,
			status: 'settled', settledTime: '2026-01-25 08:00', createTime: '2026-01-20 11:00', showDetail: false
		},
		{
			id: 6, orderNo: 'JJ202601150006', productName: '普通硅酸盐水泥 P.O 42.5', companyName: '华润建材采购',
			amount: 12540.00, rate: 2.5, baseCommission: 12000.00, factoryBonus: 300.00, logisticsRebate: 240.00, pkBonus: 0, redPacket: 0,
			status: 'settled', settledTime: '2026-01-20 08:00', createTime: '2026-01-15 08:50', showDetail: false
		}
	];

	export default {
		data() {
			return {
				tabList: [
					{ label: '全部', value: 'all' },
					{ label: '待结算', value: 'pending' },
					{ label: '已到账', value: 'settled' }
				],
				currentTab: 'all',
				summary: {
					pending: 46017.10,
					settled: 49685.00,
					total: 95702.10
				},
				commissionList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		onLoad() {
			this.loadSummary();
			this.loadList();
		},
		methods: {
			loadSummary() {
				this.$core.get({
					url: 'xiluxc.jj_commission/summary',
					loading: false,
					success: ret => {
						this.summary = Object.assign(this.summary, ret.data);
					},
					fail: () => { return false; }
				});
			},

			loadList() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				this.$core.get({
					url: 'xiluxc.jj_commission/list',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						status: this.currentTab === 'all' ? '' : this.currentTab
					},
					loading: false,
					success: ret => {
						let list = ret.data.list || ret.data || [];
						list.forEach(item => { item.showDetail = false; });
						this.handleListData(list);
					},
					fail: () => {
						this.loadMockData();
						return false;
					}
				});
			},

			loadMockData() {
				setTimeout(() => {
					let filtered = [...MOCK_COMMISSIONS];
					if (this.currentTab !== 'all') {
						filtered = filtered.filter(item => item.status === this.currentTab);
					}
					const pageSize = 10;
					const start = (this.moreButton.page - 1) * pageSize;
					const pageData = filtered.slice(start, start + pageSize);
					this.handleListData(pageData);
				}, 300);
			},

			handleListData(list) {
				if (list.length === 0 && this.moreButton.page === 1) {
					this.moreButton.nothing = true;
					this.moreButton.text = '暂无佣金记录';
				} else if (list.length < 10) {
					this.commissionList = this.commissionList.concat(list);
					this.moreButton.nomore = true;
					this.moreButton.text = '—— 我是有底线的 ——';
				} else {
					this.commissionList = this.commissionList.concat(list);
					this.moreButton.page += 1;
					this.moreButton.text = '加载更多';
				}
				this.moreButton.loading = false;
			},

			onTabChange(value) {
				if (this.currentTab === value) return;
				this.currentTab = value;
				this.commissionList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadList();
			},

			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-wrap {
		max-width: 750rpx;
		margin-left: auto;
		margin-right: auto;
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.colf { color: #FFFFFF; }

	/* 汇总卡片 */
	.summary-box {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.summary-row {
		display: flex;
		gap: 20rpx;
	}

	.summary-card {
		flex: 1;
		text-align: center;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12rpx;
		padding: 24rpx 10rpx;
	}

	/* Tab */
	.tab-nav {
		white-space: nowrap;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 0 10rpx;

		.tab-item {
			display: inline-block;
			vertical-align: top;
			line-height: 80rpx;
			height: 80rpx;
			padding: 0 30rpx;
			font-size: 28rpx;
			color: #666666;
			position: relative;

			&.active {
				font-weight: bold;
				color: #FE4B01;
			}

			&.active::after {
				content: '';
				width: 30rpx;
				height: 6rpx;
				background: #FE4B01;
				border-radius: 3rpx;
				position: absolute;
				bottom: 6rpx;
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}

	/* 佣金项 */
	.commission-item {
		cursor: pointer;
	}

	.status-label {
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
	}

	.status-pending {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.status-settled {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	/* 明细展开 */
	.detail-section {
		background: #F9FAFB;
		border-radius: 12rpx;
		padding: 20rpx;
	}

	.detail-line {
		padding: 12rpx 0;
		border-bottom: 1rpx solid #F0F0F0;
	}

	.bb-none {
		border-bottom: none;
	}

	.toggle-detail {
		padding: 8rpx 0;
	}

	.tip-box {
		background: #FFFBE6;
		border-radius: 12rpx;
		padding: 24rpx;
		border-left: 6rpx solid #FAAD14;
	}

	.nothing {
		padding: 60rpx 0;
	}

	@media screen and (min-width: 768px) {
		.page-wrap {
			max-width: 1200px;
			padding: 30px;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.summary-box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.summary-row {
			gap: 16px;
		}

		.summary-card {
			padding: 20px 10px;
			border-radius: 8px;
		}

		.tab-nav {
			border-radius: 12px;
			margin-bottom: 20px;

			.tab-item {
				height: 48px;
				line-height: 48px;
				padding: 0 24px;
				font-size: 15px;
				cursor: pointer;

				&:hover { color: #FE4B01; }
			}
		}

		.commission-item {
			margin-bottom: 20px;
			transition: box-shadow 0.2s;

			&:hover {
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
			}
		}

		.toggle-detail {
			cursor: pointer;

			&:hover { opacity: 0.85; }
		}

		.tip-box {
			border-radius: 8px;
			padding: 16px;
		}
	}
</style>
