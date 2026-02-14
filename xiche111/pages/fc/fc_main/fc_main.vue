<template>
	<view class="fc-main">
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
				<fc-home-content v-if="activeTab === 'home'" @switchTab="onSwitchTab" />

				<!-- 产品管理 -->
				<fc-products-content v-else-if="activeTab === 'products'" />

				<!-- 订单管理 -->
				<fc-orders-content v-else-if="activeTab === 'orders'" :init-tab="ordersInitTab" :key="ordersKey" />

				<!-- 我的 -->
				<fc-profile-content v-else-if="activeTab === 'profile'" />
			</view>
		</view>

		<!-- 移动端 TabBar -->
		<fc-tabbar
			v-if="isMobile"
			:active="activeTab"
			:navigate="false"
			@change="onTabChange"
		/>
	</view>
</template>

<script>
	import pcSidebar from '@/components/pc-sidebar/pc-sidebar.vue';
	import fcTabbar from '@/components/fc-tabbar/fc-tabbar.vue';
	import fcHomeContent from '@/components/fc-home-content/fc-home-content.vue';
	import fcProductsContent from '@/components/fc-products-content/fc-products-content.vue';
	import fcProfileContent from '@/components/fc-profile-content/fc-profile-content.vue';
	import fcOrdersContent from '@/components/fc-orders-content/fc-orders-content.vue';

	export default {
		components: { pcSidebar, fcTabbar, fcHomeContent, fcProductsContent, fcProfileContent, fcOrdersContent },
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
						label: '产品管理',
						icon: '/static/icon/icon_foot2_uc.png',
						iconActive: '/static/icon/icon_foot2_sc.png'
					},
					{
						key: 'orders',
						label: '订单管理',
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
			if (options.tab && ['home', 'products', 'orders', 'profile'].indexOf(options.tab) !== -1) {
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
				if (status !== undefined) {
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
	.fc-main {
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
