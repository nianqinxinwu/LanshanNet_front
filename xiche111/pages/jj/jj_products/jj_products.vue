<template>
	<view>
		<!-- #ifdef H5 -->
		<pc-sidebar v-if="isPC" active="products" :menu-list="pcMenuList" />
		<!-- #endif -->

		<view class="container bg-f5" :class="{ 'pc-layout': isPC }">
			<view class="page-wrap p30">
				<view class="box tc ptb40">
					<view class="fs34 fwb col1 mb20">商品池</view>
					<view class="fs28 col9">功能开发中，敬请期待...</view>
				</view>
			</view>
		</view>

		<jj-tabbar v-if="isMobile" active="products" />
	</view>
</template>

<script>
	import pcSidebar from '@/components/pc-sidebar/pc-sidebar.vue';
	import jjTabbar from '@/components/jj-tabbar/jj-tabbar.vue';

	export default {
		components: { pcSidebar, jjTabbar },
		data() {
			return {
				pcMenuList: [
					{ key: 'home', label: '首页', icon: '/static/icon/icon_foot1_uc.png', iconActive: '/static/icon/icon_foot1_sc.png', url: '/pages/jj/jj_home/jj_home', isTab: false },
					{ key: 'products', label: '商品池', icon: '/static/icon/icon_foot2_uc.png', iconActive: '/static/icon/icon_foot2_sc.png', url: '/pages/jj/jj_products/jj_products', isTab: false },
					{ key: 'cart', label: '商品清单', icon: '/static/icon/icon_foot3_uc.png', iconActive: '/static/icon/icon_foot3_sc.png', url: '/pages/jj/jj_cart/jj_cart', isTab: false },
					{ key: 'orders', label: '订单', icon: '/static/icon/icon_foot4_uc.png', iconActive: '/static/icon/icon_foot4_sc.png', url: '/pages/jj/jj_orders/jj_orders', isTab: false },
					{ key: 'profile', label: '我的', icon: '/static/icon/icon_foot5_uc.png', iconActive: '/static/icon/icon_foot5_sc.png', url: '/pages/jj/jj_profile/jj_profile', isTab: false }
				]
			}
		},
		onShow() {
			// #ifdef H5
			if (this.isPC) {
				uni.hideTabBar({ animation: false });
			}
			// #endif
		}
	}
</script>

<style lang="scss" scoped>
	.page-wrap {
		max-width: 750rpx;
		margin-left: auto;
		margin-right: auto;
		padding-bottom: 120rpx;
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.pc-layout {
		margin-left: 220px;
	}

	@media screen and (min-width: 768px) {
		.page-wrap {
			max-width: 700px;
			padding: 30px;
			padding-bottom: 30px;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
		}
	}
</style>
