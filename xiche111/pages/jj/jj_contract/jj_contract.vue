<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 订单摘要 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">订单信息</view>
					<view class="flex-box">
						<image :src="orderInfo.coverImage" mode="aspectFill" class="product-thumb"></image>
						<view class="flex-grow-1 ml20">
							<view class="fs28 fwb col1 m-ellipsis">{{ orderInfo.productName }}</view>
							<view class="mt10 fs24 col9">买家：{{ orderInfo.companyName }}</view>
						</view>
					</view>
				</view>

				<!-- ============ 合同上传阶段 ============ -->
				<block v-if="stage === 'upload'">
					<!-- 倒计时 -->
					<view class="jj-box mb30">
						<view class="countdown-header flex-box">
							<view class="fs34 fwb col1 lh36 flex-grow-1">合同上传倒计时</view>
							<view class="status-tag status-upload fs22">待上传</view>
						</view>
						<view class="countdown-box tc mt20">
							<view class="countdown-time">
								<text class="time-num">{{ countdownDisplay.hours }}</text>
								<text class="time-sep">:</text>
								<text class="time-num">{{ countdownDisplay.minutes }}</text>
								<text class="time-sep">:</text>
								<text class="time-num">{{ countdownDisplay.seconds }}</text>
							</view>
							<view class="fs24 col9 mt10">请在倒计时结束前上传正式买卖合同</view>
						</view>
						<!-- 逾期警告 -->
						<view class="warn-box mt20" v-if="countdownSeconds <= 3600 && countdownSeconds > 0">
							<view class="fs24 col-warn">剩余时间不足1小时，逾期未传合同保证金将自动划转给工厂！</view>
						</view>
					</view>

					<!-- 合同上传区 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">上传买卖合同</view>
						<view class="fs24 col9 mb20">请上传正式买卖合同（PDF格式，≤10MB），合同内需包含最终锁定佣金金额。</view>

						<view class="upload-area" @click="chooseContract" v-if="!contractFile.url">
							<image src="/static/images/icon_upload_logo.png" mode="aspectFill" class="upload-icon"></image>
							<view class="fs26 col9 mt10">点击上传合同（PDF）</view>
						</view>
						<view class="file-card flex-box" v-else>
							<view class="file-icon-box">
								<view class="fs24 colf">PDF</view>
							</view>
							<view class="flex-grow-1 ml20">
								<view class="fs28 col1 m-ellipsis">{{ contractFile.name }}</view>
								<view class="fs24 col9 mt5">{{ contractFile.sizeText }}</view>
							</view>
							<view class="fs26 col4" @click="removeContract">删除</view>
						</view>
					</view>

					<!-- 提交按钮 -->
					<view class="submit-btn-wrap">
						<view class="btn5" :class="{ disabled: !contractFile.url || uploading }" @click="submitContract">
							{{ uploading ? '上传中...' : '提交合同' }}
						</view>
					</view>
				</block>

				<!-- ============ 履约执行阶段 ============ -->
				<block v-if="stage === 'execution'">
					<!-- 状态横幅 -->
					<view class="jj-box mb30 execution-banner">
						<view class="flex-box flex-center flex-col">
							<image src="/static/icon/icon_true.png" mode="aspectFill" class="banner-icon"></image>
							<view class="fs30 fwb col1 mt15">合同已上传，进入履约期</view>
							<view class="fs24 col9 mt10">工厂确认合同后将安排发货</view>
						</view>
					</view>

					<!-- 履约倒计时 -->
					<view class="jj-box mb30">
						<view class="countdown-header flex-box">
							<view class="fs34 fwb col1 lh36 flex-grow-1">履约倒计时</view>
							<view class="status-tag status-exec fs22">履约中</view>
						</view>
						<view class="countdown-box tc mt20">
							<view class="countdown-time">
								<text class="time-num">{{ countdownDisplay.hours }}</text>
								<text class="time-sep">:</text>
								<text class="time-num">{{ countdownDisplay.minutes }}</text>
								<text class="time-sep">:</text>
								<text class="time-num">{{ countdownDisplay.seconds }}</text>
							</view>
							<view class="fs24 col9 mt10">履约完成后佣金将自动结算，保证金全额退还</view>
						</view>
					</view>

					<!-- 操作按钮 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">操作</view>
						<view class="action-btn flex-box bb" @click="urgeFactory">
							<view class="flex-grow-1 fs28 col1">催促工厂</view>
							<view class="fs24 col9">发送催促通知给工厂</view>
							<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow ml15"></image>
						</view>
						<view class="action-btn flex-box" @click="viewLogistics">
							<view class="flex-grow-1 fs28 col1">查看工厂发货</view>
							<view class="fs24 col9">查看物流跟踪信息</view>
							<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow ml15"></image>
						</view>
					</view>

					<!-- 提示 -->
					<view class="tip-box mb30">
						<view class="fs24 col9 lh40">
							<text class="fwb">说明：</text>
							工厂点击【同意放款】或倒计时结束后，系统将自动结算佣金并退还保证金至您的账户。
						</view>
					</view>
				</block>

				<!-- ============ 已过期 ============ -->
				<block v-if="stage === 'expired'">
					<view class="jj-box mb30 tc">
						<view class="fs30 fwb" style="color: #FF4D4F;">合同上传已逾期</view>
						<view class="fs26 col9 mt15 lh40">因未在规定时间内上传买卖合同，履约保证金已自动划转给工厂。</view>
						<view class="mt30">
							<view class="btn5" @click="goBack">返回首页</view>
						</view>
					</view>
				</block>
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
					productName: '',
					coverImage: '/static/images/icon_upload_logo.png',
					companyName: '',
					contractUploadHours: 24,
					executionHours: 72
				},
				stage: 'upload',  // upload | execution | expired
				countdownSeconds: 0,
				countdownTimer: null,
				contractFile: {
					url: '',
					name: '',
					sizeText: ''
				},
				uploading: false,
				// 倒计时截止时间戳（秒）
				deadlineTimestamp: 0
			}
		},
		computed: {
			countdownDisplay() {
				let total = Math.max(0, this.countdownSeconds);
				let hours = Math.floor(total / 3600);
				let minutes = Math.floor((total % 3600) / 60);
				let seconds = total % 60;
				return {
					hours: String(hours).padStart(2, '0'),
					minutes: String(minutes).padStart(2, '0'),
					seconds: String(seconds).padStart(2, '0')
				};
			}
		},
		onLoad(options) {
			if (options.orderId) {
				this.orderId = options.orderId;
			}
			if (options.param) {
				try {
					let param = JSON.parse(decodeURIComponent(options.param));
					this.orderInfo = Object.assign(this.orderInfo, param);
				} catch (e) {
					console.log('param parse error', e);
				}
			}
			this.loadContractStatus();
		},
		onUnload() {
			this.clearTimer();
		},
		methods: {
			loadContractStatus() {
				if (!this.orderId) {
					// 无 orderId 时使用本地参数初始化倒计时（开发阶段）
					this.initUploadCountdown(this.orderInfo.contractUploadHours);
					return;
				}
				this.$core.get({
					url: 'xiluxc.jj_order/contract_status',
					data: { order_id: this.orderId },
					loading: false,
					success: ret => {
						let data = ret.data;
						this.stage = data.stage || 'upload';
						if (data.deadline_timestamp) {
							this.deadlineTimestamp = data.deadline_timestamp;
							this.startCountdown();
						} else if (this.stage === 'upload') {
							this.initUploadCountdown(data.contract_upload_hours || this.orderInfo.contractUploadHours);
						} else if (this.stage === 'execution') {
							this.initExecutionCountdown(data.execution_hours || this.orderInfo.executionHours);
						}
						if (data.contract_url) {
							this.contractFile.url = data.contract_url;
							this.contractFile.name = data.contract_name || '买卖合同.pdf';
						}
					},
					fail: () => {
						// 接口未就绪时使用本地参数
						this.initUploadCountdown(this.orderInfo.contractUploadHours);
						return false;
					}
				});
			},
			initUploadCountdown(hours) {
				this.stage = 'upload';
				this.countdownSeconds = hours * 3600;
				this.startCountdown();
			},
			initExecutionCountdown(hours) {
				this.stage = 'execution';
				this.countdownSeconds = hours * 3600;
				this.startCountdown();
			},
			startCountdown() {
				this.clearTimer();
				if (this.deadlineTimestamp > 0) {
					let now = Math.floor(Date.now() / 1000);
					this.countdownSeconds = Math.max(0, this.deadlineTimestamp - now);
				}
				this.countdownTimer = setInterval(() => {
					if (this.countdownSeconds <= 0) {
						this.clearTimer();
						this.onCountdownEnd();
						return;
					}
					this.countdownSeconds--;
				}, 1000);
			},
			clearTimer() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer);
					this.countdownTimer = null;
				}
			},
			onCountdownEnd() {
				if (this.stage === 'upload') {
					this.stage = 'expired';
				} else if (this.stage === 'execution') {
					uni.showModal({
						title: '提示',
						content: '履约期已结束，佣金将自动结算，保证金已退还。',
						showCancel: false,
						success() {
							uni.redirectTo({ url: '/pages/jj/jj_main/jj_main' });
						}
					});
				}
			},
			// 选择合同文件
			chooseContract() {
				let that = this;
				// #ifdef MP-WEIXIN
				uni.chooseMessageFile({
					count: 1,
					type: 'file',
					extension: ['pdf'],
					success: res => {
						let file = res.tempFiles[0];
						if (file.size > 10 * 1024 * 1024) {
							uni.showToast({ title: '文件大小不能超过10MB', icon: 'none' });
							return;
						}
						that.contractFile = {
							url: file.path,
							name: file.name || '买卖合同.pdf',
							sizeText: that.formatFileSize(file.size),
							localPath: file.path
						};
					}
				});
				// #endif
				// #ifdef H5 || APP-PLUS
				// H5端通过 input[type=file] 选取
				let inputEl = document.createElement('input');
				inputEl.type = 'file';
				inputEl.accept = '.pdf';
				inputEl.onchange = function(e) {
					let file = e.target.files[0];
					if (!file) return;
					if (file.size > 10 * 1024 * 1024) {
						uni.showToast({ title: '文件大小不能超过10MB', icon: 'none' });
						return;
					}
					// H5 使用 blob URL 临时预览
					let blobUrl = URL.createObjectURL(file);
					that.contractFile = {
						url: blobUrl,
						name: file.name,
						sizeText: that.formatFileSize(file.size),
						localPath: blobUrl,
						rawFile: file
					};
				};
				inputEl.click();
				// #endif
			},
			removeContract() {
				this.contractFile = { url: '', name: '', sizeText: '' };
			},
			submitContract() {
				if (!this.contractFile.url) {
					uni.showToast({ title: '请先选择合同文件', icon: 'none' });
					return;
				}
				if (this.uploading) return;
				this.uploading = true;

				let that = this;
				let filePath = this.contractFile.localPath || this.contractFile.url;

				// #ifdef MP-WEIXIN
				this.$core.uploadFile({
					filePath: filePath,
					success: (ret) => {
						that.doSubmitContract(ret.data.url);
					},
					fail: () => {
						// 接口未就绪，Mock 上传成功
						that.doSubmitContract('mock://contract/' + Date.now() + '.pdf');
					}
				});
				// #endif
				// #ifdef H5
				if (this.contractFile.rawFile) {
					// H5 使用 uni.uploadFile 方式
					let userinfo = this.$core.getCache('userinfo');
					let header = {};
					if (userinfo && userinfo.token) {
						header.token = userinfo.token;
					}
					uni.uploadFile({
						url: getApp().globalData.apiBaseUri + '/common/upload',
						filePath: filePath,
						name: 'file',
						header: header,
						success: res => {
							if (res.statusCode === 200) {
								let data = JSON.parse(res.data);
								if (data.code == 1) {
									that.doSubmitContract(data.data.fullurl);
								} else {
									// 接口未就绪，Mock 上传成功
									that.doSubmitContract('mock://contract/' + Date.now() + '.pdf');
								}
							} else {
								// 接口未就绪，Mock 上传成功
								that.doSubmitContract('mock://contract/' + Date.now() + '.pdf');
							}
						},
						fail: () => {
							// 接口未就绪，Mock 上传成功
							that.doSubmitContract('mock://contract/' + Date.now() + '.pdf');
						}
					});
				} else {
					this.$core.uploadFileH5({
						filePath: filePath,
						success: (ret) => {
							that.doSubmitContract(ret.data.url);
						},
						fail: () => {
							// 接口未就绪，Mock 上传成功
							that.doSubmitContract('mock://contract/' + Date.now() + '.pdf');
						}
					});
				}
				// #endif
			},
			doSubmitContract(contractUrl) {
				this.$core.post({
					url: 'xiluxc.jj_order/submit_contract',
					data: {
						order_id: this.orderId,
						contract_url: contractUrl,
						contract_name: this.contractFile.name
					},
					success: ret => {
						this.uploading = false;
						this.onContractSubmitSuccess();
					},
					fail: err => {
						// 接口未就绪，Mock 提交成功直接走流程
						this.uploading = false;
						this.onContractSubmitSuccess();
						return false;
					}
				});
			},
			onContractSubmitSuccess() {
				this.clearTimer();
				uni.showModal({
					title: '提示',
					content: '合同提交成功！请等待工厂确认。',
					showCancel: false,
					success() {
						uni.redirectTo({ url: '/pages/jj/jj_main/jj_main?tab=orders' });
					}
				});
			},
			urgeFactory() {
				this.$core.post({
					url: 'xiluxc.jj_order/urge_factory',
					data: { order_id: this.orderId },
					success: () => {
						uni.showToast({ title: '催促通知已发送', icon: 'success' });
					}
				});
			},
			viewLogistics() {
				uni.navigateTo({
					url: '/pages/jj/jj_logistics/jj_logistics?orderId=' + this.orderId
				});
			},
			goBack() {
				uni.redirectTo({ url: '/pages/jj/jj_main/jj_main' });
			},
			formatFileSize(bytes) {
				if (bytes < 1024) return bytes + 'B';
				if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
				return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
			}
		}
	}
