<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 邀请统计 -->
				<view class="stats-card mb30">
					<view class="flex-box">
						<view class="flex-grow-1 tc">
							<view class="stats-num">{{ stats.inviteCount }}</view>
							<view class="fs24 mt10" style="color: rgba(255,255,255,0.8);">邀请人数</view>
						</view>
						<view class="stats-divider"></view>
						<view class="flex-grow-1 tc">
							<view class="stats-num">¥{{ formatPrice(stats.teamRevenue) }}</view>
							<view class="fs24 mt10" style="color: rgba(255,255,255,0.8);">团队业绩</view>
						</view>
					</view>
				</view>

				<!-- 我的邀请码 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">我的邀请码</view>
					<view class="code-box">
						<view class="code-text">{{ inviteCode }}</view>
					</view>
					<view class="flex-box mt20" style="gap: 20rpx;">
						<view class="btn-outline flex-grow-1 tc fs28" @click="copyCode">复制邀请码</view>
						<view class="btn-primary flex-grow-1 tc fs28" @click="generatePoster">生成海报</view>
					</view>
				</view>

				<!-- 邀请规则 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">邀请规则</view>
					<view v-for="(rule, idx) in rules" :key="idx" class="rule-item flex-box mb15">
						<view class="rule-dot">{{ idx + 1 }}</view>
						<view class="fs26 col5 ml15 flex-grow-1">{{ rule }}</view>
					</view>
				</view>

				<!-- 我的团队 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">我的团队</view>
					<view v-if="teamList.length === 0" class="fs28 col9 tc ptb30">暂无团队成员</view>
					<view v-for="(member, idx) in teamList" :key="idx" class="team-item flex-box" :class="{ 'bb': idx < teamList.length - 1 }">
						<image :src="member.avatar || '/static/icon/icon_foot5_sc.png'" mode="aspectFill" class="team-avatar"></image>
						<view class="flex-grow-1 ml20">
							<view class="fs28 col1 fwb">{{ member.name }}</view>
							<view class="fs24 col9 mt8">{{ member.mobile }}</view>
						</view>
						<view class="tr">
							<view class="fs26 col1">{{ member.orderCount }} 单</view>
							<view class="fs22 col9 mt8">本月业绩</view>
						</view>
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
				stats: {
					inviteCount: 0,
					teamRevenue: 0
				},
				inviteCode: '',
				rules: [
					'邀请好友注册成为居间人，好友填写您的邀请码即可绑定',
					'好友完成首单后，您可获得平台奖励佣金',
					'团队每月业绩达标，享受额外团队奖金'
				],
				teamList: []
			}
		},
		onLoad() {
			this.loadDistribution();
		},
		methods: {
			loadDistribution() {
				this.$core.get({
					url: 'xiluxc.jj_distribution/index',
					loading: true,
					success: ret => {
						let d = ret.data;
						this.inviteCode = d.invite_code || '';
						this.stats.inviteCount = d.invite_count || 0;
						this.stats.teamRevenue = Number(d.team_revenue) || 0;
						// 映射团队列表
						if (d.team_list && Array.isArray(d.team_list)) {
							this.teamList = d.team_list.map(item => ({
								name: (item.inviteUser && item.inviteUser.nickname) || '用户' + item.invite_user_id,
								mobile: (item.inviteUser && item.inviteUser.mobile) || '',
								avatar: (item.inviteUser && item.inviteUser.avatar) || '',
								orderCount: item.order_count || 0
							}));
						}
					},
					fail: () => { return false; }
				});
			},
			copyCode() {
				uni.setClipboardData({
					data: this.inviteCode,
					success: () => {
						uni.showToast({ title: '邀请码已复制', icon: 'success' });
					}
				});
			},
			generatePoster() {
				uni.showToast({ title: '功能开发中', icon: 'none' });
			}
		}
	}
</script>

<style lang="scss" scoped>
	.stats-card {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
	}

	.stats-num {
		font-size: 42rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.stats-divider {
		width: 1px;
		height: 60rpx;
		background: rgba(255, 255, 255, 0.3);
	}

	.code-box {
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 30rpx;
		text-align: center;
	}

	.code-text {
		font-size: 44rpx;
		font-weight: bold;
		color: #FE4B01;
		letter-spacing: 8rpx;
	}

	.btn-outline {
		border: 1px solid #FE4B01;
		color: #FE4B01;
		height: 76rpx;
		line-height: calc(76rpx - 2px);
		border-radius: 38rpx;
	}

	.btn-primary {
		background: #FE4B01;
		color: #FFFFFF;
		height: 76rpx;
		line-height: 76rpx;
		border-radius: 38rpx;
	}

	.rule-item {
		align-items: flex-start;
	}

	.rule-dot {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background: #FE4B01;
		color: #FFFFFF;
		font-size: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 4rpx;
	}

	.team-item {
		padding: 24rpx 0;
	}

	.team-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	/* PC端适配 */
	@media screen and (min-width: 768px) {
		.stats-card {
			padding: 30px 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.btn-outline,
		.btn-primary {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}

		.team-item {
			&:hover {
				background: #F9FAFB;
			}
		}
	}
</style>
