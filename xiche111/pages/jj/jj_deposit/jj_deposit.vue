<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" :class="{ disabled: !isAgree || paying }" @click="onPay()">缴纳保证金</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 单订单模式 -->
				<template v-if="!isBatch">
					<!-- 订单摘要 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">订单信息</view>
						<view class="flex-box">
							<image :src="orderInfo.coverImage" mode="aspectFill" class="product-thumb"></image>
							<view class="flex-grow-1 ml20">
								<view class="fs28 fwb col1 m-ellipsis">{{ orderInfo.productName }}</view>
								<view class="mt10 fs24 col9">厂商：{{ orderInfo.factoryName }}</view>
							</view>
						</view>
						<view class="detail-row flex-box bb mt10">
							<view class="col5 fs28">商品单价</view>
							<view class="flex-grow-1 tr fs28 col1">¥{{ orderInfo.unitPrice }}</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">商品数量</view>
							<view class="flex-grow-1 tr fs28 col1">{{ orderInfo.quantity }}</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">商品总价</view>
							<view class="flex-grow-1 tr fs28 fwb col1">¥{{ orderInfo.totalAmount }}</view>
						</view>
						<view class="detail-row flex-box">
							<view class="col5 fs28">佣金比例</view>
							<view class="flex-grow-1 tr fs28 col4">{{ orderInfo.commission }}%</view>
						</view>
					</view>

					<!-- 保证金金额 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">保证金明细</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">锁定佣金(单位:元)</view>
							<view class="flex-grow-1 tr fs28 col1">¥{{ formatPrice(orderInfo.commissionAmount) }}</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">保证金比例</view>
							<view class="flex-grow-1 tr fs28 col1">{{ orderInfo.depositRate }}%</view>
						</view>
						<view class="detail-row flex-box">
							<view class="col5 fs28 fwb">应缴保证金(单位:元)</view>
							<view class="flex-grow-1 tr">
								<text class="fs24 col4">¥</text>
								<text class="fs36 fwb col4">{{ formatPrice(depositAmount) }}</text>
							</view>
						</view>
					</view>
				</template>

				<!-- 批量模式 -->
				<template v-else>
					<!-- 订单列表 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">订单信息 <text class="fs24 col9">({{ batchItems.length }}笔订单)</text></view>
						<view class="batch-order-item" :class="{ bb: idx < batchItems.length - 1 }" v-for="(item, idx) in batchItems" :key="idx">
							<view class="flex-box">
								<view class="flex-grow-1">
									<view class="fs28 fwb col1 m-ellipsis">{{ item.product_name }}</view>
									<view class="fs24 col9 mt6">¥{{ formatPrice(item.unit_price) }} x{{ item.quantity }}</view>
								</view>
								<view class="tr ml15">
									<view class="fs24 col5">合同金额</view>
									<view class="fs26 fwb col1 mt4">¥{{ formatPrice(item.total_amount) }}</view>
								</view>
							</view>
							<view class="flex-box mt10">
								<view class="fs22 col9">佣金: ¥{{ formatPrice(item.commission_amount) }}</view>
								<view class="fs22 col9 ml20">保证金比例: {{ item.deposit_rate }}%</view>
								<view class="fs22 col4 ml20">保证金: ¥{{ formatPrice(item.deposit_amount) }}</view>
							</view>
						</view>
					</view>

					<!-- 金额汇总 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">金额汇总</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">订单数量</view>
							<view class="flex-grow-1 tr fs28 col1">{{ batchItems.length }}笔</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">合同金额合计(单位:元)</view>
							<view class="flex-grow-1 tr fs28 col1">¥{{ formatPrice(batchTotalContract) }}</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">佣金合计(单位:元)</view>
							<view class="flex-grow-1 tr fs28 col1">¥{{ formatPrice(batchTotalCommission) }}</view>
						</view>
						<view class="detail-row flex-box">
							<view class="col5 fs28 fwb">应缴保证金合计(单位:元)</view>
							<view class="flex-grow-1 tr">
								<text class="fs24 col4">¥</text>
								<text class="fs36 fwb col4">{{ formatPrice(batchTotalDeposit) }}</text>
							</view>
						</view>
					</view>
				</template>

				<!-- 支付方式 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">支付方式</view>
					<view class="pay-option flex-box bb" :class="{ active: payType === 'wxpay' }" @click="payType = 'wxpay'">
						<image src="/static/icon/icon_pay2.png" mode="aspectFill" class="pay-ico"></image>
						<view class="flex-grow-1 pl20 fs28 col1">微信支付</view>
						<image :src="'/static/icon/'+(payType === 'wxpay' ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="pay-check-ico"></image>
						<image v-if="payType === 'wxpay'" src="/static/icon/icon_true.png" mode="aspectFill" class="check-ico"></image>
					</view>
					<view class="pay-option flex-box" :class="{ active: payType === 'alipay' }" @click="payType = 'alipay'">
						<image src="/static/icon/icon_pay1.png" mode="aspectFill" class="pay-ico"></image>
						<view class="flex-grow-1 pl20 fs28 col1">支付宝支付</view>
						<image :src="'/static/icon/'+(payType === 'alipay' ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="pay-check-ico"></image>
						<image v-if="payType === 'alipay'" src="/static/icon/icon_true.png" mode="aspectFill" class="check-ico"></image>
					</view>
				</view>

				<!-- 履约保证协议 -->
				<view class="flex-box flex-center fs26 col6 mb30 flex-wrap">
					<image @click="isAgree = !isAgree" :src="'/static/icon/'+(isAgree ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="agree-ico mr10"></image>
					<view>我已阅读并同意</view>
					<view class="col4" @click="openAgreement('deposit_rule')">《履约保证协议》</view>
				</view>

				<!-- 提示信息 -->
				<view class="tip-box mb30">
					<view class="fs24 col9 lh40">
						<text class="fwb">温馨提示：</text>
						保证金将冻结至托管账户，履约完成后全额退还。逾期未上传合同，保证金将自动划转给工厂。
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// #ifdef H5
	var jweixin = require('@/xilu/jweixin.js');
	// #endif
	export default {
		data() {
			return {
				orderId: '',
				batchId: '',
				isBatch: false,
				orderInfo: {
					productName: '',
					coverImage: '/static/images/icon_upload_logo.png',
					factoryName: '',
					unitPrice: '0.00',
					quantity: 0,
					totalAmount: '0.00',
					commission: 0,
					commissionAmount: 0,
					depositRate: 0,
					depositAmount: 0,
					contractUploadHours: 0,
					executionHours: 72
				},
				batchItems: [],
				batchTotalDeposit: 0,
				payType: 'wxpay',
				isAgree: false,
				paying: false
			}
		},
		computed: {
			depositAmount() {
				return Number(this.orderInfo.depositAmount) || 0;
			},
			batchTotalContract() {
				let total = 0;
				this.batchItems.forEach(i => { total += Number(i.total_amount) || 0; });
				return total;
			},
			batchTotalCommission() {
				let total = 0;
				this.batchItems.forEach(i => { total += Number(i.commission_amount) || 0; });
				return total;
			}
		},
		onLoad(options) {
			const userinfo = this.$core.getUserinfo();
			if (!userinfo || !userinfo.token) {
				uni.redirectTo({ url: '/pages/login/login' });
				return;
			}
			if (options.batchId) {
				this.batchId = options.batchId;
				this.isBatch = true;
				this.loadBatchInfo();
			} else {
				if (options.orderId) {
					this.orderId = options.orderId;
				}
				if (options.param) {
					try {
						let param = JSON.parse(decodeURIComponent(options.param));
						this.orderInfo = Object.assign(this.orderInfo, param);
					} catch (e) {
						console.log('param parse error', e);
					}
				}
				this.loadOrderInfo();
			}
		},
		methods: {
			loadOrderInfo() {
				if (!this.orderId) return;
				this.$core.get({
					url: 'xiluxc.jj_order/deposit_info',
					data: { order_id: this.orderId },
					loading: false,
					success: ret => {
						this.orderInfo = Object.assign(this.orderInfo, ret.data);
					},
					fail: () => {
						return false;
					}
				});
			},
			loadBatchInfo() {
				if (!this.batchId) return;
				this.$core.get({
					url: 'xiluxc.jj_order/batch_deposit_info',
					data: { batch_id: this.batchId },
					loading: true,
					success: ret => {
						let d = ret.data;
						this.batchItems = d.items || [];
						this.batchTotalDeposit = Number(d.total_amount) || 0;
					},
					fail: () => {
						return false;
					}
				});
			},
			onPay() {
				if (!this.isAgree) {
					uni.showToast({ title: '请同意《履约保证协议》', icon: 'none' });
					return;
				}
				if (this.paying) return;
				this.paying = true;

				if (this.isBatch) {
					this.doBatchPay();
				} else {
					this.doSinglePay();
				}
			},
			doSinglePay() {
				this.$core.post({
					url: 'xiluxc.jj_order/pay_deposit',
					data: {
						order_id: this.orderId,
						pay_type: this.payType === 'wxpay' ? 1 : 2
					},
					success: ret => {
						if (ret.data && ret.data.mock_paid) {
							this.onPaySuccess();
							return;
						}
						if (this.payType === 'wxpay') {
							this.wxPay(ret.data);
						} else {
							this.onPaySuccess();
						}
					},
					fail: err => {
						this.paying = false;
						return false;
					}
				});
			},
			doBatchPay() {
				this.$core.post({
					url: 'xiluxc.jj_order/pay_batch_deposit',
					data: {
						batch_id: this.batchId,
						pay_type: this.payType === 'wxpay' ? 1 : 2
					},
					success: ret => {
						if (ret.data && ret.data.mock_paid) {
							this.onBatchPaySuccess(ret.data);
							return;
						}
						if (this.payType === 'wxpay') {
							this.wxPay(ret.data, true);
						} else {
							this.onBatchPaySuccess(ret.data);
						}
					},
					fail: err => {
						this.paying = false;
						return false;
					}
				});
			},
			wxPay(wxconfig, isBatch) {
				let page = this;
				let onSuccess = isBatch ? function() { page.onBatchPaySuccess(wxconfig); } : function() { page.onPaySuccess(); };
				// #ifdef MP-WEIXIN
				this.$core.payment(wxconfig, onSuccess, function() {
					page.paying = false;
				});
				// #endif
				// #ifdef H5
				jweixin.config({
					debug: false,
					appId: wxconfig.appId,
					timestamp: wxconfig.timeStamp,
					nonceStr: wxconfig.nonceStr,
					signature: wxconfig.paySign,
					jsApiList: ['chooseWXPay']
				});
				jweixin.ready(function() {
					jweixin.chooseWXPay({
						timestamp: wxconfig.timeStamp,
						nonceStr: wxconfig.nonceStr,
						package: wxconfig.package,
						signType: wxconfig.signType,
						paySign: wxconfig.paySign,
						success: onSuccess,
						cancel: function() {
							page.paying = false;
							uni.showToast({ title: '取消支付', icon: 'none' });
						},
						fail: function() {
							page.paying = false;
							uni.showToast({ title: '支付失败', icon: 'none' });
						}
					});
				});
				// #endif
			},
			onPaySuccess() {
				this.paying = false;
				uni.showModal({
					title: '提示',
					content: '保证金缴纳成功！已冻结至托管账户，请尽快上传合同。',
					showCancel: false,
					success() {
						uni.navigateBack();
					}
				});
			},
			onBatchPaySuccess(data) {
				this.paying = false;
				let orderCount = data.order_count || this.batchItems.length;
				// 批量支付成功后跳转到订单列表页
				uni.showModal({
					title: '提示',
					content: orderCount + '笔订单保证金缴纳成功！已冻结至托管账户，请尽快上传合同。',
					showCancel: false,
					success() {
						// 跳转到居间人订单列表（待上传合同状态）
						uni.redirectTo({ url: '/pages/jj/jj_main/jj_main?tab=orders&status=3' });
					}
				});
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.product-thumb {
		width: 140rpx;
		height: 140rpx;
		border-radius: 15rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	.detail-row {
		padding: 24rpx 0;
	}

	.batch-order-item {
		padding: 24rpx 0;
	}

	.pay-option {
		padding: 28rpx 0;
		position: relative;

		&.active {
			color: #FE4B01;
		}
	}

	.pay-ico {
		width: 50rpx;
		height: 50rpx;
		flex-shrink: 0;
	}

	.pay-check-ico {
		width: 38rpx;
		height: 38rpx;
		flex-shrink: 0;
		margin-right: 15rpx;
	}

	.check-ico {
		width: 35rpx;
		height: 35rpx;
		flex-shrink: 0;
	}

	.agree-ico {
		width: 38rpx;
		height: 38rpx;
		border-radius: 50%;
	}

	.tip-box {
		background: #FFFBE6;
		border-radius: 12rpx;
		padding: 24rpx;
		border-left: 6rpx solid #FAAD14;
	}

	.foot_nav {
		padding: 10rpx 30rpx;

		.disabled {
			opacity: 0.5;
		}
	}

	/* PC 端适配 */
	@media screen and (min-width: 768px) {
		.detail-row {
			padding: 16px 0;
		}

		.batch-order-item {
			padding: 16px 0;
		}

		.pay-option {
			padding: 18px 0;
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}

		.foot_nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}

		.agree-ico {
			cursor: pointer;
		}

		.tip-box {
			border-radius: 8px;
			padding: 16px;
		}
	}

	@supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
		.container {
			padding-bottom: calc(130rpx + 68rpx);
			padding-bottom: calc(constant(safe-area-inset-bottom) + 130rpx);
			padding-bottom: calc(env(safe-area-inset-bottom) + 130rpx);
		}
	}
</style>
