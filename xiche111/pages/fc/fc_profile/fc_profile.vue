<template>
	<view :class="['page-root', isPC ? 'pc-layout' : 'mobile-layout']">
		<!-- #ifdef H5 -->
		<pc-sidebar v-if="isPC" :active="'profile'" :menu-list="menuList" />
		<!-- #endif -->
		<view class="main-content" :class="{ 'pc-content': isPC }">
			<view class="content-wrap p30">
				<fc-profile-content />
			</view>
		</view>
		<fc-tabbar v-if="isMobile" :active="'profile'" />
	</view>
</template>

<script>
	import pcSidebar from '@/components/pc-sidebar/pc-sidebar.vue';
	import fcTabbar from '@/components/fc-tabbar/fc-tabbar.vue';
	import fcProfileContent from '@/components/fc-profile-content/fc-profile-content.vue';

	export default {
		components: { pcSidebar, fcTabbar, fcProfileContent },
		data() {
			return {
				menuList: [
					{ key: 'home', label: '首页', icon: '/static/icon/icon_foot1_uc.png', iconActive: '/static/icon/icon_foot1_sc.png', url: '/pages/fc/fc_main/fc_main' },
					{ key: 'products', label: '产品管理', icon: '/static/icon/icon_foot2_uc.png', iconActive: '/static/icon/icon_foot2_sc.png', url: '/pages/fc/fc_main/fc_main?tab=products' },
					{ key: 'orders', label: '订单管理', icon: '/static/icon/icon_foot4_uc.png', iconActive: '/static/icon/icon_foot4_sc.png', url: '/pages/fc/fc_main/fc_main?tab=orders' },
					{ key: 'profile', label: '我的', icon: '/static/icon/icon_foot5_uc.png', iconActive: '/static/icon/icon_foot5_sc.png', url: '/pages/fc/fc_main/fc_main?tab=profile' }
				]
			}
		},
		onShow() {
			// #ifdef H5
			uni.hideTabBar({ animation: false });
			// #endif
		}
	}
</script>

<style lang="scss" scoped>
	.page-root {
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
		}
	}
</style>
