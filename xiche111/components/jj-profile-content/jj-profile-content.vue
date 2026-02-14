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
		<view class="jj-box mb30">
			<view class="fs34 fwb col1 lh36 mb20">收入看板</view>
			<view class="income-row">
				<view class="income-card">
					<view class="fs24 col9">今日待结算(单位:元)</view>
					<view class="income-amount col4">¥{{ formatPrice(income.todayPending) }}</view>
				</view>
				<view class="income-card">
					<view class="fs24 col9">本月已结算(单位:元)</view>
					<view class="income-amount col1">¥{{ formatPrice(income.monthSettled) }}</view>
				</view>
				<view class="income-card">
					<view class="fs24 col9">累计收入(单位:元)</view>
					<view class="income-amount col2">¥{{ formatPrice(income.totalIncome) }}</view>
				</view>
			</view>
		</view>

		<!-- 心愿目标 -->
		<view class="jj-box mb30">
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
		<view class="jj-box mb30">
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
		name: 'jj-profile-content',
		data() {
			return {
				userinfo: {
					nickname: '居间人',
					avatar: '',
					score: 0,
					mobile: ''
				},
				income: {
					todayPending: 0,
					monthSettled: 0,
					totalIncome: 0
				},
				wishGoal: {
					target: 0,
					current: 0,
					type: '月'
				},
				pendingOrders: [],
				menuList: [
					{ key: 'commission', label: '佣金明细', icon: '/static/icon/icon_foot2_sc.png' },
					{ key: 'wish', label: '心愿目标', icon: '/static/icon/icon_foot3_sc.png' },
					{ key: 'pk_pool', label: 'PK奖池', icon: '/static/icon/icon_foot1_sc.png' },
					{ key: 'red_packet', label: '平台红包', icon: '/static/icon/icon_foot4_sc.png' },
					{ key: 'distribution', label: '分销推广', icon: '/static/icon/icon_foot1_sc.png' },
					// { key: 'buyer_manage', label: '买家管理', icon: '/static/icon/icon_foot3_sc.png' },
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
		mounted() {
			this.loadProfile();
			this.loadWishGoal();
			uni.$on('wishGoalUpdated', () => {
				this.loadWishGoal();
			});
		},
		beforeDestroy() {
			uni.$off('wishGoalUpdated');
		},
		methods: {
			loadProfile() {
				this.$core.get({
					url: 'xiluxc.jj_agent/profile',
					loading: false,
					success: ret => {
						let d = ret.data;
						this.userinfo.nickname = d.nickname || '居间人';
						this.userinfo.avatar = d.avatar || '';
						this.userinfo.mobile = d.mobile || '';
						if (d.agent_profile) {
							this.userinfo.score = d.agent_profile.credit_score || 0;
							this.income.totalIncome = Number(d.agent_profile.total_revenue) || 0;
							this.income.monthSettled = Number(d.agent_profile.settled_revenue) || 0;
							this.income.todayPending = Number(d.agent_profile.pending_revenue) || 0;
						}
					},
					fail: () => { return false; }
				});
			},
			loadWishGoal() {
				this.$core.get({
					url: 'xiluxc.jj_wish/current',
					loading: false,
					success: ret => {
						if (ret.data && ret.data.id) {
							this.wishGoal.target = Number(ret.data.target) || 0;
							this.wishGoal.current = Number(ret.data.current) || 0;
							this.wishGoal.type = ret.data.type === 'order' ? '月订单' : '月';
						} else {
							this.wishGoal.target = 0;
							this.wishGoal.current = 0;
						}
					},
					fail: () => { return false; }
				});
			},
			onEditProfile() {
				uni.navigateTo({ url: '/pages/jj/jj_settings/jj_settings' });
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
					case 'buyer_manage':
						uni.navigateTo({ url: '/pages/jj/jj_buyer_manage/jj_buyer_manage' });
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

	.menu-icon-buyer_manage {
		background: linear-gradient(135deg, #36cfc9, #87e8de);
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
