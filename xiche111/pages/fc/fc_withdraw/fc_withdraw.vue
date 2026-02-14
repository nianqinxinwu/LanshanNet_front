<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" @click="onSubmit">确认提现</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 可用余额 -->
				<view class="balance-info mb30">
					<view class="fs24 col9">可用余额</view>
					<view class="fs40 fwb col1 mt10">¥{{ currentBalance }}</view>
				</view>

				<!-- 提现金额 -->
				<view class="jj-box mb30">
					<view class="fs30 fwb col1 lh36 mb20">提现金额</view>
					<view class="inp_nav flex-box col1 fs30">
						<view class="col5">¥</view>
						<input type="digit" class="flex-grow-1 ml10" v-model="amount"
							placeholder="请输入提现金额" placeholder-class="cola" />
					</view>
					<view class="fs22 col9 mt16" @click="fillAll">全部提现</view>
				</view>

				<!-- 银行账户选择 -->
				<view class="jj-box mb30">
					<view class="fs30 fwb col1 lh36 mb20">提现到</view>
					<view v-if="selectedBank" class="bank-selected" @click="openBankPicker">
						<view class="fs28 col1 fwb">{{ selectedBank.account_name }}</view>
						<view class="fs24 col9 mt6">{{ selectedBank.bank_name }} {{ selectedBank.bank_branch }}</view>
						<view class="fs26 col5 mt6">{{ maskBankNo(selectedBank.bank_no) }}</view>
						<view class="fs22 col4 mt6">点击切换 ></view>
					</view>
					<view v-else class="bank-empty" @click="goBankManage">
						<view class="fs28 col9">请先添加对公账户</view>
						<view class="fs24 col4 mt6">去添加 ></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 银行账户选择弹窗 -->
		<uni-popup ref="bankPopup" type="bottom">
			<view class="popup-content">
				<view class="popup-header flex-box">
					<view class="fs30 fwb col1">选择账户</view>
					<view class="fs28 col9" @click="closeBankPicker">关闭</view>
				</view>
				<view class="bank-option" v-for="(item, index) in bankList" :key="index"
					:class="{ active: selectedBank && selectedBank.id === item.id }" @click="selectBank(item)">
					<view class="fs28 col1 fwb">{{ item.account_name }}</view>
					<view class="fs24 col9 mt6">{{ item.bank_name }} {{ item.bank_branch }}</view>
					<view class="fs26 col5 mt6">{{ maskBankNo(item.bank_no) }}</view>
					<view class="default-tag" v-if="item.is_default">默认</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentBalance: '0.00',
				rawBalance: 0,
				amount: '',
				bankList: [],
				selectedBank: null
			}
		},
		onLoad() {
			this.loadBalance();
			this.loadBanks();
		},
		methods: {
			loadBalance() {
				this.$core.get({
					url: 'xiluxc.fc_wallet/balance',
					loading: false,
					success: ret => {
						this.currentBalance = ret.data.money || '0.00';
						this.rawBalance = parseFloat(String(ret.data.money).replace(/,/g, '')) || 0;
					}
				});
			},
			loadBanks() {
				this.$core.get({
					url: 'xiluxc.fc_wallet/bank_account_list',
					loading: false,
					success: ret => {
						this.bankList = ret.data.list || [];
						// 默认选中默认账户
						if (this.bankList.length > 0) {
							let def = this.bankList.find(b => b.is_default);
							this.selectedBank = def || this.bankList[0];
						}
					}
				});
			},
			maskBankNo(no) {
				if (!no || no.length <= 4) return no;
				return '****  ****  ****  ' + no.slice(-4);
			},
			fillAll() {
				this.amount = String(this.rawBalance);
			},
			openBankPicker() {
				this.$refs.bankPopup.open('bottom');
			},
			selectBank(item) {
				this.selectedBank = item;
				this.$refs.bankPopup.close();
			},
			closeBankPicker() {
				this.$refs.bankPopup.close();
			},
			goBankManage() {
				uni.navigateTo({ url: '/pages/fc/fc_bank_accounts/fc_bank_accounts' });
			},
			onSubmit() {
				let amt = parseFloat(this.amount);
				if (!amt || amt <= 0) {
					uni.showToast({ title: '请输入正确的提现金额', icon: 'none' });
					return;
				}
				if (amt > this.rawBalance) {
					uni.showToast({ title: '提现金额不能超过可用余额', icon: 'none' });
					return;
				}
				if (!this.selectedBank) {
					uni.showToast({ title: '请选择对公账户', icon: 'none' });
					return;
				}

				uni.showModal({
					title: '确认提现',
					content: '确定提现 ¥' + amt.toFixed(2) + ' 到 ' + this.selectedBank.bank_name + '？',
					success: res => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.fc_wallet/create_withdraw',
								data: {
									amount: amt,
									bank_account_id: this.selectedBank.id
								},
								success: () => {
									uni.showToast({ title: '提现申请已提交', icon: 'success' });
									setTimeout(() => { uni.navigateBack(); }, 1500);
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

	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;
		border-bottom: 1rpx solid #F0F0F0;
	}

	.bank-selected {
		background: #F5F7FB;
		border-radius: 15rpx;
		padding: 24rpx;
		cursor: pointer;
	}

	.bank-empty {
		background: #F5F7FB;
		border-radius: 15rpx;
		padding: 40rpx 24rpx;
		text-align: center;
		cursor: pointer;
	}

	.popup-content {
		background: #FFFFFF;
		border-radius: 30rpx 30rpx 0 0;
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	.popup-header {
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #F0F0F0;
		margin-bottom: 20rpx;
		justify-content: space-between;
	}

	.bank-option {
		padding: 24rpx;
		border-radius: 15rpx;
		margin-bottom: 16rpx;
		background: #F5F7FB;
		position: relative;
		cursor: pointer;

		&.active {
			border: 2rpx solid #FE4B01;
			background: rgba(254, 75, 1, 0.05);
		}
	}

	.default-tag {
		position: absolute;
		top: 24rpx;
		right: 24rpx;
		background: #FE4B01;
		color: #FFFFFF;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
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
