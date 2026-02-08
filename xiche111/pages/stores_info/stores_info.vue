<template>
	<view>
		<view class="container">
			<!-- 顶部轮播图 -->
			<swiper class="top-swiper" circular :autoplay="true" :interval="3000" :duration="1000" indicator-dots indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#FF8C00">
				<swiper-item v-for="(img,index) in shop.images_text" :key="index">
					<image :src="img" mode="aspectFill" class="swiper-img"></image>
				</swiper-item>
			</swiper>
			
			<!-- 店铺信息卡片 -->
			<view class="shop-card">
				<view class="shop-header">
					<view class="shop-name">{{shop.name}}</view>
					<view :class="['shop-status', shop.status == 'normal' ? 'open' : 'closed']">
						{{statusText}}
					</view>
				</view>
				
				<view class="shop-info">
					<view class="info-item" @click="onLocation">
						<image src="/static/icon/location.png" class="info-icon"></image>
						<text class="info-text">{{shop.address}}</text>
					</view>
					<view class="info-item" @click="onCall" v-if="shop.contact_mobile">
						<image src="/static/icon/phone.png" class="info-icon"></image>
						<text class="info-text">{{shop.contact_mobile}}</text>
					</view>
				</view>
			</view>

			<!-- 选择车型 -->
			<view class="section-card">
				<view class="section-title">
					<view class="title-line"></view>
					<text class="title-text">选择车型</text>
				</view>
				<view class="car-type-buttons">
					<view
						:class="['car-type-item', selectedCarType === 1 ? 'active' : '']"
						@click="selectedCarType = 1">
						<image src="/static/icon/car4.png" class="car-type-icon"></image>
						<text class="car-type-text">小轿车</text>
					</view>
					<view 
						:class="['car-type-item', selectedCarType === 2 ? 'active' : '']"
						@click="selectedCarType = 2">
						<image src="/static/icon/car3.png" class="car-type-icon"></image>
						<text class="car-type-text">两轮/三轮</text>
					</view>
				</view>
			</view>

			<!-- 工位选择 -->
			<view class="section-card">
				<view class="section-title">
					<view class="title-line"></view>
					<text class="title-text">选择工位</text>
				</view>
				<view class="workstation-grid">
					<view v-for="(item,index) in shop.device" :key="index" 
						@click="selectGongwei(item.id)"
						:class="['workstation-item', 
							item.status == '1' ? 'busy' : 'available',
							{'selected': selectedIndex == item.id}]">
						<view class="workstation-name">{{item.name}}</view>
						<view class="workstation-status">{{item.status_str}}</view>
					</view>
				</view>
			</view>

			<!-- 操作按钮区域 -->
			<view class="action-section">
				<view class="warning-tips">
					<text class="warning-text">温馨提示：卷帘门20秒自动关闭，请尽快入场</text>
				</view>
		<!-- 		<view class="warning-tips">
					<text class="warning-text1">两轮/三轮洗车需要手动点击结束洗车结算，小轿车可自动结算</text>
				</view> -->
				
				<view class="action-buttons">
					<view v-if="showOpenButtonNow" class="action-btn primary">
						<button class="open-wash-btn" @click="openWashing(selectedCarType)">
							开门洗车
						</button>
					</view>

					<button 
						v-if="showEndButtonNow"
						class="action-btn end" 
						@click="endWashing">
						结束洗车
					</button>
					
					<view class="door-control-section" v-if="showEndButtonNow">
						<text class="door-label">门控制：</text>
						<view class="door-buttons">
							<button class="door-btn open-btn" @click="men('1')">开门</button>
							<button class="door-btn stop-btn" @click="men('2')">停</button>
							<button class="door-btn close-btn" @click="men('3')">关门</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 支付方式切换 -->
			<view class="section-card">
				<view class="section-title">
					<view class="title-line"></view>
					<text class="title-text">结算方式</text>
				</view>
				
				<view class="payment-tabs">
					<view class="tab-list">
						<view 
							v-for="tab in paymentTabs" 
							:key="tab.id"
							:class="['tab-item', activeTab === tab.id ? 'active' : '']"
							@click="switchTab(tab.id)">
							{{tab.name}}
						</view>
					</view>
					
					<view v-show="activeTab === 'balance'" class="tab-content">
						<view class="balance-info">
							<view class="balance-amount">
								<text class="balance-label">店铺余额：</text>
								<text class="balance-value">¥{{shop.balance || '0.00'}}</text>
							</view>
							<view class="balance-tips">可用余额直接支付洗车费用</view>
						</view>
						
						<view class="recharge-section" v-if="shop.recharge.length > 0">
							<view class="recharge-title">快速充值</view>
							<scroll-view class="recharge-scroll" scroll-x>
								<view 
									v-for="(item, index) in shop.recharge" 
									:key="index"
									class="recharge-item"
									@click="onRecharge">
									<view class="recharge-main">
										<text class="recharge-money">¥{{item.money}}</text>
										<view v-if="item.extra_money > 0" class="recharge-gift">
											<text class="gift-icon">赠</text>
											<text>¥{{item.extra_money}}</text>
										</view>
									</view>
									<view class="recharge-action">立即充值</view>
								</view>
							</scroll-view>
						</view>
					</view>
					
					<view v-show="activeTab === 'coupon'" class="tab-content">
						<view class="coupon-list">
							<view 
								v-for="(item, index) in shop.coupons" 
								:key="index"
								:class="['coupon-item', selectedCouponId === item.id ? 'selected' : '']"
								@click="selectCoupon(item.id)">
								<view class="coupon-left">
									<image 
										v-if="item.platform == '1'" 
										src="https://xiche.zzlanshan.site/uploads/douyin.png" 
										class="platform-icon"
										mode="aspectFit"></image>
									
									<image 
										v-else-if="item.platform == '2'" 
										src="https://xiche.zzlanshan.site/uploads/meituan.png" 
										class="platform-icon"
										mode="aspectFit"></image>
									
									<image 
										v-else 
										src="https://xiche.zzlanshan.site/uploads/default.png" 
										class="platform-icon"
										mode="aspectFit"></image>
									
									<view class="coupon-info">
										<view class="coupon-name">
											<text v-if="item.platform == '1'">抖音核销</text>
											<text v-else-if="item.platform == '2'">美团核销</text>
											<text v-else>平台核销</text>
										</view>
										<view class="coupon-code">券号：{{item.name}}</view>
									</view>
								</view>
							</view>
						</view>
						<view class="coupon-tips">请选择要使用的核销券</view>
					</view>
				</view>
			</view>
			
			<!-- 门店详情 -->
			<view class="section-card">
				<view class="section-title">
					<view class="title-line"></view>
					<text class="title-text">门店详情</text>
				</view>
				<view class="rich-content">
					<u-parse :content="shop.description"></u-parse>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
