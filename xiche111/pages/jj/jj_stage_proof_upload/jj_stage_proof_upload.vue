<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 阶段信息 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">阶段信息</view>
				<view class="info-row bb">
					<view class="col5 fs28">阶段名称</view>
					<view class="col1 fs28">{{ stageName }}</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28">订单编号</view>
					<view class="col1 fs28">{{ orderNo }}</view>
				</view>
			</view>

			<!-- 上传提示 -->
			<view class="jj-box mb30" v-if="rejectReason">
				<view class="reject-notice">
					<view class="fs28 fwb mb10" style="color:#FF4D4F;">上次提交被驳回</view>
					<view class="fs24 col5">驳回原因：{{ rejectReason }}</view>
				</view>
			</view>

			<!-- 上传区域 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">
					付款证明
					<text class="fs24 col-red ml10">*</text>
				</view>
				<view class="fs24 col9 mb20 lh36">请上传买家支付给您的付款凭证（支持JPG、PNG、PDF格式，最多5张）</view>

				<!-- 文件列表 -->
				<view class="file-list">
					<view v-for="(file, idx) in fileList" :key="idx" class="file-item flex-box mb15">
						<view class="file-icon" :class="file.type === 'pdf' ? 'file-icon-pdf' : 'file-icon-img'">
							<text class="fs20 colf">{{ file.type === 'pdf' ? 'PDF' : '图' }}</text>
						</view>
						<view class="flex-grow-1 ml15">
							<view class="fs28 col1 m-ellipsis">{{ file.name }}</view>
							<view class="fs22 col9 mt5">{{ formatFileSize(file.size) }}</view>
						</view>
						<view class="file-delete" @click="deleteFile(idx)">
							<text class="fs20 col-red">删除</text>
						</view>
					</view>
				</view>

				<!-- 上传按钮 -->
				<view class="upload-btn" @click="chooseFile" v-if="fileList.length < 5">
					<view class="upload-icon">
						<text class="fs40 col4">+</text>
					</view>
					<view class="fs24 col9 mt15">点击上传文件</view>
				</view>
			</view>

			<!-- 备注说明 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">备注说明</view>
				<textarea v-model="remark" placeholder="请输入备注信息（选填）" class="remark-textarea"
					maxlength="500" placeholder-class="textarea-placeholder"></textarea>
				<view class="fs22 col9 tr mt10">{{ remark.length }}/500</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-btn-wrap">
				<view class="submit-btn" @click="submitProof" :class="{ disabled: !canSubmit }">
					<text class="fs32 colf fwb">提交审核</text>
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
			stageName: '',
			rejectReason: '',
			fileList: [],
			remark: '',
			uploading: false
		}
	},
	computed: {
		canSubmit() {
			return this.fileList.length > 0 && !this.uploading;
		}
	},
	onLoad(options) {
		this.orderId = options.orderId || '';
		this.stageNo = parseInt(options.stageNo) || 0;
		this.orderNo = options.orderNo || '';
		this.stageName = options.stageName || `第${this.stageNo}阶段`;
		this.rejectReason = options.rejectReason || '';
	},
	methods: {
		chooseFile() {
			uni.chooseImage({
				count: 5 - this.fileList.length,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFiles = res.tempFiles || res.tempFilePaths.map((path, idx) => ({
						path: path,
						size: 0
					}));

					tempFiles.forEach(file => {
						const fileName = file.path.split('/').pop();
						const fileType = fileName.split('.').pop().toLowerCase();

						this.fileList.push({
							path: file.path,
							name: fileName,
							size: file.size || 0,
							type: fileType === 'pdf' ? 'pdf' : 'img',
							uploaded: false,
							url: ''
						});
					});
				}
			});
		},
		deleteFile(idx) {
			uni.showModal({
				title: '提示',
				content: '确定删除该文件吗？',
				success: (res) => {
					if (res.confirm) {
						this.fileList.splice(idx, 1);
					}
				}
			});
		},
		async submitProof() {
			if (!this.canSubmit) return;

			// 先上传所有文件
			uni.showLoading({ title: '上传中...' });
			this.uploading = true;

			try {
				const uploadedUrls = [];

				for (let file of this.fileList) {
					if (file.uploaded) {
						uploadedUrls.push(file.url);
						continue;
					}

					const url = await this.uploadFile(file.path);
					uploadedUrls.push(url);
				}

				// 提交付款证明
				const res = await this.submitToServer(uploadedUrls);

				uni.hideLoading();

				if (res.code === 1) {
					uni.showToast({ title: '提交成功', icon: 'success' });
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({ title: res.msg || '提交失败', icon: 'none' });
				}
			} catch (e) {
				uni.hideLoading();
				uni.showToast({ title: '上传失败，请重试', icon: 'none' });
			} finally {
				this.uploading = false;
			}
		},
		uploadFile(filePath) {
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: this.$baseUrl + '/api/xiluxc/Common/upload',
					filePath: filePath,
					name: 'file',
					header: {
						token: uni.getStorageSync('token')
					},
					success: (res) => {
						const data = JSON.parse(res.data);
						if (data.code === 1) {
							resolve(data.data.url);
						} else {
							reject(new Error(data.msg));
						}
					},
					fail: reject
				});
			});
		},
		submitToServer(fileUrls) {
			return new Promise((resolve, reject) => {
				uni.request({
					url: this.$baseUrl + '/api/xiluxc/JjOrder/upload_stage_proof',
					method: 'POST',
					header: {
						token: uni.getStorageSync('token')
					},
					data: {
						order_id: this.orderId,
						stage_no: this.stageNo,
						file_urls: fileUrls,
						remark: this.remark
					},
					success: (res) => {
						resolve(res.data);
					},
					fail: reject
				});
			});
		},
		formatFileSize(bytes) {
			if (bytes === 0) return '未知大小';
			const k = 1024;
			const sizes = ['B', 'KB', 'MB', 'GB'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return (bytes / Math.pow(k, i)).toFixed(1) + sizes[i];
		}
	}
}
</script>

<style scoped>
.reject-notice {
	padding: 20rpx;
	background: rgba(255,77,79,0.1);
	border-radius: 8rpx;
	border-left: 4rpx solid #FF4D4F;
}

.file-list {
	margin-bottom: 20rpx;
}
.file-item {
	padding: 20rpx;
	background: #FAFAFA;
	border-radius: 8rpx;
	align-items: center;
}
.file-icon {
	width: 60rpx;
	height: 60rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.file-icon-img {
	background: linear-gradient(135deg, #1890FF 0%, #52C41A 100%);
}
.file-icon-pdf {
	background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
}
.file-delete {
	padding: 10rpx 20rpx;
}

.upload-btn {
	padding: 60rpx 0;
	border: 2rpx dashed #D9D9D9;
	border-radius: 8rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #FAFAFA;
}
.upload-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: #F0F0F0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.remark-textarea {
	width: 100%;
	min-height: 200rpx;
	padding: 20rpx;
	background: #FAFAFA;
	border-radius: 8rpx;
	font-size: 28rpx;
	line-height: 1.6;
}
.textarea-placeholder {
	color: #BFBFBF;
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
