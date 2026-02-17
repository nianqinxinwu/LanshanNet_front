<template>
	<view class="proof-page">
		<!-- 驳回提示 -->
		<view class="reject-banner" v-if="rejectReason">
			<text class="fs26 col-red">上次提交被驳回：{{ rejectReason }}</text>
		</view>

		<!-- 订单信息 -->
		<view class="card mt20">
			<view class="flex-box">
				<image :src="orderInfo.coverImage" mode="aspectFill" class="cover-img"></image>
				<view class="flex-grow-1 pl20">
					<view class="fs30 col1 fwb m-ellipsis">{{ orderInfo.productName }}</view>
					<view class="fs24 col5 mt10">订单号：{{ orderInfo.orderNo }}</view>
					<view class="fs24 col5 mt6">合同金额：{{ orderInfo.commissionAmount }}</view>
				</view>
			</view>
		</view>

		<!-- 上传付款证明 -->
		<view class="card mt20">
			<view class="fs30 fwb col1 mb10">上传买家付款证明</view>
			<view class="fs24 col5 mb20">支持图片或PDF文件，最多9个</view>

			<view class="upload-area">
				<view class="upload-item" v-for="(file, index) in fileList" :key="index">
					<!-- 图片类型 -->
					<image v-if="file.type === 'image'" :src="file.url" mode="aspectFill" class="upload-img" @click="previewFile(index)"></image>
					<!-- PDF类型 -->
					<view v-else class="pdf-card" @click="previewFile(index)">
						<view class="pdf-icon-box">
							<text class="pdf-icon-text">PDF</text>
						</view>
						<view class="pdf-name">{{ file.name || 'PDF文件' }}</view>
					</view>
					<view class="del-btn" @click="removeFile(index)">
						<text class="del-btn-text">×</text>
					</view>
				</view>
				<view class="upload-item upload-add" @click="showAddMenu" v-if="fileList.length < 9">
					<view class="add-icon">+</view>
					<view class="add-text">添加文件</view>
				</view>
			</view>
		</view>

		<!-- 物流方式 -->
		<view class="card mt20">
			<view class="fs30 fwb col1 mb10">物流方式</view>
			<view class="fs24 col5 mb20">请根据与买家沟通结果选择物流方式</view>
			<view class="method-wrap">
				<view class="method-item" :class="{ active: logisticsMethod === 'pickup' }" @click="logisticsMethod = 'pickup'">
					<view class="method-check" v-if="logisticsMethod === 'pickup'">✓</view>
					<view class="fs28 fwb" :style="{ color: logisticsMethod === 'pickup' ? '#FE4B01' : '#333' }">自提</view>
					<view class="fs22 col9 mt5">买家自行到厂提货</view>
				</view>
				<view class="method-item" :class="{ active: logisticsMethod === 'factory_ship' }" @click="logisticsMethod = 'factory_ship'">
					<view class="method-check" v-if="logisticsMethod === 'factory_ship'">✓</view>
					<view class="fs28 fwb" :style="{ color: logisticsMethod === 'factory_ship' ? '#FE4B01' : '#333' }">工厂代发</view>
					<view class="fs22 col9 mt5">工厂安排物流发货</view>
				</view>
			</view>
		</view>

		<!-- 备注 -->
		<view class="card mt20">
			<view class="fs30 fwb col1 mb20">备注说明</view>
			<textarea class="remark-input" v-model="remark" placeholder="请输入备注说明（选填）"
				maxlength="500" />
		</view>

		<!-- 提交按钮 -->
		<view class="bottom-bar">
			<button class="btn-primary" :disabled="loading || fileList.length === 0" @click="submitProof">
				{{ loading ? '提交中...' : '提交付款证明' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			orderId: 0,
			loading: false,
			orderInfo: {
				orderNo: '',
				productName: '',
				coverImage: '',
				commissionAmount: '0.00',
			},
			fileList: [],
			logisticsMethod: '',
			remark: '',
			rejectReason: '',
		};
	},
	onLoad(options) {
		const userinfo = this.$core.getUserinfo();
		if (!userinfo || !userinfo.token) {
			uni.redirectTo({ url: '/pages/login/login' });
			return;
		}
		this.orderId = options.orderId || 0;
		if (this.orderId) {
			this.loadOrderInfo();
		}
	},
	methods: {
		loadOrderInfo() {
			this.$core.get({
				url: 'xiluxc.jj_order/detail',
				data: { order_id: this.orderId },
				loading: false,
				success: ret => {
					const d = ret.data;
					this.orderInfo = {
						orderNo: d.orderNo,
						productName: d.productName,
						coverImage: d.coverImage,
						commissionAmount: d.commissionAmount,
					};
					if (d.payment_proof) {
						if (d.payment_proof.status === 2) {
							this.rejectReason = d.payment_proof.reject_reason || '';
							if (d.payment_proof.logistics_method) {
								this.logisticsMethod = d.payment_proof.logistics_method;
							}
							if (d.payment_proof.file_urls && d.payment_proof.file_urls.length) {
								this.fileList = d.payment_proof.file_urls.map(url => {
									return {
										url: url,
										type: this.getFileType(url),
										name: this.getFileName(url)
									};
								});
							}
						}
					}
				},
				fail: () => {
					uni.showToast({ title: '加载失败', icon: 'none' });
				}
			});
		},

		getFileType(url) {
			if (!url) return 'image';
			let lower = url.toLowerCase();
			if (lower.endsWith('.pdf')) return 'pdf';
			return 'image';
		},

		getFileName(url) {
			if (!url) return '';
			let parts = url.split('/');
			return parts[parts.length - 1] || '';
		},

		showAddMenu() {
			uni.showActionSheet({
				itemList: ['拍照/从相册选择', '选择PDF文件'],
				success: (res) => {
					if (res.tapIndex === 0) {
						this.chooseImage();
					} else if (res.tapIndex === 1) {
						this.choosePdf();
					}
				}
			});
		},

		chooseImage() {
			let page = this;
			const remain = 9 - page.fileList.length;
			if (remain <= 0) return;
			uni.chooseImage({
				count: remain,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success(res) {
					res.tempFilePaths.forEach((filePath) => {
						page.uploadOneFile(filePath, 'image');
					});
				}
			});
		},

		choosePdf() {
			let page = this;
			const remain = 9 - page.fileList.length;
			if (remain <= 0) return;
			// #ifdef MP-WEIXIN
			uni.chooseMessageFile({
				count: remain,
				type: 'file',
				extension: ['.pdf'],
				success(res) {
					res.tempFiles.forEach((item) => {
						page.uploadOneFile(item.path, 'pdf', item.name);
					});
				}
			});
			// #endif
			// #ifdef H5
			uni.chooseFile({
				count: remain,
				type: 'file',
				extension: ['.pdf'],
				success(res) {
					res.tempFiles.forEach((item) => {
						page.uploadOneFile(item.path, 'pdf', item.name);
					});
				}
			});
			// #endif
		},

		uploadOneFile(filePath, type, fileName) {
			let page = this;
			if (page.fileList.length >= 9) return;
			// #ifdef H5
			page.$core.uploadFileH5({
				filePath: filePath,
				success: (ret) => {
					if (page.fileList.length < 9) {
						page.fileList.push({
							url: ret.data.url,
							type: type,
							name: fileName || page.getFileName(ret.data.url)
						});
					}
				},
				fail: () => {
					uni.showToast({ title: '上传失败', icon: 'none' });
				}
			});
			// #endif
			// #ifdef MP-WEIXIN
			page.$core.uploadFile({
				filePath: filePath,
				success: (ret) => {
					if (page.fileList.length < 9) {
						page.fileList.push({
							url: ret.data.url,
							type: type,
							name: fileName || page.getFileName(ret.data.url)
						});
					}
				},
				fail: () => {
					uni.showToast({ title: '上传失败', icon: 'none' });
				}
			});
			// #endif
		},

		removeFile(index) {
			this.fileList.splice(index, 1);
		},

		previewFile(index) {
			let file = this.fileList[index];
			if (file.type === 'pdf') {
				// #ifdef MP-WEIXIN
				uni.downloadFile({
					url: file.url,
					success: (res) => {
						uni.openDocument({
							filePath: res.tempFilePath,
							fileType: 'pdf',
							showMenu: true
						});
					}
				});
				// #endif
				// #ifdef H5
				window.open(file.url, '_blank');
				// #endif
			} else {
				let imageUrls = this.fileList.filter(f => f.type === 'image').map(f => f.url);
				let imageIndex = imageUrls.indexOf(file.url);
				uni.previewImage({ urls: imageUrls, current: imageIndex >= 0 ? imageIndex : 0 });
			}
		},

		submitProof() {
			if (this.loading) return;
			if (!this.fileList.length) {
				uni.showToast({ title: '请上传付款证明', icon: 'none' });
				return;
			}
			if (!this.logisticsMethod) {
				uni.showToast({ title: '请选择物流方式', icon: 'none' });
				return;
			}
			let methodText = this.logisticsMethod === 'pickup' ? '自提' : '工厂代发';
			uni.showModal({
				title: '确认提交',
				content: '物流方式：' + methodText + '。确认提交买家付款证明？提交后等待工厂审核。',
				success: (res) => {
					if (!res.confirm) return;
					this.loading = true;
					let urls = this.fileList.map(f => f.url);
					this.$core.post({
						url: 'xiluxc.jj_order/upload_payment_proof',
						data: {
							order_id: this.orderId,
							file_urls: JSON.stringify(urls),
							logistics_method: this.logisticsMethod,
							remark: this.remark,
						},
						success: ret => {
							this.loading = false;
							uni.showToast({ title: '提交成功', icon: 'success' });
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						},
						fail: () => {
							this.loading = false;
							uni.showToast({ title: '提交失败', icon: 'none' });
						}
					});
				}
			});
		}
	}
};
</script>

