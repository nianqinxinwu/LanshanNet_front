<template>
	<view class="profile-content">
		<!-- 工厂信息区 -->
		<view class="user-header mb30">
			<view class="flex-box">
				<image class="avatar" :src="factory.avatar || '/static/icon/icon_foot5_sc.png'" mode="aspectFill"></image>
				<view class="flex-grow-1 ml20">
					<view class="fs34 fwb" style="color: #FFFFFF;">{{ factory.companyName }}</view>
					<view class="fs24 mt10" style="color: rgba(255,255,255,0.8);">
						<text>{{ factory.statusText }}</text>
						<text class="ml15">履约率: {{ factory.fulfillRate }}%</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 收入看板 -->
		<view class="jj-box mb30">
			<view class="fs34 fwb col1 lh36 mb20">收入看板</view>
			<view class="income-row">
				<view class="income-card">
					<view class="fs24 col9">今日待结算(元)</view>
					<view class="income-amount col4">¥{{ income.todayPending }}</view>
				</view>
				<view class="income-card">
					<view class="fs24 col9">本月已结算(元)</view>
					<view class="income-amount col1">¥{{ income.monthSettled }}</view>
				</view>
				<view class="income-card">
					<view class="fs24 col9">累计收入(元)</view>
					<view class="income-amount col2">¥{{ income.totalIncome }}</view>
				</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="jj-box mb30">
			<view class="fs34 fwb col1 lh36 mb20">功能菜单</view>
			<view class="menu-grid">
				<view class="menu-item" v-for="(item, idx) in menuList" :key="idx" @click="onMenuClick(item.key)">
					<view class="menu-icon-wrap" :class="'menu-icon-' + item.key">
						<image :src="item.icon" mode="aspectFill" class="menu-icon"></image>
					</view>
					<view class="fs24 col3 mt10 tc">{{ item.label }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'fc-profile-content',
		data() {
			return {
				factory: {
					companyName: '工厂',
					avatar: '',
					status: 0,
					statusText: '待审核',
					fulfillRate: 0
				},
				income: {
					todayPending: '0.00',
					monthSettled: '0.00',
					totalIncome: '0.00'
				},
				menuList: [
					{ key: 'wallet', label: '我的钱包', icon: '/static/icon/icon_foot1_sc.png' },
					{ key: 'auth', label: '企业认证', icon: '/static/icon/icon_foot2_sc.png' },
					{ key: 'dashboard', label: '数据看板', icon: '/static/icon/icon_foot1_sc.png' },
					{ key: 'bids', label: '竞标管理', icon: '/static/icon/icon_foot3_sc.png' },
					{ key: 'agents', label: '居间人筛选', icon: '/static/icon/icon_foot4_sc.png' },
					{ key: 'points', label: '积分中心', icon: '/static/icon/icon_foot1_sc.png' },
					{ key: 'settings', label: '账号设置', icon: '/static/icon/icon_foot5_sc.png' },
					{ key: 'switch', label: '切换身份', icon: '/static/icon/icon_foot4_sc.png' },
					{ key: 'logout', label: '退出登录', icon: '/static/icon/icon_foot4_uc.png' }
				]
			}
		},
		mounted() {
			this.loadCertStatus();
			this.loadFinanceStats();
		},
		methods: {
			loadCertStatus() {
				this.$core.get({
					url: 'xiluxc.fc_factory/cert_status',
					loading: false,
					success: ret => {
						let d = ret.data;
						this.factory.companyName = d.company_name || '工厂';
						this.factory.avatar = '';
						this.factory.status = d.status !== undefined ? d.status : -1;
						this.factory.statusText = d.status_text || '未提交';
						this.factory.fulfillRate = d.fulfill_rate || 0;
					},
					fail: () => { return false; }
				});
			},
			loadFinanceStats() {
				this.$core.get({
					url: 'xiluxc.fc_dashboard/finance_stats',
					loading: false,
					success: ret => {
						let d = ret.data;
						this.income.todayPending = d.locked_commission || '0.00';
						this.income.monthSettled = d.month_settled || '0.00';
						this.income.totalIncome = d.settled_commission || '0.00';
					},
					fail: () => { return false; }
				});
			},
			onMenuClick(key) {
				switch (key) {
					case 'wallet':
						uni.navigateTo({ url: '/pages/fc/fc_wallet/fc_wallet' });
						break;
					case 'auth':
						uni.navigateTo({ url: '/pages/fc/fc_auth/fc_auth' });
						break;
					case 'dashboard':
						uni.navigateTo({ url: '/pages/fc/fc_dashboard/fc_dashboard' });
						break;
					case 'bids':
						uni.navigateTo({ url: '/pages/fc/fc_bids/fc_bids' });
						break;
					case 'agents':
						uni.navigateTo({ url: '/pages/fc/fc_agents/fc_agents' });
						break;
					case 'points':
						uni.navigateTo({ url: '/pages/fc/fc_points/fc_points' });
						break;
					case 'settings':
						uni.navigateTo({ url: '/pages/jj/jj_settings/jj_settings' });
						break;
					case 'switch':
						uni.showModal({
							title: '提示',
							content: '确定要切换身份吗？将返回身份选择页。',
							success: (res) => {
								if (res.confirm) {
									this.$core.logout();
									uni.redirectTo({ url: '/pages/jj_start/jj_start' });
								}
							}
						});
						break;
					case 'logout':
						uni.showModal({
							title: '提示',
							content: '确定要退出登录吗？',
							success: (res) => {
								if (res.confirm) {
									this.$core.logout();
									uni.redirectTo({ url: '/pages/jj_start/jj_start' });
								}
							}
						});
						break;
				}
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.user-header {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 3px solid rgba(255, 255, 255, 0.4);
	}

	.income-row {
		display: flex;
		gap: 20rpx;
	}

	.income-card {
		flex: 1;
		text-align: center;
		background: #F9FAFB;
		border-radius: 12rpx;
		padding: 24rpx 10rpx;
	}

	.income-amount {
		font-size: 34rpx;
		font-weight: bold;
		margin-top: 12rpx;
	}

	.menu-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 30rpx 20rpx;
	}

	.menu-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}

	.menu-icon-wrap {
		width: 90rpx;
		height: 90rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
	}

	.menu-icon-wallet {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
	}

	.menu-icon-auth {
		background: linear-gradient(135deg, #52c41a, #73d13d);
	}

	.menu-icon-dashboard {
		background: linear-gradient(135deg, #40a9ff, #69c0ff);
	}

	.menu-icon-bids {
		background: linear-gradient(135deg, #722ed1, #b37feb);
	}

	.menu-icon-agents {
		background: linear-gradient(135deg, #ff4d4f, #ff7875);
	}

	.menu-icon-points {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
	}

	.menu-icon-settings {
		background: linear-gradient(135deg, #722ed1, #b37feb);
	}

	.menu-icon-switch {
		background: linear-gradient(135deg, #13c2c2, #5cdbd3);
	}

	.menu-icon-logout {
		background: linear-gradient(135deg, #8c8c8c, #bfbfbf);
	}

	.menu-icon {
		width: 44rpx;
		height: 44rpx;
		filter: brightness(0) invert(1);
	}

	@media screen and (min-width: 768px) {
		.user-header {
			padding: 30px 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.income-row {
			gap: 16px;
		}

		.income-card {
			padding: 20px 10px;
			border-radius: 8px;
		}

		.income-amount {
			font-size: 24px;
		}

		.menu-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 24px 16px;
		}

		.menu-icon-wrap {
			cursor: pointer;
			transition: transform 0.2s;

			&:hover {
				transform: translateY(-4rpx);
			}
		}
	}
</style>