const app = getApp();
import htzRate from '@/components/htz-rate/htz-rate.vue';
export default {
	components: {
		htzRate,
	},
	data() {
		return {
			shopId: 0,
			shop: {
				name: '',
				starttime: '',
				endtime: '',
				point: 0,
				images_text: [],
				address: '',
				distance: '',
				shop_tag: [],
				recharge: [],
				coupons: [],
				shop_services: [],
				shop_package: [],
				vip: [],
				device: [],
			},
			commentList: [],
			statusText: '营业中',
			selectedIndex: 0,
			selectedCarType: 1,
			activeTab: 'balance',
			paymentTabs: [
				{ id: 'balance', name: '余额支付' },
				{ id: 'coupon', name: '核销支付' }
			],
			selectedCouponId: null,
			coupons: [
				{
					id: '1',
					name: "抖音洗车券",
					code: '123456',
					platform: '1'
				},
				{
					id: '2',
					name: "美团洗车券",
					code: '123456',
					platform: '2'
				}
			],
			refreshTimer: null,
			lastRefreshTime: 0,
			isPageActive: true,
			currentWashingDevice: null,
			isCurrentUserWashing: false,
			userInfo: null,
			showOpenButtonNow: false,
			showEndButtonNow: false
		}
	},
	computed: {
		showOpenButton() {
			if (!this.userInfo || this.isCurrentUserWashing) {
				return false;
			}
			return this.selectedIndex !== 0 && 
				   this.shop.device.find(item => item.id == this.selectedIndex)?.status !== '1';
		},
		showEndButton() {
			return this.isCurrentUserWashing;
		},
		doorButtonsEnabled() {
			return this.isCurrentUserWashing;
		}
	},
	onLoad(options) {
		this.shopId = options.id || 0;
		this.userInfo = this.$core.getUserinfo() || {};
		this.fetchDetail();
		this.fetchComment();
		this.showOpenButtonNow = true;
		this.showEndButtonNow = false;
		this.startAutoRefresh();
	},
	onUnload() {
		this.stopAutoRefresh();
	},
	
	onHide() {
		this.isPageActive = false;
		this.stopAutoRefresh();
	},
	
	onShow() {
		this.isPageActive = true;
		this.userInfo = this.$core.getUserinfo();
		this.startAutoRefresh();
	},
	
	methods: {
		startAutoRefresh() {
			this.stopAutoRefresh();
			
			console.log('开始启动自动刷新，间隔10秒...');
			this.fetchDetail();
			
			this.refreshTimer = setInterval(() => {
				this.fetchDetail();
			}, 3000);
		},
		
		stopAutoRefresh() {
			if (this.refreshTimer) {
				clearInterval(this.refreshTimer);
				this.refreshTimer = null;
			}
		},
		
		fetchDetail() {
			let currentCity = this.$core.getCurrentCity();
			let lat = currentCity.pois ? currentCity.pois.latitude : app.globalData.location.latitude;
			let lng = currentCity.pois ? currentCity.pois.longitude : app.globalData.location.longitude;
			
			const timestamp = Date.now();
			
			this.$core.get({
				url: 'xiluxc.shop/detail',
				data: {
					shop_id: this.shopId,
					lat: lat,
					lng: lng,
					_t: timestamp
				},
				loading: false,
				success: (ret) => {
					const oldSelectedIndex = this.selectedIndex;
					const oldActiveTab = this.activeTab;
					const oldSelectedCouponId = this.selectedCouponId;
					
					if (ret.data) {
						this.shop = ret.data;
						this.statusText = this.shop.status == 'normal' ? "营业中" : "休息中";
					}
					
					this.checkWashingStatus(ret.data);
					
					this.selectedIndex = oldSelectedIndex;
					this.activeTab = oldActiveTab;
					this.selectedCouponId = oldSelectedCouponId;
					
					if (ret.data && ret.data.device) {
						this.checkWorkstationStatus(ret.data.device);
					}
				}
			});
		},
		
		checkWashingStatus(shopData) {
			if (!shopData || !this.userInfo) {
				this.showOpenButtonNow = true;
				this.showEndButtonNow = false;
				return;
			}
			
			this.isCurrentUserWashing = false;
			
			if (shopData.device && Array.isArray(shopData.device)) {
				for (const device of shopData.device) {
					if (device.status === '1' && device.uid == this.userInfo.id) {
						this.isCurrentUserWashing = true;
						this.selectedIndex = device.id;
						break;
					}
				}
			}
			
			if (this.isCurrentUserWashing) {
				this.showEndButtonNow = true;
				this.showOpenButtonNow = false;
			} else {
				this.showEndButtonNow = false;
				this.showOpenButtonNow = true;
			}
		},

		checkWorkstationStatus(newDeviceList) {
			if (!newDeviceList || !Array.isArray(newDeviceList)) return;
			
			if (this.selectedIndex && !this.isCurrentUserWashing) {
				const selectedDevice = newDeviceList.find(item => item.id == this.selectedIndex);
				if (selectedDevice && selectedDevice.status == '1') {
					uni.showToast({
						title: '您选择的工位已被占用，请重新选择',
						icon: 'none',
						duration: 2000
					});
					this.selectedIndex = 0;
				}
			}
			
			this.shop.device = newDeviceList;
		},

		selectCoupon(couponId) {
			if (this.selectedCouponId === couponId) {
				this.selectedCouponId = null;
			} else {
				this.selectedCouponId = couponId;
			}
		},

		getPlatformName(platform) {
			if (platform == '1') {
				return '抖音';
			} else if (platform == '2') {
				return '美团';
			}
			return '未知平台';
		},
		
		getPlatformIcon(platform) {
			if (platform == '1') {
				return 'https://xiche.zzlanshan.site/uploads/douyin.png';
			} else if (platform == '2') {
				return 'https://xiche.zzlanshan.site/uploads/meituan.png';
			}
			return 'https://xiche.zzlanshan.site/uploads/douyin.png';
		},
		
		fetchComment() {
			this.$core.get({
				url: 'xiluxc.comment',
				data: {
					shop_id: this.shopId,
					pagesize: 2
				},
				loading: false,
				success: (ret) => {
					this.commentList = ret.data.data;
				}
			});
		},
		
		onLocation() {
			if (!this.shop.lat || !this.shop.lng) return;
			uni.openLocation({
				latitude: Number(this.shop.lat),
				longitude: Number(this.shop.lng),
				name: this.shop.name,
				address: this.shop.address
			});
		},
		
		onCall() {
			if (!this.shop.contact_mobile) return;
			uni.makePhoneCall({
				phoneNumber: this.shop.contact_mobile
			});
		},
		
		onRecharge() {
			// #ifdef MP-WEIXIN
			uni.navigateTo({
				url: '/pages/recharge/recharge?id=' + this.shop.id
			});
			// #endif
			// #ifdef H5
			this.$core.checkH5Openid('pages/recharge/recharge?id=' + this.shop.id);
			// #endif
		},

		selectGongwei(index) {
			if (this.isCurrentUserWashing) {
				uni.showToast({
					title: '您正在洗车中，无法选择其他工位',
					icon: 'none'
				});
				return;
			}
			
			if (this.selectedIndex === index) {
				this.selectedIndex = 0;
			} else {
				this.selectedIndex = index;
			}
		},

		switchTab(tabId) {
			this.activeTab = tabId;
		},
		
		openWashing(carType) {
			if (this.selectedIndex === 0) {
				uni.showToast({
					title: '请选择一个工位',
					icon: 'none'
				});
				return;
			}

			if(!this.$core.getUserinfo(true)){
				return;
			}
			
			let selectedDevice = this.shop.device.find(item => item.id == this.selectedIndex);
			if (!selectedDevice) return;

			if (selectedDevice.status == '1') {
				uni.showToast({
					title: '当前工位正在使用中，请选择其他工位',
					icon: 'none'
				});
				return;
			}
				
			const deviceFee = Number(selectedDevice.fee) || 0;
			const shopBalance = Number(this.shop.balance) || 0;
			
			if (this.activeTab === 'balance' && deviceFee > shopBalance) {
				uni.showToast({
					title: `余额不足（需¥${deviceFee}，余额¥${shopBalance}），请先充值`,
					icon: 'none'
				});
				return;
			}
			
			const carTypeText = carType === 2 ? '两轮/三轮车' : '小轿车';
			
			uni.showModal({
				title: '确认订单',
				content: `确定要为${carTypeText}在 ${selectedDevice.name} 进行洗车吗？`,
				confirmText: '确认',
				success: (res) => {
					if (res.confirm) {
						this.$core.get({
							url: 'xiluxc.shop/detailOpen',
							data: {
								shopId: this.shop.id,
								payType: this.activeTab === 'balance' ? '0' : '1',
								doorIndex: this.selectedIndex,
								couponId: this.activeTab === 'coupon' ? this.selectedCouponId : '',
								carType: carType
							},
							loading: true,
							success: (ret) => {
								uni.showToast({
									title: '门正在打开，请尽快进入',
									icon: 'success'
								});
								
								this.isCurrentUserWashing = true;
								this.showOpenButtonNow = false;
								this.showEndButtonNow = true;
								
								setTimeout(() => {
									this.fetchDetail();
								}, 1000);
							}
						});
					}
				}
			});
		},

		endWashing() {
			if (!this.isCurrentUserWashing) {
				uni.showToast({
					title: '您当前没有正在洗车',
					icon: 'none'
				});
				return;
			}
			
			uni.showModal({
				title: '结束洗车',
				content: '确定要结束洗车吗？',
				confirmText: '确定',
				success: (res) => {
					if (res.confirm) {
						this.$core.get({
							url: 'xiluxc.shop/endWashing',
							data: {
								shopId: this.shop.id,
								doorIndex: this.selectedIndex
							},
							loading: true,
							success: (ret) => {
								uni.showToast({
									title: '洗车已结束',
									icon: 'success'
								});
								
								this.isCurrentUserWashing = false;
								this.showEndButtonNow = false;
								this.showOpenButtonNow = true;
								this.selectedIndex = 0;
								this.currentWashingDevice = null;
								
								setTimeout(() => {
									this.fetchDetail();
								}, 1000);
							}
						});
					}
				}
			});
		},

		men(operateId) {
			if (!this.isCurrentUserWashing) {
				uni.showToast({
					title: '您当前没有正在洗车',
					icon: 'none'
				});
				return;
			}
			
			this.$core.get({
				url: 'xiluxc.shop/doorControl',
				data: {
					shopId: this.shop.id,
					operateId: operateId
				},
				loading: false,
				success: (ret) => {
					const tips = {
						'1': '已发送开门指令',
						'2': '已发送停止指令',
						'3': '已发送关门指令'
					};
					uni.showToast({
						title: tips[operateId] || '操作成功',
						icon: 'success'
					});
				}
			});
		}
	}
}
</script>

