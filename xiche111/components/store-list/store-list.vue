<template>
	<view>
		<view class="stores_item p30" v-for="(shop,index) in shopList" :key="index">
			<view>
				<view class="cover" @click="onShopDetail(shop.id)">
					<image :src="shop.image_text" mode="aspectFill" class="cover"></image>
				</view>
				<view class="flex-box" @click="onShopDetail(shop.id)">
					<view class="flex-grow-1 pl20">
						<!-- 标题行，包含标题和距离信息 -->
						<view class="flex flex-align-center mt30">
							<view class="fs36 fwb col1 flex-grow-1 pr20 m-ellipsis">{{shop.name}}</view>
							<view class="col89 fs26 nowrap ml20">{{shop.distance}}</view>
						</view>
						
						<!-- 地址信息 -->
						<view class="mt20 flex-box">
							<view class="flex-grow-1 m-ellipsis pr20 col5 fs26">{{shop.address}}</view>
							<image src="@/static/icon/icon_address.png" mode="aspectFill" class="ico30"></image>
						</view>
						
						<!-- 费用信息 -->
						<view class="mt20 flex-box">
							<view class="flex-grow-1 m-ellipsis pr20 col5 fs26">{{shop.fee}}</view>
						</view>
						
						<!-- 工位状态信息 -->
						<view class="mt30 flex flex-wrap gap20">
							<view class="flex flex-align-center" v-if="shop.number1 !== undefined">
								<view class="fs24 mr10 col5">工位1：</view>
								<view :class="['status-text', getStatusClass(shop.number1)]">
									{{shop.number1}}
								</view>
							</view>
							<view class="flex flex-align-center" v-if="shop.number2 !== undefined">
								<view class="fs24 mr10 col5">工位2：</view>
								<view :class="['status-text', getStatusClass(shop.number2)]">
									{{shop.number2}}
								</view>
							</view>
						</view>
					</view>
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
			htzRate
		},
		name: "company-list",
		props: {
			shopList: {
				type: Array,
				default: []
			},
			type: {
				type: Number,
				default: 1
			}
		},
		data() {
			return {
			
			};
		},
		methods: {
			// 根据状态获取样式类
			getStatusClass(status) {
				if (status === '空闲' || status === '空闲中') {
					return 'status-free';
				} else if (status.includes('已洗') || status.includes('分钟')) {
					return 'status-washing';
				} else {
					return 'status-busy';
				}
			},
			//门店详情
			onShopDetail(id) {
				uni.navigateTo({
					url: '/pages/stores_info/stores_info?id=' + id
				})
			},
			onServiceDetail(id, shopId) {
				uni.navigateTo({
					url: '/pages/service_detail/service_detail?id=' + id + '&shop_id=' + shopId
				})
			},
			//购买
			onBuy(serviceId, shopId) {
				if (!this.$core.getUserinfo(true)) {
					return;
				}
				let param = {
					type: 'service',
					shop_id: shopId,
					service_id: serviceId,
					service_price_id: 0
				};
				// #ifdef MP-WEIXIN
				uni.navigateTo({
					url: '/pages/pay_order/pay_order?param=' + encodeURIComponent(JSON.stringify(param))
				})
				// #endif
				// #ifdef H5
				this.$core.checkH5Openid('pages/pay_order/pay_order', encodeURIComponent(JSON.stringify(param)))
				// #endif
			},
		}
	}
</script>

<style lang="scss" scoped>
	.stores_item {
		margin: 30rpx 30rpx 0;
		width: 93%;
		background: #FFFFFF;
		border-radius: 25rpx;
		border: 1px solid #EEEEEE;
		
		.cover {
			width: 100%;
			height: 200rpx;
			border-radius: 30rpx;
			margin-bottom: 20rpx;
		}
		
		.mini_cover {
			width: 109rpx;
			height: 90rpx;
			border-radius: 10rpx;
		}
		
		.star {
			width: 26rpx;
			height: 26rpx;
		}
		
		.star+.star {
			margin-left: 4rpx;
		}
		
		.stores_menu {
			margin-top: 25rpx;
			width: 630rpx;
			height: 120rpx;
			background: #F5F7FB;
			border-radius: 15rpx;
			padding: 0 30rpx;
		}
		
		.nowrap {
			white-space: nowrap;
		}
		
		/* 工位状态文本样式 */
		.status-text {
			font-size: 22rpx;
			font-weight: bold;
			line-height: 1.4;
			padding: 8rpx 20rpx;
			border-radius: 20rpx; /* 椭圆形 */
			white-space: nowrap; /* 防止文字换行 */
			min-width: 80rpx; /* 最小宽度 */
			text-align: center;
		}
		
		.status-free {
			color: #07C160;
			background-color: rgba(7, 193, 96, 0.1); /* 浅绿色背景 */
			border: 1rpx solid rgba(7, 193, 96, 0.3); /* 绿色边框 */
		}
		
		.status-washing {
			color: #FA5151;
			background-color: rgba(250, 81, 81, 0.1); /* 浅红色背景 */
			border: 1rpx solid rgba(250, 81, 81, 0.3); /* 红色边框 */
		}
		
		.status-busy {
			color: #FA5151;
			/* 其他忙状态不加背景框，只显示红色文字 */
			padding: 0;
			background-color: transparent;
			border: none;
		}
		
		.gap20 {
			gap: 20rpx;
		}
		
		/* 确保工位和状态文字对齐 */
		.flex-align-center {
			align-items: center;
		}
	}
</style>