<template>
	<view class="home-content">
		<!-- 工厂信息卡片 -->
		<view class="jj-box mb30">
			<view class="flex-box">
				<image class="avatar" :src="factory.avatar || '/static/icon/icon_foot5_sc.png'" mode="aspectFill"></image>
				<view class="ml20 flex-grow-1">
					<view class="fs34 fwb col1">{{ factory.companyName }}</view>
					<view class="fs24 mt10">
						<text :class="statusColorClass">{{ factory.statusText }}</text>
						<text class="col9 ml15">履约率: {{ factory.fulfillRate }}%</text>
					</view>
				</view>
			</view>
			<view class="header-finance-row mt20">
				<view class="header-finance-item" @click="goWallet">
					<view class="fs22 col9">钱包余额</view>
					<view class="fs30 fwb col4 mt8">¥{{ finance.walletMoney }}</view>
				</view>
				<view class="header-finance-item">
					<view class="fs22 col9">已锁定佣金</view>
					<view class="fs30 fwb col4 mt8">¥{{ finance.lockedCommission }}</view>
				</view>
				<view class="header-finance-item">
					<view class="fs22 col9">已结算佣金</view>
					<view class="fs30 fwb col2 mt8">¥{{ finance.settledCommission }}</view>
				</view>
				<view class="header-finance-item">
					<view class="fs22 col9">违约保证金收入</view>
					<view class="fs30 fwb col4 mt8">¥{{ finance.defaultDeposit }}</view>
				</view>
			</view>
		</view>

		<!-- 数据看板 + 畅销产品 -->
		<view class="dashboard-panel mb30">
			<!-- 左侧：6项KPI数据 -->
			<view class="dashboard-left jj-box">
				<view class="fs34 fwb col1 lh36 mb20">数据概览</view>
				<view class="kpi-grid">
					<view class="kpi-item">
						<view class="fs24 col9">本月交易量</view>
						<view class="kpi-value col1">{{ kpi.monthlyVolume }}</view>
					</view>
					<view class="kpi-item">
						<view class="fs24 col9">待确认订单</view>
						<view class="kpi-value col4">{{ kpi.pendingOrders }}</view>
					</view>
					<view class="kpi-item">
						<view class="fs24 col9">已锁定佣金(元)</view>
						<view class="kpi-value col2">¥{{ kpi.lockedCommission }}</view>
					</view>
					<view class="kpi-item">
						<view class="fs24 col9">居间人转化率</view>
						<view class="kpi-value col4">{{ dashboard.conversionRate }}%</view>
					</view>
					<view class="kpi-item">
						<view class="fs24 col9">平均响应时间</view>
						<view class="kpi-value col2">{{ dashboard.avgResponseHours }}</view>
					</view>
					<view class="kpi-item">
						<view class="fs24 col9">竞标响应率</view>
						<view class="kpi-value col1">{{ finance.bidResponseRate }}%</view>
					</view>
				</view>
			</view>
			<!-- 右侧：畅销产品TOP10 -->
			<view class="dashboard-right jj-box">
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
		</view>

		<!-- 风险预警 -->
		<view class="jj-box mb30" v-if="warnings.length > 0">
			<view class="fs34 fwb col1 lh36 mb20">风险预警</view>
			<view v-for="(item, idx) in warnings" :key="idx" class="warning-item flex-box" :class="{ 'bb': idx < warnings.length - 1 }" @click="onWarningClick(item)">
				<view class="warning-dot"></view>
				<view class="flex-grow-1 ml15">
					<view class="fs28 col1">{{ item.title }}</view>
					<view class="fs24 col9 mt5">{{ item.desc }}</view>
				</view>
				<view class="fs24 col4">去处理 ></view>
			</view>
		</view>

		<!-- 快捷入口 -->
		<view class="jj-box mb30">
			<view class="fs34 fwb col1 lh36 mb20">快捷入口</view>
			<view class="quick-grid">
				<view class="quick-item" @click="onQuickEntry('products')">
					<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #52c41a, #73d13d);">
						<image src="/static/icon/icon_foot2_sc.png" mode="aspectFill" class="quick-icon"></image>
					</view>
					<view class="fs24 col3 mt10 tc">产品管理</view>
				</view>
				<view class="quick-item" @click="onQuickEntry('orders')">
					<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #ff7875, #ffa39e);">
						<image src="/static/icon/icon_foot4_sc.png" mode="aspectFill" class="quick-icon"></image>
					</view>
					<view class="fs24 col3 mt10 tc">订单管理</view>
				</view>
				<view class="quick-item" @click="onQuickEntry('bids')">
					<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #40a9ff, #69c0ff);">
						<image src="/static/icon/icon_foot3_sc.png" mode="aspectFill" class="quick-icon"></image>
					</view>
					<view class="fs24 col3 mt10 tc">竞标管理</view>
				</view>
				<view class="quick-item" @click="onQuickEntry('agents')">
					<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #ff8c00, #ffa940);">
						<image src="/static/icon/icon_foot1_sc.png" mode="aspectFill" class="quick-icon"></image>
					</view>
					<view class="fs24 col3 mt10 tc">居间人筛选</view>
				</view>
			</view>
		</view>

		<!-- 待办事项 -->
		<view class="jj-box mb30">
			<view class="fs34 fwb col1 lh36 mb20">待办事项</view>
			<view v-if="todoList.length === 0" class="fs28 col9 tc ptb30">暂无待办事项</view>
			<view v-for="(item, idx) in todoList" :key="idx" class="todo-item flex-box" :class="{ 'bb': idx < todoList.length - 1 }" @click="onTodoClick(item)">
				<view class="todo-dot"></view>
				<view class="flex-grow-1 ml15">
					<view class="fs28 col1">{{ item.title }}</view>
					<view class="fs24 col9 mt5">{{ item.desc }}</view>
				</view>
				<view class="fs24 col4">去处理 ></view>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		name: 'fc-home-content',
		data() {
			return {
				factory: {
					companyName: '工厂',
					avatar: '',
					status: -1,
					statusText: '未提交',
					fulfillRate: 0
				},
				kpi: {
					monthlyVolume: 0,
					pendingOrders: 0,
					lockedCommission: '0.00'
				},
				dashboard: {
					conversionRate: 0,
					avgResponseHours: '-'
				},
				topProducts: [],
				finance: {
					walletMoney: '0.00',
					lockedCommission: '0.00',
					settledCommission: '0.00',
					bidResponseRate: 0,
					defaultDeposit: '0.00'
				},
				warnings: [],
				todoList: []
			}
		},
		computed: {
			statusColorClass() {
				const map = { '-1': 'col9', 0: 'col9', 1: 'col2', 2: 'col4' };
				return map[this.factory.status] || 'col9';
			}
		},
		mounted() {
			this.loadCertStatus();
			this.loadOverview();
			this.loadTodoCount();
			this.loadProductStats();
			this.loadFinanceStats();
		},
		methods: {
			loadCertStatus() {
				this.$core.get({
					url: 'xiluxc.fc_factory/cert_status',
					loading: false,
					success: ret => {
						let d = ret.data;
						const statusMap = { '-1': '未提交', 0: '待审核', 1: '正常', 2: '冻结' };
						this.factory.companyName = d.company_name || '工厂';
						this.factory.status = d.status !== undefined ? d.status : -1;
						this.factory.statusText = d.status_text || statusMap[this.factory.status] || '未提交';
						this.factory.fulfillRate = d.fulfill_rate || 0;
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
						this.kpi.monthlyVolume = d.month_orders || 0;
						this.kpi.pendingOrders = d.pending_confirm || 0;
						this.kpi.lockedCommission = 0;
						this.dashboard.conversionRate = d.conversion_rate || 0;
						this.dashboard.avgResponseHours = d.avg_response_hours ? d.avg_response_hours + 'h' : '-';
					},
					fail: () => { return false; }
				});
			},
			loadTodoCount() {
				this.$core.get({
					url: 'xiluxc.fc_order/todo_count',
					loading: false,
					success: ret => {
						let d = ret.data;
						this.buildWarnings(d);
						this.buildTodoList(d);
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
						this.finance.walletMoney = d.wallet_money || '0.00';
						this.finance.lockedCommission = d.locked_commission || '0.00';
						this.finance.settledCommission = d.settled_commission || '0.00';
						this.finance.defaultDeposit = d.default_deposit || '0.00';
					},
					fail: () => { return false; }
				});
			},
			goWallet() {
				uni.navigateTo({ url: '/pages/fc/fc_wallet/fc_wallet' });
			},
			buildWarnings(data) {
				this.warnings = [];
				if (!data) return;
				if (data.pending_lock > 0) {
					this.warnings.push({
						type: 'unlock_commission',
						title: '佣金未锁定提醒',
						desc: data.pending_lock + '笔订单佣金待锁定（2小时限制）'
					});
				}
				if (data.pending_review > 0) {
					this.warnings.push({
						type: 'pending_contract',
						title: '合同未审核提醒',
						desc: data.pending_review + '笔合同待审核'
					});
				}
			},
			buildTodoList(data) {
				this.todoList = [];
				if (!data) return;
				if (data.pending_confirm > 0) {
					this.todoList.push({ type: 'pending_confirm', title: '待确认订单', desc: data.pending_confirm + '笔订单待确认' });
				}
				if (data.pending_lock > 0) {
					this.todoList.push({ type: 'pending_lock', title: '待锁定佣金', desc: data.pending_lock + '笔佣金待锁定' });
				}
				if (data.pending_review > 0) {
					this.todoList.push({ type: 'pending_review', title: '待审核合同', desc: data.pending_review + '笔合同待审核' });
				}
				if (data.pending_ship > 0) {
					this.todoList.push({ type: 'pending_ship', title: '待发货订单', desc: data.pending_ship + '笔订单待发货' });
				}
				if (data.pending_release > 0) {
					this.todoList.push({ type: 'pending_release', title: '待释放订单', desc: data.pending_release + '笔订单待释放' });
				}
			},
			onQuickEntry(type) {
				if (type === 'products' || type === 'orders') {
					this.$emit('switchTab', type);
				} else if (type === 'bids') {
					uni.navigateTo({ url: '/pages/fc/fc_bids/fc_bids' });
				} else if (type === 'agents') {
					uni.navigateTo({ url: '/pages/fc/fc_agents/fc_agents' });
				}
			},
			onTodoClick(item) {
				if (item.type === 'pending_confirm') {
					this.$emit('switchTab', 'orders', 0);
				} else if (item.type === 'pending_lock') {
					this.$emit('switchTab', 'orders', 2);
				} else if (item.type === 'pending_review') {
					this.$emit('switchTab', 'orders', 3);
				} else if (item.type === 'pending_ship') {
					this.$emit('switchTab', 'orders', 5);
				}
			},
			onWarningClick(item) {
				if (item.type === 'unlock_commission') {
					this.$emit('switchTab', 'orders', 2);
				} else if (item.type === 'pending_contract') {
					this.$emit('switchTab', 'orders', 3);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 2px solid #F0F0F0;
	}

	.header-finance-row {
		display: flex;
		gap: 20rpx;
		border-top: 1px solid #F0F0F0;
		padding-top: 20rpx;
	}

	.header-finance-item {
		flex: 1;
		text-align: center;
	}

	.dashboard-panel {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.dashboard-left,
	.dashboard-right {
		width: 100%;
	}

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
	}

	.kpi-item {
		text-align: center;
		background: #F9FAFB;
		border-radius: 12rpx;
		padding: 20rpx 10rpx;
	}

	.kpi-value {
		font-size: 36rpx;
		font-weight: bold;
		margin-top: 12rpx;
	}

	.warning-item {
		padding: 24rpx 0;
	}

	.warning-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #FF4D4F;
		flex-shrink: 0;
	}

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
	}

	.quick-icon {
		width: 44rpx;
		height: 44rpx;
		filter: brightness(0) invert(1);
	}

	.todo-item {
		padding: 24rpx 0;
	}

	.todo-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #FE4B01;
		flex-shrink: 0;
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

	@media screen and (min-width: 768px) {
		.dashboard-panel {
			flex-direction: row;
			gap: 16px;
		}

		.dashboard-left {
			width: 50%;
			flex-shrink: 0;
		}

		.dashboard-right {
			flex: 1;
			min-width: 0;
		}

		.kpi-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}

		.kpi-item {
			padding: 16px 10px;
		}

		.kpi-value {
			font-size: 24px;
		}

		.quick-icon-wrap {
			cursor: pointer;
			transition: transform 0.2s;

			&:hover {
				transform: translateY(-4rpx);
			}
		}

		.todo-item,
		.warning-item {
			cursor: pointer;

			&:hover {
				background-color: #F5F7FB;
			}
		}

		.top-item {
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}
	}
</style>
