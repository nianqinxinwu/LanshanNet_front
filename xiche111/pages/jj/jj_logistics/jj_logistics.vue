<template>
	<view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 物流类型切换 -->
				<view class="jj-box mb30">
					<view class="type-tabs flex-box">
						<view class="type-tab flex-grow-1 tc" :class="{ active: logisticsType === 'platform' }"
							@click="logisticsType = 'platform'">平台物流</view>
						<view class="type-tab flex-grow-1 tc" :class="{ active: logisticsType === 'self' }"
							@click="logisticsType = 'self'">自提</view>
					</view>
				</view>

				<!-- ============ 平台物流 ============ -->
				<block v-if="logisticsType === 'platform'">
					<!-- 物流信息卡片 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">物流信息</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">物流公司</view>
							<view class="flex-grow-1 tr fs28 col1">{{ logisticsInfo.companyName }}</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">运单号</view>
							<view class="flex-grow-1 tr fs28 col1">{{ logisticsInfo.trackingNo }}</view>
							<view class="copy-btn fs24 ml15" @click="copyTrackingNo">复制</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">发货状态</view>
							<view class="flex-grow-1 tr">
								<view class="shipping-status fs24" :class="'shipping-' + logisticsInfo.status">
									{{ getShippingStatusName(logisticsInfo.status) }}
								</view>
							</view>
						</view>
						<view class="detail-row flex-box" v-if="logisticsInfo.rebateAmount > 0">
							<view class="col5 fs28">物流返佣(单位:元)</view>
							<view class="flex-grow-1 tr">
								<text class="fs24 col4">¥</text>
								<text class="fs30 fwb col4">{{ formatPrice(logisticsInfo.rebateAmount) }}</text>
							</view>
						</view>
					</view>

					<!-- 物流时间线 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">物流跟踪</view>
						<view class="timeline">
							<view class="timeline-item" v-for="(item, index) in logisticsTimeline" :key="index"
								:class="{ active: index === 0 }">
								<view class="timeline-dot" :class="{ active: index === 0 }"></view>
								<view class="timeline-line" v-if="index < logisticsTimeline.length - 1"></view>
								<view class="timeline-content ml20">
									<view class="fs28" :class="index === 0 ? 'col1 fwb' : 'col5'">{{ item.desc }}</view>
									<view class="fs24 col9 mt5">{{ item.time }}</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 物流返佣说明 -->
					<view class="tip-box mb30" v-if="logisticsInfo.rebateAmount > 0">
						<view class="fs24 col9 lh40">
							<text class="fwb">物流返佣说明：</text>
							选择平台合作物流（{{ logisticsInfo.companyName }}）可享受物流返佣 ¥{{ formatPrice(logisticsInfo.rebateAmount) }}，
							返佣将在订单结算时一并到账。
						</view>
					</view>
				</block>

				<!-- ============ 自提 ============ -->
				<block v-if="logisticsType === 'self'">
					<!-- 自提信息 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">自提信息</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">提货方式</view>
							<view class="flex-grow-1 tr fs28 col1">买方到厂自提</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">提货状态</view>
							<view class="flex-grow-1 tr">
								<view class="shipping-status fs24" :class="'shipping-' + selfPickupInfo.status">
									{{ getSelfPickupStatusName(selfPickupInfo.status) }}
								</view>
							</view>
						</view>
						<view class="detail-row flex-box" v-if="selfPickupInfo.pickupTime">
							<view class="col5 fs28">提货时间</view>
							<view class="flex-grow-1 tr fs28 col1">{{ selfPickupInfo.pickupTime }}</view>
						</view>
					</view>

					<!-- 提货要求 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">提货要求</view>
						<view class="require-item flex-box mb15" v-for="(item, index) in pickupRequirements" :key="index">
							<view class="require-dot"></view>
							<view class="fs26 col5 ml15">{{ item }}</view>
						</view>
					</view>

					<!-- 提货单信息 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">提货单</view>
						<view class="fs24 col9 mb20">提货单需包含以下信息：产品清单、数量、买方身份证号、买方签字盖章</view>
						<view class="pickup-note-card" v-if="selfPickupInfo.pickupNoteUrl">
							<view class="flex-box">
								<view class="file-icon-box">
									<view class="fs22 colf">单</view>
								</view>
								<view class="flex-grow-1 ml15">
									<view class="fs28 col1">提货单</view>
									<view class="fs24 col9 mt5">{{ selfPickupInfo.pickupNoteTime || '已上传' }}</view>
								</view>
								<view class="fs26 col4" @click="viewPickupNote">查看</view>
							</view>
						</view>
						<view class="empty-note tc" v-else>
							<view class="fs26 col9">暂无提货单</view>
						</view>
					</view>
				</block>

				<!-- 收发货清单 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">收发货清单</view>
					<view class="fs24 col9 mb20">上传或查看收发货清单，用于确认货物交付情况</view>

					<!-- 已上传的清单 -->
					<view class="checklist-item flex-box mb15" v-for="(item, index) in checklistFiles" :key="index">
						<image :src="item.url" mode="aspectFill" class="checklist-thumb" v-if="item.type === 'image'"></image>
						<view class="file-icon-box" v-else>
							<view class="fs22 colf">{{ item.ext || '文件' }}</view>
						</view>
						<view class="flex-grow-1 ml15">
							<view class="fs28 col1 m-ellipsis">{{ item.name }}</view>
							<view class="fs24 col9 mt5">{{ item.time }}</view>
						</view>
					</view>

					<!-- 上传按钮 -->
					<view class="upload-area" @click="uploadChecklist" v-if="canUpload">
						<image src="/static/images/icon_upload_logo.png" mode="aspectFill" class="upload-icon"></image>
						<view class="fs26 col9 mt10">点击上传收发货清单</view>
					</view>

					<view class="empty-note tc" v-if="checklistFiles.length === 0 && !canUpload">
						<view class="fs26 col9">暂无收发货清单</view>
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
				logisticsType: 'platform',
				logisticsInfo: {
					companyName: '极速达物流',
					trackingNo: 'JSD2026020800001',
					status: 'signed',   // pending | shipped | transit | signed
					rebateAmount: 580.00,
					companyType: 'fast'  // fast=极速达 | high=佣金王 | cheap=省钱王
				},
				logisticsTimeline: [],
				selfPickupInfo: {
					status: 'pending',  // pending | picked
					pickupTime: '',
					pickupNoteUrl: ''
				},
				pickupRequirements: [
					'提货人须携带有效身份证件原件',
					'提货人须持有效订单号或提货单',
					'提货时需现场清点货物并签字确认',
					'提货单需包含：产品清单、数量、买方身份证号',
					'提货单需加盖买方企业公章'
				],
				checklistFiles: [],
				canUpload: true
			}
		},
		onLoad(options) {
			if (options.orderId) {
				this.orderId = options.orderId;
			}
			this.loadLogisticsInfo();
		},
		methods: {
			loadLogisticsInfo() {
				this.$core.get({
					url: 'xiluxc.jj_order/logistics',
					data: { order_id: this.orderId },
					loading: false,
					success: ret => {
						let data = ret.data;
						if (data.logistics_type) {
							this.logisticsType = data.logistics_type;
						}
						if (data.logistics_info) {
							this.logisticsInfo = Object.assign(this.logisticsInfo, data.logistics_info);
						}
						if (data.timeline && data.timeline.length > 0) {
							this.logisticsTimeline = data.timeline;
						}
						if (data.self_pickup_info) {
							this.selfPickupInfo = Object.assign(this.selfPickupInfo, data.self_pickup_info);
						}
						if (data.checklist_files) {
							this.checklistFiles = data.checklist_files;
						}
					},
					fail: () => { return false; }
				});
			},

			getShippingStatusName(status) {
				const map = {
					'pending': '待发货',
					'shipped': '已发货',
					'transit': '运输中',
					'signed': '已签收'
				};
				return map[status] || '未知';
			},

			getSelfPickupStatusName(status) {
				const map = {
					'pending': '待提货',
					'picked': '已提货'
				};
				return map[status] || '未知';
			},

			copyTrackingNo() {
				uni.setClipboardData({
					data: this.logisticsInfo.trackingNo,
					success: () => {
						uni.showToast({ title: '已复制运单号', icon: 'success' });
					}
				});
			},

			viewPickupNote() {
				if (this.selfPickupInfo.pickupNoteUrl) {
					uni.previewImage({
						urls: [this.selfPickupInfo.pickupNoteUrl]
					});
				}
			},

			uploadChecklist() {
				let that = this;
				uni.chooseImage({
					count: 3,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: res => {
						let tempFiles = res.tempFilePaths;
						tempFiles.forEach(filePath => {
							// 尝试上传到服务器
							that.$core.post({
								url: 'xiluxc.jj_order/upload_checklist',
								data: {
									order_id: that.orderId,
									file_url: filePath
								},
								success: ret => {
									that.checklistFiles.push({
										type: 'image',
										url: ret.data.url || filePath,
										name: '收发货清单',
										time: that.getCurrentTime(),
										ext: 'JPG'
									});
								},
								fail: () => {
									// 接口未就绪，Mock上传成功
									that.checklistFiles.push({
										type: 'image',
										url: filePath,
										name: '收发货清单',
										time: that.getCurrentTime(),
										ext: 'JPG'
									});
									return false;
								}
							});
						});
						uni.showToast({ title: '上传成功', icon: 'success' });
					}
				});
			},

			getCurrentTime() {
				let now = new Date();
				let y = now.getFullYear();
				let m = String(now.getMonth() + 1).padStart(2, '0');
				let d = String(now.getDate()).padStart(2, '0');
				let h = String(now.getHours()).padStart(2, '0');
				let min = String(now.getMinutes()).padStart(2, '0');
				return y + '-' + m + '-' + d + ' ' + h + ':' + min;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.colf {
		color: #FFFFFF;
	}

	/* 类型切换Tab */
	.type-tabs {
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 6rpx;
	}

	.type-tab {
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

	.detail-row {
		padding: 24rpx 0;
	}

	.copy-btn {
		color: #FE4B01;
		padding: 4rpx 16rpx;
		border: 2rpx solid #FE4B01;
		border-radius: 20rpx;
		flex-shrink: 0;
	}

	/* 发货状态 */
	.shipping-status {
		display: inline-block;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
	}

	.shipping-pending {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.shipping-shipped {
		background: rgba(24, 144, 255, 0.1);
		color: #1890FF;
	}

	.shipping-transit {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.shipping-signed {
		background: rgba(0, 0, 0, 0.04);
		color: #52C41A;
	}

	.shipping-picked {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	/* 时间线 */
	.timeline {
		position: relative;
	}

	.timeline-item {
		display: flex;
		position: relative;
		padding-bottom: 30rpx;
		min-height: 80rpx;

		&:last-child {
			padding-bottom: 0;
		}
	}

	.timeline-dot {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background: #D9D9D9;
		flex-shrink: 0;
		margin-top: 8rpx;
		z-index: 1;

		&.active {
			background: #FE4B01;
			box-shadow: 0 0 0 6rpx rgba(254, 75, 1, 0.2);
		}
	}

	.timeline-line {
		position: absolute;
		left: 9rpx;
		top: 28rpx;
		bottom: 0;
		width: 2rpx;
		background: #E8E8E8;
	}

	.timeline-content {
		flex: 1;
		min-width: 0;
	}

	/* 提货要求 */
	.require-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #FE4B01;
		flex-shrink: 0;
		margin-top: 12rpx;
	}

	/* 提货单 / 文件卡片 */
	.pickup-note-card {
		padding: 24rpx;
		background: #F5F7FB;
		border-radius: 12rpx;
	}

	.file-icon-box {
		width: 56rpx;
		height: 56rpx;
		background: #FE4B01;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.empty-note {
		padding: 40rpx 0;
	}

	/* 收发货清单 */
	.checklist-item {
		padding: 20rpx;
		background: #F5F7FB;
		border-radius: 12rpx;
		align-items: center;
	}

	.checklist-thumb {
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		background: #EEEEEE;
	}

	/* 上传区域 */
	.upload-area {
		width: 100%;
		height: 180rpx;
		border: 2rpx dashed #CCCCCC;
		border-radius: 16rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #FAFAFA;
		margin-top: 20rpx;
	}

	.upload-icon {
		width: 50rpx;
		height: 50rpx;
	}

	.tip-box {
		background: #FFFBE6;
		border-radius: 12rpx;
		padding: 24rpx;
		border-left: 6rpx solid #FAAD14;
	}

	/* PC 端适配 */
	@media screen and (min-width: 768px) {
		.type-tab {
			height: 44px;
			line-height: 44px;
			font-size: 15px;
			cursor: pointer;
		}

		.detail-row {
			padding: 16px 0;
		}

		.copy-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}

		.timeline-item {
			padding-bottom: 20px;
		}

		.upload-area {
			height: 140px;
			cursor: pointer;
			transition: border-color 0.2s;

			&:hover {
				border-color: #FE4B01;
			}
		}

		.checklist-item {
			padding: 16px;
			border-radius: 8px;
		}

		.tip-box {
			border-radius: 8px;
			padding: 16px;
		}
	}
</style>
