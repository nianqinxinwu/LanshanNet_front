<template>
	<view>
		<!-- 底部按钮 -->
		<view class="page-foot bg-white" v-if="isEditing">
			<view class="foot_nav">
				<view class="btn5" @click="onSubmit()">{{ certInfo.certified ? '保存修改' : '提交认证' }}</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">

				<!-- 认证状态栏 -->
				<view class="jj-box mb30" v-if="loaded && certInfo.certified">
					<view class="flex-box">
						<view class="flex-grow-1">
							<view class="fs34 fwb col1 lh36">企业认证</view>
							<view class="fs24 mt8" :class="certInfo.status === 1 ? 'col2' : 'col9'">{{ certInfo.status_text }}</view>
						</view>
						<view class="edit-toggle-btn fs26" @click="toggleEdit">{{ isEditing ? '取消编辑' : '编辑资料' }}</view>
					</view>
				</view>

				<!-- ========== 展示模式 ========== -->
				<template v-if="loaded && !isEditing && certInfo.certified">
					<!-- 营业执照 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">营业执照</view>
						<image v-if="certInfo.business_license" :src="certInfo.business_license" mode="widthFix" class="show-img" @click="previewImage(certInfo.business_license)"></image>
						<view v-else class="fs28 col9">未上传</view>
					</view>

					<!-- 产品检测报告 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">产品检测报告</view>
						<view v-if="certInfo.inspection_reports && certInfo.inspection_reports.length > 0" class="photo-grid">
							<template v-for="(file, idx) in certInfo.inspection_reports">
								<image v-if="isImageUrl(file)" :key="idx" :src="file" mode="aspectFill" class="show-img-sm" @click="previewImage(file)"></image>
								<view v-else :key="'f'+idx" class="file-card show-img-sm" @click="openFile(file)">
									<view class="file-type-tag">PDF</view>
									<view class="fs22 col5 file-name-text">{{ getFileName(file) }}</view>
								</view>
							</template>
						</view>
						<view v-else class="fs28 col9">未上传</view>
					</view>

					<!-- 国际贸易证书 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">国际贸易证书</view>
						<view v-if="certInfo.trade_certs && certInfo.trade_certs.length > 0" class="photo-grid">
							<image v-for="(img, idx) in certInfo.trade_certs" :key="idx" :src="img" mode="aspectFill" class="show-img-sm" @click="previewImage(img)"></image>
						</view>
						<view v-else class="fs28 col9">未上传</view>
					</view>

					<!-- 工厂照片 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb20">工厂照片</view>
						<view v-if="certInfo.factory_photos && certInfo.factory_photos.length > 0" class="photo-grid">
							<image v-for="(img, idx) in certInfo.factory_photos" :key="idx" :src="img" mode="aspectFill" class="show-img-sm" @click="previewImage(img)"></image>
						</view>
						<view v-else class="fs28 col9">未上传</view>
					</view>

					<!-- 企业信息 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb30">企业信息</view>
						<view class="info-row bb">
							<view class="col5 fs28">公司名称</view>
							<view class="col1 fs28">{{ certInfo.company_name }}</view>
						</view>
						<view class="info-row bb">
							<view class="col5 fs28">所属行业</view>
							<view class="col1 fs28">{{ certInfo.industry || '-' }}</view>
						</view>
						<view class="info-row bb">
							<view class="col5 fs28">所在省份</view>
							<view class="col1 fs28">{{ certInfo.province || '-' }}</view>
						</view>
						<view class="info-row bb">
							<view class="col5 fs28">联系人</view>
							<view class="col1 fs28">{{ certInfo.contact_name }}</view>
						</view>
						<view class="info-row">
							<view class="col5 fs28">联系电话</view>
							<view class="col1 fs28">{{ certInfo.contact_phone }}</view>
						</view>
					</view>
				</template>

				<!-- ========== 编辑模式 ========== -->
				<template v-if="isEditing || (loaded && !certInfo.certified)">
					<!-- 营业执照 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb30">营业执照</view>
						<view>
							<view class="col5 fs28 mb10">营业执照上传</view>
							<view class="upload_nav" @click="chooseImage('businessLicense')">
								<image :src="businessLicense ? businessLicense : '/static/images/icon_upload_logo.png'" mode="aspectFill" class="img"></image>
							</view>
						</view>
					</view>

					<!-- 产品检测报告 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb30">产品检测报告 <text class="fs24 col9">（支持图片/PDF，最多6份）</text></view>
						<view class="photo-grid">
							<view class="upload_nav" v-for="(file, idx) in inspectionReports" :key="idx" @click="removeInspectionReport(idx)">
								<image v-if="isImageUrl(file)" :src="file" mode="aspectFill" class="img"></image>
								<view v-else class="file-item">
									<view class="file-type-tag">PDF</view>
									<view class="fs20 col5 file-name-text">{{ getFileName(file) }}</view>
								</view>
								<view class="remove-btn">×</view>
							</view>
							<view class="upload_nav" v-if="inspectionReports.length < 6" @click="chooseInspectionReport">
								<image src="/static/images/icon_upload_logo.png" mode="aspectFill" class="img"></image>
							</view>
						</view>
					</view>

					<!-- 国际贸易证书（可选） -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb30">国际贸易证书 <text class="fs24 col9">（可选）</text></view>
						<view>
							<view class="upload_nav" @click="chooseImage('tradeCert')">
								<image :src="tradeCert ? tradeCert : '/static/images/icon_upload_logo.png'" mode="aspectFill" class="img"></image>
							</view>
						</view>
					</view>

					<!-- 工厂照片 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb30">工厂照片 <text class="fs24 col9">（最多6张）</text></view>
						<view class="photo-grid">
							<view class="upload_nav" v-for="(img, idx) in factoryPhotos" :key="idx" @click="removePhoto(idx)">
								<image :src="img" mode="aspectFill" class="img"></image>
								<view class="remove-btn">×</view>
							</view>
							<view class="upload_nav" v-if="factoryPhotos.length < 6" @click="chooseFactoryPhoto">
								<image src="/static/images/icon_upload_logo.png" mode="aspectFill" class="img"></image>
							</view>
						</view>
					</view>

					<!-- 企业信息表单 -->
					<view class="jj-box mb30">
						<view class="fs34 fwb col1 lh36 mb30">企业信息</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">公司名称</view>
							<input type="text" class="flex-grow-1 tr" v-model="companyName" placeholder="请输入公司名称" placeholder-class="cola" :disabled="certInfo.certified" />
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">所属行业</view>
							<picker :range="industryList" @change="onIndustryChange">
								<view class="flex-grow-1 tr" :class="industry ? 'col1' : 'cola'">{{ industry || '请选择所属行业' }}</view>
							</picker>
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">所在省份</view>
							<input type="text" class="flex-grow-1 tr" v-model="province" placeholder="请输入省份" placeholder-class="cola" />
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">联系人</view>
							<input type="text" class="flex-grow-1 tr" v-model="contactName" placeholder="请输入联系人姓名" placeholder-class="cola" />
						</view>
						<view class="inp_nav flex-box col1 fs30">
							<view class="col5 label">联系电话</view>
							<input type="text" class="flex-grow-1 tr" v-model="contactPhone" placeholder="请输入联系电话" placeholder-class="cola" />
						</view>
					</view>

					<!-- 协议勾选（仅新认证时显示） -->
					<view v-if="!certInfo.certified" class="flex-box flex-center fs26 col6 mb30 flex-wrap">
						<image @click="isAgree = !isAgree" :src="'/static/icon/'+(isAgree ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="agree-ico mr10"></image>
						<view>我已阅读并同意</view>
						<view class="col4" @click="openAgreement('platform_agreement')">《平台协议》</view>
						<view>和</view>
						<view class="col4" @click="openAgreement('factory_rule')">《工厂入驻规则》</view>
					</view>
				</template>

			</view>
		</view>
	</view>
