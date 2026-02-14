<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 当前心愿目标 -->
				<view class="jj-box mb30" v-if="currentGoal.id">
					<view class="flex-box mb20">
						<view class="fs34 fwb col1 lh36 flex-grow-1">当前目标</view>
						<view class="goal-type-tag fs22">{{ getTypeName(currentGoal.type) }}</view>
					</view>

					<!-- 进度展示 -->
					<view class="goal-progress-card">
						<view class="tc mb15">
							<view class="fs24 col5">目标金额</view>
							<view class="fs44 fwb col1 mt5">¥{{ formatPrice(currentGoal.target) }}</view>
						</view>
						<view class="progress-bar-wrap">
							<view class="progress-bar-bg">
								<view class="progress-bar-fill" :style="{ width: goalPercent + '%' }"></view>
							</view>
							<view class="flex-box mt10">
								<view class="flex-grow-1 fs26 fwb col4">{{ goalPercent }}%</view>
								<view class="fs24 col9">¥{{ formatPrice(currentGoal.current) }} / ¥{{ formatPrice(currentGoal.target) }}</view>
							</view>
						</view>

						<!-- 奖励信息 -->
						<view class="reward-box mt20">
							<view class="fs26 col5 mb10">达成奖励</view>
							<view class="fs28 fwb col1">{{ currentGoal.rewardDesc }}</view>
						</view>

						<!-- 达成后领取按钮 -->
						<view class="mt20" v-if="currentGoal.current >= currentGoal.target">
							<view class="claim-btn" :class="{ claimed: currentGoal.claimed }" @click="onClaimReward">
								{{ currentGoal.claimed ? '已领取' : '领取奖励' }}
							</view>
						</view>

						<!-- 未达成提示 -->
						<view class="mt15 tc" v-else>
							<view class="fs24 col9">还差 ¥{{ formatPrice(currentGoal.target - currentGoal.current) }} 即可达成目标</view>
						</view>
					</view>
				</view>

				<!-- 设定新目标 / 修改目标 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">{{ currentGoal.id ? '修改目标' : '设定心愿目标' }}</view>

					<!-- 目标类型 -->
					<view class="fs28 col1 mb10">目标类型</view>
					<view class="type-selector flex-box mb20">
						<view class="type-option flex-grow-1 tc" :class="{ active: form.type === 'income' }"
							@click="form.type = 'income'">收入目标</view>
						<view class="type-option flex-grow-1 tc" :class="{ active: form.type === 'order' }"
							@click="form.type = 'order'">订单目标</view>
					</view>

					<!-- 目标金额 -->
					<view class="fs28 col1 mb10">目标金额（订单成交额）</view>
					<view class="input-wrap mb20">
						<text class="fs28 col4 mr10">¥</text>
						<input type="digit" class="flex-grow-1 fs28" v-model="form.target" placeholder="请输入目标金额" placeholder-class="cola" />
					</view>

					<!-- 快捷金额 -->
					<view class="quick-amounts flex-box mb20">
						<view class="quick-item" :class="{ active: form.target == item }" v-for="item in quickAmounts"
							:key="item" @click="form.target = item">¥{{ item >= 10000 ? (item/10000) + '万' : item }}</view>
					</view>

					<!-- 奖励说明 -->
					<view class="reward-tip mb20">
						<view class="fs24 col5 mb10">达成后可获得的奖励：</view>
						<view class="fs26 col1">{{ getRewardPreview() }}</view>
					</view>

					<!-- 提交按钮 -->
					<view class="btn5" :class="{ disabled: !form.target || form.target <= 0 }" @click="onSubmitGoal">
						{{ currentGoal.id ? '更新目标' : '确定设定' }}
					</view>
				</view>

				<!-- 历史目标记录 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">历史目标</view>
					<view v-if="historyGoals.length === 0" class="fs28 col9 tc ptb30">暂无历史记录</view>
					<view v-for="(item, idx) in historyGoals" :key="idx" class="history-item" :class="{ bb: idx < historyGoals.length - 1 }">
						<view class="flex-box">
							<view class="flex-grow-1">
								<view class="fs28 col1">{{ getTypeName(item.type) }} ¥{{ formatPrice(item.target) }}</view>
								<view class="fs24 col9 mt5">{{ item.period }}</view>
							</view>
							<view class="tr">
								<view class="fs26 fwb" :class="item.achieved ? 'col-success' : 'col9'">
									{{ item.achieved ? '已达成' : '未达成' }}
								</view>
								<view class="fs22 col9 mt5">{{ Math.round(item.current / item.target * 100) }}%</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 说明 -->
				<view class="tip-box mb30">
					<view class="fs24 col9 lh40">
						<text class="fwb">说明：</text>
						设定目标后，系统将实时统计您的订单成交额并更新进度。达成目标后可领取平台奖励（如现金红包、实物奖励等），高价值奖励需通过平台人工审核后发放。
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
				currentGoal: {
					id: 0,
					type: 'income',
					target: 0,
					current: 0,
					rewardDesc: '',
					claimed: false
				},
				form: {
					type: 'income',
					target: ''
				},
				quickAmounts: [5000, 10000, 30000, 50000, 100000],
				historyGoals: []
			}
		},
		computed: {
			goalPercent() {
				if (!this.currentGoal.target) return 0;
				return Math.min(100, Math.round(this.currentGoal.current / this.currentGoal.target * 100));
			}
		},
		onLoad() {
			this.loadCurrentGoal();
			this.loadHistory();
		},
		methods: {
			loadCurrentGoal() {
				this.$core.get({
					url: 'xiluxc.jj_wish/current',
					loading: false,
					success: ret => {
						if (ret.data && ret.data.id) {
							this.currentGoal = Object.assign(this.currentGoal, ret.data);
						}
					},
					fail: () => { return false; }
				});
			},

			loadHistory() {
				this.$core.get({
					url: 'xiluxc.jj_wish/history',
					data: { page: 1, pagesize: 20 },
					loading: false,
					success: ret => {
						let rawList = ret.data.data || ret.data || [];
						if (Array.isArray(rawList)) {
							this.historyGoals = rawList.map(item => ({
								type: item.type,
								target: Number(item.target_amount) || 0,
								current: Number(item.current) || 0,
								period: item.period || '',
								achieved: item.achieved || false
							}));
						}
					},
					fail: () => { return false; }
				});
			},

			getTypeName(type) {
				const map = { income: '收入目标', order: '订单目标' };
				return map[type] || '收入目标';
			},

			getRewardPreview() {
				let amount = Number(this.form.target) || 0;
				if (amount >= 100000) return '达成后获得平台豪华奖励（需人工审核）';
				if (amount >= 50000) return '达成后获得 ¥1,000 现金红包';
				if (amount >= 30000) return '达成后获得 ¥500 现金红包';
				if (amount >= 10000) return '达成后获得 ¥200 现金红包';
				if (amount >= 5000) return '达成后获得 ¥80 现金红包';
				return '请输入目标金额查看奖励';
			},

			onSubmitGoal() {
				if (!this.form.target || this.form.target <= 0) {
					uni.showToast({ title: '请输入有效的目标金额', icon: 'none' });
					return;
				}

				this.$core.post({
					url: 'xiluxc.jj_wish/set_goal',
					data: {
						type: this.form.type,
						target: this.form.target
					},
					success: ret => {
						uni.showToast({ title: '目标设定成功', icon: 'success' });
						this.currentGoal = Object.assign(this.currentGoal, {
							id: ret.data.id || 1,
							type: this.form.type,
							target: Number(this.form.target),
							current: this.currentGoal.current,
							rewardDesc: this.getRewardPreview(),
							claimed: false
						});
						uni.$emit('wishGoalUpdated');
						this.loadHistory();
					}
				});
			},

			onClaimReward() {
				if (this.currentGoal.claimed) return;

				this.$core.post({
					url: 'xiluxc.jj_wish/claim_reward',
					data: { goal_id: this.currentGoal.id },
					success: () => {
						this.currentGoal.claimed = true;
						uni.showToast({ title: '奖励领取成功', icon: 'success' });
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* 目标类型标签 */
	.goal-type-tag {
		background: rgba(254, 75, 1, 0.1);
		color: #FE4B01;
		padding: 4rpx 20rpx;
		border-radius: 20rpx;
	}

	/* 目标进度 */
	.goal-progress-card {
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.progress-bar-wrap {
		padding: 0 4rpx;
	}

	.progress-bar-bg {
		height: 24rpx;
		background: #E8E8E8;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #FE4B01, #FF8C00);
		border-radius: 12rpx;
		transition: width 0.5s;
	}

	.reward-box {
		background: #FFFFFF;
		border-radius: 12rpx;
		padding: 20rpx;
		border: 2rpx dashed #FFD591;
	}

	.claim-btn {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		color: #FFFFFF;
		font-size: 30rpx;
		font-weight: bold;
		text-align: center;
		padding: 24rpx 0;
		border-radius: 40rpx;

		&.claimed {
			background: #D9D9D9;
			color: #999999;
		}
	}

	/* 目标类型选择器 */
	.type-selector {
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 6rpx;
	}

	.type-option {
		line-height: 72rpx;
		height: 72rpx;
		font-size: 28rpx;
		color: #666666;
		border-radius: 10rpx;

		&.active {
			background: #FFFFFF;
			color: #FE4B01;
			font-weight: bold;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
		}
	}

	/* 输入框 */
	.input-wrap {
		display: flex;
		align-items: center;
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 0 24rpx;
		height: 88rpx;
	}

	/* 快捷金额 */
	.quick-amounts {
		flex-wrap: wrap;
		gap: 15rpx;
	}

	.quick-item {
		padding: 12rpx 28rpx;
		border: 2rpx solid #E8E8E8;
		border-radius: 30rpx;
		font-size: 24rpx;
		color: #666666;

		&.active {
			border-color: #FE4B01;
			color: #FE4B01;
			background: rgba(254, 75, 1, 0.05);
		}
	}

	.reward-tip {
		background: #FFF7E6;
		border-radius: 12rpx;
		padding: 20rpx;
	}

	.disabled {
		opacity: 0.5;
	}

	/* 历史记录 */
	.history-item {
		padding: 24rpx 0;
	}

	.col-success {
		color: #52C41A;
	}

	.tip-box {
		background: #FFFBE6;
		border-radius: 12rpx;
		padding: 24rpx;
		border-left: 6rpx solid #FAAD14;
	}

	@media screen and (min-width: 768px) {
		.type-option {
			height: 44px;
			line-height: 44px;
			font-size: 15px;
			cursor: pointer;
		}

		.quick-item {
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				border-color: #FE4B01;
				color: #FE4B01;
			}
		}

		.claim-btn {
			cursor: pointer;
			max-width: 400px;
			margin: 0 auto;
			transition: opacity 0.2s;

			&:hover { opacity: 0.85; }
		}

		.goal-progress-card {
			padding: 24px;
			border-radius: 12px;
		}

		.tip-box {
			border-radius: 8px;
			padding: 16px;
		}
	}
</style>
