<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 阶段信息 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">阶段信息</view>
				<view class="info-row bb">
					<view class="col5 fs28">阶段名称</view>
					<view class="col1 fs28 fwb">{{ stageInfo.stageName }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">订单编号</view>
					<view class="col1 fs28">{{ orderNo }}</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28">居间人</view>
					<view class="col1 fs28">{{ agentName }}</view>
				</view>
			</view>

			<!-- 付款证明 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">付款证明文件</view>

				<!-- 证明文件列表 -->
				<view class="proof-files" v-if="stageInfo.proofFileUrls && stageInfo.proofFileUrls.length">
					<view v-for="(url, idx) in stageInfo.proofFileUrls" :key="idx"
						class="proof-file-card mb15" @click="previewFile(url)">
						<view class="file-preview">
							<image v-if="!isPdf(url)" :src="url" mode="aspectFill" class="preview-img"></image>
							<view v-else class="pdf-icon-wrap">
								<text class="fs40 colf">PDF</text>
							</view>
						</view>
						<view class="file-info">
							<view class="fs28 col1 fwb m-ellipsis">{{ getFileName(url) }}</view>
							<view class="fs24 col4 mt5">点击查看大图</view>
						</view>
					</view>
				</view>

				<!-- 备注信息 -->
				<view class="mt20" v-if="stageInfo.proofRemark">
					<view class="fs28 col5 mb10">居间人备注</view>
					<view class="remark-box fs26 col1">{{ stageInfo.proofRemark }}</view>
				</view>
			</view>

			<!-- 审核操作区 -->
			<view class="jj-box mb30" v-if="stageInfo.proofStatus === 1">
				<view class="fs34 fwb col1 lh36 mb20">审核操作</view>

				<!-- 审核结果选择 -->
				<view class="review-options mb30">
					<view class="review-option" :class="{ active: reviewAction === 'approve' }"
						@click="reviewAction = 'approve'">
						<view class="option-icon" :class="{ active: reviewAction === 'approve' }">
							<text class="fs28 colf">✓</text>
						</view>
						<view class="option-label fs28 fwb">通过</view>
					</view>
					<view class="review-option" :class="{ active: reviewAction === 'reject' }"
						@click="reviewAction = 'reject'">
						<view class="option-icon reject" :class="{ active: reviewAction === 'reject' }">
							<text class="fs28 colf">✕</text>
						</view>
						<view class="option-label fs28 fwb">驳回</view>
					</view>
				</view>

				<!-- 通过时填写建议金额 -->
				<view v-if="reviewAction === 'approve'" class="approve-section">
					<view class="fs28 col1 mb15">
						建议放款金额
						<text class="fs24 col-red ml10">*</text>
					</view>
					<view class="amount-input-wrap">
						<text class="amount-prefix fs32 col4">¥</text>
						<input v-model="suggestedAmount" type="digit" placeholder="请输入建议放款金额"
							class="amount-input fs36" />
					</view>
					<view class="fs24 col9 mt15 lh36">
						提示：建议金额将提交给客服作为参考，客服可根据实际情况调整最终放款金额
					</view>
				</view>

				<!-- 驳回时填写驳回原因 -->
				<view v-if="reviewAction === 'reject'" class="reject-section">
					<view class="fs28 col1 mb15">
						驳回原因
						<text class="fs24 col-red ml10">*</text>
					</view>
					<textarea v-model="rejectReason" placeholder="请输入驳回原因，便于居间人重新提交"
						class="reject-textarea" maxlength="200" placeholder-class="textarea-placeholder"></textarea>
					<view class="fs22 col9 tr mt10">{{ rejectReason.length }}/200</view>
				</view>
			</view>

			<!-- 已审核状态 -->
			<view class="jj-box mb30" v-else-if="stageInfo.proofStatus === 2">
				<view class="reviewed-status">
					<view class="status-icon success">
						<text class="fs32 colf">✓</text>
					</view>
					<view class="fs32 fwb col1 mt20">审核已通过</view>
					<view class="fs26 col9 mt15">建议金额：¥{{ formatPrice(stageInfo.factorySuggestedAmount) }}</view>
					<view class="fs24 col9 mt10">等待客服确认放款</view>
				</view>
			</view>

			<view class="jj-box mb30" v-else-if="stageInfo.proofStatus === 3">
				<view class="reviewed-status">
					<view class="status-icon reject">
						<text class="fs32 colf">✕</text>
					</view>
					<view class="fs32 fwb mt20" style="color:#FF4D4F;">审核已驳回</view>
					<view class="fs26 col9 mt15">驳回原因：{{ stageInfo.proofRejectReason }}</view>
					<view class="fs24 col9 mt10">等待居间人重新上传</view>
				</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-btn-wrap" v-if="stageInfo.proofStatus === 1">
				<view class="submit-btn" @click="submitReview" :class="{ disabled: !canSubmit }">
					<text class="fs32 colf fwb">{{ reviewAction === 'approve' ? '确认通过' : '确认驳回' }}</text>
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
			orderNo: '',
			agentName: '',
			stageInfo: {
				stageName: '',
				proofStatus: 0,
				proofFileUrls: [],
				proofRemark: '',
				factorySuggestedAmount: 0,
				proofRejectReason: ''
			},
			reviewAction: 'approve', // approve | reject
			suggestedAmount: '',
			rejectReason: '',
			submitting: false
		}
	},
	computed: {
		canSubmit() {
			if (this.submitting) return false;
			if (this.reviewAction === 'approve') {
				return this.suggestedAmount && Number(this.suggestedAmount) > 0;
			}
			return this.rejectReason.trim().length > 0;
		}
	},
	onLoad(options) {
		this.orderId = options.orderId || '';
		this.stageNo = parseInt(options.stageNo) || 0;
		this.orderNo = options.orderNo || '';
		this.agentName = options.agentName || '';
		this.loadData();
	},
	methods: {
		loadData() {
			uni.showLoading({ title: '加载中...' });
			uni.request({
				url: this.$baseUrl + '/api/xiluxc/FcOrder/stage_detail',
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
		submitReview() {
			if (!this.canSubmit) return;

			const data = {
				order_id: this.orderId,
				stage_no: this.stageNo,
				action: this.reviewAction
			};

			if (this.reviewAction === 'approve') {
				data.suggested_amount = this.suggestedAmount;
			} else {
				data.reject_reason = this.rejectReason.trim();
			}

			uni.showModal({
				title: '确认操作',
				content: `确定要${this.reviewAction === 'approve' ? '通过' : '驳回'}此付款证明吗？`,
				success: (res) => {
					if (res.confirm) {
						this.doSubmit(data);
					}
				}
			});
		},
		doSubmit(data) {
			this.submitting = true;
			uni.showLoading({ title: '提交中...' });

			uni.request({
				url: this.$baseUrl + '/api/xiluxc/FcOrder/review_stage_proof',
				method: 'POST',
				header: {
					token: uni.getStorageSync('token')
				},
				data: data,
				success: (res) => {
					uni.hideLoading();
					if (res.data.code === 1) {
						uni.showToast({ title: '提交成功', icon: 'success' });
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({ title: res.data.msg || '提交失败', icon: 'none' });
					}
				},
				fail: () => {
					uni.hideLoading();
					uni.showToast({ title: '网络错误', icon: 'none' });
				},
				complete: () => {
					this.submitting = false;
				}
			});
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
		formatPrice(price) {
			return Number(price || 0).toFixed(2);
		}
	}
}
</script>

<style scoped>
.proof-files {
	display: flex;
	flex-direction: column;
}
.proof-file-card {
	background: #FAFAFA;
	border-radius: 12rpx;
	overflow: hidden;
}
.file-preview {
	width: 100%;
	height: 400rpx;
	background: #F0F0F0;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}
.preview-img {
	width: 100%;
	height: 100%;
}
.pdf-icon-wrap {
	width: 120rpx;
	height: 120rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}
.file-info {
	padding: 20rpx;
}

.remark-box {
	padding: 20rpx;
	background: #FAFAFA;
	border-radius: 8rpx;
	line-height: 1.6;
}

.review-options {
	display: flex;
	gap: 30rpx;
}
.review-option {
	flex: 1;
	padding: 30rpx;
	border-radius: 12rpx;
	border: 2rpx solid #D9D9D9;
	display: flex;
	flex-direction: column;
	align-items: center;
	background: #FAFAFA;
	transition: all 0.3s;
}
.review-option.active {
	border-color: #1890FF;
	background: rgba(24,144,255,0.05);
}
.option-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: #D9D9D9;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 15rpx;
}
.option-icon.active {
	background: #52C41A;
}
.option-icon.reject.active {
	background: #FF4D4F;
}
.option-label {
	color: #8C8C8C;
}
.review-option.active .option-label {
	color: #1890FF;
}

.approve-section, .reject-section {
	padding: 30rpx;
	background: #F7F9FA;
	border-radius: 12rpx;
	border-left: 4rpx solid #1890FF;
}
.reject-section {
	border-color: #FF4D4F;
}

.amount-input-wrap {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background: #fff;
	border-radius: 8rpx;
	border: 2rpx solid #D9D9D9;
}
.amount-prefix {
	margin-right: 10rpx;
	font-weight: bold;
}
.amount-input {
	flex: 1;
	font-weight: bold;
	color: #1890FF;
}

.reject-textarea {
	width: 100%;
	min-height: 200rpx;
	padding: 20rpx;
	background: #fff;
	border-radius: 8rpx;
	border: 2rpx solid #D9D9D9;
	font-size: 28rpx;
	line-height: 1.6;
}
.textarea-placeholder {
	color: #BFBFBF;
}

.reviewed-status {
	padding: 60rpx 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.status-icon {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.status-icon.success {
	background: #52C41A;
}
.status-icon.reject {
	background: #FF4D4F;
}

.submit-btn-wrap {
	padding: 30rpx 0 60rpx;
}
.submit-btn {
	height: 96rpx;
	border-radius: 48rpx;
	background: linear-gradient(135deg, #1890FF 0%, #52C41A 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}
.submit-btn.disabled {
	background: #D9D9D9;
	opacity: 0.5;
}
</style>
