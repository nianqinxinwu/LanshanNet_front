<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 汇总卡片 -->
				<view class="summary-box mb30">
					<view class="summary-row">
						<view class="summary-card">
							<view class="fs24" style="color: rgba(255,255,255,0.8);">待结算(单位:元)</view>
							<view class="fs36 fwb colf mt8">¥{{ formatPrice(summary.pending) }}</view>
						</view>
						<view class="summary-card">
							<view class="fs24" style="color: rgba(255,255,255,0.8);">已到账(单位:元)</view>
							<view class="fs36 fwb colf mt8">¥{{ formatPrice(summary.settled) }}</view>
						</view>
						<view class="summary-card">
							<view class="fs24" style="color: rgba(255,255,255,0.8);">累计佣金(单位:元)</view>
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
				<view class="jj-box mb30 commission-item" v-for="(item, index) in commissionList" :key="item.id">
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
							<view class="fs24 col5">基础佣金(单位:元)</view>
							<view class="flex-grow-1 tr fs24 col1">¥{{ formatPrice(item.baseCommission) }}</view>
						</view>
						<view class="detail-line flex-box" v-if="item.factoryBonus > 0">
							<view class="fs24 col5">厂家奖金(单位:元)</view>
							<view class="flex-grow-1 tr fs24 col1">¥{{ formatPrice(item.factoryBonus) }}</view>
						</view>
						<view class="detail-line flex-box" v-if="item.logisticsRebate > 0">
							<view class="fs24 col5">物流返佣(单位:元)</view>
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
					pending: 0,
					settled: 0,
					total: 0
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
						let list = (ret.data.list && ret.data.list.data) || ret.data.list || ret.data || [];
						if (Array.isArray(list)) {
							list.forEach(item => { item.showDetail = false; });
						}
						this.handleListData(list);
					},
					fail: () => {
						this.moreButton.loading = false;
						this.moreButton.text = '加载失败，点击重试';
						return false;
					}
				});
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
			}
		}
	}
</script>

<style lang="scss" scoped>
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
