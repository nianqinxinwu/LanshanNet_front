<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 订单概况 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">订单概况</view>
				<view class="info-row bb">
					<view class="col5 fs28">订单编号</view>
					<view class="col1 fs28">{{ orderInfo.orderNo }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">交付模式</view>
					<view class="col4 fs28 fwb">分阶段交付</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">总阶段数</view>
					<view class="col1 fs28">{{ orderInfo.totalStages }}阶段</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">已完成阶段</view>
					<view class="col2 fs28 fwb">{{ orderInfo.completedStages }}阶段</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28">当前阶段</view>
					<view class="col4 fs28 fwb" v-if="orderInfo.currentStage > 0">第{{ orderInfo.currentStage }}阶段</view>
					<view class="col9 fs28" v-else>已完成</view>
				</view>
			</view>

			<!-- 进度条 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">完成进度</view>
				<view class="progress-bar-container">
					<view class="progress-bar-bg">
						<view class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></view>
					</view>
					<view class="fs28 col4 fwb mt15 tc">{{ progressPercent }}%</view>
				</view>
			</view>

			<!-- 阶段列表 -->
			<view class="fs34 fwb col1 lh36 mb20">阶段列表</view>
			<view v-for="stage in stageList" :key="stage.stageNo" class="stage-card mb20" @click="goStageDetail(stage)">
				<!-- 阶段头部 -->
				<view class="stage-header flex-box">
					<view class="stage-no-badge" :class="getBadgeClass(stage)">
						<text class="fs24 colf fwb">{{ stage.stageName }}</text>
					</view>
					<view class="flex-grow-1 ml15">
						<view class="fs28 fwb col1">{{ stage.stageName }}</view>
						<view class="fs24 col9 mt5">{{ getStageStatusDesc(stage) }}</view>
					</view>
					<view class="stage-status-tag" :class="'tag-' + getStageStatusType(stage)">
						<text class="fs22 colf">{{ getStageStatusText(stage) }}</text>
					</view>
				</view>

				<!-- 阶段进度 -->
				<view class="stage-progress mt20">
					<view class="progress-step" v-for="(step, idx) in getStageSteps(stage)" :key="idx"
						:class="{ active: step.active, current: step.current }">
						<view class="step-dot"></view>
						<view class="step-label fs20">{{ step.label }}</view>
						<view class="step-line" v-if="idx < getStageSteps(stage).length - 1"></view>
					</view>
				</view>

				<!-- 金额信息 -->
				<view class="stage-amount-info mt20 bb"></view>
				<view class="stage-amount-row flex-box mt15" v-if="stage.releaseAmount > 0">
					<view class="col5 fs24">放款金额</view>
					<view class="flex-grow-1 tr col4 fs28 fwb">¥{{ formatPrice(stage.releaseAmount) }}</view>
				</view>
				<view class="stage-amount-row flex-box mt10" v-if="stage.actualCommission > 0">
					<view class="col5 fs24">佣金金额</view>
					<view class="flex-grow-1 tr col2 fs28 fwb">¥{{ formatPrice(stage.actualCommission) }}</view>
				</view>
				<view class="stage-amount-row flex-box mt10" v-if="stage.serviceFeeCharged > 0">
					<view class="col5 fs24">技术服务费</view>
					<view class="flex-grow-1 tr col9 fs24">-¥{{ formatPrice(stage.serviceFeeCharged) }}</view>
				</view>

				<!-- 操作按钮 -->
				<view class="stage-actions mt20" v-if="getStageAction(stage)">
					<view class="stage-action-btn" :class="'btn-' + getStageAction(stage).type"
						@click.stop="onStageAction(stage, getStageAction(stage).type)">
						<text class="fs28 colf fwb">{{ getStageAction(stage).label }}</text>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && stageList.length === 0" class="empty-state">
				<image src="/static/images/empty_list.png" mode="aspectFit" class="empty-icon"></image>
				<view class="fs28 col9 mt20 tc">暂无阶段数据</view>
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
				orderNo: '',
				totalStages: 0,
				currentStage: 0,
				completedStages: 0
			},
			stageList: [],
			loading: false
		}
	},
	computed: {
		progressPercent() {
			if (this.orderInfo.totalStages === 0) return 0;
			return Math.round((this.orderInfo.completedStages / this.orderInfo.totalStages) * 100);
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId;
			this.loadData();
		}
	},
	methods: {
		loadData() {
			this.loading = true;
			uni.request({
				url: this.$baseUrl + '/api/xiluxc/JjOrder/stage_list',
				method: 'GET',
				header: {
					token: uni.getStorageSync('token')
				},
				data: {
					order_id: this.orderId
				},
				success: (res) => {
					if (res.data.code === 1) {
						const data = res.data.data;
						this.orderInfo = {
							orderNo: data.order_sn,
							totalStages: data.total_stages,
							currentStage: data.current_stage,
							completedStages: data.completed_stages
						};
						this.stageList = data.stages || [];
					} else {
						uni.showToast({ title: res.data.msg || '加载失败', icon: 'none' });
					}
				},
				fail: () => {
					uni.showToast({ title: '网络错误', icon: 'none' });
				},
				complete: () => {
					this.loading = false;
				}
			});
		},
		getBadgeClass(stage) {
			if (stage.status === 2) return 'badge-completed';
			if (stage.status === 1) return 'badge-current';
			return 'badge-pending';
		},
		getStageStatusType(stage) {
			if (stage.status === 2) return 'success';
			if (stage.status === 1) return 'processing';
			return 'default';
		},
		getStageStatusText(stage) {
			if (stage.status === 2) return '已完成';
			if (stage.status === 1) return '进行中';
			return '未开始';
		},
		getStageStatusDesc(stage) {
			if (stage.releaseStatus === 4) return '打款已完成，佣金已到账';
			if (stage.releaseStatus === 3) return '财务审核打款中';
			if (stage.releaseStatus === 2) return '已通知打款';
			if (stage.releaseStatus === 1) return '等待客服确认放款金额';
			if (stage.proofStatus === 2) return '付款证明已通过，等待放款';
			if (stage.proofStatus === 3) return '付款证明被驳回，需重新上传';
			if (stage.proofStatus === 1) return '付款证明审核中';
			if (stage.status === 1) return '等待上传付款证明';
			return '等待上一阶段完成';
		},
		getStageSteps(stage) {
			return [
				{ label: '上传证明', active: stage.proofStatus > 0, current: stage.proofStatus === 1 },
				{ label: '工厂审核', active: stage.proofStatus > 1, current: stage.proofStatus === 1 },
				{ label: '客服确认', active: stage.releaseStatus > 0, current: stage.releaseStatus === 1 },
				{ label: '打款完成', active: stage.releaseStatus === 4, current: stage.releaseStatus === 3 }
			];
		},
		getStageAction(stage) {
			// 只有当前阶段才能操作
			if (stage.stageNo !== this.orderInfo.currentStage) return null;

			// 未上传付款证明
			if (stage.proofStatus === 0) {
				return { type: 'upload', label: '上传付款证明' };
			}
			// 被驳回
			if (stage.proofStatus === 3) {
				return { type: 'upload', label: '重新上传证明' };
			}
			// 其他状态只能查看
			if (stage.proofStatus > 0) {
				return { type: 'view', label: '查看详情' };
			}
			return null;
		},
		onStageAction(stage, type) {
			if (type === 'upload') {
				uni.navigateTo({
					url: '/pages/jj/jj_stage_proof_upload/jj_stage_proof_upload?orderId=' + this.orderId + '&stageNo=' + stage.stageNo
				});
			}
		},
		goStageDetail(stage) {
			uni.navigateTo({
				url: '/pages/jj/jj_stage_detail/jj_stage_detail?orderId=' + this.orderId + '&stageNo=' + stage.stageNo
			});
		},
		formatPrice(price) {
			return Number(price || 0).toFixed(2);
		}
	}
}
</script>

