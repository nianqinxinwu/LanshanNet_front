<template>
	<view class="page">
		<view class="content">
			<view class="logo-wrap">
				<image v-if="logo" class="logo" :src="logo" mode="aspectFill"></image>
				<view v-else class="logo-text">居间人电商</view>
			</view>
			<view class="app-name">居间人电商</view>
			<view class="sub-title">请选择您的身份开始使用</view>
			<view class="btn-wrap">
				<view class="btn-primary" @click="selectRole(1)">我是居间人</view>
				<view class="btn-outline" @click="selectRole(2)">我是工厂</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				logo: ''
			}
		},
		onLoad() {
			let config = getApp({allowDefault: true}).globalData.config;
			if (config && config.logo) {
				this.logo = config.logo;
			}
		},
		methods: {
			selectRole(roleType) {
				uni.navigateTo({
					url: '/pages/login/login?role_type=' + roleType
				});
			}
		}
	}
</script>

<style scoped>
	.page {
		width: 100%;
		min-height: 100vh;
		background: linear-gradient(180deg, #FFFFFF 0%, #FFF5F0 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.logo-wrap {
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 40rpx;
	}

	.logo {
		width: 180rpx;
		height: 180rpx;
		display: block;
	}

	.logo-text {
		width: 180rpx;
		height: 180rpx;
		background-color: #FE4B01;
		color: #FFFFFF;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		border-radius: 50%;
	}

	.app-name {
		font-size: 48rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 20rpx;
	}

	.sub-title {
		font-size: 28rpx;
		color: #999999;
		margin-bottom: 80rpx;
	}

	.btn-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.btn-primary {
		width: 600rpx;
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
		background-color: #FE4B01;
		color: #FFFFFF;
		font-size: 32rpx;
		border-radius: 50rpx;
		margin-bottom: 40rpx;
	}

	.btn-outline {
		width: 600rpx;
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
		background-color: #FFFFFF;
		color: #FE4B01;
		font-size: 32rpx;
		border-radius: 50rpx;
		border: 2rpx solid #FE4B01;
	}
</style>
