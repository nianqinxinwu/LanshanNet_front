<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" @click="onSubmit()">提交接单</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 商品摘要 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">商品信息</view>
					<view class="flex-box">
						<image :src="productInfo.coverImage" mode="aspectFill" class="product-thumb"></image>
						<view class="flex-grow-1 ml20">
							<view class="fs28 fwb col1 m-ellipsis">{{ productInfo.name }}</view>
							<view class="mt10">
								<text class="fs24 col4">¥</text>
								<text class="fs30 fwb col4">{{ formatPrice(productInfo.price) }}</text>
								<text class="fs22 col9"> / {{ productInfo.unit }}</text>
							</view>
							<view class="commission-tag mt10">佣金 {{ productInfo.commission }}%</view>
						</view>
					</view>
				</view>

				<!-- 买家信息表单 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb30">买家信息</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">企业名称</view>
						<input type="text" class="flex-grow-1 tr" v-model="companyName" placeholder="请输入企业名称" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">收货地址</view>
						<input type="text" class="flex-grow-1 tr" v-model="address" placeholder="请输入收货地址" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">联系人</view>
						<input type="text" class="flex-grow-1 tr" v-model="contactName" placeholder="请输入联系人姓名" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">联系电话</view>
						<input type="number" maxlength="11" class="flex-grow-1 tr" v-model="contactPhone" placeholder="请输入联系电话" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">信用代码</view>
						<input type="text" maxlength="18" class="flex-grow-1 tr" v-model="creditCode" placeholder="请输入统一社会信用代码" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30">
						<view class="col5 label">税务登记证号</view>
						<input type="text" class="flex-grow-1 tr" v-model="taxNumber" placeholder="请输入税务登记证号" placeholder-class="cola" />
					</view>
				</view>

				<!-- 协议勾选区域 -->
				<view class="flex-box flex-center fs26 col6 mb30 flex-wrap">
					<image @click="isAgree = !isAgree" :src="'/static/icon/'+(isAgree ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="agree-ico mr10"></image>
					<view>我已阅读并同意</view>
					<view class="col4" @click="openAgreement">《接单服务协议》</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	var validate = require("../../../xilu/validate.js");

	// Mock 商品数据（与详情页共享）
	const MOCK_PRODUCT_MAP = {
		1: { id: 1, name: '高强度螺纹钢 HRB400', coverImage: '/static/images/icon_upload_logo.png', price: 4280.00, unit: '吨', commission: 3.5 },
		2: { id: 2, name: '聚氯乙烯树脂 SG-5', coverImage: '/static/images/icon_upload_logo.png', price: 6850.00, unit: '吨', commission: 4.2 },
		3: { id: 3, name: 'CNC精密加工中心 VMC850', coverImage: '/static/images/icon_upload_logo.png', price: 185000.00, unit: '台', commission: 2.0 },
		4: { id: 4, name: '工业级连接器 DB25', coverImage: '/static/images/icon_upload_logo.png', price: 12.50, unit: '个', commission: 8.0 },
		5: { id: 5, name: '涤纶长丝 DTY 150D/48F', coverImage: '/static/images/icon_upload_logo.png', price: 8900.00, unit: '吨', commission: 3.0 },
		6: { id: 6, name: '普通硅酸盐水泥 P.O 42.5', coverImage: '/static/images/icon_upload_logo.png', price: 480.00, unit: '吨', commission: 2.5 },
		7: { id: 7, name: '环氧树脂 E-51', coverImage: '/static/images/icon_upload_logo.png', price: 22000.00, unit: '吨', commission: 5.0 },
		8: { id: 8, name: '液压油缸 HOB-63/35', coverImage: '/static/images/icon_upload_logo.png', price: 1280.00, unit: '台', commission: 6.5 },
		9: { id: 9, name: 'LED工业照明灯 200W', coverImage: '/static/images/icon_upload_logo.png', price: 320.00, unit: '套', commission: 7.0 },
		10: { id: 10, name: '全棉坯布 40s×40s', coverImage: '/static/images/icon_upload_logo.png', price: 15.80, unit: '米', commission: 4.0 },
		11: { id: 11, name: '镀锌方管 40×40×2.0', coverImage: '/static/images/icon_upload_logo.png', price: 5200.00, unit: '吨', commission: 3.2 },
		12: { id: 12, name: '丙烯酸乳液 BA-35', coverImage: '/static/images/icon_upload_logo.png', price: 9800.00, unit: '吨', commission: 4.5 },
	};

	export default {
		data() {
			return {
				productId: '',
				productInfo: {},
				companyName: '',
				address: '',
				contactName: '',
				contactPhone: '',
				creditCode: '',
				taxNumber: '',
				isAgree: false
			}
		},
		onLoad(options) {
			this.productId = options.productId;
			this.loadProductInfo();
		},
		methods: {
			loadProductInfo() {
				const info = MOCK_PRODUCT_MAP[this.productId];
				if (info) {
					this.productInfo = info;
				}
			},
			openAgreement() {
				let id = getApp().globalData.config['order_agreement'] || 0;
				uni.navigateTo({
					url: '/pages/rich_mp/rich_mp?id=' + id
				});
			},
			onSubmit() {
				if (!this.isAgree) {
					uni.showToast({ title: '请同意接单服务协议', icon: 'none' });
					return;
				}

				let formData = {
					productId: this.productId,
					companyName: this.companyName,
					address: this.address,
					contactName: this.contactName,
					contactPhone: this.contactPhone,
					creditCode: this.creditCode,
					taxNumber: this.taxNumber
				};

				let rule = [
					{ name: 'companyName', nameChn: '企业名称', rules: ['require'], errorMsg: { require: '请输入企业名称' } },
					{ name: 'address', nameChn: '收货地址', rules: ['require'], errorMsg: { require: '请输入收货地址' } },
					{ name: 'contactName', nameChn: '联系人', rules: ['require'], errorMsg: { require: '请输入联系人姓名' } },
					{ name: 'contactPhone', nameChn: '联系电话', rules: ['require', 'mobile'], errorMsg: { require: '请输入联系电话', mobile: '请输入正确的手机号' } },
					{ name: 'creditCode', nameChn: '信用代码', rules: ['require'], errorMsg: { require: '请输入统一社会信用代码' } }
				];

				if (!validate.check(formData, rule)) {
					uni.showToast({ title: validate.getError()[0], icon: 'none' });
					return;
				}

				this.$core.post({
					url: 'xiluxc.jj_order/submit',
					data: formData,
					success: ret => {
						let orderData = ret.data;
						this.goDeposit(orderData);
					},
					fail: () => {
						// 接口未就绪，使用 Mock 数据走通流程
						let mockOrder = {
							order_id: 'mock_' + Date.now(),
							order_sn: 'JJ' + Date.now(),
							commission_amount: this.productInfo.price * this.productInfo.commission / 100,
							deposit_rate: 10,
							contract_upload_hours: 24,
							execution_hours: 72
						};
						this.goDeposit(mockOrder);
						return false;
					}
				});
			},
			goDeposit(orderData) {
				let param = encodeURIComponent(JSON.stringify({
					productName: this.productInfo.name,
					coverImage: this.productInfo.coverImage,
					companyName: this.companyName,
					commission: this.productInfo.commission,
					commissionAmount: orderData.commission_amount || 0,
					depositRate: orderData.deposit_rate || 0,
					contractUploadHours: orderData.contract_upload_hours || 24,
					executionHours: orderData.execution_hours || 72
				}));
				uni.redirectTo({
					url: '/pages/jj/jj_deposit/jj_deposit?orderId=' + orderData.order_id + '&param=' + param
				});
			},
			formatPrice(price) {
				if (!price) return '0.00';
				return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

	.product-thumb {
		width: 140rpx;
		height: 140rpx;
		border-radius: 15rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	.commission-tag {
		display: inline-block;
		background: rgba(254, 75, 1, 0.1);
		color: #FE4B01;
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
	}

	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;

		.label {
			width: 200rpx;
			flex-shrink: 0;
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

		.inp_nav {
			height: auto;
			padding: 14px 0;
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
	}

	@supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
		.container {
			padding-bottom: calc(130rpx + 68rpx);
			padding-bottom: calc(constant(safe-area-inset-bottom) + 130rpx);
			padding-bottom: calc(env(safe-area-inset-bottom) + 130rpx);
		}
	}
</style>
