<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 快捷入口 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">快捷入口</view>
				<view class="quick-grid">
					<view class="quick-item" @click="onQuickEntry('im')">
						<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #9254de, #b37feb);">
							<text class="quick-icon-text">💬</text>
							<view v-if="unreadCount > 0" class="unread-badge">
								<text class="unread-text">{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
							</view>
						</view>
						<view class="fs24 col3 mt10 tc">消息</view>
					</view>
					<view class="quick-item" @click="onQuickEntry('agents')">
						<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #52c41a, #73d13d);">
							<text class="quick-icon-text">👥</text>
						</view>
						<view class="fs24 col3 mt10 tc">居间人</view>
					</view>
					<view class="quick-item" @click="onQuickEntry('products')">
						<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #40a9ff, #69c0ff);">
							<text class="quick-icon-text">📦</text>
						</view>
						<view class="fs24 col3 mt10 tc">商品管理</view>
					</view>
					<view class="quick-item" @click="onQuickEntry('withdraw')">
						<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #ff7875, #ffa39e);">
							<text class="quick-icon-text">💰</text>
						</view>
						<view class="fs24 col3 mt10 tc">提现</view>
					</view>
				</view>
			</view>

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
				unreadCount: 0,
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
			this.loadUnreadCount();
		},
		onShow() {
			this.loadUnreadCount();
		},
		methods: {
			onQuickEntry(type) {
				const routes = {
					'im': '/pages/im/im_chat_list/im_chat_list',
					'agents': '/pages/fc/fc_agents/fc_agents',
					'products': '',
					'withdraw': '/pages/fc/fc_withdraw/fc_withdraw'
				};
				if (routes[type]) {
					uni.navigateTo({ url: routes[type] });
				} else {
					uni.showToast({ title: '功能开发中', icon: 'none' });
				}
			},
			loadUnreadCount() {
				this.$core.get({
					url: 'xiluxc.im/unread_count',
					loading: false,
					success: ret => {
						this.unreadCount = ret.data.count || 0;
					},
					fail: () => { return false; }
				});
			},
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
	/* 快捷入口 */
	.quick-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
	}

	.quick-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}

	.quick-icon-wrap {
		width: 90rpx;
		height: 90rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.12);
		position: relative;
	}

	.quick-icon-text {
		font-size: 40rpx;
		line-height: 1;
	}

	.unread-badge {
		position: absolute;
		top: -6rpx;
		right: -6rpx;
		min-width: 32rpx;
		height: 32rpx;
		background: #ff4d4f;
		border-radius: 16rpx;
		padding: 0 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2rpx solid #fff;
	}

	.unread-text {
		font-size: 20rpx;
		color: #fff;
		font-weight: bold;
		line-height: 1;
		transform: scale(0.9);
	}

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
		.quick-grid {
			gap: 16px;
		}

		.quick-icon-wrap {
			cursor: pointer;
			transition: transform 0.2s;

			&:hover {
				transform: translateY(-4px);
			}
		}

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
