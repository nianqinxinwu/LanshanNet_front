<template>
	<view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 个人信息 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">个人信息</view>
					<!-- #ifdef MP-WEIXIN -->
					<button class="cell-btn flex-box bb" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
						<view class="col5 fs28 cell-label">头像</view>
						<view class="flex-grow-1 tr">
							<image :src="userinfo.avatar || '/static/icon/icon_foot5_sc.png'" mode="aspectFill" class="cell-avatar"></image>
						</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow"></image>
					</button>
					<!-- #endif -->
					<!-- #ifdef H5 || APP-PLUS -->
					<view class="cell flex-box bb" @click="chooseImage">
						<view class="col5 fs28 cell-label">头像</view>
						<view class="flex-grow-1 tr">
							<image :src="userinfo.avatar || '/static/icon/icon_foot5_sc.png'" mode="aspectFill" class="cell-avatar"></image>
						</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow"></image>
					</view>
					<!-- #endif -->
					<view class="cell flex-box bb" @click="onEditNickname">
						<view class="col5 fs28 cell-label">昵称</view>
						<view class="flex-grow-1 tr fs28 col1">{{ userinfo.nickname || '未设置' }}</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow"></image>
					</view>
					<view class="cell flex-box">
						<view class="col5 fs28 cell-label">手机号</view>
						<view class="flex-grow-1 tr fs28 col1">{{ mobileMask }}</view>
					</view>
				</view>

				<!-- 昵称编辑弹窗 -->
				<view class="mask" v-if="showNicknamePopup" @click="showNicknamePopup = false">
					<view class="popup-box" @click.stop>
						<view class="fs34 fwb col1 tc mb30">修改昵称</view>
						<!-- #ifdef MP-WEIXIN -->
						<input type="nickname" class="popup-input fs28" v-model="editNickname" placeholder="请输入新昵称" placeholder-class="cola" @nicknamereview="onNicknameReview" />
						<!-- #endif -->
						<!-- #ifdef H5 || APP-PLUS -->
						<input type="text" class="popup-input fs28" v-model="editNickname" placeholder="请输入新昵称" placeholder-class="cola" maxlength="20" />
						<!-- #endif -->
						<view class="flex-box mt30" style="gap: 20rpx;">
							<view class="popup-btn popup-btn-cancel flex-grow-1 tc fs28" @click="showNicknamePopup = false">取消</view>
							<view class="popup-btn popup-btn-confirm flex-grow-1 tc fs28" @click="saveNickname">确定</view>
						</view>
					</view>
				</view>

				<!-- 认证信息 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">认证信息</view>
					<view class="cell flex-box bb">
						<view class="col5 fs28 cell-label">认证类型</view>
						<view class="flex-grow-1 tr fs28 col1">{{ authInfo.typeName }}</view>
					</view>
					<view class="cell flex-box">
						<view class="col5 fs28 cell-label">认证状态</view>
						<view class="flex-grow-1 tr">
							<text class="fs28" :class="authInfo.status === 1 ? 'col2' : 'col9'">{{ authInfo.statusText }}</text>
						</view>
					</view>
				</view>

				<!-- 其他 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">其他</view>
					<view class="cell flex-box bb" @click="onSwitchRole">
						<view class="col1 fs28 flex-grow-1">切换身份</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow"></image>
					</view>
					<view class="cell flex-box" @click="onAbout">
						<view class="col1 fs28 flex-grow-1">关于平台</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow"></image>
					</view>
				</view>

				<!-- 退出登录 -->
				<view class="logout-btn" @click="onLogout">退出登录</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userinfo: {
					nickname: '',
					avatar: '',
					mobile: ''
				},
				authInfo: {
					type: 1,
					typeName: '个人居间人',
					status: 1,
					statusText: '已认证'
				},
				showNicknamePopup: false,
				editNickname: ''
			}
		},
		computed: {
			mobileMask() {
				let m = this.userinfo.mobile || '';
				if (m.length === 11) {
					return m.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
				}
				return m || '未绑定';
			}
		},
		onLoad() {
			this.getUserinfo();
		},
		onShow() {
			// 返回该页面时刷新信息（头像/昵称可能在其他地方修改）
			this.getUserinfo();
		},
		methods: {
			// 从接口获取用户信息
			getUserinfo() {
				this.$core.get({
					url: 'xiluxc.user/profile',
					data: {},
					loading: false,
					success: ret => {
						this.userinfo.nickname = ret.data.nickname || '';
						this.userinfo.avatar = ret.data.avatar || '';
						this.userinfo.mobile = ret.data.mobile || '';
					},
					fail: err => {
						// 接口失败时回退读缓存
						let info = this.$core.getUserinfo();
						if (info) {
							this.userinfo.nickname = info.nickname || '';
							this.userinfo.avatar = info.avatar || '';
							this.userinfo.mobile = info.mobile || '';
						}
					}
				});
			},

			// H5/APP: 选择图片上传头像
			chooseImage() {
				let that = this;
				uni.chooseImage({
					count: 1,
					success: res => {
						let file = res.tempFiles[0];
						// #ifdef H5
						that.$core.uploadFileH5({
							filePath: file.path,
							success: (ret, response) => {
								that.userinfo.avatar = ret.data.url;
								that.saveAvatar(ret.data.url);
							}
						});
						// #endif
						// #ifdef APP-PLUS
						that.$core.uploadFile({
							filePath: file.path,
							success: (ret, response) => {
								that.userinfo.avatar = ret.data.url;
								that.saveAvatar(ret.data.url);
							}
						});
						// #endif
					}
				});
			},

			// 微信小程序: 选择头像回调
			onChooseAvatar(e) {
				let that = this;
				// #ifdef MP-WEIXIN
				that.$core.uploadFile({
					filePath: e.detail.avatarUrl,
					success: (ret, response) => {
						that.userinfo.avatar = ret.data.url;
						that.saveAvatar(ret.data.url);
					}
				});
				// #endif
			},

			// 保存头像到服务器
			saveAvatar(avatarUrl) {
				this.$core.post({
					url: 'xiluxc.user/profile',
					data: {
						avatar: avatarUrl,
						nickname: this.userinfo.nickname
					},
					success: ret => {
						// 更新本地缓存
						let userinfo = this.$core.getUserinfo();
						if (userinfo) {
							userinfo.avatar = avatarUrl;
							this.$core.setUserinfo(userinfo);
						}
						uni.$emit('user_update', {});
						uni.showToast({ title: '头像已更新', icon: 'success' });
					},
					fail: ret => {
						uni.showToast({ title: ret.msg || '保存失败', icon: 'none' });
					}
				});
			},

			// 打开昵称编辑弹窗
			onEditNickname() {
				this.editNickname = this.userinfo.nickname;
				this.showNicknamePopup = true;
			},

			// 微信小程序昵称审核回调
			onNicknameReview(e) {
				if (!e.detail.pass) {
					uni.showToast({ title: '昵称不合法', icon: 'none' });
					this.editNickname = '';
				}
			},

			// 保存昵称
			saveNickname() {
				let nickname = this.editNickname.trim();
				if (!nickname) {
					uni.showToast({ title: '请输入昵称', icon: 'none' });
					return;
				}
				this.showNicknamePopup = false;

				this.$core.post({
					url: 'xiluxc.user/profile',
					data: {
						avatar: this.userinfo.avatar,
						nickname: nickname
					},
					success: ret => {
						this.userinfo.nickname = nickname;
						// 更新本地缓存
						let userinfo = this.$core.getUserinfo();
						if (userinfo) {
							userinfo.nickname = nickname;
							this.$core.setUserinfo(userinfo);
						}
						uni.$emit('user_update', {});
						uni.showToast({ title: '昵称已更新', icon: 'success' });
					},
					fail: ret => {
						uni.showToast({ title: ret.msg || '保存失败', icon: 'none' });
					}
				});
			},

			onSwitchRole() {
				uni.showModal({
					title: '提示',
					content: '确定要切换身份吗？将返回登录页重新选择角色。',
					success: (res) => {
						if (res.confirm) {
							uni.redirectTo({ url: '/pages/login/login' });
						}
					}
				});
			},
			onAbout() {
				let id = getApp().globalData.config['about_us'] || 0;
				uni.navigateTo({
					url: '/pages/rich_mp/rich_mp?id=' + id
				});
			},
			onLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							this.$core.logout();
							uni.redirectTo({ url: '/pages/login/login' });
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-wrap {
		max-width: 750rpx;
		margin-left: auto;
		margin-right: auto;
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.cell {
		padding: 28rpx 0;
	}

	/* 微信小程序头像选择button重置样式 */
	.cell-btn {
		display: flex;
		align-items: center;
		padding: 28rpx 0;
		margin: 0;
		background: none;
		border: none;
		border-radius: 0;
		font-size: inherit;
		line-height: inherit;
		color: inherit;
		text-align: left;
		width: 100%;
		box-sizing: border-box;

		&::after {
			display: none;
		}
	}

	.cell-label {
		width: 160rpx;
		flex-shrink: 0;
	}

	.cell-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		vertical-align: middle;
	}

	.cell-arrow {
		width: 24rpx;
		height: 24rpx;
		margin-left: 15rpx;
		flex-shrink: 0;
	}

	/* 昵称编辑弹窗 */
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.popup-box {
		width: 600rpx;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
	}

	.popup-input {
		width: 100%;
		height: 80rpx;
		border: 1px solid #EEEEEE;
		border-radius: 12rpx;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.popup-btn {
		height: 76rpx;
		line-height: 76rpx;
		border-radius: 38rpx;
	}

	.popup-btn-cancel {
		border: 1px solid #DDDDDD;
		color: #666666;
		line-height: calc(76rpx - 2px);
	}

	.popup-btn-confirm {
		background: #FE4B01;
		color: #FFFFFF;
	}

	.logout-btn {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 28rpx;
		text-align: center;
		font-size: 30rpx;
		color: #FF4D4F;
		font-weight: bold;
	}

	/* PC端适配 */
	@media screen and (min-width: 768px) {
		.page-wrap {
			max-width: 1200px;
			padding: 30px;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.cell,
		.cell-btn {
			padding: 18px 0;
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}

		.popup-box {
			width: 420px;
			padding: 30px 24px;
			border-radius: 12px;
		}

		.popup-input {
			height: 44px;
			padding: 0 14px;
			border-radius: 8px;
			font-size: 15px;
		}

		.popup-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}

		.logout-btn {
			border-radius: 12px;
			padding: 18px;
			cursor: pointer;
			transition: background 0.2s;

			&:hover {
				background: #FFF1F0;
			}
		}
	}
</style>