</template>

<script>
	var validate = require("../../../xilu/validate.js");
	export default {
		data() {
			return {
				loaded: false,
				isEditing: false,
				certInfo: {
					certified: false,
					status: -1,
					status_text: '未提交',
					company_name: '',
					province: '',
					industry: '',
					contact_name: '',
					contact_phone: '',
					business_license: '',
					inspection_reports: [],
					trade_certs: [],
					factory_photos: []
				},
				// 编辑表单字段
				businessLicense: '',
				inspectionReports: [],
				tradeCert: '',
				factoryPhotos: [],
				companyName: '',
				industry: '',
				industryList: ['建材', '化工', '机械', '电子', '纺织', '食品', '医药', '其他'],
				province: '',
				contactName: '',
				contactPhone: '',
				isAgree: false
			}
		},
		onLoad() {
			this.loadCertStatus();
		},
		methods: {
			loadCertStatus() {
				this.$core.get({
					url: 'xiluxc.fc_factory/cert_status',
					loading: true,
					success: ret => {
						let d = ret.data;
						this.certInfo = {
							certified: d.certified || false,
							status: d.status !== undefined ? d.status : -1,
							status_text: d.status_text || '未提交',
							company_name: d.company_name || '',
							province: d.province || '',
							industry: d.industry || '',
							contact_name: d.contact_name || '',
							contact_phone: d.contact_phone || '',
							business_license: d.business_license || '',
							inspection_reports: d.inspection_reports || [],
							trade_certs: d.trade_certs || [],
							factory_photos: d.factory_photos || []
						};
						// 未认证直接进入编辑模式
						if (!this.certInfo.certified) {
							this.isEditing = true;
						}
						this.loaded = true;
					},
					fail: () => {
						this.isEditing = true;
						this.loaded = true;
						return false;
					}
				});
			},
			toggleEdit() {
				if (!this.isEditing) {
					// 进入编辑：用现有数据填充表单
					this.companyName = this.certInfo.company_name;
					this.province = this.certInfo.province;
					this.industry = this.certInfo.industry;
					this.contactName = this.certInfo.contact_name;
					this.contactPhone = this.certInfo.contact_phone;
					this.businessLicense = this.certInfo.business_license;
					this.inspectionReports = this.certInfo.inspection_reports ? [].concat(this.certInfo.inspection_reports) : [];
					this.tradeCert = (this.certInfo.trade_certs && this.certInfo.trade_certs[0]) || '';
					this.factoryPhotos = this.certInfo.factory_photos ? [].concat(this.certInfo.factory_photos) : [];
				}
				this.isEditing = !this.isEditing;
			},
			previewImage(url) {
				uni.previewImage({ urls: [url], current: url });
			},
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
			chooseFactoryPhoto() {
				let that = this;
				let remain = 6 - that.factoryPhotos.length;
				uni.chooseImage({
					count: remain,
					success: res => {
						res.tempFiles.forEach(file => {
							// #ifdef H5
							that.$core.uploadFileH5({
								filePath: file.path,
								success: (ret, response) => {
									if (that.factoryPhotos.length < 6) {
										that.factoryPhotos.push(ret.data.url);
									}
								}
							});
							//#endif
							//#ifdef MP-WEIXIN
							that.$core.uploadFile({
								filePath: file.path,
								success: (ret, response) => {
									if (that.factoryPhotos.length < 6) {
										that.factoryPhotos.push(ret.data.url);
									}
								}
							});
							//#endif
						});
					}
				});
			},
			removePhoto(idx) {
				uni.showModal({
					title: '提示',
					content: '确定删除此照片？',
					success: (res) => {
						if (res.confirm) {
							this.factoryPhotos.splice(idx, 1);
						}
					}
				});
			},
			isImageUrl(url) {
				if (!url) return false;
				return /\.(jpg|jpeg|png|gif|bmp|webp)(\?|$)/i.test(url);
			},
			getFileName(url) {
				if (!url) return '';
				let name = url.split('/').pop().split('?')[0];
				return name.length > 16 ? name.substring(0, 13) + '...' : name;
			},
			openFile(url) {
				// #ifdef H5
				window.open(url, '_blank');
				// #endif
				// #ifdef MP-WEIXIN
				uni.downloadFile({
					url: url,
					success: (res) => {
						uni.openDocument({ filePath: res.tempFilePath });
					}
				});
				// #endif
			},
			chooseInspectionReport() {
				let that = this;
				let remain = 6 - that.inspectionReports.length;
				that.$core.chooseAndUploadFile({
					count: remain,
					extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'],
					success: (ret) => {
						if (that.inspectionReports.length < 6) {
							that.inspectionReports.push(ret.data.url);
						}
					}
				});
			},
			removeInspectionReport(idx) {
				uni.showModal({
					title: '提示',
					content: '确定删除此文件？',
					success: (res) => {
						if (res.confirm) {
							this.inspectionReports.splice(idx, 1);
						}
					}
				});
			},
			onIndustryChange(e) {
				this.industry = this.industryList[e.detail.value];
			},
			onSubmit() {
				if (this.certInfo.certified) {
					this.doUpdate();
				} else {
					this.doSubmitCert();
				}
			},
			// 已认证：更新信息
			doUpdate() {
				let formData = {
					contact_name: this.contactName,
					contact_phone: this.contactPhone,
					province: this.province,
					industry: this.industry,
					business_license: this.businessLicense,
					inspection_reports: this.inspectionReports.length > 0 ? JSON.stringify(this.inspectionReports) : '[]',
					trade_certs: this.tradeCert ? JSON.stringify([this.tradeCert]) : '[]',
					factory_photos: this.factoryPhotos.length > 0 ? JSON.stringify(this.factoryPhotos) : '[]'
				};
				this.$core.post({
					url: 'xiluxc.fc_factory/update_info',
					data: formData,
					success: ret => {
						uni.showToast({ title: '修改成功', icon: 'success' });
						this.isEditing = false;
						this.loadCertStatus();
					}
				});
			},
			// 新认证：提交
			doSubmitCert() {
				if (!this.isAgree) {
					uni.showToast({ title: '请同意协议', icon: 'none' });
					return;
				}
				let formData = {
					company_name: this.companyName,
					province: this.province,
					industry: this.industry,
					contact_name: this.contactName,
					contact_phone: this.contactPhone,
					business_license: this.businessLicense,
					inspection_reports: this.inspectionReports.length > 0 ? JSON.stringify(this.inspectionReports) : '',
					trade_certs: this.tradeCert ? JSON.stringify([this.tradeCert]) : '',
					factory_photos: this.factoryPhotos.length > 0 ? JSON.stringify(this.factoryPhotos) : ''
				};
				let rule = [
					{ name: 'business_license', nameChn: '营业执照', rules: ['require'], errorMsg: { require: '请上传营业执照' } },
					{ name: 'company_name', nameChn: '公司名称', rules: ['require'], errorMsg: { require: '请输入公司名称' } },
					{ name: 'contact_name', nameChn: '联系人', rules: ['require'], errorMsg: { require: '请输入联系人姓名' } },
					{ name: 'contact_phone', nameChn: '联系电话', rules: ['require'], errorMsg: { require: '请输入联系电话' } }
				];
				if (!validate.check(formData, rule)) {
					uni.showToast({ title: validate.getError()[0], icon: 'none' });
					return;
				}
				this.$core.post({
					url: 'xiluxc.fc_factory/submit_cert',
					data: formData,
					success: ret => {
						uni.showModal({
							title: '提示',
							content: '认证提交成功',
							showCancel: false,
							success: () => {
								uni.redirectTo({ url: '/pages/fc/fc_main/fc_main' });
							}
						});
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.edit-toggle-btn {
		border: 1px solid #FE4B01;
		color: #FE4B01;
		padding: 10rpx 30rpx;
		border-radius: 30rpx;
		flex-shrink: 0;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 28rpx 0;
	}

	.show-img {
		width: 100%;
		max-width: 400rpx;
		border-radius: 12rpx;
	}

	.show-img-sm {
		width: 200rpx;
		height: 200rpx;
		border-radius: 12rpx;
	}

	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;

		.label {
			width: 160rpx;
		}
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

	.photo-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.remove-btn {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: #FF4D4F;
		color: #FFFFFF;
		font-size: 28rpx;
		text-align: center;
		line-height: 40rpx;
		cursor: pointer;
	}

	.file-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #F5F8FC;
		border-radius: 12rpx;
		border: 1px solid #E8E8E8;
		padding: 16rpx;
	}

	.file-item {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 15rpx;
	}

	.file-type-tag {
		background: #E74C3C;
		color: #FFFFFF;
		font-size: 24rpx;
		font-weight: bold;
		padding: 8rpx 24rpx;
		border-radius: 8rpx;
		margin-bottom: 12rpx;
	}

	.file-name-text {
		text-align: center;
		word-break: break-all;
		padding: 0 8rpx;
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

	@media screen and (min-width: 768px) {
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

		.agree-ico {
			cursor: pointer;
		}

		.edit-toggle-btn {
			cursor: pointer;
			transition: background 0.2s;

			&:hover {
				background: #FE4B01;
				color: #FFFFFF;
			}
		}

		.show-img-sm {
			cursor: pointer;
		}

		.info-row {
			padding: 16px 0;
		}
	}
</style>
