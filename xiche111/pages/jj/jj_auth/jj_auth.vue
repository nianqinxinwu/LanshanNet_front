<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav" @click="onSubmit()">
				<view class="btn5">提交认证</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 居间人类别选择 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb30">选择认证类型</view>
					<view class="flex-box mb20" @click="agentType = 1">
						<image :src="'/static/icon/'+(agentType == 1 ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="ico34"></image>
						<view class="pl15 fs30 col1">我是个人居间人</view>
					</view>
					<view class="flex-box" @click="agentType = 2">
						<image :src="'/static/icon/'+(agentType == 2 ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="ico34"></image>
						<view class="pl15 fs30 col1">我是公司居间人</view>
					</view>
				</view>

				<!-- 手机验证 -->
				<view class="box mb30">
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">手机号</view>
						<input type="text" class="flex-grow-1 tr" disabled :value="mobile" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30">
						<view class="col5 label">验证码</view>
						<input type="number" maxlength="6" class="flex-grow-1 tr" v-model="code" placeholder="请输入验证码" placeholder-class="cola" />
						<view class="code-btn fs26" :class="disabledCode ? 'col9' : 'col4'" @click="getCode()">{{codeText}}</view>
					</view>
				</view>

				<!-- 身份证信息（个人/公司共用） -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb30">身份证信息</view>
					<view class="mb20">
						<view class="col5 fs28 mb10">身份证正面</view>
						<view class="upload_nav" @click="chooseImage('idCardFrontImgUrl')">
							<image :src="idCardFrontImgUrl ? idCardFrontImgUrl : '/static/images/icon_upload_logo.png'" mode="aspectFill" class="img"></image>
						</view>
					</view>
					<view>
						<view class="col5 fs28 mb10">身份证反面</view>
						<view class="upload_nav" @click="chooseImage('idCardBackImgUrl')">
							<image :src="idCardBackImgUrl ? idCardBackImgUrl : '/static/images/icon_upload_logo.png'" mode="aspectFill" class="img"></image>
						</view>
					</view>
				</view>

				<!-- 公司居间人：营业执照 -->
				<view v-if="agentType == 2" class="box mb30">
					<view class="fs34 fwb col1 lh36 mb30">企业信息</view>
					<view>
						<view class="col5 fs28 mb10">营业执照</view>
						<view class="upload_nav" @click="chooseImage('businessLicense')">
							<image :src="businessLicense ? businessLicense : '/static/images/icon_upload_logo.png'" mode="aspectFill" class="img"></image>
						</view>
					</view>
				</view>

				<!-- 协议勾选区域 -->
				<view class="flex-box flex-center fs26 col6 mb30 flex-wrap">
					<image @click="isAgree = !isAgree" :src="'/static/icon/'+(isAgree ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="agree-ico mr10"></image>
					<view>我已阅读并同意</view>
					<view class="col4" @click="openAgreement('platform_agreement')">《平台协议》</view>
					<view>和</view>
					<view class="col4" @click="openAgreement('deposit_rule')">《履约保证金规则》</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	var validate = require("../../../xilu/validate.js");
	export default {
		data() {
			return {
				agentType: 1,
				mobile: '',
				code: '',
				disabledCode: false,
				codeText: '获取验证码',
				idCardFrontImgUrl: '',
				idCardBackImgUrl: '',
				businessLicense: '',
				isAgree: false
			}
		},
		onLoad(options) {
			if (options && options.mobile) {
				this.mobile = options.mobile;
			} else {
				let userinfo = this.$core.getUserinfo();
				if (userinfo && userinfo.mobile) {
					this.mobile = userinfo.mobile;
				}
			}
		},
		methods: {
			// 获取验证码
			getCode() {
				if (this.disabledCode) return;
				if (!this.mobile) {
					uni.showToast({ title: '手机号不得为空', icon: 'none' });
					return;
				}
				this.$core.post({
					url: 'sms/send',
					data: {
						mobile: this.mobile,
						event: 'jj_auth'
					},
					success: (ret) => {
						this.timeCut();
					}
				});
			},
			// 倒计时
			timeCut() {
				if (this.disabledCode) return;
				this.disabledCode = true;
				let n = 60;
				this.codeText = n + 's';
				const run = setInterval(() => {
					n -= 1;
					if (n < 0) {
						clearInterval(run);
					}
					this.codeText = n + 's';
					if (this.codeText < 0 + 's') {
						this.disabledCode = false;
						this.codeText = '获取验证码';
					}
				}, 1000);
			},
			// 图片上传
			chooseImage(field) {
				let that = this;
				uni.chooseImage({
					count: 1,
					success: res => {
						let file = res.tempFiles[0];
						// #ifdef H5
						that.$core.uploadFileH5({
							filePath: file.path,
							success: (ret, response) => {
								that[field] = ret.data.url;
							}
						});
						//#endif
						//#ifdef MP-WEIXIN
						that.$core.uploadFile({
							filePath: file.path,
							success: (ret, response) => {
								that[field] = ret.data.url;
							}
						});
						//#endif
					}
				});
			},
			// 打开协议
			openAgreement(type) {
				let id = getApp().globalData.config[type] || 0;
				uni.navigateTo({
					url: '/pages/rich_mp/rich_mp?id=' + id
				});
			},
			// 提交认证
			onSubmit() {
				if (!this.isAgree) {
					uni.showToast({ title: '请同意协议', icon: 'none' });
					return;
				}

				let formData = {
					agentType: this.agentType,
					mobile: this.mobile,
					code: this.code,
					idCardFrontImgUrl: this.idCardFrontImgUrl,
					idCardBackImgUrl: this.idCardBackImgUrl
				};

				let rule = [
					{ name: 'code', nameChn: '验证码', rules: ['require'], errorMsg: { require: '请输入验证码' } },
					{ name: 'idCardFrontImgUrl', nameChn: '身份证正面', rules: ['require'], errorMsg: { require: '请上传身份证正面照片' } },
					{ name: 'idCardBackImgUrl', nameChn: '身份证反面', rules: ['require'], errorMsg: { require: '请上传身份证反面照片' } }
				];

				if (this.agentType == 2) {
					formData.businessLicense = this.businessLicense;
					rule.push(
						{ name: 'businessLicense', nameChn: '营业执照', rules: ['require'], errorMsg: { require: '请上传企业营业执照' } }
					);
				}

				if (!validate.check(formData, rule)) {
					uni.showToast({ title: validate.getError()[0], icon: 'none' });
					return;
				}

				this.$core.post({
					url: 'xiluxc.user/intermediaryAuth',
					data: formData,
					success: ret => {
						uni.showModal({
							title: '提示',
							content: '居间人认证成功',
							showCancel: false,
							success() {
								uni.redirectTo({ url: '/pages/jj/jj_main/jj_main' });
							}
						});
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

	/* PC端宽屏适配 */
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

		.inp_nav {
			height: auto;
			padding: 14px 0;
		}

		.upload_nav {
			width: 160px;
			height: 160px;
			border-radius: 8px;
			cursor: pointer;
		}

		.foot_nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}

		.code-btn {
			cursor: pointer;
		}

		.agree-ico {
			cursor: pointer;
		}
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;

		.label {
			width: 160rpx;
		}
	}

	.code-btn {
		padding-left: 20rpx;
		border-left: 1px solid #EEEEEE;
		white-space: nowrap;
	}

	.upload_nav {
		width: 200rpx;
		height: 200rpx;
		border-radius: 15rpx;
		display: inline-block;
		vertical-align: top;
		position: relative;
		background: #F5F8FC;

		.img {
			width: 100%;
			height: 100%;
			display: block;
			border-radius: 15rpx;
		}
	}

	.agree-ico {
		width: 38rpx;
		height: 38rpx;
		border-radius: 50%;
	}

	.foot_nav {
		padding: 10rpx 30rpx;
	}

	@supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
		.container {
			padding-bottom: calc(130rpx + 68rpx);
			padding-bottom: calc(constant(safe-area-inset-bottom) + 130rpx);
			padding-bottom: calc(env(safe-area-inset-bottom) + 130rpx);
		}
	}
</style>
