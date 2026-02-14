<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 积分余额卡片 -->
			<view class="points-header mb30">
				<view class="fs28" style="color: rgba(255,255,255,0.8);">当前积分</view>
				<view class="points-balance">{{ points.balance }}</view>
				<view class="fs24 mt10" style="color: rgba(255,255,255,0.6);">≈ ¥{{ formatPrice(points.balance / 10) }}</view>
				<view class="exchange-btn fs26 mt20" @click="onExchange">去兑换</view>
			</view>

			<!-- 积分记录Tab -->
			<view class="jj-box mb30">
				<view class="flex-box mb20">
					<view class="tab-btn fs28" :class="{ active: currentTab === 'earn' }" @click="currentTab = 'earn'; resetAndLoad()">获取记录</view>
					<view class="tab-btn fs28" :class="{ active: currentTab === 'spend' }" @click="currentTab = 'spend'; resetAndLoad()">兑换记录</view>
				</view>

				<!-- 记录列表 -->
				<view v-if="recordList.length === 0 && !moreButton.loading" class="fs28 col9 tc ptb30">暂无记录</view>
				<view v-for="(item, idx) in recordList" :key="idx" class="record-item" :class="{ 'bb': idx < recordList.length - 1 }">
					<view class="flex-box">
						<view class="flex-grow-1">
							<view class="fs28 col1">{{ item.title }}</view>
							<view class="fs24 col9 mt8">{{ item.time }}</view>
						</view>
						<view class="fs30 fwb" :class="item.amount > 0 ? 'col2' : 'col4'">
							{{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
						</view>
					</view>
				</view>

				<!-- 加载更多 -->
				<view class="g-btn3-wrap" v-if="!moreButton.nothing && recordList.length > 0">
					<view class="g-btn3 fs26 col9 tc ptb20" @click="loadRecords">{{ moreButton.text }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				points: {
					balance: 0
				},
				currentTab: 'earn',
				recordList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		onLoad() {
			this.loadBalance();
			this.loadRecords();
		},
		methods: {
			loadBalance() {
				this.$core.get({
					url: 'xiluxc.fc_points/balance',
					loading: false,
					success: ret => {
						this.points.balance = Number(ret.data.balance) || 0;
					},
					fail: () => { return false; }
				});
			},
			loadRecords() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				this.$core.get({
					url: 'xiluxc.fc_points/history',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						type: this.currentTab
					},
					loading: false,
					success: ret => {
						let rawList = ret.data.data || ret.data.list || ret.data || [];
						let list = Array.isArray(rawList) ? rawList.map(item => ({
							title: item.title || item.remark || '',
							amount: Number(item.amount) || 0,
							time: item.createtime ? new Date(item.createtime * 1000).toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(/\//g, '-') : (item.time || '')
						})) : [];
						if (list.length === 0 && this.moreButton.page === 1) {
							this.moreButton.nothing = true;
						} else if (list.length < 10) {
							this.recordList = this.recordList.concat(list);
							this.moreButton.nomore = true;
							this.moreButton.text = '—— 我是有底线的 ——';
						} else {
							this.recordList = this.recordList.concat(list);
							this.moreButton.page += 1;
							this.moreButton.text = '加载更多';
						}
						this.moreButton.loading = false;
					},
					fail: () => {
						this.moreButton.loading = false;
						this.moreButton.text = '加载失败，点击重试';
						return false;
					}
				});
			},
			resetAndLoad() {
				this.recordList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadRecords();
			},
			onExchange() {
				uni.showToast({ title: '功能开发中', icon: 'none' });
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.points-header {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
		text-align: center;
	}

	.points-balance {
		font-size: 72rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-top: 10rpx;
	}

	.exchange-btn {
		display: inline-block;
		border: 1px solid rgba(255, 255, 255, 0.6);
		color: #FFFFFF;
		padding: 12rpx 40rpx;
		border-radius: 30rpx;
		cursor: pointer;
	}

	.tab-btn {
		flex: 1;
		text-align: center;
		padding: 16rpx 0;
		color: #666666;
		position: relative;

		&.active {
			font-weight: bold;
			color: #FE4B01;

			&::after {
				content: '';
				width: 40rpx;
				height: 6rpx;
				background: #FE4B01;
				border-radius: 3rpx;
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}

	.record-item {
		padding: 24rpx 0;
	}

	@media screen and (min-width: 768px) {
		.points-header {
			padding: 30px 24px;
			border-radius: 12px;
		}

		.points-balance {
			font-size: 48px;
		}

		.exchange-btn {
			cursor: pointer;
			transition: background-color 0.2s;

			&:hover {
				background: rgba(255, 255, 255, 0.2);
			}
		}

		.tab-btn {
			cursor: pointer;

			&:hover:not(.active) {
				color: #FE4B01;
			}
		}
	}
</style>
