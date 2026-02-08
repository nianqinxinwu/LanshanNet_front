<template>
	<view class="orders-content">
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
	// Mock 订单数据
	const MOCK_ORDERS = [
		{
			id: 1001,
			orderNo: 'JJ202602080001',
			productName: '高强度螺纹钢 HRB400',
			coverImage: '/static/images/icon_upload_logo.png',
			companyName: '鑫达建设有限公司',
			commissionAmount: 14980.00,
			state: 1,
			depositRate: 10,
			commission: 3.5,
			createTime: '2026-02-08 10:30:00'
		},
		{
			id: 1002,
			orderNo: 'JJ202602070002',
			productName: '聚氯乙烯树脂 SG-5',
			coverImage: '/static/images/icon_upload_logo.png',
			companyName: '华源化工采购部',
			commissionAmount: 28770.00,
			state: 3,
			depositRate: 10,
			commission: 4.2,
			createTime: '2026-02-07 14:20:00'
		},
		{
			id: 1003,
			orderNo: 'JJ202602060003',
			productName: 'CNC精密加工中心 VMC850',
			coverImage: '/static/images/icon_upload_logo.png',
			companyName: '精锐机械制造厂',
			commissionAmount: 3700.00,
			state: 4,
			depositRate: 10,
			commission: 2.0,
			createTime: '2026-02-06 09:15:00'
		},
		{
			id: 1004,
			orderNo: 'JJ202602050004',
			productName: '工业级连接器 DB25',
			coverImage: '/static/images/icon_upload_logo.png',
			companyName: '联创电子科技',
			commissionAmount: 5000.00,
			state: 4,
			depositRate: 10,
			commission: 8.0,
			createTime: '2026-02-05 16:40:00'
		},
		{
			id: 1005,
			orderNo: 'JJ202602040005',
			productName: '涤纶长丝 DTY 150D/48F',
			coverImage: '/static/images/icon_upload_logo.png',
			companyName: '恒通纺织集团',
			commissionAmount: 26700.00,
			state: 5,
			depositRate: 10,
			commission: 3.0,
			createTime: '2026-02-04 11:00:00'
		},
		{
			id: 1006,
			orderNo: 'JJ202602030006',
			productName: '普通硅酸盐水泥 P.O 42.5',
			coverImage: '/static/images/icon_upload_logo.png',
			companyName: '华润建材采购',
			commissionAmount: 12000.00,
			state: 6,
			depositRate: 10,
			commission: 2.5,
			createTime: '2026-02-03 08:50:00'
		},
		{
			id: 1007,
			orderNo: 'JJ202602020007',
			productName: '环氧树脂 E-51',
			coverImage: '/static/images/icon_upload_logo.png',
			companyName: '巴陵石化采购部',
			commissionAmount: 110000.00,
			state: 6,
			depositRate: 10,
			commission: 5.0,
			createTime: '2026-02-02 13:30:00'
		},
		{
			id: 1008,
			orderNo: 'JJ202602010008',
			productName: '液压油缸 HOB-63/35',
			coverImage: '/static/images/icon_upload_logo.png',
			companyName: '力源液压设备采购',
			commissionAmount: 8320.00,
			state: 1,
			depositRate: 10,
			commission: 6.5,
			createTime: '2026-02-01 15:10:00'
		}
	];

	export default {
		name: 'jj-orders-content',
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
				orderList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		mounted() {
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

			// 获取筛选后的Mock数据
			getFilteredOrders() {
				let list = [...MOCK_ORDERS];
				if (this.currentTab !== 'all') {
					let tabValue = this.currentTab;
					if (tabValue === 4) {
						// 履约中 tab 包含状态4和5
						list = list.filter(item => item.state === 4 || item.state === 5);
					} else {
						list = list.filter(item => item.state === tabValue);
					}
				}
				return list;
			},

			// 模拟分页加载
			loadOrders() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				// 尝试调接口
				this.$core.get({
					url: 'xiluxc.jj_order/list',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						state: this.currentTab === 'all' ? '' : this.currentTab
					},
					loading: false,
					success: ret => {
						let list = ret.data.list || ret.data || [];
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
						// 接口未就绪，使用Mock数据
						this.loadMockOrders();
						return false;
					}
				});
			},

			// Mock数据分页加载
			loadMockOrders() {
				setTimeout(() => {
					const allFiltered = this.getFilteredOrders();
					const pageSize = 10;
					const start = (this.moreButton.page - 1) * pageSize;
					const pageData = allFiltered.slice(start, start + pageSize);

					if (pageData.length === 0 && this.moreButton.page === 1) {
						this.moreButton.nothing = true;
						this.moreButton.text = '暂无订单';
					} else if (pageData.length < pageSize) {
						this.orderList = this.orderList.concat(pageData);
						this.moreButton.nomore = true;
						this.moreButton.text = '—— 我是有底线的 ——';
					} else {
						this.orderList = this.orderList.concat(pageData);
						this.moreButton.page += 1;
						this.moreButton.text = '加载更多';
					}

					this.moreButton.loading = false;
				}, 300);
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