<style scoped>
.progress-bar-container {
	padding: 20rpx 0;
}
.progress-bar-bg {
	height: 16rpx;
	background: #F0F0F0;
	border-radius: 8rpx;
	overflow: hidden;
}
.progress-bar-fill {
	height: 100%;
	background: linear-gradient(90deg, #1890FF 0%, #52C41A 100%);
	transition: width 0.3s;
}

.stage-card {
	background: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}
.stage-header {
	align-items: center;
}
.stage-no-badge {
	width: 120rpx;
	height: 60rpx;
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.badge-completed { background: #52C41A; }
.badge-current { background: #1890FF; }
.badge-pending { background: #D9D9D9; }

.stage-status-tag {
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
}
.tag-success { background: rgba(82,196,26,0.1); color: #52C41A !important; }
.tag-processing { background: rgba(24,144,255,0.1); color: #1890FF !important; }
.tag-default { background: rgba(0,0,0,0.05); color: #8C8C8C !important; }

.stage-progress {
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	padding: 20rpx 0;
}
.progress-step {
	position: relative;
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.step-dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	background: #D9D9D9;
	position: relative;
	z-index: 2;
}
.progress-step.active .step-dot {
	background: #1890FF;
}
.progress-step.current .step-dot {
	width: 30rpx;
	height: 30rpx;
	background: #1890FF;
	box-shadow: 0 0 0 6rpx rgba(24,144,255,0.2);
}
.step-label {
	margin-top: 10rpx;
	color: #8C8C8C;
	white-space: nowrap;
}
.progress-step.active .step-label {
	color: #1890FF;
	font-weight: bold;
}
.step-line {
	position: absolute;
	top: 10rpx;
	left: 50%;
	width: 100%;
	height: 2rpx;
	background: #D9D9D9;
	z-index: 1;
}
.progress-step.active .step-line {
	background: #1890FF;
}

.stage-amount-row {
	padding: 10rpx 0;
}
.stage-actions {
	display: flex;
	gap: 20rpx;
}
.stage-action-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.btn-upload {
	background: linear-gradient(135deg, #1890FF 0%, #52C41A 100%);
}
.btn-view {
	background: #F0F0F0;
	color: #595959 !important;
}

.empty-state {
	padding: 100rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.empty-icon {
	width: 300rpx;
	height: 300rpx;
	opacity: 0.5;
}
</style>
