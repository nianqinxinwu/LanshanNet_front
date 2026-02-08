<template>
	<view class="profile-content">
		<!-- 用户信息区 -->
		<view class="user-header mb30">
			<view class="flex-box">
				<image class="avatar" :src="userinfo.avatar || '/static/icon/icon_foot5_sc.png'" mode="aspectFill"></image>
				<view class="flex-grow-1 ml20">
					<view class="fs34 fwb" style="color: #FFFFFF;">{{ userinfo.nickname }}</view>
					<view class="fs24 mt10" style="color: rgba(255,255,255,0.8);">信誉评分: {{ userinfo.score }}分</view>
				</view>
				<view class="edit-btn fs24" @click="onEditProfile">编辑资料</view>
			</view>
		</view>

		<!-- 收入看板 -->
		<view class="box mb30">
			<view class="fs34 fwb col1 lh36 mb20">收入看板</view>
			<view class="income-row">
				<view class="income-card">
					<view class="fs24 col9">今日待结算</view>
					<view class="income-amount col4">¥{{ formatPrice(income.todayPending) }}</view>
				</view>
				<view class="income-card">
					<view class="fs24 col9">本月已结算</view>
					<view class="income-amount col1">¥{{ formatPrice(income.monthSettled) }}</view>
				</view>
				<view class="income-card">
					<view class="fs24 col9">累计收入</view>
					<view class="income-amount col2">¥{{ formatPrice(income.totalIncome) }}</view>
				</view>
			</view>
		</view>

		<!-- 心愿目标 -->
		<view class="box mb30">
			<view class="flex-box mb20">
				<view class="fs34 fwb col1 lh36 flex-grow-1">心愿目标</view>
				<view class="fs24 col4" @click="onMenuClick('wish')">设定目标</view>
			</view>
			<view class="fs26 col5 mb15">本{{ wishGoal.type }}目标: ¥{{ formatPrice(wishGoal.target) }}</view>
			<view class="progress-wrap">
				<view class="progress-bar">
					<view class="progress-fill" :style="{ width: wishPercent + '%' }"></view>
				</view>
				<view class="flex-box mt10">
					<view class="flex-grow-1 fs24 col4">{{ wishPercent }}%</view>
					<view class="fs24 col9">¥{{ formatPrice(wishGoal.current) }} / ¥{{ formatPrice(wishGoal.target) }}</view>
				</view>
			</view>
		</view>

		<!-- 待结算订单 -->
		<view class="box mb30">
			<view class="fs34 fwb col1 lh36 mb20">待结算订单</view>
			<view v-if="pendingOrders.length === 0" class="fs28 col9 tc ptb30">暂无待结算订单</view>
			<view v-for="(item, idx) in pendingOrders" :key="idx" class="order-item" :class="{ 'bb': idx < pendingOrders.length - 1 }">
				<view class="flex-box">
					<view class="flex-grow-1">
						<view class="fs28 col1 fwb">#{{ item.id }}</view>
						<view class="fs26 col5 mt8">{{ item.productName }}</view>
					</view>
					<view class="tr">
						<view class="fs28 fwb col4">¥{{ item.commission.toFixed(2) }}</view>
						<view class="fs22 col9 mt8">{{ item.status }}</view>
					</view>
				</view>
				<view class="countdown-row mt10">
					<view class="countdown-tag fs22">结算倒计时 {{ item.countdown }}</view>
				</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="box mb30">
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
		name: 'jj-profile-content',
		data() {
			return {
				userinfo: {
					nickname: '居间人昵称',
					avatar: '',
					score: 85,
					mobile: '138****8888'
				},
				income: {
					todayPending: 3280.00,
					monthSettled: 8320.00,
					totalIncome: 56800.00
				},
				wishGoal: {
					target: 10000,
					current: 6800,
					type: '月'
				},
				pendingOrders: [
					{ id: '20240101', productName: '高强度螺纹钢 HRB400', commission: 149.80, countdown: '72:00:00', status: '佣金已锁定' },
					{ id: '20240102', productName: '聚氯乙烯树脂 SG-5', commission: 287.70, countdown: '48:32:15', status: '佣金已锁定' },
					{ id: '20240103', productName: 'LED工业照明灯 200W', commission: 224.00, countdown: '23:15:40', status: '佣金已锁定' }
				],
				menuList: [
					{ key: 'commission', label: '佣金明细', icon: '/static/icon/icon_foot2_sc.png' },
					{ key: 'wish', label: '心愿目标', icon: '/static/icon/icon_foot3_sc.png' },
					{ key: 'pk_pool', label: 'PK奖池', icon: '/static/icon/icon_foot1_sc.png' },
					{ key: 'red_packet', label: '平台红包', icon: '/static/icon/icon_foot4_sc.png' },
					{ key: 'distribution', label: '分销推广', icon: '/static/icon/icon_foot1_sc.png' },
					{ key: 'settings', label: '账号设置', icon: '/static/icon/icon_foot5_sc.png' },
					{ key: 'switch', label: '切换身份', icon: '/static/icon/icon_foot4_sc.png' },
					{ key: 'logout', label: '退出登录', icon: '/static/icon/icon_foot4_uc.png' }
				]
			}
		},
		computed: {
			wishPercent() {
				if (!this.wishGoal.target) return 0;
				return Math.min(100, Math.round(this.wishGoal.current / this.wishGoal.target * 100));
			}
		},
		methods: {
			formatPrice(price) {
				if (!price) return '0.00';
				return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			},
			onEditProfile() {
				uni.showToast({ title: '功能开发中', icon: 'none' });
			},
			onMenuClick(key) {
				switch (key) {
					case 'commission':
						uni.navigateTo({ url: '/pages/jj/jj_commission/jj_commission' });
						break;
					case 'wish':
						uni.navigateTo({ url: '/pages/jj/jj_wish/jj_wish' });
						break;
					case 'pk_pool':
						uni.navigateTo({ url: '/pages/jj/jj_pk_pool/jj_pk_pool' });
						break;
					case 'red_packet':
						uni.navigateTo({ url: '/pages/jj/jj_red_packet/jj_red_packet' });
						break;
					case 'distribution':
						uni.navigateTo({ url: '/pages/jj/jj_distribution/jj_distribution' });
						break;
					case 'settings':
						uni.navigateTo({ url: '/pages/jj/jj_settings/jj_settings' });
						break;
					case 'switch':
						uni.showModal({
							title: '提示',
							content: '确定要切换身份吗？将返回登录页重新选择角色。',
							success: (res) => {
								if (res.confirm) {
									uni.redirectTo({ url: '/pages/login/login' });
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
									uni.redirectTo({ url: '/pages/login/login' });
								}
							}
						});
						break;
				}
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

	.edit-btn {
		border: 1px solid rgba(255, 255, 255, 0.6);
		color: #FFFFFF;
		padding: 8rpx 24rpx;
		border-radius: 30rpx;
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
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

	.progress-wrap {
		padding: 0 4rpx;
	}

	.progress-bar {
		height: 20rpx;
		background: #F0F0F0;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #FE4B01, #FF8C00);
		border-radius: 10rpx;
		transition: width 0.3s;
	}

	.order-item {
		padding: 24rpx 0;
	}

	.countdown-row {
		display: flex;
	}

	.countdown-tag {
		background: rgba(254, 75, 1, 0.08);
		color: #FE4B01;
		padding: 6rpx 16rpx;
		border-radius: 6rpx;
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

	.menu-icon-commission {
		background: linear-gradient(135deg, #52c41a, #73d13d);
	}

	.menu-icon-wish {
		background: linear-gradient(135deg, #40a9ff, #69c0ff);
	}

	.menu-icon-pk_pool {
		background: linear-gradient(135deg, #722ed1, #b37feb);
	}

	.menu-icon-red_packet {
		background: linear-gradient(135deg, #ff4d4f, #ff7875);
	}

	.menu-icon-distribution {
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

		.box {
			padding: 24px;
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

		.edit-btn {
			cursor: pointer;

			&:hover {
				background: rgba(255, 255, 255, 0.2);
			}
		}

		.order-item {
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}
	}
</style>
