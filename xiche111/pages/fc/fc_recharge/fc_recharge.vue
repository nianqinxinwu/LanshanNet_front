<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" @click="onRecharge">确认充值</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 当前余额 -->
				<view class="balance-info mb30">
					<view class="fs24 col9">当前可用余额</view>
					<view class="fs40 fwb col1 mt10">¥{{ currentBalance }}</view>
				</view>

				<!-- 快捷金额 -->
				<view class="jj-box mb30">
					<view class="fs30 fwb col1 lh36 mb20">选择充值金额</view>
					<view class="amount-grid">
						<view class="amount-item" :class="{ active: selectedAmount === item }"
							v-for="(item, index) in quickAmounts" :key="index" @click="selectAmount(item)">
							¥{{ item }}
						</view>
					</view>
				</view>

				<!-- 自定义金额 -->
				<view class="jj-box mb30">
					<view class="fs30 fwb col1 lh36 mb20">自定义金额</view>
					<view class="inp_nav flex-box col1 fs30">
						<view class="col5">¥</view>
						<input type="digit" class="flex-grow-1 ml10" v-model="customAmount" placeholder="请输入充值金额(最低1元)"
							placeholder-class="cola" @input="onCustomInput" />
					</view>
				</view>

				<!-- 充值金额确认 -->
				<view class="jj-box mb30" v-if="finalAmount > 0">
					<view class="flex-box">
						<view class="fs28 col5">充值金额</view>
						<view class="flex-grow-1 tr fs34 fwb col4">¥{{ finalAmount.toFixed(2) }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentBalance: '0.00',
				quickAmounts: [100, 500, 1000, 5000, 10000],
				selectedAmount: 0,
				customAmount: ''
			}
		},
		computed: {
			finalAmount() {
				if (this.customAmount && Number(this.customAmount) > 0) {
					return Number(this.customAmount);
				}
				return this.selectedAmount;
			}
		},
		onLoad() {
			this.loadBalance();
		},
		methods: {
			loadBalance() {
				this.$core.get({
					url: 'xiluxc.fc_wallet/balance',
					loading: false,
					success: ret => {
						this.currentBalance = ret.data.money || '0.00';
					}
				});
			},
			selectAmount(amount) {
				this.selectedAmount = amount;
				this.customAmount = '';
			},
			onCustomInput() {
				if (this.customAmount) {
					this.selectedAmount = 0;
				}
			},
			onRecharge() {
				if (this.finalAmount < 1) {
					uni.showToast({ title: '请选择或输入充值金额(最低1元)', icon: 'none' });
					return;
				}

				let platform = 'wxmini';
				// #ifdef H5
				platform = 'wxoffical';
				// #endif

				// #ifdef H5
				this.rechargeH5(platform);
				// #endif
				// #ifdef MP-WEIXIN
				this.rechargeMini(platform);
				// #endif
			},
			rechargeH5(platform) {
				// H5端需要先获取openid
				this.$core.post({
					url: 'xiluxc.fc_wallet/create_recharge',
					data: {
						amount: this.finalAmount,
						platform: platform,
						openid: this.$core.getOpenid ? this.$core.getOpenid() : ''
					},
					success: ret => {
						if (ret.data && ret.data.mock_paid) {
							uni.showToast({ title: '充值成功', icon: 'success' });
							setTimeout(() => { uni.navigateBack(); }, 1500);
							return;
						}
						if (ret.data) {
							this.$core.wechatPay(ret.data, () => {
								uni.showToast({ title: '充值成功', icon: 'success' });
								setTimeout(() => { uni.navigateBack(); }, 1500);
							});
						}
					}
				});
			},
			rechargeMini(platform) {
				this.$core.post({
					url: 'xiluxc.fc_wallet/create_recharge',
					data: {
						amount: this.finalAmount,
						platform: platform
					},
					success: ret => {
						if (ret.data && ret.data.mock_paid) {
							uni.showToast({ title: '充值成功', icon: 'success' });
							setTimeout(() => { uni.navigateBack(); }, 1500);
							return;
						}
						if (ret.data) {
							uni.requestPayment({
								...ret.data,
								success: () => {
									uni.showToast({ title: '充值成功', icon: 'success' });
									setTimeout(() => { uni.navigateBack(); }, 1500);
								},
								fail: (err) => {
									if (err.errMsg !== 'requestPayment:fail cancel') {
										uni.showToast({ title: '支付失败', icon: 'none' });
									}
								}
							});
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.balance-info {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
		color: #FFFFFF;

		.col9 {
			color: rgba(255, 255, 255, 0.8) !important;
		}

		.col1 {
			color: #FFFFFF !important;
		}
	}

	.amount-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
	}

	.amount-item {
		text-align: center;
		background: #F5F7FB;
		border-radius: 15rpx;
		padding: 30rpx 0;
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		cursor: pointer;
		border: 2rpx solid transparent;

		&.active {
			border-color: #FE4B01;
			color: #FE4B01;
			background: rgba(254, 75, 1, 0.05);
		}
	}

	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;
		border-bottom: 1rpx solid #F0F0F0;
	}

	.foot_nav {
		padding: 10rpx 30rpx;
	}

	@supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
		.container {
			padding-bottom: calc(130rpx + 68rpx);
			padding-bottom: calc(constant(safe-area-inset-bottom) + 130rpx);
			padding-bottom: calc(env(safe-area-inset-bottom) + 130rpx);
		}
	}

	@media screen and (min-width: 768px) {
		.balance-info {
			padding: 30px 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.amount-grid {
			grid-template-columns: repeat(5, 1fr);
			gap: 16px;
		}

		.amount-item {
			padding: 20px 0;
			font-size: 18px;
			border-radius: 8px;
			transition: all 0.2s;

			&:hover {
				border-color: #FE4B01;
			}
		}

		.inp_nav {
			height: auto;
			padding: 14px 0;
		}

		.foot_nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}
	}
</style>
