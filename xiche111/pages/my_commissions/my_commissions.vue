<template>
	<view>
		<view class="container bg-f5">
			<image src="@/static/images/bg4.png" mode="aspectFill" class="top_img" />
			<view class="page-head">
				<hx-navbar ref="hxnb" :config="config">
				</hx-navbar>
			</view>
			
			<!-- 工位控制模块 -->
			<view class="workstation-control">
				<!-- 工位1 -->
				<view class="workstation-card">
					<view class="workstation-header">
						<text class="workstation-title">工位1控制</text>
						<!-- <view class="workstation-status" :class="workstation1.status">{{workstation1.statusText}}</view> -->
					</view>
					
					<view class="control-section">
						<view class="control-title">门控制</view>
						<view class="button-group">
							<button class="control-btn primary" @click="controlDoor(1, 1)">开门</button>
							<button class="control-btn warn" @click="controlDoor(1, 2)">停</button>
							<button class="control-btn danger" @click="controlDoor(1, 3)">关门</button>
						</view>
					</view>
					
					<view class="control-section">
						<view class="control-title">水电控制</view>
						<view class="button-group">
							<button class="control-btn success" @click="controlUtility(1, 1)">通水电</button>
							<button class="control-btn danger" @click="controlUtility(1, 2)">断水电</button>
						</view>
						<view class="button-group">
								<button class="control-btn power-on-all" @click="controlAllPower(2, 1)">全部通电</button>
								<button class="control-btn power-off-all" @click="controlAllPower(2, 2)">全部断电</button>
						</view>
					</view>
					
					<view class="control-section">
						<view class="control-title">储物箱控制</view>
						<view class="storage-control">
							<view class="storage-header">
								<text>选择箱号：</text>
								<picker :range="storageBoxes1" :value="selectedBox1" @change="onBoxChange(1, $event)">
									<view class="picker">{{storageBoxes1[selectedBox1]}}</view>
								</picker>
							</view>
							<view class="button-group">
								<button class="control-btn info" @click="controlStorageBox(1, 1)">开储物箱</button>
								<button class="control-btn secondary" @click="controlStorageBox(1, 2)">重置储物箱</button>
							</view>
							<view class="button-group">
								<button class="control-btn info-all" @click="controlAllStorageBox(1, 1)">开全部储物箱</button>
								<button class="control-btn secondary-all" @click="controlAllStorageBox(1, 2)">重置全部储物箱</button>
								<button class="control-btn used" @click="controlUsedStorageBox(1)">一键开已用</button>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 工位2 -->
				<view class="workstation-card">
					<view class="workstation-header">
						<text class="workstation-title">工位2控制</text>
						<!-- <view class="workstation-status" :class="workstation2.status">{{workstation2.statusText}}</view> -->
					</view>
					
					<view class="control-section">
						<view class="control-title">门控制</view>
						<view class="button-group">
							<button class="control-btn primary" @click="controlDoor(2, 1)">开门</button>
							<button class="control-btn warn" @click="controlDoor(2, 2)">停</button>
							<button class="control-btn danger" @click="controlDoor(2, 3)">关门</button>
						</view>
					</view>
					
					<view class="control-section">
						<view class="control-title">水电控制</view>
						<view class="button-group">
							<button class="control-btn success" @click="controlUtility(2, 1)">通水电</button>
							<button class="control-btn danger" @click="controlUtility(2, 2)">断水电</button>
						</view>
						<view class="button-group">
								<button class="control-btn power-on-all" @click="controlAllPower(2, 1)">全部通电</button>
								<button class="control-btn power-off-all" @click="controlAllPower(2, 2)">全部断电</button>
						</view>
					</view>
					
					<view class="control-section">
						<view class="control-title">储物箱控制</view>
						<view class="storage-control">
							<view class="storage-header">
								<text>选择箱号：</text>
								<picker :range="storageBoxes2" :value="selectedBox2" @change="onBoxChange(2, $event)">
									<view class="picker">{{storageBoxes2[selectedBox2]}}</view>
								</picker>
							</view>
							<view class="button-group">
								<button class="control-btn info" @click="controlStorageBox(2, 1)">开储物箱</button>
								<button class="control-btn secondary" @click="controlStorageBox(2, 2)">重置储物箱</button>
							</view>
							<view class="button-group">
								<button class="control-btn info-all" @click="controlAllStorageBox(2, 1)">开全部储物箱</button>
								<button class="control-btn secondary-all" @click="controlAllStorageBox(2, 2)">重置全部储物箱</button>
								<button class="control-btn used" @click="controlUsedStorageBox(2)">一键开已用</button>
							</view>
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
				config: {
					color: '#ffffff',
					title: '设备控制',
					backgroundColor: [0, ['#FFFFFF', '#FFFFFF']],
					slideBackgroundColor: [1, ['#FE5D01', '#FE5D01']],
					statusBarFontColor: ['#ffffff', '#ffffff']
				},
				// 工位1数据
				workstation1: {
					status: 'idle', // idle: 空闲, busy: 使用中
					statusText: '空闲'
				},
				// 工位2数据
				workstation2: {
					status: 'idle',
					statusText: '空闲'
				},
				// 工位1储物箱列表
				storageBoxes1: [],
				selectedBox1: 0,
				// 工位2储物箱列表
				storageBoxes2: [],
				selectedBox2: 0
			}
		},
		onLoad() {
			this.initStorageBoxes();
			this.fetchWorkstationStatus();
		},
		onPageScroll(e) {
			this.$refs.hxnb.pageScroll(e);
		},
		methods: {
			// 初始化储物箱列表
			initStorageBoxes() {
				// 工位1：箱号4-24
				for (let i = 1; i <= 24; i++) {
					this.storageBoxes1.push(`箱号${i}`);
				}
				// 工位2：箱号1-24
				for (let i = 1; i <= 24; i++) {
					this.storageBoxes2.push(`箱号${i}`);
				}
			},
			
			// 获取工位状态
			fetchWorkstationStatus() {
				// 这里调用API获取工位状态
				// this.$core.get({url: '...', success: (ret) => { ... }});
			},
			
			// 储物箱选择变化
			onBoxChange(workstationIndex, e) {
				if (workstationIndex === 1) {
					this.selectedBox1 = e.detail.value;
				} else {
					this.selectedBox2 = e.detail.value;
				}
			},
			
			// 门控制
			controlDoor(workstationIndex, action) {
				uni.showModal({
					title: '确认操作',
					content: `确定要${this.getActionText(action)}工位${workstationIndex}的门吗？`,
					success: (res) => {
						if (res.confirm) {
							// 调用API
							this.$core.post({
								url: 'xiluxc.shop/doorControlAdmin',
								data: {
									shopId: 9, 
									operateId: action,
									doorindex: workstationIndex
								},
								loading: true,
								success: (ret) => {
									uni.showToast({title: '操作成功', icon: 'success'});
								}
							});
							
							// 临时演示
							uni.showToast({
								title: `工位${workstationIndex}门${this.getActionText(action)}指令已发送`,
								icon: 'success'
							});
						}
					}
				});
			},
			// 全部通电/断电控制
			controlAllPower(workstationIndex, action) {
				const actionText = action === 'on' ? '通电' : '断电';
				uni.showModal({
					title: '确认操作',
					content: `确定要${actionText}工位${workstationIndex}的所有设备吗？`,
					success: (res) => {
						if (res.confirm) {
							// 调用API
							this.$core.post({
								url: 'xiluxc.shop/allPowerControl',
								data: {
									shopId: 9,
									operateId: action
								},
								loading: true,
								success: (ret) => {
									if (ret.code == 1) {
										uni.showToast({
											title: `工位${workstationIndex}${actionText}成功`,
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: ret.msg || '操作失败',
											icon: 'none'
										});
									}
								}
							});
						}
					}
				});
			},
			// 水电控制
			controlUtility(workstationIndex, action) {
				const actionText = action === 'water_power_on' ? '通水电' : '断水电';
				uni.showModal({
					title: '确认操作',
					content: `确定要${actionText}工位${workstationIndex}吗？`,
					success: (res) => {
						if (res.confirm) {
							// 调用API
							this.$core.post({
								url: 'xiluxc.shop/electricControlAdmin',
								data: {
									shopId: 9,
									doorindex: workstationIndex,
									operateId: action
								},
								loading: true,
								success: (ret) => {
									uni.showToast({title: '操作成功', icon: 'success'});
								}
							});
							
							// 临时演示
							uni.showToast({
								title: `工位${workstationIndex}${actionText}指令已发送`,
								icon: 'success'
							});
						}
					}
				});
			},
			
			// 单个储物箱控制
			controlStorageBox(workstationIndex, action) {
				const boxNumber = this.getSelectedBoxNumber(workstationIndex);
				const actionText = action === 'open' ? '打开' : '重置';
				
				uni.showModal({
					title: '确认操作',
					content: `确定要${actionText}工位${workstationIndex}的${boxNumber}号储物箱吗？`,
					success: (res) => {
						if (res.confirm) {
							// 调用API
							this.$core.post({
								url: 'xiluxc.shop/boxControlAdmin',
								data: {
									shopId: 9,
									doorindex: workstationIndex,
									boxid: boxNumber,
									operateId: action
								},
								loading: true,
								success: (ret) => {
									uni.showToast({title: '操作成功', icon: 'success'});
								}
							});
							
							// 临时演示
							uni.showToast({
								title: `${actionText}工位${workstationIndex}的${boxNumber}号储物箱指令已发送`,
								icon: 'success'
							});
						}
					}
				});
			},
			
			// 全部储物箱控制
			controlAllStorageBox(workstationIndex, action) {
				const actionText = action === 'open' ? '打开' : '重置';
				
				uni.showModal({
					title: '确认操作',
					content: `确定要${actionText}工位${workstationIndex}的全部储物箱吗？`,
					success: (res) => {
						if (res.confirm) {
							// 调用API
							this.$core.post({
								url: 'xiluxc.shop/allBoxControlAdmin',
								data: {
									shopId: 9,
									doorindex: workstationIndex,
									operateId: action
								},
								loading: true,
								success: (ret) => {
									uni.showToast({title: '操作成功', icon: 'success'});
								}
							});
							
							// 临时演示
							uni.showToast({
								title: `${actionText}工位${workstationIndex}的全部储物箱指令已发送`,
								icon: 'success'
							});
						}
					}
				});
			},
			
			// 一键开已用储物箱
			controlUsedStorageBox(workstationIndex) {
				uni.showModal({
					title: '确认操作',
					content: `确定要打开工位${workstationIndex}的所有已用储物箱吗？`,
					success: (res) => {
						if (res.confirm) {
							// 调用API
							this.$core.post({
								url: 'xiluxc.shop/openUsedStorageBox',
								data: {
									shopId: 9,
									doorindex: workstationIndex
								},
								loading: true,
								success: (ret) => {
									if (ret.code == 1) {
										uni.showToast({
											title: `成功打开${ret.data.open_count}个已用储物箱`,
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: ret.msg || '操作失败',
											icon: 'none'
										});
									}
								}
							});
						}
					}
				});
			},
			
			// 获取选中的箱号
			getSelectedBoxNumber(workstationIndex) {
				if (workstationIndex === 1) {
					return this.selectedBox1 + 4; // 工位1从4开始
				} else {
					return this.selectedBox2 + 1; // 工位2从1开始
				}
			},
			
			// 获取动作文本
			getActionText(action) {
				const actions = {
					'open': '打开',
					'stop': '停止',
					'close': '关闭',
					'water_power_on': '通水电',
					'water_power_off': '断水电',
					'reset': '重置'
				};
				return actions[action] || action;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}
	
	.top_img {
		height: 300rpx;
		position: absolute;
		left: 0;
		right: 0;
		width: 100%;
		z-index: 1;
	}
	
	.page-head {
		position: relative;
		z-index: 2;
	}
	
	.workstation-control {
		padding: 30rpx;
		margin-top: 180rpx;
	}
	
	.workstation-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
	}
	
	.workstation-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #f5f5f5;
	}
	
	.workstation-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
	
	.workstation-status {
		padding: 12rpx 24rpx;
		border-radius: 24rpx;
		font-size: 24rpx;
		font-weight: 500;
		
		&.idle {
			background: linear-gradient(135deg, #52c41a, #73d13d);
			color: white;
		}
		
		&.busy {
			background: linear-gradient(135deg, #ff4d4f, #ff7875);
			color: white;
		}
	}
	
	.control-section {
		margin-bottom: 40rpx;
	}
	
	.control-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-left: 10rpx;
		border-left: 8rpx solid #FE5D01;
	}
	
	.button-group {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		margin-top: 10rpx;
	}
	
	.control-btn {
		flex: 1;
		min-width: 200rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		color: white;
		font-size: 28rpx;
		font-weight: 500;
		border-radius: 12rpx;
		border: none;
		padding: 0;
		margin: 0;
		
		&::after {
			border: none;
		}
		
		// 主按钮样式
		&.primary {
			background: linear-gradient(135deg, #40a9ff, #69c0ff);
		}
		
		&.warn {
			background: linear-gradient(135deg, #ffa940, #ffc069);
		}
		
		&.danger {
			background: linear-gradient(135deg, #ff4d4f, #ff7875);
		}
		
		&.success {
			background: linear-gradient(135deg, #52c41a, #73d13d);
		}
		
		// 储物箱按钮
		&.info {
			background: linear-gradient(135deg, #36cfc9, #5cdbd3);
		}
		
		&.secondary {
			background: linear-gradient(135deg, #ffa940, #ffc069);
		}
		
		// 全部储物箱按钮
		&.info-all {
			background: linear-gradient(135deg, #597ef7, #85a5ff);
		}
		
		&.used {
			background: linear-gradient(135deg, #fa8c16, #ffa940);
		}
		
		&.secondary-all {
			background: linear-gradient(135deg, #722ed1, #9254de);
		}
		
		&:active {
			opacity: 0.8;
			transform: translateY(2rpx);
		}
	}
	
	.storage-control {
		.storage-header {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			font-size: 28rpx;
			color: #333;
			
			.picker {
				padding: 10rpx 30rpx;
				background: #f8f9fa;
				border-radius: 12rpx;
				color: #1890ff;
				font-weight: 500;
				min-width: 120rpx;
				text-align: center;
			}
		}
	}
	.control-btn.power-on-all {
	    background: linear-gradient(135deg, #52c41a, #73d13d);
	}
	
	.control-btn.power-off-all {
	    background: linear-gradient(135deg, #f5222d, #ff4d4f);
	}
</style>