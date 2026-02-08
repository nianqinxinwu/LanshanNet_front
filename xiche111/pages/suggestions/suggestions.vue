<template>
	<view>
		<!-- 预约排队按钮 -->
		<view class="page-foot bg-white">
			<view class="ptb10 plr30">
				<view class="btn-primary" @click="handleReserve">
					预约排队
				</view>
			</view>
		</view>
		
		<!-- 主内容区 -->
		<view class="container bg-f5">
			<view class="p30">
				<!-- 排队状态卡片 -->
				<view class="queue-card">
					<view class="queue-header">
						<image src="/static/icon/queue-icon.png" class="queue-icon"></image>
						<text class="queue-title">排队状态</text>
						<view class="refresh-btn" @click="manualRefresh">
							<image src="/static/icon/refresh.png" class="refresh-icon"></image>
							<text>刷新</text>
						</view>
					</view>
					
					<view class="queue-info">
						<view class="current-number">
							<text class="number-label">当前号码</text>
							<text class="number-value" v-if="currentNumber">{{currentNumber}}</text>
							<text class="number-value empty" v-else>暂无</text>
						</view>
						
						<view class="queue-progress">
							<view class="progress-info">
								<view class="waiting-count">
									<text class="count-icon">👥</text>
									<text class="count-text">当前排队人数：</text>
									<text class="count-number">{{queueData.person || 0}}人</text>
								</view>
								
								<view class="estimate-time">
									<text class="time-icon">⏱️</text>
									<text class="time-text">预计等待：</text>
									<text class="time-number">{{estimatedTime}}分钟</text>
								</view>
							</view>
							
							<!-- 进度条 -->
							<view class="progress-bar-container">
								<view class="progress-bar">
									<view 
										class="progress-fill"
										:style="{width: progressWidth + '%'}">
									</view>
								</view>
								<view class="progress-labels">
									<text class="progress-label">0人</text>
									<text class="progress-label">10人</text>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 我的排队信息 -->
					<view class="my-queue" v-if="myQueueInfo">
						<view class="my-queue-header">
							<image src="/static/icon/my-queue.png" class="my-queue-icon"></image>
							<text class="my-queue-title">我的排队</text>
						</view>
						
						<view class="my-queue-detail">
							<view class="queue-item">
								<view class="queue-item-label">排队号码：</view>
								<view class="queue-item-value highlight">{{myQueueInfo.queue_number}}</view>
							</view>
							<view class="queue-item">
								<view class="queue-item-label">前面还有：</view>
								<view class="queue-item-value">{{myQueueInfo.people_ahead}}人</view>
							</view>
							<view class="queue-item">
								<view class="queue-item-label">预计等待：</view>
								<view class="queue-item-value">{{myQueueInfo.estimated_wait}}分钟</view>
							</view>
							<view class="queue-item">
								<view class="queue-item-label">排队时间：</view>
								<view class="queue-item-value">{{myQueueInfo.create_time}}</view>
							</view>
						</view>
						
						<view class="cancel-btn" @click="handleCancelQueue" v-if="myQueueInfo.status === 'waiting'">
							取消排队
						</view>
					</view>
				</view>
				
				<!-- 预约规则 -->
				<view class="rules-card">
					<view class="rules-header">
						<image src="/static/icon/rules-icon.png" class="rules-icon"></image>
						<text class="rules-title">预约规则</text>
					</view>
					
					<view class="rules-content">
						<view class="rule-item" v-for="(rule, index) in reservationRules" :key="index">
							<view class="rule-number">{{index + 1}}</view>
							<view class="rule-text">{{rule}}</view>
						</view>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view class="nothing" v-if="queueData.nothing">
					<image src="/static/icon/icon_queue_empty.png" mode="aspectFit"></image>
					<text>暂无排队信息</text>
				</view>
			</view>
		</view>
		
		<!-- 预约确认弹窗 -->
		<uni-popup ref="popup" type="dialog">
			<uni-popup-dialog 
				type="info"
				title="预约确认"
				:content="confirmContent"
				:before-close="true"
				@confirm="confirmReserve"
				@close="cancelReserve">
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				queueData: {
					person: 0,
					current_number: null,
					estimated_time: 15
				},
				myQueueInfo: null,
				queueMore: {page: 1},
				refreshTimer: null,
				isRefreshing: false,
				reservationRules: [
					'预约成功后请准时到达，过号需重新排队',
					'当前排队人数仅供参考，实际等待时间可能有所变化',
					'如需取消预约，请在排队界面点击取消',
					'排队号码仅当日有效',
					'请保持手机畅通，关注排队进展'
				]
			}
		},
		computed: {
			// 计算进度条宽度
			progressWidth() {
				const maxPeople = 10 // 最大显示10人
				const currentPeople = this.queueData.person || 0
				return Math.min((currentPeople / maxPeople) * 100, 100)
			},
			
			// 计算预计等待时间
			estimatedTime() {
				const baseTime = 10 // 每人预计10分钟
				return (this.queueData.person || 0) * baseTime
			},
			
			// 当前叫号
			currentNumber() {
				return this.queueData.current_number || null
			},
			
			// 确认弹窗内容
			confirmContent() {
				const waitingPeople = this.queueData.person || 0
				const estimatedTime = this.estimatedTime
				return `当前排队人数：${waitingPeople}人\n预计等待时间：${estimatedTime}分钟\n确认要预约排队吗？`
			}
		},
		onLoad() {
			this.fetchQueueData()
			this.startAutoRefresh()
		},
		onUnload() {
			this.stopAutoRefresh()
		},
		onHide() {
			this.stopAutoRefresh()
		},
		onShow() {
			this.startAutoRefresh()
		},
		onReachBottom() {
			// 如果有分页需求可以在这里处理
		},
		methods: {
			// 刷新数据
			refresh() {
				this.queueData = { person: 0 }
				this.queueMore = { page: 1 }
				this.fetchQueueData()
			},
			
			// 获取排队数据
			fetchQueueData() {
				if (this.isRefreshing) return
				
				this.isRefreshing = true
				this.$util.fetch(this, 'xiluxc.shop/inorder', {
					pagesize: 10,
					page: this.queueMore.page,
					_t: Date.now() // 防止缓存
				}, 'queueMore', 'queueData', 'data', data => {
					// 处理返回的数据
					if (data && data.person !== undefined) {
						this.queueData = data
						// 如果有用户排队信息，可以在这里处理
						this.checkMyQueue()
					}
					this.isRefreshing = false
				}, error => {
					this.isRefreshing = false
					console.error('获取排队数据失败:', error)
				})
			},
			
			// 检查用户是否在排队
			checkMyQueue() {
				// 这里可以根据用户ID或其他标识从返回数据中查找用户的排队信息
				// 假设返回数据中有my_queue字段
				if (this.queueData.my_queue) {
					this.myQueueInfo = this.queueData.my_queue
				} else {
					this.myQueueInfo = null
				}
			},
			
			// 开始自动刷新
			startAutoRefresh() {
				this.stopAutoRefresh()
				
				console.log('开始排队数据自动刷新，间隔3秒...')
				this.fetchQueueData()
				
				// 每3秒刷新一次
				this.refreshTimer = setInterval(() => {
					if (!this.isRefreshing) {
						this.fetchQueueData()
					}
				}, 3000)
			},
			
			// 停止自动刷新
			stopAutoRefresh() {
				if (this.refreshTimer) {
					clearInterval(this.refreshTimer)
					this.refreshTimer = null
				}
			},
			
			// 处理预约
			handleReserve() {
				// 检查是否已在排队
				if (this.myQueueInfo) {
					uni.showToast({
						title: '您已在排队中',
						icon: 'none',
						duration: 2000
					})
					return
				}
				
				// 检查当前排队人数是否为0
				const waitingPeople = this.queueData.person || 0
				
				if (waitingPeople === 0) {
					// 人数为0，直接跳转
					uni.navigateTo({
						url: '/pages/stores_info/stores_info?id=9'
					})
				} else {
					// 人数大于0，显示确认弹窗
					this.$refs.popup.open()
				}
			},
			
			// 确认预约
			confirmReserve(done) {
				// 调用预约接口
				this.$util.fetch(this, 'xiluxc.shop/reserve', {
					shop_id: this.$route.query.id || 0 // 如果有店铺ID
				}, null, null, null, data => {
					uni.showToast({
						title: '预约成功',
						icon: 'success',
						duration: 2000
					})
					
					// 刷新数据
					this.refresh()
					
					if (done) done()
				}, error => {
					uni.showToast({
						title: '预约失败，请重试',
						icon: 'none',
						duration: 2000
					})
					if (done) done()
				})
			},
			
			// 取消预约
			cancelReserve(done) {
				if (done) done()
			},
			
			// 取消排队
			handleCancelQueue() {
				uni.showModal({
					title: '取消排队',
					content: '确定要取消排队吗？',
					success: (res) => {
						if (res.confirm) {
							this.$util.fetch(this, 'xiluxc.shop/cancelQueue', {
								queue_id: this.myQueueInfo.id
							}, null, null, null, data => {
								uni.showToast({
									title: '已取消排队',
									icon: 'success',
									duration: 2000
								})
								this.refresh()
							})
						}
					}
				})
			},
			
			// 手动刷新
			manualRefresh() {
				uni.showLoading({
					title: '刷新中...'
				})
				this.fetchQueueData()
				setTimeout(() => {
					uni.hideLoading()
					uni.showToast({
						title: '刷新成功',
						icon: 'success',
						duration: 1500
					})
				}, 1000)
			}
		}
	}
