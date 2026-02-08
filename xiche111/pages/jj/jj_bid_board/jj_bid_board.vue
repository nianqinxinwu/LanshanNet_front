<template>
	<view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 顶部统计 + 发起竞标 -->
				<view class="box mb30">
					<view class="flex-box flex-between flex-v-center">
						<view>
							<view class="fs34 fwb col1">竞标看板</view>
							<view class="fs24 col9 mt10">共 {{ totalCount }} 条竞标记录</view>
						</view>
						<view class="btn-publish" @click="goPublish">+ 发起竞标</view>
					</view>
					<!-- 统计卡片 -->
					<view class="stat-row mt30">
						<view class="stat-card">
							<view class="stat-num col4">{{ statData.bidding }}</view>
							<view class="fs22 col9 mt5">竞标中</view>
						</view>
						<view class="stat-card">
							<view class="stat-num" style="color: #52C41A;">{{ statData.completed }}</view>
							<view class="fs22 col9 mt5">已完成</view>
						</view>
						<view class="stat-card">
							<view class="stat-num col9">{{ statData.expired }}</view>
							<view class="fs22 col9 mt5">已过期</view>
						</view>
					</view>
				</view>

				<!-- Tab 筛选 -->
				<view class="tab-bar mb30">
					<view
						v-for="(tab, idx) in tabs"
						:key="idx"
						class="tab-item"
						:class="{ 'tab-active': activeTabIdx === idx }"
						@click="switchTab(idx)"
					>
						{{ tab.label }}
					</view>
				</view>

				<!-- 竞标列表 -->
				<view v-if="filteredList.length === 0" class="box tc ptb30">
					<view class="fs28 col9">暂无竞标记录</view>
					<view class="btn-empty mt20" @click="goPublish">去发起竞标</view>
				</view>

				<view
					v-for="(item, idx) in filteredList"
					:key="item.id"
					class="box mb30 bid-card"
					@click="onBidDetail(item)"
				>
					<!-- 头部：竞标编号 + 状态 -->
					<view class="flex-box flex-between flex-v-center mb20">
						<view class="fs24 col9">{{ item.bidSn }}</view>
						<view
							class="status-tag"
							:class="{
								'status-bidding': item.status === 1,
								'status-completed': item.status === 2,
								'status-expired': item.status === 3
							}"
						>{{ statusText(item.status) }}</view>
					</view>

					<!-- 需求信息 -->
					<view class="fs30 fwb col1 mb10">{{ item.categoryName }}</view>
					<view class="info-grid mb20">
						<view class="info-item">
							<view class="fs22 col9">需求数量</view>
							<view class="fs26 col1 mt5">{{ item.quantity }}{{ item.unit }}</view>
						</view>
						<view class="info-item">
							<view class="fs22 col9">期望交货</view>
							<view class="fs26 col1 mt5">{{ item.expectDelivery }}</view>
						</view>
						<view class="info-item">
							<view class="fs22 col9">目标佣金</view>
							<view class="fs26 col4 mt5">{{ item.targetCommission ? '¥' + item.targetCommission : '面议' }}</view>
						</view>
						<view class="info-item">
							<view class="fs22 col9">邀请工厂</view>
							<view class="fs26 col1 mt5">{{ item.factoryCount }}家</view>
						</view>
					</view>

					<!-- 报价进度 -->
					<view class="quote-progress mb15">
						<view class="flex-box flex-between flex-v-center mb10">
							<view class="fs24 col6">报价进度</view>
							<view class="fs24 col4">{{ item.quotedCount }}/{{ item.factoryCount }}</view>
						</view>
						<view class="progress-bar">
							<view class="progress-fill" :style="{ width: (item.quotedCount / item.factoryCount * 100) + '%' }"></view>
						</view>
					</view>

					<!-- 倒计时（竞标中时展示） -->
					<view v-if="item.status === 1 && item.remainTime > 0" class="countdown-row">
						<text class="fs22 col9">剩余时间：</text>
						<text class="fs24 col4 fwb">{{ formatCountdown(item.remainTime) }}</text>
					</view>

					<!-- 工厂报价列表（已有报价时展示） -->
					<view v-if="item.quotes && item.quotes.length > 0" class="quotes-section mt20">
						<view class="fs26 fwb col1 mb15">工厂报价</view>
						<view class="quote-table">
							<!-- 表头 -->
							<view class="quote-row quote-header">
								<view class="quote-cell flex2">工厂</view>
								<view class="quote-cell">合同价</view>
								<view class="quote-cell">交货时间</view>
								<view class="quote-cell">佣金</view>
								<view class="quote-cell">履约率</view>
							</view>
							<!-- 数据行 -->
							<view
								v-for="(q, qi) in item.quotes"
								:key="qi"
								class="quote-row"
								:class="{ 'quote-selected': q.selected }"
							>
								<view class="quote-cell flex2 fs24">
									<text>{{ q.factoryName }}</text>
									<view v-if="q.status === 0" class="mini-tag tag-waiting">待报价</view>
									<view v-else-if="q.status === 1" class="mini-tag tag-quoted">已报价</view>
									<view v-else class="mini-tag tag-expired">已过期</view>
								</view>
								<view class="quote-cell fs24" :class="{ 'col4': q.status === 1 }">
									{{ q.status === 1 ? '¥' + q.contractPrice : '-' }}
								</view>
								<view class="quote-cell fs24">
									{{ q.status === 1 ? q.deliveryDate : '-' }}
								</view>
								<view class="quote-cell fs24 col4">
									{{ q.status === 1 ? '¥' + q.commissionAmount : '-' }}
								</view>
								<view class="quote-cell fs24">
									{{ q.fulfillRate ? q.fulfillRate + '%' : '-' }}
								</view>
							</view>
						</view>

						<!-- 选定工厂按钮 -->
						<view v-if="item.status === 1 && item.quotedCount > 0" class="mt20">
							<view class="btn-select" @click.stop="onSelectFactory(item)">选定工厂</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// Mock 竞标数据
	const MOCK_BID_LIST = [
		{
			id: 1,
			bidSn: 'BID20260208001',
			categoryName: '高强度螺纹钢 HRB400',
			quantity: 500,
			unit: '吨',
			expectDelivery: '2026-03-01',
			targetCommission: 15000,
			factoryCount: 3,
			quotedCount: 2,
			status: 1,
			remainTime: 36 * 3600,
			createTime: '2026-02-08 10:00',
			buyerInfo: { companyName: '鑫盛建设集团', address: '上海市浦东新区', contactName: '张经理', contactPhone: '13800001111' },
			quotes: [
				{ factoryId: 101, factoryName: '鑫达钢铁有限公司', status: 1, contractPrice: 4280, deliveryDate: '2026-02-28', commissionAmount: 14980, fulfillRate: 96, selected: false },
				{ factoryId: 102, factoryName: '华北钢铁集团', status: 1, contractPrice: 4150, deliveryDate: '2026-03-05', commissionAmount: 14525, fulfillRate: 92, selected: false },
				{ factoryId: 103, factoryName: '中原特钢有限公司', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 88, selected: false }
			]
		},
		{
			id: 2,
			bidSn: 'BID20260207002',
			categoryName: '聚氯乙烯树脂 SG-5',
			quantity: 200,
			unit: '吨',
			expectDelivery: '2026-02-25',
			targetCommission: 8000,
			factoryCount: 2,
			quotedCount: 2,
			status: 2,
			remainTime: 0,
			createTime: '2026-02-07 14:30',
			buyerInfo: { companyName: '恒通化工科技', address: '江苏省南京市', contactName: '李总', contactPhone: '13900002222' },
			quotes: [
				{ factoryId: 201, factoryName: '齐鲁石化工业', status: 1, contractPrice: 6850, deliveryDate: '2026-02-22', commissionAmount: 8220, fulfillRate: 95, selected: true },
				{ factoryId: 202, factoryName: '长江化工集团', status: 1, contractPrice: 7100, deliveryDate: '2026-02-24', commissionAmount: 7810, fulfillRate: 90, selected: false }
			]
		},
		{
			id: 3,
			bidSn: 'BID20260205003',
			categoryName: 'CNC精密加工中心 VMC850',
			quantity: 5,
			unit: '台',
			expectDelivery: '2026-03-15',
			targetCommission: 0,
			factoryCount: 4,
			quotedCount: 1,
			status: 3,
			remainTime: 0,
			createTime: '2026-02-05 09:00',
			buyerInfo: { companyName: '精工机械制造', address: '广东省深圳市', contactName: '王工', contactPhone: '13700003333' },
			quotes: [
				{ factoryId: 301, factoryName: '沈阳机床集团', status: 1, contractPrice: 185000, deliveryDate: '2026-03-10', commissionAmount: 18500, fulfillRate: 94, selected: false },
				{ factoryId: 302, factoryName: '大连数控设备', status: 2, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 91, selected: false },
				{ factoryId: 303, factoryName: '济南重工机械', status: 2, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 87, selected: false },
				{ factoryId: 304, factoryName: '武汉精密制造', status: 2, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 93, selected: false }
			]
		},
		{
			id: 4,
			bidSn: 'BID20260208004',
			categoryName: '环氧树脂 E-51',
			quantity: 100,
			unit: '吨',
			expectDelivery: '2026-03-10',
			targetCommission: 12000,
			factoryCount: 5,
			quotedCount: 0,
			status: 1,
			remainTime: 68 * 3600,
			createTime: '2026-02-08 08:00',
			buyerInfo: { companyName: '新材料科技有限公司', address: '浙江省杭州市', contactName: '陈经理', contactPhone: '13600004444' },
			quotes: [
				{ factoryId: 401, factoryName: '蓝星化工研究院', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 97, selected: false },
				{ factoryId: 402, factoryName: '巴陵石化树脂', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 93, selected: false },
				{ factoryId: 403, factoryName: '南亚环氧科技', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 89, selected: false },
				{ factoryId: 404, factoryName: '黄山化工集团', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 91, selected: false },
				{ factoryId: 405, factoryName: '岳阳兴长石化', status: 0, contractPrice: 0, deliveryDate: '', commissionAmount: 0, fulfillRate: 86, selected: false }
			]
		}
	];

	export default {
		data() {
			return {
				activeTabIdx: 0,
				tabs: [
					{ label: '全部', status: 0 },
					{ label: '竞标中', status: 1 },
					{ label: '已完成', status: 2 },
					{ label: '已过期', status: 3 }
				],
				bidList: [],
				countdownTimer: null
			}
		},
		computed: {
			filteredList() {
				if (this.activeTabIdx === 0) return this.bidList;
				let status = this.tabs[this.activeTabIdx].status;
				return this.bidList.filter(item => item.status === status);
			},
			totalCount() {
				return this.bidList.length;
			},
			statData() {
				let bidding = 0, completed = 0, expired = 0;
				this.bidList.forEach(item => {
					if (item.status === 1) bidding++;
					else if (item.status === 2) completed++;
					else if (item.status === 3) expired++;
				});
				return { bidding, completed, expired };
			}
		},
		onLoad() {
			this.loadBidList();
		},
		onShow() {
			this.startCountdown();
		},
		onHide() {
			this.stopCountdown();
		},
		onUnload() {
			this.stopCountdown();
		},
		methods: {
			loadBidList() {
				this.$core.get({
					url: 'xiluxc.jj_bid/list',
					data: {},
					success: ret => {
						this.bidList = ret.data.list || [];
					},
					fail: () => {
						this.bidList = JSON.parse(JSON.stringify(MOCK_BID_LIST));
						return false;
					}
				});
			},
			switchTab(idx) {
				this.activeTabIdx = idx;
			},
			statusText(status) {
				const map = { 1: '竞标中', 2: '已完成', 3: '已过期' };
				return map[status] || '未知';
			},
			formatCountdown(seconds) {
				if (seconds <= 0) return '00:00:00';
				let h = Math.floor(seconds / 3600);
				let m = Math.floor((seconds % 3600) / 60);
				let s = seconds % 60;
				return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
			},
			startCountdown() {
				this.stopCountdown();
				this.countdownTimer = setInterval(() => {
					let changed = false;
					this.bidList.forEach(item => {
						if (item.status === 1 && item.remainTime > 0) {
							item.remainTime--;
							changed = true;
							if (item.remainTime <= 0) {
								item.status = 3;
							}
						}
					});
					if (!changed) this.stopCountdown();
				}, 1000);
			},
			stopCountdown() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer);
					this.countdownTimer = null;
				}
			},
			goPublish() {
				uni.navigateTo({ url: '/pages/jj/jj_bid_publish/jj_bid_publish' });
			},
			onBidDetail(item) {
				let param = encodeURIComponent(JSON.stringify(item));
				uni.navigateTo({
					url: '/pages/jj/jj_bid_detail/jj_bid_detail?bidId=' + item.id + '&param=' + param
				});
			},
			onSelectFactory(item) {
				let quotedList = item.quotes.filter(q => q.status === 1);
				if (quotedList.length === 0) {
					uni.showToast({ title: '暂无工厂报价', icon: 'none' });
					return;
				}
				// 弹窗选择工厂
				let names = quotedList.map(q => q.factoryName);
				uni.showActionSheet({
					itemList: names,
					success: res => {
						let selected = quotedList[res.tapIndex];
						uni.showModal({
							title: '确认选定',
							content: '选定「' + selected.factoryName + '」后将生成履约保证协议并进入保证金支付流程，是否确认？',
							success: modalRes => {
								if (modalRes.confirm) {
									this.confirmSelectFactory(item, selected);
								}
							}
						});
					}
				});
			},
			confirmSelectFactory(bid, factory) {
				this.$core.post({
					url: 'xiluxc.jj_bid/select_factory',
					data: {
						bid_id: bid.id,
						factory_id: factory.factoryId
					},
					success: ret => {
						uni.showToast({ title: '已选定工厂', icon: 'success' });
						bid.status = 2;
						bid.quotes.forEach(q => {
							q.selected = q.factoryId === factory.factoryId;
						});
						// 跳转保证金支付
						let param = encodeURIComponent(JSON.stringify({
							productName: bid.categoryName,
							coverImage: '/static/images/icon_upload_logo.png',
							companyName: bid.buyerInfo.companyName,
							commission: 0,
							commissionAmount: factory.commissionAmount,
							depositRate: 10,
							contractUploadHours: 24,
							executionHours: 72
						}));
						setTimeout(() => {
							uni.navigateTo({
								url: '/pages/jj/jj_deposit/jj_deposit?orderId=' + (ret.data.order_id || 'bid_' + bid.id) + '&param=' + param
							});
						}, 500);
					},
					fail: () => {
						// Mock 流程
						uni.showToast({ title: '已选定工厂', icon: 'success' });
						bid.status = 2;
						bid.quotes.forEach(q => {
							q.selected = q.factoryId === factory.factoryId;
						});
						let param = encodeURIComponent(JSON.stringify({
							productName: bid.categoryName,
							coverImage: '/static/images/icon_upload_logo.png',
							companyName: bid.buyerInfo.companyName,
							commission: 0,
							commissionAmount: factory.commissionAmount,
							depositRate: 10,
							contractUploadHours: 24,
							executionHours: 72
						}));
						setTimeout(() => {
							uni.navigateTo({
								url: '/pages/jj/jj_deposit/jj_deposit?orderId=bid_' + bid.id + '&param=' + param
							});
						}, 500);
						return false;
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-wrap {
		max-width: 750rpx;
		margin-left: auto;
		margin-right: auto;
		padding-bottom: 40rpx;
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	/* 发起竞标按钮 */
	.btn-publish {
		background: linear-gradient(135deg, #FE4B01, #FF7A45);
		color: #FFFFFF;
		font-size: 28rpx;
		font-weight: bold;
		padding: 16rpx 36rpx;
		border-radius: 38rpx;
		white-space: nowrap;
	}

	/* 统计行 */
	.stat-row {
		display: flex;
		gap: 20rpx;
	}

	.stat-card {
		flex: 1;
		text-align: center;
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 20rpx 10rpx;
	}

	.stat-num {
		font-size: 40rpx;
		font-weight: bold;
	}

	/* Tab 筛选栏 */
	.tab-bar {
		display: flex;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 6rpx;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		font-size: 28rpx;
		color: #666666;
		padding: 20rpx 0;
		border-radius: 16rpx;
		transition: all 0.25s;
	}

	.tab-active {
		background: #FE4B01;
		color: #FFFFFF;
		font-weight: bold;
	}

	/* 竞标卡片 */
	.bid-card {
		transition: box-shadow 0.2s;
	}

	.status-tag {
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
	}

	.status-bidding {
		background: rgba(64, 169, 255, 0.1);
		color: #40A9FF;
	}

	.status-completed {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.status-expired {
		background: rgba(153, 153, 153, 0.1);
		color: #999999;
	}

	/* 需求信息网格 */
	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16rpx;
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 20rpx;
	}

	.info-item {
		padding: 4rpx 0;
	}

	/* 报价进度 */
	.progress-bar {
		height: 12rpx;
		background: #F0F0F0;
		border-radius: 6rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #FE4B01, #FF7A45);
		border-radius: 6rpx;
		transition: width 0.3s;
	}

	/* 倒计时 */
	.countdown-row {
		background: #FFF7E6;
		border-radius: 8rpx;
		padding: 14rpx 20rpx;
		text-align: center;
	}

	/* 报价对比表 */
	.quote-table {
		border: 1rpx solid #EEEEEE;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.quote-row {
		display: flex;
		align-items: center;
		padding: 16rpx 12rpx;
		border-bottom: 1rpx solid #F5F5F5;
	}

	.quote-row:last-child {
		border-bottom: none;
	}

	.quote-header {
		background: #F5F7FB;
		font-size: 22rpx;
		color: #999999;
		font-weight: bold;
	}

	.quote-cell {
		flex: 1;
		text-align: center;
		font-size: 22rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.quote-cell.flex2 {
		flex: 2;
		text-align: left;
	}

	.quote-selected {
		background: rgba(254, 75, 1, 0.04);
		border-left: 4rpx solid #FE4B01;
	}

	.mini-tag {
		display: inline-block;
		font-size: 18rpx;
		padding: 2rpx 8rpx;
		border-radius: 4rpx;
		margin-left: 8rpx;
	}

	.tag-waiting {
		background: #FFF7E6;
		color: #FAAD14;
	}

	.tag-quoted {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.tag-expired {
		background: rgba(153, 153, 153, 0.1);
		color: #999999;
	}

	/* 选定工厂按钮 */
	.btn-select {
		background: #FE4B01;
		color: #FFFFFF;
		font-size: 30rpx;
		font-weight: bold;
		text-align: center;
		padding: 22rpx 0;
		border-radius: 38rpx;
	}

	/* 空状态按钮 */
	.btn-empty {
		display: inline-block;
		color: #FE4B01;
		font-size: 28rpx;
		border: 1rpx solid #FE4B01;
		padding: 12rpx 40rpx;
		border-radius: 30rpx;
	}

	/* PC 端适配 */
	@media screen and (min-width: 768px) {
		.page-wrap {
			max-width: 1200px;
			padding: 30px;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.btn-publish {
			font-size: 14px;
			padding: 10px 24px;
			cursor: pointer;
			transition: opacity 0.2s;
		}

		.btn-publish:hover {
			opacity: 0.85;
		}

		.tab-bar {
			border-radius: 12px;
			padding: 4px;
			margin-bottom: 20px;
		}

		.tab-item {
			font-size: 14px;
			padding: 12px 0;
			border-radius: 10px;
			cursor: pointer;
		}

		.bid-card {
			cursor: pointer;
		}

		.bid-card:hover {
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		}

		.stat-row {
			gap: 16px;
		}

		.stat-card {
			padding: 16px 10px;
			border-radius: 8px;
		}

		.stat-num {
			font-size: 28px;
		}

		.info-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;
			padding: 16px;
			border-radius: 8px;
		}

		.quote-row {
			padding: 12px;
		}

		.quote-cell {
			font-size: 13px;
		}

		.btn-select {
			font-size: 15px;
			padding: 14px 0;
			cursor: pointer;
			transition: opacity 0.2s;
		}

		.btn-select:hover {
			opacity: 0.85;
		}

		.btn-empty {
			cursor: pointer;
		}

		.btn-empty:hover {
			background: rgba(254, 75, 1, 0.05);
		}
	}
</style>
