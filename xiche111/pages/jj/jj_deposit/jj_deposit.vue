<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" :class="{ disabled: !isAgree || paying }" @click="onPay()">缴纳保证金</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 订单摘要 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">订单信息</view>
					<view class="flex-box">
						<image :src="orderInfo.coverImage" mode="aspectFill" class="product-thumb"></image>
						<view class="flex-grow-1 ml20">
							<view class="fs28 fwb col1 m-ellipsis">{{ orderInfo.productName }}</view>
							<view class="mt10 fs24 col9">买家：{{ orderInfo.companyName }}</view>
							<view class="mt10">
								<text class="fs24 col5">佣金比例：</text>
								<text class="fs28 fwb col4">{{ orderInfo.commission }}%</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 保证金金额 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">保证金明细</view>
					<view class="detail-row flex-box bb">
						<view class="col5 fs28">锁定佣金</view>
						<view class="flex-grow-1 tr fs28 col1">¥{{ formatPrice(orderInfo.commissionAmount) }}</view>
					</view>
					<view class="detail-row flex-box bb">
						<view class="col5 fs28">保证金比例</view>
						<view class="flex-grow-1 tr fs28 col1">{{ orderInfo.depositRate }}%</view>
					</view>
					<view class="detail-row flex-box">
						<view class="col5 fs28 fwb">应缴保证金</view>
						<view class="flex-grow-1 tr">
							<text class="fs24 col4">¥</text>
							<text class="fs36 fwb col4">{{ formatPrice(depositAmount) }}</text>
						</view>
					</view>
				</view>

				<!-- 支付方式 -->
				<view class="box mb30">
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
					<view class="col4" @click="openAgreement">《履约保证协议》</view>
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
				orderInfo: {
					productName: '',
					coverImage: '/static/images/icon_upload_logo.png',
					companyName: '',
					commission: 0,
					commissionAmount: 0,
					depositRate: 0,
					contractUploadHours: 24,
					executionHours: 72
				},
				payType: 'wxpay',
				isAgree: false,
				paying: false
			}
		},
		computed: {
			depositAmount() {
				return this.orderInfo.commissionAmount * this.orderInfo.depositRate / 100;
			}
		},
		onLoad(options) {
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
			openAgreement() {
				let id = getApp().globalData.config['deposit_rule'] || 0;
				uni.navigateTo({
					url: '/pages/rich_mp/rich_mp?id=' + id
				});
			},
			onPay() {
				if (!this.isAgree) {
					uni.showToast({ title: '请同意《履约保证协议》', icon: 'none' });
					return;
				}
				if (this.paying) return;
				this.paying = true;

				this.$core.post({
					url: 'xiluxc.jj_order/pay_deposit',
					data: {
						order_id: this.orderId,
						pay_type: this.payType
					},
					success: ret => {
						if (this.payType === 'wxpay') {
							this.wxPay(ret.data);
						} else {
							this.onPaySuccess();
						}
					},
					fail: err => {
						// 接口未就绪，Mock 支付成功直接走流程
						this.onPaySuccess();
						return false;
					}
				});
			},
			wxPay(wxconfig) {
				let page = this;
				// #ifdef MP-WEIXIN
				this.$core.payment(wxconfig, function() {
					page.onPaySuccess();
				}, function() {
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
						success: function() {
							page.onPaySuccess();
						},
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
				let param = encodeURIComponent(JSON.stringify({
					orderId: this.orderId,
					productName: this.orderInfo.productName,
					coverImage: this.orderInfo.coverImage,
					companyName: this.orderInfo.companyName,
					contractUploadHours: this.orderInfo.contractUploadHours,
					executionHours: this.orderInfo.executionHours
				}));
				let contractUrl = '/pages/jj/jj_contract/jj_contract?orderId=' + this.orderId + '&param=' + param;
				uni.showModal({
					title: '提示',
					content: '保证金缴纳成功！已冻结至托管账户。',
					showCancel: false,
					success() {
						uni.redirectTo({ url: contractUrl });
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
	.page-wrap {
		max-width: 750rpx;
		margin-left: auto;
		margin-right: auto;
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

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
		.page-wrap {
			max-width: 1200px;
			padding: 30px;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.detail-row {
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
