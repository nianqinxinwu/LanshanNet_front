<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 状态Tab -->
				<scroll-view scroll-x="true" class="tab-nav mb30">
					<view class="tab-item" :class="{ active: currentTab === item.value }"
						v-for="(item, index) in tabList" :key="index" @click="onTabChange(item.value)">
						{{ item.label }}
					</view>
				</scroll-view>

				<!-- 提现记录列表 -->
				<view class="withdraw-card box mb20" v-for="(item, index) in list" :key="index">
					<view class="flex-box mb16">
						<view class="flex-grow-1">
							<view class="fs24 col9">{{ item.order_no }}</view>
						</view>
						<view class="state-tag" :class="'state-' + item.state">{{ item.state_text }}</view>
					</view>
					<view class="fs34 fwb col1 mb10">¥{{ item.money }}</view>
					<view class="fs24 col9 mb6">{{ item.bank_name }} {{ item.bank_branch }}</view>
					<view class="fs24 col9 mb6">{{ item.account_name }} | {{ maskBankNo(item.bank_no) }}</view>
					<view class="fs22 col9">{{ item.createtime_text }}</view>

					<!-- 已拒绝显示原因 -->
					<view class="refuse-reason mt16" v-if="item.state == 4 && item.reason">
						<view class="fs24 col4">拒绝原因：{{ item.reason }}</view>
					</view>
				</view>

				<!-- 空状态 / 加载更多 -->
				<view class="nothing" v-if="moreButton.nothing">
					<view class="tc ptb40">
						<view class="fs28 col9">暂无提现记录</view>
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
				tabList: [
					{ label: '全部', value: '' },
					{ label: '审核中', value: 1 },
					{ label: '处理中', value: 2 },
					{ label: '已处理', value: 3 },
					{ label: '已拒绝', value: 4 }
				],
				currentTab: '',
				list: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		onLoad() {
			this.loadList();
		},
		methods: {
			loadList() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				let data = {
					page: this.moreButton.page,
					pagesize: 15
				};
				if (this.currentTab !== '') {
					data.state = this.currentTab;
				}

				this.$core.get({
					url: 'xiluxc.fc_wallet/withdraw_log',
					data: data,
					loading: false,
					success: ret => {
						let listData = ret.data.list || {};
						let rawList = listData.data || [];
						if (rawList.length === 0 && this.moreButton.page === 1) {
							this.moreButton.nothing = true;
							this.moreButton.text = '暂无提现记录';
						} else if (this.moreButton.page >= (listData.last_page || 1)) {
							this.list = this.list.concat(rawList);
							this.moreButton.nomore = true;
							this.moreButton.text = '—— 没有更多了 ——';
						} else {
							this.list = this.list.concat(rawList);
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
			onTabChange(value) {
				if (this.currentTab === value) return;
				this.currentTab = value;
				this.list = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadList();
			},
			maskBankNo(no) {
				if (!no || no.length <= 4) return no;
				return '****' + no.slice(-4);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

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
			padding: 0 26rpx;
			font-size: 26rpx;
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

	.state-tag {
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		height: fit-content;
	}

	.state-1 {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.state-2 {
		background: rgba(24, 144, 255, 0.1);
		color: #1890FF;
	}

	.state-3 {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.state-4 {
		background: rgba(255, 77, 79, 0.1);
		color: #FF4D4F;
	}

	.refuse-reason {
		background: #FFF2F0;
		border-radius: 10rpx;
		padding: 16rpx 20rpx;
	}

	.nothing {
		padding: 60rpx 0;
	}

	@media screen and (min-width: 768px) {
		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 16px;
		}

		.tab-nav {
			border-radius: 12px;
			margin-bottom: 16px;

			.tab-item {
				height: 48px;
				line-height: 48px;
				padding: 0 20px;
				font-size: 14px;
				cursor: pointer;

				&:hover {
					color: #FE4B01;
				}
			}
		}
	}
</style>
