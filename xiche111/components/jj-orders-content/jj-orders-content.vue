<template>
	<view class="orders-content">
		<!-- 搜索栏 -->
		<view class="search-bar mb20">
			<view class="search-inner flex-box">
				<image src="/static/icon/icon_search.png" mode="aspectFill" class="search-icon"></image>
				<input type="text" class="search-input flex-grow-1" v-model="keyword" placeholder="搜索订单号/商品名/买家企业" placeholder-class="cola" confirm-type="search" @confirm="onSearch" />
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
			<!-- 订单头部：编号+状态 -->
			<view class="flex-box mb20">
				<view class="flex-grow-1 fs24 col9">订单编号：{{ item.orderNo }}</view>
				<view class="status-label fs24" :class="'status-' + item.state">{{ getStateName(item.state) }}</view>
			</view>
			<!-- 商品信息 -->
			<view class="flex-box">
				<image :src="item.coverImage" mode="aspectFill" class="order-cover"></image>
				<view class="flex-grow-1 ml20">
					<view class="fs28 fwb col1 m-ellipsis lh36">{{ item.productName }}</view>
					<view class="fs24 col9 mt10">买家：{{ item.companyName }}</view>
					<view class="flex-box mt10">
						<view class="commission-tag">佣金 ¥{{ formatPrice(item.commissionAmount) }}</view>
					</view>
				</view>
			</view>
			<!-- 操作按钮 -->
			<view class="flex-box mt20 flex-end" v-if="getActionText(item.state)">
				<view class="action-btn fs24" @click.stop="onAction(item)">{{ getActionText(item.state) }}</view>
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
		name: 'jj-orders-content',
		props: {
			initTab: { type: [String, Number], default: 'all' }
		},
		data() {
			return {
				tabList: [
					{ label: '全部', value: 'all' },
					{ label: '待缴保证金', value: 1 },
					{ label: '合同上传中', value: 3 },
					{ label: '履约中', value: 4 },
					{ label: '已结算', value: 6 }
				],
				currentTab: 'all',
				keyword: '',
				orderList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		mounted() {
			if (this.initTab !== 'all') {
				this.currentTab = Number(this.initTab) || 'all';
			}
			this.loadOrders();
		},
		methods: {
			getStateName(state) {
				const map = {
					0: '待确认',
					1: '待缴纳保证金',
					2: '保证金已缴',
					3: '合同上传中',
					4: '履约执行中',
					5: '待结算',
					6: '已结算',
					7: '已取消',
					8: '已逾期'
				};
				return map[state] || '未知';
			},

			getActionText(state) {
				const map = {
					1: '去缴纳保证金',
					3: '去上传合同',
					4: '查看物流',
					5: '查看物流',
					6: '查看详情'
				};
				return map[state] || '';
			},

			// 加载订单列表
			loadOrders() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				// 尝试调接口
				this.$core.get({
					url: 'xiluxc.jj_order/index',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						status: this.currentTab === 'all' ? '' : this.currentTab,
						keyword: this.keyword
					},
					loading: false,
					success: ret => {
						let rawList = ret.data.data || ret.data.list || ret.data || [];
						// 映射后端 snake_case 字段到前端 camelCase
						let list = Array.isArray(rawList) ? rawList.map(item => ({
							id: item.id,
							orderNo: item.order_sn || item.orderNo,
							productName: item.product_name || item.productName,
							coverImage: item.cover_image || item.coverImage || '/static/images/icon_upload_logo.png',
							companyName: item.buyer_company || item.companyName,
							commissionAmount: item.commission_amount || item.commissionAmount,
							state: item.status !== undefined ? item.status : item.state,
							depositRate: item.deposit_rate || item.depositRate,
							commission: item.commission_rate || item.commission,
							createTime: item.createtime ? new Date(item.createtime * 1000).toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(/\//g, '-') : (item.createTime || '')
						})) : [];
						if (list.length === 0 && this.moreButton.page === 1) {
							this.moreButton.nothing = true;
							this.moreButton.text = '暂无订单';
						} else if (list.length < 10) {
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

			// 切换Tab
			onTabChange(value) {
				if (this.currentTab === value) return;
				this.currentTab = value;
				this.resetAndLoad();
			},

			// 重置列表并重新加载
			resetAndLoad() {
				this.orderList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadOrders();
			},

			// 点击卡片进入详情
			goDetail(order) {
				let param = encodeURIComponent(JSON.stringify({
					productName: order.productName,
					coverImage: order.coverImage,
					companyName: order.companyName,
					commissionAmount: order.commissionAmount,
					state: order.state,
					orderNo: order.orderNo,
					commission: order.commission,
					depositRate: order.depositRate,
					createTime: order.createTime
				}));
				uni.navigateTo({
					url: '/pages/jj/jj_order_detail/jj_order_detail?orderId=' + order.id + '&param=' + param
				});
			},

			// 操作按钮
			onAction(order) {
				switch (order.state) {
					case 1:
						// 去缴纳保证金
						let depositParam = encodeURIComponent(JSON.stringify({
							productName: order.productName,
							coverImage: order.coverImage,
							companyName: order.companyName,
							commission: order.commission,
							commissionAmount: order.commissionAmount,
							depositRate: order.depositRate
						}));
						uni.navigateTo({
							url: '/pages/jj/jj_deposit/jj_deposit?orderId=' + order.id + '&param=' + depositParam
						});
						break;
					case 3:
						// 去上传合同
						let contractParam = encodeURIComponent(JSON.stringify({
							productName: order.productName,
							coverImage: order.coverImage,
							companyName: order.companyName
						}));
						uni.navigateTo({
							url: '/pages/jj/jj_contract/jj_contract?orderId=' + order.id + '&param=' + contractParam
						});
						break;
					case 4:
					case 5:
						// 查看物流
						uni.navigateTo({
							url: '/pages/jj/jj_logistics/jj_logistics?orderId=' + order.id
						});
						break;
					case 6:
						// 查看详情
						this.goDetail(order);
						break;
				}
			},

			// 搜索
			onSearch() {
				this.resetAndLoad();
			},

			// 清除搜索
			onClearSearch() {
				this.keyword = '';
				this.resetAndLoad();
			},

			// 价格格式化
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

	.status-1 {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.status-3 {
		background: rgba(24, 144, 255, 0.1);
		color: #1890FF;
	}

	.status-4,
	.status-5 {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
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
