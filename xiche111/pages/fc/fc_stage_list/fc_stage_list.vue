<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 订单概况 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">订单概况</view>
				<view class="info-row bb">
					<view class="col5 fs28">订单编号</view>
					<view class="col1 fs28">{{ orderInfo.orderSn }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">居间人</view>
					<view class="col1 fs28">{{ orderInfo.agentName }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">总阶段数</view>
					<view class="col1 fs28 fwb">{{ orderInfo.totalStages }}阶段</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">已完成</view>
					<view class="col2 fs28 fwb">{{ orderInfo.completedStages }}阶段</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28">当前阶段</view>
					<view class="col4 fs28 fwb" v-if="orderInfo.currentStage > 0">第{{ orderInfo.currentStage }}阶段</view>
					<view class="col9 fs28" v-else>已全部完成</view>
				</view>
			</view>

			<!-- 进度条 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">完成进度</view>
				<view class="progress-info flex-box mb15">
					<view class="fs28 col1">{{ orderInfo.completedStages }}/{{ orderInfo.totalStages }}阶段</view>
					<view class="fs28 fwb" style="color:#1890FF;">{{ progressPercent }}%</view>
				</view>
				<view class="progress-bar">
					<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
				</view>
			</view>

			<!-- 阶段列表 -->
			<view class="stages-title fs34 fwb col1 mb20">阶段列表</view>
			<view v-for="stage in stageList" :key="stage.stageNo" class="stage-card mb30">
				<!-- 卡片头部 -->
				<view class="stage-header flex-box">
					<view class="flex-grow-1">
						<view class="fs32 fwb col1">{{ stage.stageName }}</view>
					</view>
					<view class="stage-badge" :class="getStatusClass(stage.status)">
						{{ getStatusText(stage.status) }}
					</view>
				</view>

				<!-- 付款证明状态 -->
				<view class="stage-section mt20">
					<view class="fs28 col5 mb15">付款证明状态</view>
					<view class="proof-status-wrap">
						<view class="status-step" :class="{ active: stage.proofStatus >= 1 }">
							<view class="step-dot"></view>
							<view class="step-label fs22">已上传</view>
						</view>
						<view class="status-line" :class="{ active: stage.proofStatus >= 2 }"></view>
						<view class="status-step" :class="{ active: stage.proofStatus >= 2, rejected: stage.proofStatus === 3 }">
							<view class="step-dot"></view>
							<view class="step-label fs22">{{ stage.proofStatus === 3 ? '已驳回' : '已审核' }}</view>
						</view>
						<view class="status-line" :class="{ active: stage.releaseStatus >= 2 }"></view>
						<view class="status-step" :class="{ active: stage.releaseStatus >= 2 }">
							<view class="step-dot"></view>
							<view class="step-label fs22">客服确认</view>
						</view>
						<view class="status-line" :class="{ active: stage.releaseStatus >= 4 }"></view>
						<view class="status-step" :class="{ active: stage.releaseStatus >= 4 }">
							<view class="step-dot"></view>
							<view class="step-label fs22">已打款</view>
						</view>
					</view>
				</view>

				<!-- 金额信息 -->
				<view class="stage-section mt20">
					<view class="fs28 col5 mb10">金额信息</view>
					<view class="amount-grid">
						<view class="amount-item" v-if="stage.factorySuggestedAmount > 0">
							<view class="fs22 col9">您的建议</view>
							<view class="fs28 fwb" style="color:#1890FF;">¥{{ formatPrice(stage.factorySuggestedAmount) }}</view>
						</view>
						<view class="amount-item" v-if="stage.releaseAmount > 0">
							<view class="fs22 col9">实际放款</view>
							<view class="fs28 fwb col2">¥{{ formatPrice(stage.releaseAmount) }}</view>
						</view>
						<view class="amount-item" v-if="stage.actualCommission > 0">
							<view class="fs22 col9">佣金</view>
							<view class="fs28 fwb col1">¥{{ formatPrice(stage.actualCommission) }}</view>
						</view>
						<view class="amount-item" v-if="stage.serviceFeeCharged > 0">
							<view class="fs22 col9">服务费</view>
							<view class="fs28 fwb col-red">¥{{ formatPrice(stage.serviceFeeCharged) }}</view>
						</view>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="stage-actions mt20">
					<view v-if="stage.proofStatus === 1" class="action-btn primary" @click="goReview(stage)">
						<text class="fs28 colf fwb">审核证明</text>
					</view>
					<view v-else-if="stage.proofStatus === 3" class="action-btn warning" @click="goReview(stage)">
						<text class="fs28 colf fwb">查看驳回详情</text>
					</view>
					<view v-else class="action-btn ghost" @click="goDetail(stage)">
						<text class="fs28 col1">查看详情</text>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="stageList.length === 0" class="empty-state">
				<image src="/static/images/empty.png" mode="aspectFit" class="empty-img"></image>
				<view class="fs28 col9 mt30">暂无阶段信息</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			orderId: '',
			orderInfo: {
				orderSn: '',
				agentName: '',
				totalStages: 0,
				currentStage: 0,
				completedStages: 0
			},
			stageList: []
		}
	},
	computed: {
		progressPercent() {
			if (this.orderInfo.totalStages === 0) return 0;
			return Math.round((this.orderInfo.completedStages / this.orderInfo.totalStages) * 100);
		}
	},
	onLoad(options) {
		this.orderId = options.orderId || '';
		this.loadData();
	},
	onPullDownRefresh() {
		this.loadData().then(() => {
			uni.stopPullDownRefresh();
		});
	},
	methods: {
		loadData() {
			return new Promise((resolve, reject) => {
				uni.showLoading({ title: '加载中...' });
				uni.request({
					url: this.$baseUrl + '/api/xiluxc/FcOrder/stage_list',
					method: 'GET',
					header: {
						token: uni.getStorageSync('token')
					},
					data: {
						order_id: this.orderId
					},
					success: (res) => {
						uni.hideLoading();
						if (res.data.code === 1) {
							this.orderInfo = res.data.data.orderInfo;
							this.stageList = res.data.data.stages;
							resolve();
						} else {
							uni.showToast({ title: res.data.msg || '加载失败', icon: 'none' });
							reject();
						}
					},
					fail: () => {
						uni.hideLoading();
						uni.showToast({ title: '网络错误', icon: 'none' });
						reject();
					}
				});
			});
		},
		getStatusClass(status) {
			const classes = {
				0: 'status-pending',
				1: 'status-progress',
				2: 'status-completed'
			};
			return classes[status] || 'status-pending';
		},
		getStatusText(status) {
			const texts = {
				0: '未开始',
				1: '进行中',
				2: '已完成'
			};
			return texts[status] || '未知';
		},
		goReview(stage) {
			if (stage.proofStatus === 0) {
				uni.showToast({ title: '居间人尚未上传证明', icon: 'none' });
				return;
			}
			uni.navigateTo({
				url: `/pages/fc/fc_stage_proof_review/fc_stage_proof_review?orderId=${this.orderId}&stageNo=${stage.stageNo}&orderNo=${this.orderInfo.orderSn}&agentName=${this.orderInfo.agentName}`
			});
		},
		goDetail(stage) {
			uni.navigateTo({
				url: `/pages/fc/fc_stage_detail/fc_stage_detail?orderId=${this.orderId}&stageNo=${stage.stageNo}`
			});
		},
		formatPrice(price) {
			return Number(price || 0).toFixed(2);
		}
	}
}
</script>

