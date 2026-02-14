<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- KPI卡片区 -->
			<view class="kpi-row mb30">
				<view class="kpi-card jj-box">
					<view class="fs24 col9">月交易量</view>
					<view class="kpi-value col1">{{ dashboard.monthOrders }}</view>
				</view>
				<view class="kpi-card jj-box">
					<view class="fs24 col9">居间人转化率</view>
					<view class="kpi-value col4">{{ dashboard.conversionRate }}%</view>
				</view>
				<view class="kpi-card jj-box">
					<view class="fs24 col9">平均响应时间</view>
					<view class="kpi-value col2">{{ dashboard.avgResponseHours }}</view>
				</view>
			</view>

			<!-- 畅销产品TOP10 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">畅销产品 TOP10</view>
				<view v-if="topProducts.length === 0" class="fs28 col9 tc ptb30">暂无数据</view>
				<view v-for="(item, idx) in topProducts" :key="idx" class="top-item flex-box" :class="{ 'bb': idx < topProducts.length - 1 }">
					<view class="rank-badge fs24" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</view>
					<view class="flex-grow-1 ml15">
						<view class="fs28 col1">{{ item.name }}</view>
					</view>
					<view class="tr">
						<view class="fs24 col5">订单数: {{ item.sales }}</view>
						<view class="fs24 col4 mt5">¥{{ item.amount }}</view>
					</view>
				</view>
			</view>

			<!-- 财务统计 -->
			<view class="finance-row mb30">
				<view class="jj-box flex-grow-1">
					<view class="fs24 col9">已锁定佣金总额</view>
					<view class="finance-value col4">¥{{ finance.lockedCommission }}</view>
				</view>
				<view class="jj-box flex-grow-1">
					<view class="fs24 col9">已结算佣金总额</view>
					<view class="finance-value col2">¥{{ finance.settledCommission }}</view>
				</view>
			</view>
			<view class="finance-row mb30">
				<view class="jj-box flex-grow-1">
					<view class="fs24 col9">竞标响应率</view>
					<view class="finance-value col1">{{ finance.bidResponseRate }}%</view>
				</view>
				<view class="jj-box flex-grow-1">
					<view class="fs24 col9">违约保证金收入</view>
					<view class="finance-value col4">¥{{ finance.defaultDeposit }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				dashboard: {
					monthOrders: 0,
					conversionRate: 0,
					avgResponseHours: '-'
				},
				topProducts: [],
				finance: {
					lockedCommission: '0.00',
					settledCommission: '0.00',
					bidResponseRate: 0,
					defaultDeposit: '0.00'
				}
			}
		},
		onLoad() {
			this.loadOverview();
			this.loadProductStats();
			this.loadFinanceStats();
		},
		methods: {
			loadOverview() {
				this.$core.get({
					url: 'xiluxc.fc_dashboard/overview',
					loading: false,
					success: ret => {
						let d = ret.data;
						this.dashboard.monthOrders = d.month_orders || 0;
						this.dashboard.conversionRate = d.conversion_rate || 0;
						this.dashboard.avgResponseHours = d.avg_response_hours ? d.avg_response_hours + 'h' : '-';
					},
					fail: () => { return false; }
				});
			},
			loadProductStats() {
				this.$core.get({
					url: 'xiluxc.fc_dashboard/product_stats',
					loading: false,
					success: ret => {
						let d = ret.data;
						if (d.top10_products && Array.isArray(d.top10_products)) {
							this.topProducts = d.top10_products.map(item => ({
								name: item.product_name || '',
								sales: item.order_count || 0,
								amount: item.total_amount || '0.00'
							}));
						}
						this.finance.bidResponseRate = d.bid_response_rate || 0;
					},
					fail: () => { return false; }
				});
			},
			loadFinanceStats() {
				this.$core.get({
					url: 'xiluxc.fc_dashboard/finance_stats',
					loading: false,
					success: ret => {
						let d = ret.data;
						this.finance.lockedCommission = d.locked_commission || '0.00';
						this.finance.settledCommission = d.settled_commission || '0.00';
						this.finance.defaultDeposit = d.default_deposit || '0.00';
					},
					fail: () => { return false; }
				});
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.kpi-row {
		display: flex;
		gap: 20rpx;
	}

	.kpi-card {
		flex: 1;
		text-align: center;
		padding: 30rpx 10rpx;
	}

	.kpi-value {
		font-size: 40rpx;
		font-weight: bold;
		margin-top: 16rpx;
	}

	.top-item {
		padding: 24rpx 0;
	}

	.rank-badge {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		background: #F0F0F0;
		color: #666666;
		text-align: center;
		line-height: 44rpx;
		flex-shrink: 0;
	}

	.rank-top {
		background: #FE4B01;
		color: #FFFFFF;
	}

	.finance-row {
		display: flex;
		gap: 20rpx;
	}

	.finance-value {
		font-size: 36rpx;
		font-weight: bold;
		margin-top: 16rpx;
	}

	@media screen and (min-width: 768px) {
		.kpi-row {
			gap: 16px;
		}

		.kpi-card {
			padding: 24px 10px;
		}

		.kpi-value {
			font-size: 32px;
		}

		.finance-row {
			gap: 16px;
		}

		.finance-value {
			font-size: 28px;
		}

		.top-item {
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}
	}
</style>
