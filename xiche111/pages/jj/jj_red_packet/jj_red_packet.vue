<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 红包汇总 -->
				<view class="red-header mb30">
					<view class="tc">
						<view class="fs26" style="color: rgba(255,255,255,0.8);">累计获得红包</view>
						<view class="red-total-amount">¥{{ formatPrice(summary.totalAmount) }}</view>
						<view class="red-stats flex-box mt20">
							<view class="red-stat-item flex-grow-1 tc">
								<view class="fs24" style="color: rgba(255,255,255,0.7);">累计单数</view>
								<view class="fs30 fwb colf mt5">{{ summary.totalOrders }}单</view>
							</view>
							<view class="red-stat-divider"></view>
							<view class="red-stat-item flex-grow-1 tc">
								<view class="fs24" style="color: rgba(255,255,255,0.7);">每单红包</view>
								<view class="fs30 fwb colf mt5">¥{{ formatPrice(summary.perOrderAmount) }}</view>
							</view>
							<view class="red-stat-divider"></view>
							<view class="red-stat-item flex-grow-1 tc">
								<view class="fs24" style="color: rgba(255,255,255,0.7);">本月红包</view>
								<view class="fs30 fwb colf mt5">¥{{ formatPrice(summary.monthAmount) }}</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 红包规则 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">红包规则</view>
					<view class="rule-item flex-box mb15" v-for="(item, idx) in ruleList" :key="idx">
						<view class="rule-dot"></view>
						<view class="fs26 col5 ml15 flex-grow-1">{{ item }}</view>
					</view>
				</view>

				<!-- 状态Tab -->
				<scroll-view scroll-x="true" class="tab-nav mb30">
					<view class="tab-item" :class="{ active: currentTab === item.value }" v-for="(item, index) in tabList"
						:key="index" @click="onTabChange(item.value)">{{ item.label }}</view>
				</scroll-view>

				<!-- 红包记录列表 -->
				<view class="jj-box mb30 packet-item" v-for="(item, index) in packetList" :key="item.id">
					<view class="flex-box">
						<view class="packet-icon-wrap">
							<text class="fs28 colf">¥</text>
						</view>
						<view class="flex-grow-1 ml20">
							<view class="fs28 fwb col1">平台红包 +¥{{ formatPrice(item.amount) }}</view>
							<view class="fs24 col9 mt8">订单 #{{ item.orderNo }}</view>
							<view class="fs22 col9 mt5">{{ item.time }}</view>
						</view>
						<view class="tr">
							<view class="status-label fs22" :class="item.status === 'claimed' ? 'status-received' : 'status-pending'">
								{{ item.status === 'claimed' ? '已到账' : '待发放' }}
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 / 加载更多 -->
				<view class="nothing" v-if="moreButton.nothing">
					<view class="tc ptb40">
						<view class="fs28 col9">暂无红包记录</view>
					</view>
				</view>
				<view class="g-btn3-wrap" v-else>
					<view class="g-btn3 fs26 col9 tc ptb20" @click="loadList">{{ moreButton.text }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				summary: {
					totalAmount: 0,
					totalOrders: 0,
					perOrderAmount: 0,
					monthAmount: 0
				},
				tabList: [
					{ label: '全部', value: 'all' },
					{ label: '待发放', value: 'unclaimed' },
					{ label: '已到账', value: 'claimed' }
				],
				currentTab: 'all',
				ruleList: [
					'每完成一笔结算订单，平台自动发放红包',
					'红包金额由平台统一设定，当前标准：¥50/单',
					'红包将在订单结算完成后自动到账',
					'红包不可提现，可抵扣下次保证金缴纳'
				],
				packetList: [],
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
					url: 'xiluxc.jj_red_packet/summary',
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
					url: 'xiluxc.jj_red_packet/list',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						status: this.currentTab === 'all' ? '' : this.currentTab
					},
					loading: false,
					success: ret => {
						let rawList = (ret.data.list && ret.data.list.data) || ret.data.list || ret.data || [];
						// 映射后端字段到前端格式
						let list = Array.isArray(rawList) ? rawList.map(item => ({
							id: item.id,
							orderNo: item.order_no || item.orderNo,
							amount: item.amount,
							status: item.status == 1 ? 'claimed' : 'unclaimed',
							time: item.createtime ? new Date(item.createtime * 1000).toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(/\//g, '-') : (item.time || '')
						})) : [];
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
					this.moreButton.text = '暂无红包记录';
				} else if (list.length < 10) {
					this.packetList = this.packetList.concat(list);
					this.moreButton.nomore = true;
					this.moreButton.text = '—— 我是有底线的 ——';
				} else {
					this.packetList = this.packetList.concat(list);
					this.moreButton.page += 1;
					this.moreButton.text = '加载更多';
				}
				this.moreButton.loading = false;
			},

			onTabChange(value) {
				if (this.currentTab === value) return;
				this.currentTab = value;
				this.packetList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadList();
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* 红包头部 */
	.red-header {
		background: linear-gradient(135deg, #FF4D4F, #FF7875);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
	}

	.red-total-amount {
		font-size: 60rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-top: 10rpx;
	}

	.red-stats {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12rpx;
		padding: 20rpx 0;
	}

	.red-stat-divider {
		width: 1rpx;
		height: 50rpx;
		background: rgba(255, 255, 255, 0.3);
	}

	/* 规则 */
	.rule-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #FF4D4F;
		flex-shrink: 0;
		margin-top: 12rpx;
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
				color: #FF4D4F;
			}

			&.active::after {
				content: '';
				width: 30rpx;
				height: 6rpx;
				background: #FF4D4F;
				border-radius: 3rpx;
				position: absolute;
				bottom: 6rpx;
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}

	/* 红包项 */
	.packet-icon-wrap {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #FF4D4F, #FF7875);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
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

	.status-received {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.nothing {
		padding: 60rpx 0;
	}

	@media screen and (min-width: 768px) {
		.red-header {
			padding: 32px 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.red-total-amount {
			font-size: 42px;
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

				&:hover { color: #FF4D4F; }
			}
		}

		.packet-item {
			transition: box-shadow 0.2s;

			&:hover {
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
			}
		}
	}
</style>