<style lang="scss" scoped>
	.container {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		padding-bottom: 30rpx;
	}

	.top-swiper {
		width: 100%;
		height: 350rpx;
		position: relative;
	}

	.swiper-img {
		width: 100%;
		height: 100%;
	}

	.shop-card {
		margin: 20rpx 20rpx 20rpx;
		background: white;
		border-radius: 16rpx;
		padding: 25rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.shop-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.shop-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
	}

	.shop-status {
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
		font-weight: 500;
		margin-left: 15rpx;
	}

	.shop-status.open {
		background: linear-gradient(135deg, #52c41a, #73d13d);
		color: white;
	}

	.shop-status.closed {
		background: linear-gradient(135deg, #d9d9d9, #bfbfbf);
		color: white;
	}

	.shop-info {
		.info-item {
			display: flex;
			align-items: center;
			margin-bottom: 15rpx;
			padding: 15rpx;
			background: #f8f9fa;
			border-radius: 12rpx;
		}

		.info-icon {
			width: 30rpx;
			height: 30rpx;
			margin-right: 15rpx;
		}

		.info-text {
			font-size: 26rpx;
			color: #666;
			flex: 1;
		}
	}

	.section-card {
		margin: 0 20rpx 20rpx;
		background: white;
		border-radius: 16rpx;
		padding: 25rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.section-title {
		display: flex;
		align-items: center;
		margin-bottom: 25rpx;
	}

	.title-line {
		width: 6rpx;
		height: 32rpx;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 3rpx;
		margin-right: 15rpx;
	}

	.title-text {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.car-type-buttons {
		display: flex;
		gap: 15rpx;
	}

	.car-type-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
		border: 6rpx solid #e8e8e8;
	}

	.car-type-item.active {
		background: white;
		border-color: #52c41a;
	}

	.car-type-icon {
		width: 50rpx;
		height: 50rpx;
		margin-bottom: 10rpx;
	}

	.car-type-text {
		font-size: 26rpx;
		color: #333;
	}

	.workstation-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 15rpx;
	}

	.workstation-item {
		padding: 20rpx;
		border-radius: 12rpx;
		text-align: center;
	}

	.workstation-item.available {
		background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
		border: 6rpx solid #91d5ff;
	}

	.workstation-item.busy {
		background: linear-gradient(135deg, #fff2f0, #ffe6e6);
		border: 6rpx solid #ffccc7;
	}

	.workstation-item.selected {
		border: 6rpx solid #ff8c00;
	}

	.workstation-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}

	.workstation-status {
		font-size: 24rpx;
	}

	.action-section {
		margin: 0 20rpx 20rpx;
	}

	.warning-tips {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		background: linear-gradient(135deg, #fffbe6, #fff1b8);
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		border: 1rpx solid #ffd666;
	}

	.warning-icon {
		width: 28rpx;
		height: 28rpx;
		margin-right: 12rpx;
	}

	.warning-text {
		font-size: 22rpx;
		color: #d48806;
	}
	.warning-text1 {
		font-size: 22rpx;
		color: #ff5454;
	}

	.action-buttons .open-wash-section {
		margin-bottom: 20rpx;
	}

	.open-wash-btn {
		width: 100%;
		height: 100rpx;
		background: linear-gradient(135deg, #52c41a, #73d13d);
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
	}

	.open-wash-btn .wash-icon {
		width: 45rpx;
		height: 45rpx;
		margin-right: 15rpx;
	}

	.open-wash-btn .wash-text {
		font-size: 34rpx;
		font-weight: bold;
		color: white;
		display: flex;
		align-items: center;
	}

	.end-wash-btn {
		width: 100%;
		height: 100rpx;
		background: linear-gradient(135deg, #ff4d4f, #ff7875);
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		margin-bottom: 20rpx;
	}

	.end-wash-btn .wash-icon {
		width: 45rpx;
		height: 45rpx;
		margin-right: 15rpx;
	}

	.end-wash-btn .wash-text {
		font-size: 34rpx;
		font-weight: bold;
		color: white;
		display: flex;
		align-items: center;
	}

	.door-control-section {
		background: white;
		border-radius: 12rpx;
		padding: 20rpx;
	}

	.door-label {
		font-size: 26rpx;
		color: #333;
		margin-bottom: 15rpx;
		display: block;
	}

	.door-buttons {
		display: flex;
		gap: 15rpx;
	}

	.door-btn {
		flex: 1;
		height: 70rpx;
		line-height: 70rpx;
		text-align: center;
		color: white;
		font-size: 28rpx;
		border-radius: 12rpx;
		border: none;
	}

	.door-btn.open-btn {
		background: linear-gradient(135deg, #40a9ff, #69c0ff);
	}

	.door-btn.stop-btn {
		background: linear-gradient(135deg, #d9d9d9, #bfbfbf);
	}

	.door-btn.close-btn {
		background: linear-gradient(135deg, #ff7875, #ffa39e);
	}

	.payment-tabs .tab-list {
		display: flex;
		background: #f8f9fa;
		border-radius: 12rpx;
		padding: 8rpx;
		margin-bottom: 40rpx;
	}

	.payment-tabs .tab-item {
		flex: 1;
		text-align: center;
		padding: 24rpx;
		font-size: 28rpx;
		color: #666;
		border-radius: 8rpx;
		transition: all 0.3s;
	}

	.payment-tabs .tab-item.active {
		background: white;
		color: #333;
		font-weight: bold;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		border: 2rpx solid #FF8C00;
	}

	.tab-content {
		animation: fadeIn 0.3s;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.balance-info {
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 20rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		color: white;
	}

	.balance-amount {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.balance-label {
		font-size: 28rpx;
	}

	.balance-value {
		font-size: 48rpx;
		font-weight: bold;
	}

	.balance-tips {
		font-size: 24rpx;
	}

	.recharge-section {
		.recharge-title {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 30rpx;
		}

		.recharge-scroll {
			white-space: nowrap;
			height: 240rpx;
		}

		.recharge-item {
			display: inline-block;
			width: 200rpx;
			height: 200rpx;
			background: white;
			border-radius: 20rpx;
			margin-right: 24rpx;
			padding: 30rpx;
			border: 2rpx solid #e8e8e8;
			transition: all 0.3s;

			&:active {
				border-color: #667eea;
				transform: translateY(-4rpx);
			}
		}

		.recharge-main {
			text-align: center;
			margin-bottom: 30rpx;
		}

		.recharge-money {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 16rpx;
		}

		.recharge-gift {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24rpx;
			color: #ff4d4f;
		}

		.gift-icon {
			background: #ff4d4f;
			color: white;
			padding: 4rpx 12rpx;
			border-radius: 4rpx;
			font-size: 20rpx;
			margin-right: 8rpx;
		}

		.recharge-action {
			text-align: center;
			padding: 16rpx;
			background: linear-gradient(135deg, #667eea, #764ba2);
			color: white;
			border-radius: 12rpx;
			font-size: 24rpx;
			font-weight: 500;
		}
	}

	.coupon-list .coupon-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 24rpx;
		border: 2rpx solid #e8e8e8;
			transition: all 0.3s;
			
			&.selected {
				border: 2rpx solid #FF8C00;
				background: linear-gradient(135deg, #fffbe6, #fff1b8);
				transform: translateY(-4rpx);
				box-shadow: 0 8rpx 24rpx rgba(255, 140, 0, 0.2);
			}
	}

	.coupon-left {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.platform-icon {
		width: 60rpx;
		height: 60rpx;
		margin-right: 20rpx;
		border-radius: 12rpx;
	}

	.coupon-info {
		display: flex;
		flex-direction: column;
	}

	.coupon-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}

	.coupon-code {
		font-size: 24rpx;
		color: #666;
	}

	.coupon-tips {
		text-align: center;
		font-size: 24rpx;
		color: #666;
		margin-top: 30rpx;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
	}

	.rich-content {
		line-height: 1.6;
		font-size: 26rpx;
		color: #333;
	}

	button:after {
		border: none;
	}
	
		/* 结束洗车按钮样式 */
		.action-btn.end {
			width: 100%;
			height: 100rpx;
			line-height: 100rpx;
			text-align: center;
			background: linear-gradient(135deg, #ff4d4f, #ff7875);
			color: white;
			font-size: 32rpx;
			font-weight: bold;
			border-radius: 50rpx;
			margin-bottom: 30rpx;
			border: none;
			padding: 0;
			
			&::after {
				border: none;
			}
		}
</style>