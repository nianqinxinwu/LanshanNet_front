<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" @click="onSubmit()">{{ productId ? '保存修改' : '发布产品' }}</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 产品封面 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb30">产品封面</view>
					<view class="upload_nav" @click="chooseImage('coverImage')">
						<image :src="coverImage ? coverImage : '/static/images/icon_upload_logo.png'" mode="aspectFill" class="img"></image>
					</view>
				</view>

				<!-- 基本信息 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb30">基本信息</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">产品名称</view>
						<input type="text" class="flex-grow-1 tr" v-model="name" placeholder="请输入产品名称" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">所属分类</view>
						<picker :range="categoryList" range-key="name" @change="onCategoryChange">
							<view class="flex-grow-1 tr" :class="categoryName ? 'col1' : 'cola'">{{ categoryName || '请选择分类' }}</view>
						</picker>
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">价格(元)</view>
						<input type="digit" class="flex-grow-1 tr" v-model="price" placeholder="请输入价格" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">单位</view>
						<picker :range="unitList" @change="onUnitChange">
							<view class="flex-grow-1 tr" :class="unit ? 'col1' : 'cola'">{{ unit || '请选择单位' }}</view>
						</picker>
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">库存</view>
						<input type="number" class="flex-grow-1 tr" v-model="stock" placeholder="请输入库存" placeholder-class="cola" />
					</view>
					<!-- 保证金比例（已固定为佣金的1%，隐藏设置组件） -->
					<!-- <view class="inp_nav flex-box col1 fs30">
						<view class="col5 label">保证金比例(%)</view>
						<input type="digit" class="flex-grow-1 tr" v-model="depositRate" placeholder="默认10%" placeholder-class="cola" />
					</view> -->
				</view>

					<!-- 佣金比例（已固定为10%，隐藏设置组件） -->
				<!-- <view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">佣金比例</view>
					<view class="fs28 col4 mb20">当前佣金比例: {{ commissionRate }}%</view>
					<slider :value="commissionRate" min="1" max="30" @change="onSliderChange" activeColor="#FE4B01" block-size="20" />
					<view class="flex-box mt10">
						<view class="fs24 col9">1%</view>
						<view class="flex-grow-1"></view>
						<view class="fs24 col9">30%</view>
					</view>
				</view> -->

				<!-- 工艺标准 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">工艺标准</view>
					<textarea class="textarea" v-model="craftStandard" placeholder="请输入工艺标准描述" placeholder-class="cola" maxlength="500" />
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
				productId: '',
				coverImage: '',
				name: '',
				categoryId: '',
				categoryName: '',
				categoryList: [
					{ id: 1, name: '建材' },
					{ id: 2, name: '化工' },
					{ id: 3, name: '机械' },
					{ id: 4, name: '电子' },
					{ id: 5, name: '纺织' }
				],
				price: '',
				unit: '',
				unitList: ['吨', '件', '米', '套', '箱', '个'],
				stock: '',
				commissionRate: 10,
				craftStandard: '',
				depositRate: '1',
				inspectionReportUrl: ''
			}
		},
		onLoad(options) {
			if (options && options.id) {
				this.productId = options.id;
				this.loadProduct();
			}
		},
		methods: {
			loadProduct() {
				this.$core.get({
					url: 'xiluxc.fc_product/detail',
					data: { id: this.productId },
					success: ret => {
						let d = ret.data;
						this.coverImage = d.cover_image || '';
						this.name = d.name || '';
						this.categoryId = d.category_id || '';
						this.categoryName = d.category_name || '';
						this.price = d.price ? String(d.price) : '';
						this.unit = d.unit || '';
						this.stock = d.stock ? String(d.stock) : '';
						this.commissionRate = Number(d.commission_rate) || 10;
						this.craftStandard = d.craft_standard || '';
						this.depositRate = d.deposit_rate ? String(d.deposit_rate) : '1';
						this.inspectionReportUrl = d.inspection_report_url || '';
					}
				});
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
			onCategoryChange(e) {
				let item = this.categoryList[e.detail.value];
				this.categoryId = item.id;
				this.categoryName = item.name;
			},
			onUnitChange(e) {
				this.unit = this.unitList[e.detail.value];
			},
			onSliderChange(e) {
				this.commissionRate = e.detail.value;
			},
			onSubmit() {
				let formData = {
					cover_image: this.coverImage,
					name: this.name,
					category_id: this.categoryId,
					category_name: this.categoryName,
					price: this.price,
					unit: this.unit,
					stock: this.stock,
					craft_standard: this.craftStandard,
					inspection_report_url: this.inspectionReportUrl
				};

				let rule = [
					{ name: 'cover_image', nameChn: '产品封面', rules: ['require'], errorMsg: { require: '请上传产品封面图' } },
					{ name: 'name', nameChn: '产品名称', rules: ['require'], errorMsg: { require: '请输入产品名称' } },
					{ name: 'price', nameChn: '价格', rules: ['require'], errorMsg: { require: '请输入价格' } },
					{ name: 'unit', nameChn: '单位', rules: ['require'], errorMsg: { require: '请选择单位' } },
					{ name: 'stock', nameChn: '库存', rules: ['require'], errorMsg: { require: '请输入库存' } }
				];

				if (!validate.check(formData, rule)) {
					uni.showToast({ title: validate.getError()[0], icon: 'none' });
					return;
				}

				let url = this.productId ? 'xiluxc.fc_product/edit' : 'xiluxc.fc_product/add';
				if (this.productId) formData.id = this.productId;

				this.$core.post({
					url: url,
					data: formData,
					success: ret => {
						uni.showToast({ title: this.productId ? '修改成功' : '发布成功', icon: 'success' });
						setTimeout(() => { uni.navigateBack(); }, 1500);
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
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

		.textarea {
			min-height: 120px;
			font-size: 14px;
		}
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

	.textarea {
		width: 100%;
		min-height: 200rpx;
		font-size: 28rpx;
		padding: 20rpx;
		background: #F5F8FC;
		border-radius: 15rpx;
		box-sizing: border-box;
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
