<template>
	<view class="jj-main">
		<!-- #ifdef H5 -->
		<pc-sidebar
			v-if="isPC"
			:active="activeTab"
			:menu-list="menuList"
			:navigate="false"
			@change="onTabChange"
		/>
		<!-- #endif -->

		<view class="main-content" :class="{ 'pc-content': isPC }">
			<view class="content-wrap p30">
				<!-- 首页 -->
				<jj-home-content v-if="activeTab === 'home'" @switchTab="onSwitchTab" />

				<!-- 商品池 -->
				<jj-products-content v-else-if="activeTab === 'products'" />

				<!-- 商品清单 -->
				<jj-cart-content v-else-if="activeTab === 'cart'" @switchTab="onSwitchTab" />

				<!-- 订单 -->
				<jj-orders-content v-else-if="activeTab === 'orders'" :init-tab="ordersInitTab" :key="ordersKey" />

				<!-- 我的 -->
				<jj-profile-content v-else-if="activeTab === 'profile'" />
			</view>
		</view>

		<!-- 移动端 TabBar -->
		<jj-tabbar
			v-if="isMobile"
			:active="activeTab"
			:navigate="false"
			@change="onTabChange"
		/>
	</view>
</template>

<script>
	import pcSidebar from '@/components/pc-sidebar/pc-sidebar.vue';
	import jjTabbar from '@/components/jj-tabbar/jj-tabbar.vue';
	import jjHomeContent from '@/components/jj-home-content/jj-home-content.vue';
	import jjProductsContent from '@/components/jj-products-content/jj-products-content.vue';
	import jjProfileContent from '@/components/jj-profile-content/jj-profile-content.vue';
	import jjOrdersContent from '@/components/jj-orders-content/jj-orders-content.vue';
	import jjCartContent from '@/components/jj-cart-content/jj-cart-content.vue';

	export default {
		components: { pcSidebar, jjTabbar, jjHomeContent, jjProductsContent, jjProfileContent, jjOrdersContent, jjCartContent },
		data() {
			return {
				activeTab: 'home',
				ordersInitTab: 'all',
				ordersKey: 0,
				menuList: [
					{
						key: 'home',
						label: '首页',
						icon: '/static/icon/icon_foot1_uc.png',
						iconActive: '/static/icon/icon_foot1_sc.png'
					},
					{
						key: 'products',
						label: '商品池',
						icon: '/static/icon/icon_foot2_uc.png',
						iconActive: '/static/icon/icon_foot2_sc.png'
					},
					{
						key: 'cart',
						label: '商品清单',
						icon: '/static/icon/icon_cart_uc.svg',
						iconActive: '/static/icon/icon_cart_sc.svg'
					},
					{
						key: 'orders',
						label: '订单',
						icon: '/static/icon/icon_foot4_uc.png',
						iconActive: '/static/icon/icon_foot4_sc.png'
					},
					{
						key: 'profile',
						label: '我的',
						icon: '/static/icon/icon_foot5_uc.png',
						iconActive: '/static/icon/icon_foot5_sc.png'
					}
				]
			}
		},
		onLoad(options) {
			const userinfo = this.$core.getUserinfo();
			if (!userinfo || !userinfo.token) {
				uni.redirectTo({ url: '/pages/login/login' });
				return;
			}
			if (options.tab && ['home', 'products', 'cart', 'orders', 'profile'].indexOf(options.tab) !== -1) {
				this.activeTab = options.tab;
			}
		},
		onShow() {
			// #ifdef H5
			uni.hideTabBar({ animation: false });
			// #endif
		},
		methods: {
			onTabChange(tabKey) {
				this.activeTab = tabKey;
			},
			onSwitchTab(tabKey, status) {
				if (status) {
					this.ordersInitTab = status;
					this.ordersKey++;
				} else {
					this.ordersInitTab = 'all';
				}
				this.activeTab = tabKey;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.jj-main {
		min-height: 100vh;
		background: #F5F7FB;
	}

	.main-content {
		min-height: 100vh;
	}

	.content-wrap {
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

	/* PC端：内容区右移，为左侧菜单腾出空间 */
	.pc-content {
		margin-left: 220px;

		.content-wrap {
			padding-bottom: 30px;
		}
	}

	@media screen and (min-width: 768px) {
		.content-wrap {
			max-width: 1200px;
			padding: 30px;
			padding-bottom: 30px;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
		}
	}
</style>
