<template>
	<view class="jj-tabbar">
		<view
			v-for="(item, index) in tabList"
			:key="index"
			class="tab-item"
			:class="{ 'tab-active': active === item.key }"
			@click="onTabClick(item)"
		>
			<image :src="active === item.key ? item.iconActive : item.icon" mode="aspectFill" class="tab-icon"></image>
			<view class="tab-label">{{ item.label }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'jj-tabbar',
		props: {
			active: {
				type: String,
				default: 'home'
			},
			navigate: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				tabList: [
					{
						key: 'home',
						label: '首页',
						icon: '/static/icon/icon_foot1_uc.png',
						iconActive: '/static/icon/icon_foot1_sc.png',
						url: '/pages/jj/jj_home/jj_home'
					},
					{
						key: 'products',
						label: '商品池',
						icon: '/static/icon/icon_foot2_uc.png',
						iconActive: '/static/icon/icon_foot2_sc.png',
						url: '/pages/jj/jj_products/jj_products'
					},
					{
						key: 'cart',
						label: '商品清单',
						icon: '/static/icon/icon_cart_uc.svg',
						iconActive: '/static/icon/icon_cart_sc.svg',
						url: '/pages/jj/jj_cart/jj_cart'
					},
					{
						key: 'orders',
						label: '订单',
						icon: '/static/icon/icon_foot4_uc.png',
						iconActive: '/static/icon/icon_foot4_sc.png',
						url: '/pages/jj/jj_orders/jj_orders'
					},
					{
						key: 'profile',
						label: '我的',
						icon: '/static/icon/icon_foot5_uc.png',
						iconActive: '/static/icon/icon_foot5_sc.png',
						url: '/pages/jj/jj_profile/jj_profile'
					}
				]
			}
		},
		methods: {
			onTabClick(item) {
				if (item.key === this.active) return;
				if (this.navigate) {
					uni.redirectTo({ url: item.url });
				} else {
					this.$emit('change', item.key);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.jj-tabbar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		display: flex;
		align-items: center;
		height: 100rpx;
		background: #FFFFFF;
		border-top: 1px solid #EEEEEE;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		cursor: pointer;
	}

	.tab-icon {
		width: 44rpx;
		height: 44rpx;
		margin-bottom: 4rpx;
	}

	.tab-label {
		font-size: 20rpx;
		color: #AAAAAA;
	}

	.tab-active .tab-label {
		color: #FE4B01;
	}
</style>
