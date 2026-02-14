<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 搜索栏 -->
			<view class="search-bar mb20">
				<view class="search-inner flex-box">
					<image src="/static/icon/icon_search.png" mode="aspectFill" class="search-icon"></image>
					<input type="text" class="search-input flex-grow-1" v-model="keyword" placeholder="搜索竞标标题" placeholder-class="cola" confirm-type="search" @confirm="onSearch" />
					<view v-if="keyword" class="search-clear fs24" @click="onClearSearch">清除</view>
				</view>
			</view>

			<!-- 状态Tab -->
			<scroll-view scroll-x="true" class="tab-nav mb30">
				<view class="tab-item" :class="{ active: currentTab === item.value }" v-for="(item, index) in tabList"
					:key="index" @click="onTabChange(item.value)">{{ item.label }}</view>
			</scroll-view>

			<!-- 竞标列表 -->
			<view class="bid-card jj-box mb30" v-for="(item, index) in bidList" :key="item.id">
				<view class="flex-box mb15">
					<view class="flex-grow-1 fs30 fwb col1 m-ellipsis">{{ item.title }}</view>
					<view class="status-tag fs22" :class="'tag-' + item.status">{{ item.statusText }}</view>
				</view>
				<view class="fs24 col9 mb10">发起人：{{ item.agentName }}</view>
				<view class="flex-box mb15">
					<view class="fs24 col5 flex-grow-1">截止时间：{{ item.deadline }}</view>
					<view class="fs24 col4" v-if="item.remaining">剩余 {{ item.remaining }}</view>
				</view>
				<view class="flex-box flex-end">
					<view class="action-btn fs24" v-if="item.status === 0" @click="goQuote(item)">去报价</view>
					<view class="outline-btn fs24" v-else-if="item.status === 1" @click="goQuote(item)">查看报价</view>
				</view>
			</view>

			<!-- 空状态 / 加载更多 -->
			<view class="nothing" v-if="moreButton.nothing">
				<view class="tc ptb40">
					<view class="fs28 col9">暂无竞标邀请</view>
				</view>
			</view>
			<view class="g-btn3-wrap" v-else>
				<view class="g-btn3 fs26 col9 tc ptb20" @click="loadBids">{{ moreButton.text }}</view>
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
					{ label: '待报价', value: 'pending' },
					{ label: '已报价', value: 'quoted' },
					{ label: '已截止', value: 'expired' }
				],
				currentTab: 'all',
				keyword: '',
				bidList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		onLoad() {
			this.loadBids();
		},
		methods: {
			formatRemainTime(seconds) {
				if (seconds <= 0) return '已截止';
				let h = Math.floor(seconds / 3600);
				let m = Math.floor((seconds % 3600) / 60);
				return h > 0 ? h + '时' + m + '分' : m + '分';
			},
			loadBids() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				this.$core.get({
					url: 'xiluxc.fc_bid/invitation_list',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						status: this.currentTab === 'all' ? '' : this.currentTab,
						keyword: this.keyword
					},
					loading: false,
					success: ret => {
						let listData = ret.data.list || {};
						let rawList = listData.data || [];
						let list = rawList.map(item => ({
							id: item.id,
							bidId: item.bid_id,
							title: item.bid ? item.bid.category_name + ' ' + item.bid.quantity + item.bid.unit : '',
							agentName: '',
							deadline: item.bid && item.bid.expire_time ? new Date(item.bid.expire_time * 1000).toLocaleString('zh-CN') : '',
							remaining: item.remain_time > 0 ? this.formatRemainTime(item.remain_time) : '',
							status: item.status,
							statusText: item.status_text || '',
							quoteId: item.contract_price ? item.id : '',
							bidSn: item.bid ? item.bid.bid_sn : ''
						}));
						if (list.length === 0 && this.moreButton.page === 1) {
							this.moreButton.nothing = true;
						} else if (this.moreButton.page >= (listData.last_page || 1)) {
							this.bidList = this.bidList.concat(list);
							this.moreButton.nomore = true;
							this.moreButton.text = '—— 我是有底线的 ——';
						} else {
							this.bidList = this.bidList.concat(list);
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
				this.resetAndLoad();
			},
			resetAndLoad() {
				this.bidList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadBids();
			},
			onSearch() {
				this.resetAndLoad();
			},
			onClearSearch() {
				this.keyword = '';
				this.resetAndLoad();
			},
			goQuote(item) {
				let url = '/pages/fc/fc_bid_quote/fc_bid_quote?bidId=' + item.bidId;
				if (item.quoteId) url += '&quoteId=' + item.quoteId;
				uni.navigateTo({ url: url });
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search-bar {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 20rpx 30rpx;
	}

	.search-inner {
		background: #F5F7FB;
		border-radius: 30rpx;
		padding: 0 24rpx;
		height: 68rpx;
		align-items: center;
	}

	.search-icon {
		width: 32rpx;
		height: 32rpx;
		flex-shrink: 0;
		margin-right: 16rpx;
	}

	.search-input {
		font-size: 26rpx;
		height: 68rpx;
		line-height: 68rpx;
	}

	.search-clear {
		color: #999999;
		flex-shrink: 0;
		padding-left: 16rpx;
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
			padding: 0 24rpx;
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

	.bid-card {
		cursor: pointer;
	}

	.status-tag {
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
	}

	.tag-0 {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.tag-1 {
		background: rgba(24, 144, 255, 0.1);
		color: #1890FF;
	}

	.tag-2 {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.tag-3 {
		background: rgba(0, 0, 0, 0.04);
		color: #999999;
	}

	.flex-end {
		justify-content: flex-end;
	}

	.action-btn {
		background: #FE4B01;
		color: #FFFFFF;
		padding: 12rpx 36rpx;
		border-radius: 30rpx;
	}

	.outline-btn {
		border: 1px solid #DDDDDD;
		color: #666666;
		padding: 12rpx 36rpx;
		border-radius: 30rpx;
	}

	.nothing {
		padding: 60rpx 0;
	}

	@media screen and (min-width: 768px) {
		.search-bar {
			border-radius: 12px;
			padding: 14px 20px;
		}

		.search-inner {
			border-radius: 20px;
			padding: 0 16px;
			height: 42px;
		}

		.tab-nav {
			border-radius: 12px;

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

		.bid-card {
			transition: box-shadow 0.2s;

			&:hover {
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
			}
		}

		.action-btn,
		.outline-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}
	}
</style>