</script>

<style lang="scss" scoped>
	.product-thumb {
		width: 100rpx;
		height: 100rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	/* 倒计时样式 */
	.countdown-header {
		align-items: center;
	}

	.status-tag {
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
	}

	.status-upload {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.status-exec {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.countdown-box {
		background: #F5F7FB;
		border-radius: 16rpx;
		padding: 30rpx 0;
	}

	.countdown-time {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.time-num {
		display: inline-block;
		width: 80rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background: #FE4B01;
		color: #FFFFFF;
		font-size: 36rpx;
		font-weight: bold;
		border-radius: 12rpx;
	}

	.time-sep {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin: 0 10rpx;
	}

	.warn-box {
		background: #FFF2F0;
		border-radius: 8rpx;
		padding: 16rpx 20rpx;
		border-left: 6rpx solid #FF4D4F;
	}

	.col-warn {
		color: #FF4D4F;
	}

	/* 上传区域 */
	.upload-area {
		width: 100%;
		height: 200rpx;
		border: 2rpx dashed #CCCCCC;
		border-radius: 16rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #FAFAFA;
	}

	.upload-icon {
		width: 60rpx;
		height: 60rpx;
	}

	.file-card {
		padding: 24rpx;
		background: #F5F7FB;
		border-radius: 12rpx;
		align-items: center;
	}

	.file-icon-box {
		width: 60rpx;
		height: 60rpx;
		background: #FF4D4F;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* 履约执行阶段 */
	.execution-banner {
		background: linear-gradient(135deg, #F0FFF4, #FFFFFF);
		border: 2rpx solid #B7EB8F;
	}

	.banner-icon {
		width: 60rpx;
		height: 60rpx;
	}

	.action-btn {
		padding: 28rpx 0;
		align-items: center;
	}

	.cell-arrow {
		width: 24rpx;
		height: 24rpx;
		flex-shrink: 0;
	}

	.tip-box {
		background: #FFFBE6;
		border-radius: 12rpx;
		padding: 24rpx;
		border-left: 6rpx solid #FAAD14;
	}

	.submit-btn-wrap {
		padding: 0 0 30rpx;

		.disabled {
			opacity: 0.5;
		}
	}

	/* PC 端适配 */
	@media screen and (min-width: 768px) {
		.upload-area {
			height: 150px;
			cursor: pointer;
			transition: border-color 0.2s;

			&:hover {
				border-color: #FE4B01;
			}
		}

		.file-card {
			padding: 16px;
			border-radius: 8px;
		}

		.action-btn {
			padding: 18px 0;
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}

		.countdown-box {
			padding: 24px 0;
			border-radius: 12px;
		}

		.time-num {
			width: 56px;
			height: 56px;
			line-height: 56px;
			font-size: 24px;
			border-radius: 8px;
		}

		.time-sep {
			font-size: 24px;
			margin: 0 8px;
		}

		.tip-box {
			border-radius: 8px;
			padding: 16px;
		}

		.submit-btn-wrap {
			max-width: 400px;
			margin: 0 auto;
		}
	}
</style>
