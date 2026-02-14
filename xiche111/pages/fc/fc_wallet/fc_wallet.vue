<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 余额卡片 -->
				<view class="balance-card mb30">
					<view class="fs24" style="color: rgba(255,255,255,0.8);">可用余额(元)</view>
					<view class="balance-amount mt10">¥{{ walletInfo.money }}</view>
					<view class="balance-row mt20">
						<view class="balance-item">
							<view class="fs22" style="color: rgba(255,255,255,0.6);">冻结金额</view>
							<view class="fs28 fwb mt6" style="color: #FFFFFF;">¥{{ walletInfo.frozenMoney }}</view>
						</view>
						<view class="balance-item">
							<view class="fs22" style="color: rgba(255,255,255,0.6);">累计充值</view>
							<view class="fs28 fwb mt6" style="color: #FFFFFF;">¥{{ walletInfo.totalRecharge }}</view>
						</view>
						<view class="balance-item">
							<view class="fs22" style="color: rgba(255,255,255,0.6);">累计结算</view>
							<view class="fs28 fwb mt6" style="color: #FFFFFF;">¥{{ walletInfo.totalSettled }}</view>
						</view>
						<view class="balance-item">
							<view class="fs22" style="color: rgba(255,255,255,0.6);">累计提现</view>
							<view class="fs28 fwb mt6" style="color: #FFFFFF;">¥{{ walletInfo.totalWithdraw }}</view>
						</view>
					</view>
					<view class="btn-group">
						<view class="recharge-btn" @click="goRecharge">充值</view>
						<view class="withdraw-btn" @click="goWithdraw">提现</view>
					</view>
				</view>

				<!-- 快捷入口 -->
				<view class="shortcut-row mb30">
					<view class="shortcut-item" @click="goBankAccounts">
						<text class="fs26 col4">对公账户管理</text>
					</view>
					<view class="shortcut-divider"></view>
					<view class="shortcut-item" @click="goWithdrawLog">
						<text class="fs26 col4">提现记录</text>
					</view>
				</view>

				<!-- 流水Tab -->
				<scroll-view scroll-x="true" class="tab-nav mb30">
					<view class="tab-item" :class="{ active: currentTab === item.value }" v-for="(item, index) in tabList"
						:key="index" @click="onTabChange(item.value)">{{ item.label }}</view>
				</scroll-view>

				<!-- 流水列表 -->
				<view class="log-card box mb20" v-for="(item, index) in logList" :key="index">
					<view class="flex-box">
						<view class="log-icon" :class="'log-type-' + item.type">
							<text class="fs24">{{ getTypeIcon(item.type) }}</text>
						</view>
						<view class="flex-grow-1 ml20">
							<view class="fs28 col1">{{ item.type_text }}</view>
							<view class="fs22 col9 mt6">{{ item.memo }}</view>
						</view>
						<view class="tr">
							<view class="fs30 fwb" :class="isIncome(item.type) ? 'col2' : 'col4'">
								{{ isIncome(item.type) ? '+' : '-' }}¥{{ item.amount }}
							</view>
							<view class="fs22 col9 mt6">{{ formatTime(item.createtime) }}</view>
						</view>
					</view>
				</view>

				<!-- 空状态 / 加载更多 -->
				<view class="nothing" v-if="moreButton.nothing">
					<view class="tc ptb40">
						<view class="fs28 col9">暂无流水记录</view>
					</view>
				</view>
				<view class="g-btn3-wrap" v-else>
					<view class="g-btn3 fs26 col9 tc ptb20" @click="loadLogs">{{ moreButton.text }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				walletInfo: {
					money: '0.00',
					frozenMoney: '0.00',
					totalRecharge: '0.00',
					totalSettled: '0.00',
					totalWithdraw: '0.00'
				},
				tabList: [
					{ label: '全部', value: '' },
					{ label: '充值', value: 1 },
					{ label: '佣金冻结', value: 2 },
					{ label: '佣金结算', value: 3 },
					{ label: '解冻退回', value: 4 },
					{ label: '提现', value: 5 },
					{ label: '提现退回', value: 6 }
				],
				currentTab: '',
				logList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		onLoad() {
			this.loadBalance();
			this.loadLogs();
		},
		onShow() {
			this.loadBalance();
		},
		methods: {
			loadBalance() {
				this.$core.get({
					url: 'xiluxc.fc_wallet/balance',
					loading: false,
					success: ret => {
						let d = ret.data;
						this.walletInfo.money = d.money || '0.00';
						this.walletInfo.frozenMoney = d.frozen_money || '0.00';
						this.walletInfo.totalRecharge = d.total_recharge || '0.00';
						this.walletInfo.totalSettled = d.total_settled || '0.00';
						this.walletInfo.totalWithdraw = d.total_withdraw || '0.00';
					}
				});
			},
			loadLogs() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				this.$core.get({
					url: 'xiluxc.fc_wallet/fund_log',
					data: {
						page: this.moreButton.page,
						pagesize: 15,
						type: this.currentTab
					},
					loading: false,
					success: ret => {
						let listData = ret.data.list || {};
						let rawList = listData.data || [];
						if (rawList.length === 0 && this.moreButton.page === 1) {
							this.moreButton.nothing = true;
							this.moreButton.text = '暂无流水记录';
						} else if (this.moreButton.page >= (listData.last_page || 1)) {
							this.logList = this.logList.concat(rawList);
							this.moreButton.nomore = true;
							this.moreButton.text = '—— 没有更多了 ——';
						} else {
							this.logList = this.logList.concat(rawList);
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
				this.logList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadLogs();
			},
			goRecharge() {
				uni.navigateTo({ url: '/pages/fc/fc_recharge/fc_recharge' });
			},
			goWithdraw() {
				uni.navigateTo({ url: '/pages/fc/fc_withdraw/fc_withdraw' });
			},
			goBankAccounts() {
				uni.navigateTo({ url: '/pages/fc/fc_bank_accounts/fc_bank_accounts' });
			},
			goWithdrawLog() {
				uni.navigateTo({ url: '/pages/fc/fc_withdraw_log/fc_withdraw_log' });
			},
			getTypeIcon(type) {
				const map = { 1: '+', 2: '-', 3: '-', 4: '+', 5: '-', 6: '+' };
				return map[type] || '?';
			},
			isIncome(type) {
				return type === 1 || type === 4 || type === 6;
			},
			formatTime(ts) {
				if (!ts) return '';
				let d = new Date(ts * 1000);
				let y = d.getFullYear();
				let m = String(d.getMonth() + 1).padStart(2, '0');
				let day = String(d.getDate()).padStart(2, '0');
				let h = String(d.getHours()).padStart(2, '0');
				let min = String(d.getMinutes()).padStart(2, '0');
				return y + '-' + m + '-' + day + ' ' + h + ':' + min;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.balance-card {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
		position: relative;
	}

	.balance-amount {
		font-size: 60rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.balance-row {
		display: flex;
		gap: 20rpx;
		flex-wrap: wrap;
	}

	.balance-item {
		flex: 1;
		min-width: 140rpx;
		text-align: center;
	}

	.btn-group {
		position: absolute;
		top: 40rpx;
		right: 30rpx;
		display: flex;
		gap: 16rpx;
	}

	.recharge-btn,
	.withdraw-btn {
		background: rgba(255, 255, 255, 0.25);
		color: #FFFFFF;
		padding: 12rpx 36rpx;
		border-radius: 30rpx;
		font-size: 28rpx;
		cursor: pointer;
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 24rpx 0;
	}

	.shortcut-item {
		flex: 1;
		text-align: center;
		cursor: pointer;
	}

	.shortcut-divider {
		width: 2rpx;
		height: 30rpx;
		background: #E0E0E0;
	}

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
			padding: 0 26rpx;
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

	.log-card {
		cursor: pointer;
	}

	.log-icon {
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.log-type-1 {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.log-type-2 {
		background: rgba(254, 75, 1, 0.1);
		color: #FE4B01;
	}

	.log-type-3 {
		background: rgba(24, 144, 255, 0.1);
		color: #1890FF;
	}

	.log-type-4 {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.log-type-5 {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.log-type-6 {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.nothing {
		padding: 60rpx 0;
	}

	@media screen and (min-width: 768px) {
		.balance-card {
			padding: 30px 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.balance-amount {
			font-size: 36px;
		}

		.btn-group {
			top: 30px;
			right: 24px;
			gap: 10px;
		}

		.recharge-btn,
		.withdraw-btn {
			padding: 8px 24px;
			border-radius: 20px;
			font-size: 15px;
			transition: background 0.2s;

			&:hover {
				background: rgba(255, 255, 255, 0.4);
			}
		}

		.shortcut-row {
			border-radius: 12px;
			margin-bottom: 16px;
			padding: 16px 0;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 16px;
		}

		.tab-nav {
			border-radius: 12px;
			margin-bottom: 16px;

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

		.log-icon {
			width: 44px;
			height: 44px;
		}
	}
</style>