</script>

<style lang="scss" scoped>
	// 基础样式
	.container {
		min-height: 100vh;
	}
	
	.page-foot {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #5B8EFF, #3462FF);
		color: white;
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		padding: 24rpx;
		border-radius: 50rpx;
		box-shadow: 0 8rpx 20rpx rgba(82, 135, 255, 0.3);
		transition: all 0.3s;
		
		&:active {
			transform: scale(0.98);
			box-shadow: 0 4rpx 10rpx rgba(82, 135, 255, 0.3);
		}
	}
	
	// 排队卡片样式
	.queue-card {
		background: linear-gradient(135deg, #FFFFFF, #F8FAFF);
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
		margin-bottom: 32rpx;
		box-shadow: 0 12rpx 32rpx rgba(82, 135, 255, 0.08);
		border: 1rpx solid rgba(82, 135, 255, 0.1);
		
		.queue-header {
			display: flex;
			align-items: center;
			margin-bottom: 40rpx;
			
			.queue-icon {
				width: 48rpx;
				height: 48rpx;
				margin-right: 16rpx;
			}
			
			.queue-title {
				flex: 1;
				font-size: 36rpx;
				font-weight: bold;
				color: #2C3E50;
				background: linear-gradient(135deg, #2C3E50, #4A6491);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
			}
			
			.refresh-btn {
				display: flex;
				align-items: center;
				padding: 12rpx 24rpx;
				background: #F8FAFF;
				border-radius: 50rpx;
				border: 1rpx solid rgba(82, 135, 255, 0.3);
				font-size: 24rpx;
				color: #3462FF;
				
				.refresh-icon {
					width: 28rpx;
					height: 28rpx;
					margin-right: 8rpx;
				}
				
				&:active {
					background: #EDF2FF;
				}
			}
		}
		
		.queue-info {
			.current-number {
				text-align: center;
				margin-bottom: 40rpx;
				padding: 32rpx;
				background: linear-gradient(135deg, #EFF4FF, #FFFFFF);
				border-radius: 20rpx;
				border: 2rpx solid rgba(82, 135, 255, 0.2);
				
				.number-label {
					display: block;
					font-size: 28rpx;
					color: #7F8C8D;
					margin-bottom: 16rpx;
				}
				
				.number-value {
					font-size: 72rpx;
					font-weight: bold;
					color: #3462FF;
					letter-spacing: 4rpx;
					
					&.empty {
						font-size: 36rpx;
						color: #95A5A6;
					}
				}
			}
			
			.queue-progress {
				.progress-info {
					display: flex;
					justify-content: space-between;
					margin-bottom: 32rpx;
					
					.waiting-count,
					.estimate-time {
						display: flex;
						align-items: center;
						
						.count-icon,
						.time-icon {
							font-size: 32rpx;
							margin-right: 8rpx;
						}
						
						.count-text,
						.time-text {
							font-size: 28rpx;
							color: #7F8C8D;
							margin-right: 8rpx;
						}
						
						.count-number,
						.time-number {
							font-size: 32rpx;
							font-weight: bold;
							color: #2C3E50;
						}
						
						.time-number {
							color: #FF9500;
						}
					}
				}
				
				.progress-bar-container {
					margin-top: 48rpx;
					
					.progress-bar {
						height: 20rpx;
						background: #EDF2F7;
						border-radius: 10rpx;
						overflow: hidden;
						margin-bottom: 16rpx;
						
						.progress-fill {
							height: 100%;
							background: linear-gradient(90deg, #5B8EFF, #3462FF);
							border-radius: 10rpx;
							transition: width 0.5s ease;
						}
					}
					
					.progress-labels {
						display: flex;
						justify-content: space-between;
						
						.progress-label {
							font-size: 24rpx;
							color: #95A5A6;
						}
					}
				}
			}
		}
		
		// 我的排队信息
		.my-queue {
			margin-top: 48rpx;
			padding-top: 32rpx;
			border-top: 2rpx dashed rgba(82, 135, 255, 0.2);
			
			.my-queue-header {
				display: flex;
				align-items: center;
				margin-bottom: 32rpx;
				
				.my-queue-icon {
					width: 36rpx;
					height: 36rpx;
					margin-right: 12rpx;
				}
				
				.my-queue-title {
					font-size: 32rpx;
					font-weight: bold;
					color: #2C3E50;
				}
			}
			
			.my-queue-detail {
				background: #F8FAFF;
				border-radius: 16rpx;
				padding: 32rpx;
				margin-bottom: 32rpx;
				
				.queue-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 16rpx 0;
					
					&:not(:last-child) {
						border-bottom: 1rpx solid rgba(82, 135, 255, 0.1);
					}
					
					.queue-item-label {
						font-size: 28rpx;
						color: #7F8C8D;
					}
					
					.queue-item-value {
						font-size: 30rpx;
						font-weight: 500;
						color: #2C3E50;
						
						&.highlight {
							color: #FF9500;
							font-weight: bold;
							font-size: 36rpx;
						}
					}
				}
			}
			
			.cancel-btn {
				background: #FFEBEE;
				color: #FF5252;
				font-size: 30rpx;
				font-weight: 500;
				text-align: center;
				padding: 24rpx;
				border-radius: 16rpx;
				transition: all 0.3s;
				
				&:active {
					background: #FFCDD2;
				}
			}
		}
	}
	
	// 规则卡片样式
	.rules-card {
		background: linear-gradient(135deg, #FFFFFF, #FFFBF5);
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
		box-shadow: 0 12rpx 32rpx rgba(255, 149, 0, 0.08);
		border: 1rpx solid rgba(255, 149, 0, 0.1);
		
		.rules-header {
			display: flex;
			align-items: center;
			margin-bottom: 32rpx;
			
			.rules-icon {
				width: 48rpx;
				height: 48rpx;
				margin-right: 16rpx;
			}
			
			.rules-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #2C3E50;
				background: linear-gradient(135deg, #FF9500, #FFB74D);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
			}
		}
		
		.rules-content {
			.rule-item {
				display: flex;
				align-items: flex-start;
				margin-bottom: 24rpx;
				
				&:last-child {
					margin-bottom: 0;
				}
				
				.rule-number {
					flex-shrink: 0;
					width: 44rpx;
					height: 44rpx;
					background: linear-gradient(135deg, #FFB74D, #FF9500);
					color: white;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 26rpx;
					font-weight: bold;
					margin-right: 20rpx;
					margin-top: 4rpx;
				}
				
				.rule-text {
					flex: 1;
					font-size: 28rpx;
					line-height: 1.6;
					color: #5D4037;
				}
			}
		}
	}
	
	// 空状态样式
	.nothing {
		text-align: center;
		padding: 80rpx 0;
		
		image {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 32rpx;
			opacity: 0.7;
		}
		
		text {
			display: block;
			font-size: 28rpx;
			color: #95A5A6;
		}
	}
	
	// 响应式调整
	@media (max-width: 750rpx) {
		.queue-info .progress-info {
			flex-direction: column;
			gap: 20rpx;
			
			.waiting-count,
			.estimate-time {
				justify-content: center;
			}
		}
	}
</style>