<style scoped>
.progress-info {
	justify-content: space-between;
}
.progress-bar {
	width: 100%;
	height: 16rpx;
	background: #F0F0F0;
	border-radius: 8rpx;
	overflow: hidden;
}
.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #1890FF 0%, #52C41A 100%);
	transition: width 0.3s;
	border-radius: 8rpx;
}

.stage-card {
	padding: 30rpx;
	background: #fff;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
}

.stage-header {
	align-items: center;
}
.stage-badge {
	padding: 8rpx 20rpx;
	border-radius: 30rpx;
	font-size: 22rpx;
	font-weight: bold;
}
.stage-badge.status-pending {
	background: rgba(191,191,191,0.1);
	color: #8C8C8C;
}
.stage-badge.status-progress {
	background: rgba(24,144,255,0.1);
	color: #1890FF;
}
.stage-badge.status-completed {
	background: rgba(82,196,26,0.1);
	color: #52C41A;
}

.stage-section {
	padding-top: 20rpx;
	border-top: 1rpx solid #F0F0F0;
}

.proof-status-wrap {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
}
.status-step {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex-shrink: 0;
}
.step-dot {
	width: 24rpx;
	height: 24rpx;
	border-radius: 50%;
	background: #D9D9D9;
	margin-bottom: 8rpx;
	transition: all 0.3s;
}
.status-step.active .step-dot {
	background: #1890FF;
	box-shadow: 0 0 0 6rpx rgba(24,144,255,0.2);
}
.status-step.rejected .step-dot {
	background: #FF4D4F;
	box-shadow: 0 0 0 6rpx rgba(255,77,79,0.2);
}
.step-label {
	color: #BFBFBF;
	white-space: nowrap;
}
.status-step.active .step-label {
	color: #1890FF;
	font-weight: bold;
}
.status-step.rejected .step-label {
	color: #FF4D4F;
}
.status-line {
	flex: 1;
	height: 2rpx;
	background: #D9D9D9;
	margin: 0 10rpx 30rpx;
	transition: all 0.3s;
}
.status-line.active {
	background: #1890FF;
}

.amount-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
}
.amount-item {
	padding: 20rpx;
	background: #FAFAFA;
	border-radius: 8rpx;
	text-align: center;
}

.stage-actions {
	display: flex;
	gap: 20rpx;
}
.action-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.action-btn.primary {
	background: linear-gradient(135deg, #1890FF 0%, #52C41A 100%);
}
.action-btn.warning {
	background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
}
.action-btn.ghost {
	background: #fff;
	border: 2rpx solid #D9D9D9;
}

.empty-state {
	padding: 100rpx 0;
	text-align: center;
}
.empty-img {
	width: 300rpx;
	height: 300rpx;
}
</style>
