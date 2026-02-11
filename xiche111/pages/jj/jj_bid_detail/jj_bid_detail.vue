<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 状态横幅 -->
				<view class="status-banner mb30" :class="'banner-status-' + bidInfo.status">
					<view class="fs30 fwb colf">{{ statusText(bidInfo.status) }}</view>
					<view class="fs24 mt8" style="color: rgba(255,255,255,0.8);">
						<text v-if="bidInfo.status === 1">竞标进行中，等待工厂报价</text>
						<text v-else-if="bidInfo.status === 2">已选定工厂，进入履约流程</text>
						<text v-else>竞标已过期，可重新发起</text>
					</view>
					<!-- 倒计时 -->
					<view v-if="bidInfo.status === 1 && bidInfo.remainTime > 0" class="countdown-box mt15">
						<text class="fs22" style="color: rgba(255,255,255,0.7);">剩余时间：</text>
						<text class="fs30 fwb colf">{{ formatCountdown(bidInfo.remainTime) }}</text>
					</view>
				</view>

				<!-- 竞标信息 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">竞标信息</view>
					<view class="info-grid">
						<view class="info-item">
							<view class="fs22 col9">竞标编号</view>
							<view class="fs26 col1 mt5">{{ bidInfo.bidSn }}</view>
						</view>
						<view class="info-item">
							<view class="fs22 col9">发起时间</view>
							<view class="fs26 col1 mt5">{{ bidInfo.createTime }}</view>
						</view>
						<view class="info-item">
							<view class="fs22 col9">产品品类</view>
							<view class="fs26 col1 mt5 fwb">{{ bidInfo.categoryName }}</view>
						</view>
						<view class="info-item">
							<view class="fs22 col9">需求数量</view>
							<view class="fs26 col1 mt5">{{ bidInfo.quantity }}{{ bidInfo.unit }}</view>
						</view>
						<view class="info-item">
							<view class="fs22 col9">期望交货</view>
							<view class="fs26 col1 mt5">{{ bidInfo.expectDelivery }}</view>
						</view>
						<view class="info-item">
							<view class="fs22 col9">目标佣金(单位:元)</view>
							<view class="fs26 col4 mt5">{{ bidInfo.targetCommission ? '¥' + formatPrice(bidInfo.targetCommission) : '面议' }}</view>
						</view>
					</view>
				</view>

				<!-- 报价进度 -->
				<view class="jj-box mb30">
					<view class="flex-box flex-between flex-v-center mb20">
						<view class="fs34 fwb col1 lh36">报价进度</view>
						<view class="fs26 col4 fwb">{{ bidInfo.quotedCount }}/{{ bidInfo.factoryCount }}</view>
					</view>
					<view class="progress-bar mb15">
						<view class="progress-fill" :style="{ width: quoteProgress + '%' }"></view>
					</view>
					<view class="flex-box flex-between">
						<view class="fs22 col9">已报价 {{ bidInfo.quotedCount }} 家</view>
						<view class="fs22 col9">共邀请 {{ bidInfo.factoryCount }} 家</view>
					</view>
				</view>

				<!-- 工厂报价对比 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">工厂报价对比</view>

					<view v-if="!bidInfo.quotes || bidInfo.quotes.length === 0" class="tc ptb30">
						<view class="fs28 col9">暂无工厂报价数据</view>
					</view>

					<!-- 报价卡片列表 -->
					<view v-for="(q, qi) in bidInfo.quotes" :key="qi" class="quote-card mb20"
						:class="{ 'quote-card-selected': q.selected, 'quote-card-quoted': q.status === 1, 'quote-card-pending': q.status === 0 }">
						<!-- 工厂名 + 状态 -->
						<view class="flex-box flex-between flex-v-center mb15">
							<view class="fs28 fwb col1">{{ q.factoryName }}</view>
							<view class="quote-status-tag" :class="{
								'tag-quoted': q.status === 1,
								'tag-waiting': q.status === 0,
								'tag-expired': q.status === 2
							}">
								<text v-if="q.status === 1">已报价</text>
								<text v-else-if="q.status === 0">待报价</text>
								<text v-else>已过期</text>
							</view>
						</view>

						<!-- 报价详情（已报价时） -->
						<view v-if="q.status === 1" class="quote-detail-grid">
							<view class="quote-detail-item">
								<view class="fs22 col9">合同价/单价(单位:元)</view>
								<view class="fs28 fwb col1 mt5">¥{{ formatPrice(q.contractPrice) }}</view>
							</view>
							<view class="quote-detail-item">
								<view class="fs22 col9">交货时间</view>
								<view class="fs28 col1 mt5">{{ q.deliveryDate }}</view>
							</view>
							<view class="quote-detail-item">
								<view class="fs22 col9">佣金总额(单位:元)</view>
								<view class="fs28 fwb col4 mt5">¥{{ formatPrice(q.commissionAmount) }}</view>
							</view>
							<view class="quote-detail-item">
								<view class="fs22 col9">历史履约率</view>
								<view class="fs28 mt5" :class="q.fulfillRate >= 90 ? 'col-green' : 'col-warn'">{{ q.fulfillRate }}%</view>
							</view>
						</view>

						<!-- 合同总价（已报价时） -->
						<view v-if="q.status === 1" class="total-price-row mt15">
							<text class="fs24 col9">合同总价/预估(单位:元)：</text>
							<text class="fs28 fwb col1">¥{{ formatPrice(q.contractPrice * bidInfo.quantity) }}</text>
						</view>

						<!-- 选中标记 -->
						<view v-if="q.selected" class="selected-mark">
							<text class="fs22 colf">已选定</text>
						</view>

						<!-- 未报价提示 -->
						<view v-if="q.status === 0" class="tc ptb20">
							<view class="fs26 col9">等待工厂报价中...</view>
							<view class="fs22 col9 mt5">履约率 {{ q.fulfillRate }}%</view>
						</view>

						<!-- 过期提示 -->
						<view v-if="q.status === 2" class="tc ptb20">
							<view class="fs26 col9">工厂未在规定时间内报价</view>
							<view class="fs22 col9 mt5">履约率 {{ q.fulfillRate }}%</view>
						</view>
					</view>
				</view>

				<!-- 买家信息 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">买家信息</view>
					<view class="buyer-info-list">
						<view class="buyer-row bb">
							<view class="fs24 col9">企业名称</view>
							<view class="fs26 col1 mt5">{{ bidInfo.buyerInfo.companyName }}</view>
						</view>
						<view class="buyer-row bb">
							<view class="fs24 col9">收货地址</view>
							<view class="fs26 col1 mt5">{{ bidInfo.buyerInfo.address }}</view>
						</view>
						<view class="buyer-row bb">
							<view class="fs24 col9">联系人</view>
							<view class="fs26 col1 mt5">{{ bidInfo.buyerInfo.contactName }}</view>
						</view>
						<view class="buyer-row">
							<view class="fs24 col9">联系电话</view>
							<view class="fs26 col1 mt5">{{ bidInfo.buyerInfo.contactPhone }}</view>
						</view>
					</view>
				</view>

				<!-- 操作按钮区 -->
				<view class="action-area mb30">
					<!-- 竞标中：选定工厂 -->
					<view v-if="bidInfo.status === 1 && bidInfo.quotedCount > 0"
						class="btn-primary" @click="onSelectFactory">选定工厂</view>
					<view v-if="bidInfo.status === 1 && bidInfo.quotedCount === 0"
						class="btn-disabled">等待工厂报价</view>

					<!-- 已完成：查看订单 -->
					<view v-if="bidInfo.status === 2"
						class="btn-primary" @click="onViewOrder">查看订单</view>

					<!-- 已过期：重新发起 -->
					<view v-if="bidInfo.status === 3"
						class="btn-primary" @click="onRepublish">重新发起竞标</view>

					<view class="btn-back mt20" @click="goBack">返回竞标看板</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	var mappers = require("../../../xilu/mappers.js");
	var countdownMixin = require("../../../xilu/countdown-mixin.js");

	export default {
		mixins: [countdownMixin],
		data() {
			return {
				bidId: '',
				bidInfo: {
					id: 0,
					bidSn: '',
					categoryName: '',
					quantity: 0,
					unit: '',
					expectDelivery: '',
					targetCommission: 0,
					factoryCount: 0,
					quotedCount: 0,
					status: 1,
					remainTime: 0,
					createTime: '',
					buyerInfo: { companyName: '', address: '', contactName: '', contactPhone: '' },
					quotes: []
				}
			}
		},
		computed: {
			quoteProgress() {
				if (!this.bidInfo.factoryCount) return 0;
				return Math.round(this.bidInfo.quotedCount / this.bidInfo.factoryCount * 100);
			}
		},
		onLoad(options) {
			this.bidId = options.bidId || '';
			// 尝试从 URL param 解析传入数据
			if (options.param) {
				try {
					let paramData = JSON.parse(decodeURIComponent(options.param));
					this.bidInfo = Object.assign(this.bidInfo, paramData);
				} catch (e) {}
			}
			this.loadDetail();
		},
		onShow() {
			this.startDetailCountdown();
		},
		methods: {
			startDetailCountdown() {
				if (this.bidInfo.status !== 1 || this.bidInfo.remainTime <= 0) return;
				this.countdownStart(() => {
					if (this.bidInfo.remainTime > 0) {
						this.bidInfo.remainTime--;
						if (this.bidInfo.remainTime <= 0) {
							this.bidInfo.status = 3;
							return true;
						}
						return false;
					}
					return true;
				});
			},

			loadDetail() {
				this.$core.get({
					url: 'xiluxc.jj_bid/detail',
					data: { bid_id: this.bidId },
					loading: true,
					success: ret => {
						let data = ret.data;
						if (data.quotes && Array.isArray(data.quotes)) {
							data.quotes = data.quotes.map(q => mappers.mapQuote(q));
						}
						this.bidInfo = Object.assign(this.bidInfo, data);
						this.startDetailCountdown();
					},
					fail: () => { return false; }
				});
			},

			statusText(status) {
				const map = { 1: '竞标中', 2: '已完成', 3: '已过期' };
				return map[status] || '未知';
			},

			onSelectFactory() {
				let quotedList = this.bidInfo.quotes.filter(q => q.status === 1);
				if (quotedList.length === 0) {
					uni.showToast({ title: '暂无工厂报价', icon: 'none' });
					return;
				}
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
									this.confirmSelectFactory(selected);
								}
							}
						});
					}
				});
			},

			confirmSelectFactory(factory) {
				this.$core.post({
					url: 'xiluxc.jj_bid/select_factory',
					data: {
						bid_id: this.bidInfo.id,
						factory_id: factory.factoryId
					},
					success: ret => {
						this.handleSelectSuccess(ret.data.order_id || 'bid_' + this.bidInfo.id, factory);
					},
					fail: () => {
						this.handleSelectSuccess('bid_' + this.bidInfo.id, factory);
						return false;
					}
				});
			},

			handleSelectSuccess(orderId, factory) {
				uni.showToast({ title: '已选定工厂', icon: 'success' });
				this.bidInfo.status = 2;
				this.bidInfo.quotes.forEach(q => {
					q.selected = q.factoryId === factory.factoryId;
				});
				this.countdownStop();
				let param = encodeURIComponent(JSON.stringify({
					productName: this.bidInfo.categoryName,
					coverImage: '/static/images/icon_upload_logo.png',
					companyName: this.bidInfo.buyerInfo.companyName,
					commission: 0,
					commissionAmount: factory.commissionAmount,
					depositRate: 10,
					contractUploadHours: 24,
					executionHours: 72
				}));
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/jj/jj_deposit/jj_deposit?orderId=' + orderId + '&param=' + param
					});
				}, 500);
			},

			onViewOrder() {
				let selectedFactory = this.bidInfo.quotes.find(q => q.selected);
				let param = encodeURIComponent(JSON.stringify({
					productName: this.bidInfo.categoryName,
					coverImage: '/static/images/icon_upload_logo.png',
					companyName: this.bidInfo.buyerInfo.companyName,
					commissionAmount: selectedFactory ? selectedFactory.commissionAmount : 0,
					status: 4
				}));
				uni.navigateTo({
					url: '/pages/jj/jj_order_detail/jj_order_detail?orderId=bid_' + this.bidInfo.id + '&param=' + param
				});
			},

			onRepublish() {
				uni.navigateTo({ url: '/pages/jj/jj_bid_publish/jj_bid_publish' });
			},

			goBack() {
				uni.navigateBack();
			},

			formatCountdown(seconds) {
				if (!seconds || seconds <= 0) return '已结束';
				let h = Math.floor(seconds / 3600);
				let m = Math.floor((seconds % 3600) / 60);
				let s = seconds % 60;
				let parts = [];
				if (h > 0) parts.push(h + '时');
				if (m > 0 || h > 0) parts.push((m < 10 && h > 0 ? '0' : '') + m + '分');
				parts.push((s < 10 ? '0' : '') + s + '秒');
				return parts.join('');
			},

			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.colf { color: #FFFFFF; }
	.col-green { color: #52C41A; }
	.col-warn { color: #FAAD14; }

	/* 状态横幅 */
	.status-banner {
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
	}

	.banner-status-1 {
		background: linear-gradient(135deg, #40A9FF, #69C0FF);
	}

	.banner-status-2 {
		background: linear-gradient(135deg, #52C41A, #73D13D);
	}

	.banner-status-3 {
		background: linear-gradient(135deg, #8C8C8C, #BFBFBF);
	}

	.countdown-box {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12rpx;
		padding: 16rpx 24rpx;
		display: inline-flex;
		align-items: center;
		gap: 8rpx;
	}

	/* 信息网格 */
	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 24rpx;
	}

	/* 报价进度 */
	.progress-bar {
		height: 16rpx;
		background: #F0F0F0;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #FE4B01, #FF7A45);
		border-radius: 8rpx;
		transition: width 0.3s;
	}

	/* 报价卡片 */
	.quote-card {
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 24rpx;
		border: 2rpx solid #F0F0F0;
		position: relative;
		overflow: hidden;
	}

	.quote-card-selected {
		border-color: #FE4B01;
		background: rgba(254, 75, 1, 0.02);
	}

	.quote-card-quoted {
		border-color: #D9F7BE;
	}

	.quote-status-tag {
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
	}

	.tag-quoted {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.tag-waiting {
		background: #FFF7E6;
		color: #FAAD14;
	}

	.tag-expired {
		background: rgba(153, 153, 153, 0.1);
		color: #999999;
	}

	.quote-detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16rpx;
	}

	.quote-detail-item {
		background: #FFFFFF;
		border-radius: 10rpx;
		padding: 16rpx;
	}

	.total-price-row {
		background: #FFFFFF;
		border-radius: 10rpx;
		padding: 16rpx;
		text-align: center;
	}

	.selected-mark {
		position: absolute;
		top: 0;
		right: 0;
		background: #FE4B01;
		padding: 6rpx 20rpx;
		border-radius: 0 14rpx 0 14rpx;
	}

	/* 买家信息 */
	.buyer-row {
		padding: 20rpx 0;
	}

	/* 操作按钮 */
	.action-area {
		padding: 0 10rpx;
	}

	.btn-primary {
		background: linear-gradient(135deg, #FE4B01, #FF7A45);
		color: #FFFFFF;
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		padding: 26rpx 0;
		border-radius: 44rpx;
	}

	.btn-disabled {
		background: #E8E8E8;
		color: #999999;
		font-size: 32rpx;
		text-align: center;
		padding: 26rpx 0;
		border-radius: 44rpx;
	}

	.btn-back {
		background: #F5F7FB;
		color: #666666;
		font-size: 28rpx;
		text-align: center;
		padding: 22rpx 0;
		border-radius: 44rpx;
	}

	/* PC 端适配 */
	@media screen and (min-width: 768px) {
		.status-banner {
			padding: 32px 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.info-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 16px;
			padding: 20px;
			border-radius: 8px;
		}

		.quote-card {
			padding: 20px;
			border-radius: 12px;
			margin-bottom: 16px;
			transition: box-shadow 0.2s;
		}

		.quote-card:hover {
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		}

		.quote-detail-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;
		}

		.quote-detail-item {
			padding: 12px;
			border-radius: 8px;
		}

		.buyer-row {
			padding: 14px 0;
		}

		.btn-primary {
			font-size: 16px;
			padding: 16px 0;
			cursor: pointer;
			transition: opacity 0.2s;
		}

		.btn-primary:hover {
			opacity: 0.85;
		}

		.btn-disabled {
			font-size: 16px;
			padding: 16px 0;
		}

		.btn-back {
			font-size: 14px;
			padding: 14px 0;
			cursor: pointer;
			transition: background 0.2s;
		}

		.btn-back:hover {
			background: #EAEDF3;
		}

		.action-area {
			margin-bottom: 20px;
		}
	}
</style>
