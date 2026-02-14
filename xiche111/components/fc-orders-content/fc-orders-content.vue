<template>
	<view class="orders-content">
		<!-- 搜索栏 -->
		<view class="search-bar mb20">
			<view class="search-inner flex-box">
				<image src="/static/icon/icon_search.png" mode="aspectFill" class="search-icon"></image>
				<input type="text" class="search-input flex-grow-1" v-model="keyword" placeholder="搜索订单号/商品名/居间人" placeholder-class="cola" confirm-type="search" @confirm="onSearch" />
				<view v-if="keyword" class="search-clear fs24" @click="onClearSearch">清除</view>
			</view>
		</view>

		<!-- 状态Tab -->
		<scroll-view scroll-x="true" class="tab-nav mb30">
			<view class="tab-item" :class="{ active: currentTab === item.value }" v-for="(item, index) in tabList"
				:key="index" @click="onTabChange(item.value)">{{ item.label }}</view>
		</scroll-view>

		<!-- 订单列表 -->
		<view class="order-card box mb30" v-for="(item, index) in orderList" :key="item.id"
			@click="goDetail(item)">
			<!-- 订单头部 -->
			<view class="flex-box mb20">
				<view class="flex-grow-1 fs24 col9">订单编号：{{ item.orderNo }}</view>
				<view class="status-label fs24" :class="'status-' + item.state">{{ getStateName(item.state, item) }}</view>
			</view>
			<!-- 商品信息 -->
			<view class="flex-box">
				<image :src="item.coverImage" mode="aspectFill" class="order-cover"></image>
				<view class="flex-grow-1 ml20">
					<view class="fs28 fwb col1 m-ellipsis lh36">{{ item.productName }}</view>
					<view class="fs24 col9 mt10">居间人：{{ item.agentName }}</view>
					<view class="fs24 col9 mt6">下单时间：{{ item.createTime }}</view>
					<view class="flex-box mt10">
						<view class="commission-tag">佣金 ¥{{ item.commissionAmount }}</view>
						<view class="countdown-tag fs22 ml10" v-if="item.state === 2 && item.countdown">{{ item.countdown }}</view>
					</view>
				</view>
			</view>
			<!-- 操作按钮 -->
			<view class="flex-box mt20 flex-end" v-if="getActionText(item.state, item)">
				<view class="action-btn fs24" @click.stop="onAction(item)">{{ getActionText(item.state, item) }}</view>
			</view>
		</view>

		<!-- 空状态 / 加载更多 -->
		<view class="nothing" v-if="moreButton.nothing">
			<view class="tc ptb40">
				<view class="fs28 col9">暂无订单</view>
			</view>
		</view>
		<view class="g-btn3-wrap" v-else>
			<view class="g-btn3 fs26 col9 tc ptb20" @click="loadOrders">{{ moreButton.text }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'fc-orders-content',
		props: {
			initTab: { type: [String, Number], default: 'all' }
		},
		data() {
			return {
				tabList: [
					{ label: '全部', value: 'all' },
					{ label: '待确认', value: 0 },
					{ label: '待缴纳佣金及服务费', value: 1 },
					{ label: '待锁定佣金', value: 2 },
					{ label: '合同阶段', value: 3 },
					{ label: '等待买家付款', value: 4 },
					{ label: '待放款', value: 5 },
					{ label: '已结算', value: 6 },
					{ label: '已取消', value: 7 }
				],
				currentTab: 'all',
				keyword: '',
				orderList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		mounted() {
			if (this.initTab !== 'all') {
				this.currentTab = Number(this.initTab) >= 0 ? Number(this.initTab) : 'all';
			}
			this.loadOrders();
		},
		methods: {
			getStateName(state, item) {
				if (state === 3) {
					return (item && item.contractUploaded) ? '合同审核中' : '待上传合同';
				}
				const map = {
					0: '待确认',
					1: '待缴纳佣金及服务费',
					2: '待锁定佣金',
					4: '等待买家付款',
					5: '待放款',
					6: '已结算',
					7: '已取消',
					8: '已逾期'
				};
				return map[state] || '未知';
			},
			getActionText(state, item) {
				if (state === 0) return '确认接单';
				if (state === 2) return '锁定佣金';
				if (state === 3 && item && item.contractUploaded) return '审核合同';
				if (state === 4 && item && item.proofPending) return '审核付款证明';
				if (state === 5) return '确认放款';
				return '';
			},
			loadOrders() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				this.$core.get({
					url: 'xiluxc.fc_order/index',
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
						let list = Array.isArray(rawList) ? rawList.map(item => ({
							id: item.id,
							orderNo: item.order_sn || item.orderNo,
							productName: item.product_name || item.productName,
							coverImage: item.cover_image || item.coverImage || '/static/images/icon_upload_logo.png',
							buyerCompany: item.buyer_company || '',
							agentName: item.agent_name || '',
							commissionAmount: item.commission_amount || item.commissionAmount,
							state: item.status !== undefined ? item.status : item.state,
							countdown: item.lock_countdown || '',
							contractUploaded: item.contract_uploaded || false,
							proofPending: item.proof_pending || false,
							createTime: item.createtime ? new Date(item.createtime * 1000).toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(/\//g, '-') : (item.createTime || '')
						})) : [];
						if (rawList.length === 0 && this.moreButton.page === 1) {
							this.moreButton.nothing = true;
							this.moreButton.text = '暂无订单';
						} else if (this.moreButton.page >= (listData.last_page || 1)) {
							this.orderList = this.orderList.concat(list);
							this.moreButton.nomore = true;
							this.moreButton.text = '—— 我是有底线的 ——';
						} else {
							this.orderList = this.orderList.concat(list);
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
				this.orderList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadOrders();
			},
			goDetail(order) {
				uni.navigateTo({
					url: '/pages/fc/fc_order_detail/fc_order_detail?orderId=' + order.id
				});
			},
			onAction(order) {
				if (order.state === 0) {
					this.confirmOrder(order);
				} else {
					this.goDetail(order);
				}
			},
			confirmOrder(order) {
				uni.showModal({
					title: '确认接单',
					content: '确定要接受此订单吗？',
					success: (res) => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.fc_order/confirm',
								data: { order_id: order.id },
								success: ret => {
									uni.showToast({ title: '已确认接单', icon: 'success' });
									this.resetAndLoad();
								}
							});
						}
					}
				});
			},
			onSearch() {
				this.resetAndLoad();
			},
			onClearSearch() {
				this.keyword = '';
				this.resetAndLoad();
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

	.order-card {
		cursor: pointer;
	}

	.order-cover {
		width: 140rpx;
		height: 140rpx;
		border-radius: 15rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	.status-label {
		flex-shrink: 0;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
	}

	.status-0 {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.status-1 {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.status-2 {
		background: rgba(255, 77, 79, 0.1);
		color: #FF4D4F;
	}

	.status-3 {
		background: rgba(24, 144, 255, 0.1);
		color: #1890FF;
	}

	.status-4 {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.status-5 {
		background: rgba(114, 46, 209, 0.1);
		color: #722ED1;
	}

	.status-6 {
		background: rgba(0, 0, 0, 0.04);
		color: #999999;
	}

	.status-7,
	.status-8 {
		background: rgba(255, 77, 79, 0.1);
		color: #FF4D4F;
	}

	.commission-tag {
		background: rgba(254, 75, 1, 0.1);
		color: #FE4B01;
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
	}

	.countdown-tag {
		background: rgba(255, 77, 79, 0.1);
		color: #FF4D4F;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
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

	.nothing {
		padding: 60rpx 0;
	}

	@media screen and (min-width: 768px) {
		.search-bar {
			border-radius: 12px;
			padding: 14px 20px;
			margin-bottom: 20px;
		}

		.search-inner {
			border-radius: 20px;
			padding: 0 16px;
			height: 42px;
		}

		.search-icon {
			width: 18px;
			height: 18px;
			margin-right: 10px;
		}

		.search-input {
			font-size: 14px;
			height: 42px;
			line-height: 42px;
		}

		.search-clear {
			cursor: pointer;

			&:hover {
				color: #FE4B01;
			}
		}

		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.tab-nav {
			border-radius: 12px;
			margin-bottom: 20px;

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

		.order-card {
			margin-bottom: 20px;
			transition: box-shadow 0.2s;

			&:hover {
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
			}
		}

		.order-cover {
			width: 100px;
			height: 100px;
			border-radius: 8px;
		}

		.action-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}
	}
</style>
