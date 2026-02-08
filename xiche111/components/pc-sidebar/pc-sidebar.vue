<template>
	<!-- #ifdef H5 -->
	<view class="pc-sidebar" v-if="show">
		<view class="sidebar-logo">
			<image src="/static/icon/icon_foot1_sc.png" mode="aspectFill" class="logo-img"></image>
			<view class="logo-text">居间人电商</view>
		</view>
		<view class="sidebar-menu">
			<view
				v-for="(item, index) in menuList"
				:key="index"
				class="menu-item"
				:class="{ 'menu-active': active === item.key }"
				@click="onMenuClick(item)"
			>
				<image :src="active === item.key ? item.iconActive : item.icon" mode="aspectFill" class="menu-icon"></image>
				<view class="menu-label">{{ item.label }}</view>
			</view>
		</view>
		<view class="sidebar-footer" @click="onLogout">
			<view class="menu-label col9">退出登录</view>
		</view>
	</view>
	<!-- #endif -->
</template>

<script>
	export default {
		name: 'pc-sidebar',
		props: {
			active: {
				type: String,
				default: 'index'
			},
			show: {
				type: Boolean,
				default: true
			},
			navigate: {
				type: Boolean,
				default: true
			},
			menuList: {
				type: Array,
				default() {
					return [
						{
							key: 'index',
							label: '首页',
							icon: '/static/icon/icon_foot1_uc.png',
							iconActive: '/static/icon/icon_foot1_sc.png',
							url: '/pages/index/index',
							isTab: true
						},
						{
							key: 'profile',
							label: '我的',
							icon: '/static/icon/icon_foot5_uc.png',
							iconActive: '/static/icon/icon_foot5_sc.png',
							url: '/pages/profile/profile',
							isTab: true
						}
					];
				}
			}
		},
		data() {
			return {}
		},
		methods: {
			onMenuClick(item) {
				if (item.key === this.active) return;
				if (this.navigate) {
					if (item.isTab) {
						uni.switchTab({ url: item.url });
					} else {
						uni.redirectTo({ url: item.url });
					}
				} else {
					this.$emit('change', item.key);
				}
			},
			onLogout() {
				uni.showModal({
					title: '提示',
					content: '确定退出登录？',
					success: (res) => {
						if (res.confirm) {
							this.$core.logout();
							uni.reLaunch({ url: '/pages/jj_start/jj_start' });
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pc-sidebar {
		width: 220px;
		height: 100vh;
		background: #FFFFFF;
		border-right: 1px solid #EEEEEE;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
	}

	.sidebar-logo {
		padding: 30px 20px 24px;
		display: flex;
		align-items: center;
		border-bottom: 1px solid #F0F0F0;

		.logo-img {
			width: 40px;
			height: 40px;
			border-radius: 8px;
		}

		.logo-text {
			margin-left: 12px;
			font-size: 16px;
			font-weight: 600;
			color: #101010;
		}
	}

	.sidebar-menu {
		flex: 1;
		padding: 12px 0;
		overflow-y: auto;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 14px 24px;
		cursor: pointer;
		transition: background-color 0.2s;

		&:hover {
			background-color: #F5F7FB;
		}

		&.menu-active {
			background-color: #FFF5F0;

			.menu-label {
				color: #FE4B01;
				font-weight: 500;
			}
		}

		.menu-icon {
			width: 22px;
			height: 22px;
		}

		.menu-label {
			margin-left: 12px;
			font-size: 14px;
			color: #333;
		}
	}

	.sidebar-footer {
		padding: 16px 24px;
		border-top: 1px solid #F0F0F0;
		cursor: pointer;

		&:hover {
			background-color: #F5F7FB;
		}

		.menu-label {
			font-size: 14px;
			color: #999;
		}
	}
</style>
