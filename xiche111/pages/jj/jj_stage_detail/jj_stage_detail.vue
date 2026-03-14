<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 阶段状态横幅 -->
			<view class="jj-box mb30 status-banner" :class="'banner-' + getStatusType(stageInfo)">
				<view class="tc">
					<view class="fs32 fwb colf">{{ getStatusTitle(stageInfo) }}</view>
					<view class="fs24 colf mt10" style="opacity:0.8;">{{ getStatusDesc(stageInfo) }}</view>
				</view>
			</view>

			<!-- 阶段基本信息 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">阶段信息</view>
				<view class="info-row bb">
					<view class="col5 fs28">阶段名称</view>
					<view class="col1 fs28 fwb">{{ stageInfo.stageName }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">阶段序号</view>
					<view class="col1 fs28">第{{ stageInfo.stageNo }}阶段</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28">阶段状态</view>
					<view class="fs28" :class="'status-color-' + stageInfo.status">{{ stageInfo.statusText }}</view>
				</view>
			</view>

			<!-- 付款证明信息 -->
			<view class="jj-box mb30" v-if="stageInfo.proofStatus > 0">
				<view class="fs34 fwb col1 lh36 mb20">付款证明</view>

				<!-- 证明状态 -->
				<view class="proof-status-card mb20" :class="'status-' + stageInfo.proofStatus">
					<view class="flex-box">
						<view class="proof-status-icon">
							<text class="fs28 colf">{{ getProofIcon(stageInfo.proofStatus) }}</text>
						</view>
						<view class="flex-grow-1 ml15">
							<view class="fs28 fwb col1">{{ getProofStatusText(stageInfo.proofStatus) }}</view>
							<view class="fs24 col9 mt5">{{ getProofStatusDesc(stageInfo.proofStatus) }}</view>
						</view>
					</view>

					<!-- 驳回原因 -->
					<view class="reject-reason mt15" v-if="stageInfo.proofStatus === 3 && stageInfo.proofRejectReason">
						<view class="fs24 fwb col-red mb10">驳回原因</view>
						<view class="fs24 col5">{{ stageInfo.proofRejectReason }}</view>
					</view>
				</view>

				<!-- 证明文件 -->
				<view class="proof-files" v-if="stageInfo.proofFileUrls && stageInfo.proofFileUrls.length">
					<view class="fs28 col5 mb15">证明文件</view>
					<view v-for="(url, idx) in stageInfo.proofFileUrls" :key="idx"
						class="proof-file-item flex-box mb10" @click="previewFile(url)">
						<view class="file-icon">
							<text class="fs20 colf">{{ isPdf(url) ? 'PDF' : '图' }}</text>
						</view>
						<view class="flex-grow-1 ml15 fs24 col1 m-ellipsis">{{ getFileName(url) }}</view>
						<view class="fs24 col4">查看</view>
					</view>
				</view>

				<!-- 备注信息 -->
				<view class="mt20" v-if="stageInfo.proofRemark">
					<view class="fs28 col5 mb10">备注说明</view>
					<view class="remark-box fs24 col1">{{ stageInfo.proofRemark }}</view>
				</view>

				<!-- 重新上传按钮 -->
				<view class="mt20" v-if="stageInfo.proofStatus === 3">
					<view class="action-btn-primary" @click="goReupload">
						<text class="fs28 colf fwb">重新上传证明</text>
					</view>
				</view>
			</view>

			<!-- 放款信息 -->
			<view class="jj-box mb30" v-if="stageInfo.releaseStatus > 0">
				<view class="fs34 fwb col1 lh36 mb20">放款信息</view>

				<view class="info-row bb" v-if="stageInfo.factorySuggestedAmount > 0">
					<view class="col5 fs28">工厂建议金额</view>
					<view class="col1 fs28">¥{{ formatPrice(stageInfo.factorySuggestedAmount) }}</view>
				</view>
				<view class="info-row bb" v-if="stageInfo.releaseAmount > 0">
					<view class="col5 fs28">实际放款金额</view>
					<view class="col4 fs28 fwb">¥{{ formatPrice(stageInfo.releaseAmount) }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">放款状态</view>
					<view class="fs28" :class="'status-color-' + stageInfo.releaseStatus">
						{{ stageInfo.releaseStatusText }}
					</view>
				</view>
				<view class="info-row" v-if="stageInfo.releaseNotifiedAt">
					<view class="col5 fs28">通知打款时间</view>
					<view class="col1 fs24">{{ formatTime(stageInfo.releaseNotifiedAt) }}</view>
				</view>
			</view>

			<!-- 佣金信息 -->
			<view class="jj-box mb30" v-if="stageInfo.actualCommission > 0">
				<view class="fs34 fwb col1 lh36 mb20">佣金明细</view>

				<view class="info-row bb">
					<view class="col5 fs28">本阶段佣金</view>
					<view class="col2 fs28 fwb">¥{{ formatPrice(stageInfo.actualCommission) }}</view>
				</view>
				<view class="info-row bb" v-if="stageInfo.serviceFeeCharged > 0">
					<view class="col5 fs28">技术服务费</view>
					<view class="col-red fs28">-¥{{ formatPrice(stageInfo.serviceFeeCharged) }}</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28 fwb">实际到账</view>
					<view class="col2 fs32 fwb">¥{{ formatPrice(netAmount) }}</view>
				</view>

				<!-- 佣金状态 -->
				<view class="commission-status-card mt20" v-if="stageInfo.commission">
					<view class="flex-box">
						<view class="flex-grow-1">
							<view class="fs28 fwb col1">打款状态</view>
							<view class="fs24 col9 mt5">{{ getPayStatusDesc(stageInfo.commission.payStatus) }}</view>
						</view>
						<view class="status-badge" :class="'badge-' + stageInfo.commission.payStatus">
							<text class="fs24 colf">{{ getPayStatusText(stageInfo.commission.payStatus) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 操作记录时间线 -->
			<view class="jj-box mb30" v-if="showTimeline">
				<view class="fs34 fwb col1 lh36 mb20">操作记录</view>

				<view class="timeline">
					<view class="timeline-item" v-for="(item, idx) in timelineItems" :key="idx">
						<view class="timeline-dot" :class="{ active: item.active }"></view>
						<view class="timeline-line" v-if="idx < timelineItems.length - 1"></view>
						<view class="timeline-content">
							<view class="fs28 col1 fwb mb5">{{ item.title }}</view>
							<view class="fs24 col9">{{ item.time }}</view>
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
			orderId: '',
			stageNo: 0,
			stageInfo: {
				stageName: '',
				stageNo: 0,
				status: 0,
				proofStatus: 0,
				releaseStatus: 0,
				proofFileUrls: [],
				proofRemark: '',
				proofRejectReason: '',
				factorySuggestedAmount: 0,
				releaseAmount: 0,
				actualCommission: 0,
				serviceFeeCharged: 0,
				commission: null
			}
		}
	},
	computed: {
		netAmount() {
			return Number(this.stageInfo.actualCommission || 0) - Number(this.stageInfo.serviceFeeCharged || 0);
		},
		showTimeline() {
			return this.stageInfo.proofStatus > 0;
		},
		timelineItems() {
			const items = [];

			if (this.stageInfo.proofUploadedAt) {
				items.push({
					title: '上传付款证明',
					time: this.formatTime(this.stageInfo.proofUploadedAt),
					active: true
				});
			}

			if (this.stageInfo.proofReviewedAt) {
				items.push({
					title: this.stageInfo.proofStatus === 2 ? '工厂审核通过' : '工厂审核驳回',
					time: this.formatTime(this.stageInfo.proofReviewedAt),
					active: true
				});
			}

			if (this.stageInfo.releaseFilledAt) {
				items.push({
					title: '客服确认放款金额',
					time: this.formatTime(this.stageInfo.releaseFilledAt),
					active: true
				});
			}

			if (this.stageInfo.releaseNotifiedAt) {
				items.push({
					title: '通知打款',
					time: this.formatTime(this.stageInfo.releaseNotifiedAt),
					active: true
				});
			}

			if (this.stageInfo.releaseAuditingAt) {
				items.push({
					title: '审核打款',
					time: this.formatTime(this.stageInfo.releaseAuditingAt),
					active: true
				});
			}

			if (this.stageInfo.releaseCompletedAt) {
				items.push({
					title: '打款完成',
					time: this.formatTime(this.stageInfo.releaseCompletedAt),
					active: true
				});
			}

			return items;
		}
	},
	onLoad(options) {
		this.orderId = options.orderId || '';
		this.stageNo = parseInt(options.stageNo) || 0;
		this.loadData();
	},
	methods: {
		loadData() {
			uni.showLoading({ title: '加载中...' });
			uni.request({
				url: this.$baseUrl + '/api/xiluxc/JjOrder/stage_detail',
				method: 'GET',
				header: {
					token: uni.getStorageSync('token')
				},
				data: {
					order_id: this.orderId,
					stage_no: this.stageNo
				},
				success: (res) => {
					uni.hideLoading();
					if (res.data.code === 1) {
						this.stageInfo = res.data.data;
					} else {
						uni.showToast({ title: res.data.msg || '加载失败', icon: 'none' });
					}
				},
				fail: () => {
					uni.hideLoading();
					uni.showToast({ title: '网络错误', icon: 'none' });
				}
			});
		},
		getStatusType(stage) {
			if (stage.status === 2) return 'success';
			if (stage.proofStatus === 3) return 'error';
			if (stage.status === 1) return 'processing';
			return 'default';
		},
		getStatusTitle(stage) {
			if (stage.status === 2) return '阶段已完成';
			if (stage.proofStatus === 3) return '付款证明被驳回';
			if (stage.releaseStatus === 4) return '打款已完成';
			if (stage.releaseStatus === 3) return '财务审核中';
			if (stage.proofStatus === 1) return '证明审核中';
			if (stage.status === 1) return '阶段进行中';
			return '等待开始';
		},
		getStatusDesc(stage) {
			if (stage.status === 2) return '佣金已到账，进入下一阶段';
			if (stage.proofStatus === 3) return '请重新上传付款证明';
			if (stage.releaseStatus === 4) return '佣金已到账';
			if (stage.releaseStatus === 3) return '财务正在审核打款';
			if (stage.proofStatus === 1) return '工厂正在审核付款证明';
			if (stage.status === 1) return '请上传付款证明';
			return '等待上一阶段完成';
		},
		getProofIcon(status) {
			if (status === 2) return '✓';
			if (status === 3) return '✕';
			return '?';
		},
		getProofStatusText(status) {
			const map = { 0: '未上传', 1: '待审核', 2: '已通过', 3: '已驳回' };
			return map[status] || '未知';
		},
		getProofStatusDesc(status) {
			if (status === 1) return '工厂正在审核您上传的付款证明';
			if (status === 2) return '工厂已确认付款证明，等待放款';
			if (status === 3) return '工厂驳回了您的付款证明';
			return '';
		},
		getPayStatusText(status) {
			const map = { 0: '待处理', 1: '通知打款', 2: '审核中', 3: '已完成', 4: '失败' };
			return map[status] || '未知';
		},
		getPayStatusDesc(status) {
			if (status === 1) return '已通知财务打款';
			if (status === 2) return '财务正在审核';
			if (status === 3) return '打款已完成，佣金已到账';
			return '等待处理';
		},
		isPdf(url) {
			return url.toLowerCase().endsWith('.pdf');
		},
		getFileName(url) {
			return url.split('/').pop();
		},
		previewFile(url) {
			if (this.isPdf(url)) {
				uni.downloadFile({
					url: url,
					success: (res) => {
						uni.openDocument({
							filePath: res.tempFilePath,
							showMenu: true
						});
					}
				});
			} else {
				uni.previewImage({
					urls: this.stageInfo.proofFileUrls.filter(u => !this.isPdf(u)),
					current: url
				});
			}
		},
		goReupload() {
			uni.navigateTo({
				url: '/pages/jj/jj_stage_proof_upload/jj_stage_proof_upload?orderId=' + this.orderId +
					'&stageNo=' + this.stageNo +
					'&orderNo=' + this.stageInfo.orderNo +
					'&stageName=' + this.stageInfo.stageName +
					'&rejectReason=' + encodeURIComponent(this.stageInfo.proofRejectReason || '')
			});
		},
		formatPrice(price) {
			return Number(price || 0).toFixed(2);
		},
		formatTime(timestamp) {
			if (!timestamp) return '';
			const d = new Date(timestamp * 1000);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
		}
	}
}
</script>

<style scoped>
.status-banner {
	padding: 40rpx;
	border-radius: 16rpx;
}
.banner-success { background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%); }
.banner-error { background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%); }
.banner-processing { background: linear-gradient(135deg, #1890FF 0%, #40A9FF 100%); }
.banner-default { background: linear-gradient(135deg, #8C8C8C 0%, #BFBFBF 100%); }

.proof-status-card {
	padding: 20rpx;
	border-radius: 8rpx;
	border-left: 4rpx solid;
}
.status-1 {
	background: rgba(24,144,255,0.1);
	border-color: #1890FF;
}
.status-2 {
	background: rgba(82,196,26,0.1);
	border-color: #52C41A;
}
.status-3 {
	background: rgba(255,77,79,0.1);
	border-color: #FF4D4F;
}

.proof-status-icon {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background: rgba(24,144,255,0.2);
	display: flex;
	align-items: center;
	justify-content: center;
}
.status-2 .proof-status-icon { background: rgba(82,196,26,0.2); }
.status-3 .proof-status-icon { background: rgba(255,77,79,0.2); }

.reject-reason {
	padding: 15rpx;
	background: rgba(255,255,255,0.5);
	border-radius: 8rpx;
}

.proof-files, .remark-box {
	padding: 20rpx;
	background: #FAFAFA;
	border-radius: 8rpx;
}
.proof-file-item {
	padding: 15rpx;
	background: #fff;
	border-radius: 8rpx;
	align-items: center;
}
.file-icon {
	width: 50rpx;
	height: 50rpx;
	border-radius: 8rpx;
	background: linear-gradient(135deg, #1890FF 0%, #52C41A 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.commission-status-card {
	padding: 20rpx;
	background: #FAFAFA;
	border-radius: 8rpx;
}
.status-badge {
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
}
.badge-1 { background: #1890FF; }
.badge-2 { background: #FA8C16; }
.badge-3 { background: #52C41A; }

.timeline {
	padding: 20rpx 0;
}
.timeline-item {
	position: relative;
	padding-left: 50rpx;
	padding-bottom: 30rpx;
}
.timeline-dot {
	position: absolute;
	left: 0;
	top: 8rpx;
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	background: #D9D9D9;
	border: 4rpx solid #fff;
	box-shadow: 0 0 0 2rpx #D9D9D9;
}
.timeline-dot.active {
	background: #1890FF;
	box-shadow: 0 0 0 2rpx #1890FF;
}
.timeline-line {
	position: absolute;
	left: 10rpx;
	top: 28rpx;
	bottom: -30rpx;
	width: 2rpx;
	background: #D9D9D9;
}
.timeline-content {
	padding-top: 2rpx;
}

.action-btn-primary {
	height: 80rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, #1890FF 0%, #52C41A 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.status-color-0 { color: #8C8C8C; }
.status-color-1 { color: #1890FF; }
.status-color-2 { color: #52C41A; }
.status-color-3 { color: #FA8C16; }
.status-color-4 { color: #52C41A; }
</style>