<style scoped>
.proof-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding-bottom: 140rpx;
}
.reject-banner {
	background: #fff2f0;
	padding: 24rpx 30rpx;
	border-bottom: 1rpx solid #ffd6d6;
}
.col-red { color: #e64340; }
.card {
	background: #fff;
	margin: 0 20rpx;
	border-radius: 16rpx;
	padding: 24rpx;
}
.cover-img {
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
}
.upload-area {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}
.upload-item {
	width: 196rpx;
	height: 196rpx;
	border-radius: 12rpx;
	position: relative;
}
.upload-img {
	width: 100%;
	height: 100%;
	border-radius: 12rpx;
	display: block;
}
.upload-add {
	background: #f7f9fc;
	border: 2rpx dashed #d0d0d0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.add-icon {
	font-size: 56rpx;
	color: #999;
	line-height: 60rpx;
}
.add-text {
	font-size: 22rpx;
	color: #999;
	margin-top: 6rpx;
}
/* PDF文件卡片 */
.pdf-card {
	width: 100%;
	height: 100%;
	border-radius: 12rpx;
	background: #f0f5ff;
	border: 2rpx solid #d6e4ff;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 10rpx;
	box-sizing: border-box;
}
.pdf-icon-box {
	width: 72rpx;
	height: 72rpx;
	background: #e64340;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.pdf-icon-text {
	color: #fff;
	font-size: 24rpx;
	font-weight: bold;
}
.pdf-name {
	font-size: 20rpx;
	color: #666;
	margin-top: 10rpx;
	max-width: 170rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: center;
}
/* 删除按钮 */
.del-btn {
	position: absolute;
	top: -12rpx;
	right: -12rpx;
	width: 36rpx;
	height: 36rpx;
	background: rgba(0,0,0,0.55);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
}
.del-btn-text {
	color: #fff;
	font-size: 24rpx;
	line-height: 1;
}
.remark-input {
	width: 100%;
	min-height: 160rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 20rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	background: #fafafa;
}
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx 30rpx;
	background: #fff;
	box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}
.btn-primary {
	background: #ff6600;
	color: #fff;
	border-radius: 44rpx;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 32rpx;
	border: none;
	width: 100%;
}
.btn-primary[disabled] { opacity: 0.6; }
/* 物流方式选择 */
.method-wrap {
	display: flex;
	gap: 20rpx;
}
.method-item {
	flex: 1;
	padding: 24rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	text-align: center;
	position: relative;
	background: #fafafa;
}
.method-item.active {
	border-color: #FE4B01;
	background: #fff7f0;
}
.method-check {
	position: absolute;
	top: 8rpx;
	right: 12rpx;
	font-size: 24rpx;
	color: #FE4B01;
	font-weight: bold;
}
</style>
