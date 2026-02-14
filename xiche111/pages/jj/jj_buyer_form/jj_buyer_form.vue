<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" @click="onSubmit()">提交接单</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 商品摘要 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">商品信息 <text v-if="isBatch" class="fs24 col9">({{ batchItems.length }}件商品)</text></view>

					<!-- 单商品模式 -->
					<view v-if="!isBatch" class="flex-box">
						<image :src="productInfo.coverImage" mode="aspectFill" class="product-thumb"></image>
						<view class="flex-grow-1 ml20">
							<view class="fs28 fwb col1 m-ellipsis">{{ productInfo.name }}</view>
							<view class="mt10">
								<text class="fs24 col4">¥</text>
								<text class="fs30 fwb col4">{{ formatPrice(productInfo.price) }}</text>
								<text class="fs22 col9"> / {{ productInfo.unit }}</text>
							</view>
							<view class="flex-box mt10">
								<view class="commission-tag">佣金 {{ productInfo.commission }}%</view>
								<view class="fs22 col5 ml15" v-if="quantity > 1">x{{ quantity }}</view>
							</view>
						</view>
					</view>

					<!-- 多商品模式 -->
					<view v-if="isBatch">
						<view class="batch-item flex-box" :class="{ bb: idx < batchItems.length - 1 }" v-for="(item, idx) in batchItems" :key="idx">
							<view class="flex-grow-1">
								<view class="fs26 fwb col1 m-ellipsis">{{ item.name }}</view>
								<view class="fs22 col9 mt5">¥{{ formatPrice(item.price) }} / {{ item.unit }} x{{ item.quantity }}</view>
							</view>
							<view class="fs26 fwb col4 ml15">¥{{ formatPrice(item.price * item.quantity) }}</view>
						</view>
					</view>
				</view>

				<!-- 买家信息区域（暂时注释，后期需要时取消注释）
				<view class="jj-box mb30">
					<view class="flex-box mb20">
						<view class="fs34 fwb col1 lh36 flex-grow-1">买家信息</view>
						<view class="select-buyer-btn fs24" @click="openBuyerPopup">{{ selectedBuyer ? '重新选择' : '选择买家' }}</view>
					</view>
					<view v-if="!selectedBuyer" class="empty-buyer" @click="openBuyerPopup">
						<view class="fs28 col9 tc">点击选择已保存的买家信息</view>
					</view>
					<view v-else class="buyer-info-card">
						<view class="fs30 fwb col1">{{ companyName }}</view>
						<view class="fs26 col5 mt10">{{ contactName }}　{{ contactPhone }}</view>
						<view class="fs24 col9 mt8 m-ellipsis-2">{{ address }}</view>
						<view v-if="creditCode" class="fs22 col9 mt8">信用代码: {{ creditCode }}</view>
						<view v-if="taxNumber" class="fs22 col9 mt5">税务登记证号: {{ taxNumber }}</view>
					</view>
				</view>
			-->

				<!-- 协议勾选区域 -->
				<view class="flex-box flex-center fs26 col6 mb30 flex-wrap">
					<image @click="isAgree = !isAgree" :src="'/static/icon/'+(isAgree ? 'choose_sc' : 'choose_uc')+'.png'" mode="aspectFill" class="agree-ico mr10"></image>
					<view>我已阅读并同意</view>
					<view class="col4" @click="openAgreement('order_agreement')">《接单服务协议》</view>
				</view>
			</view>
		</view>

		<!-- 买家选择弹框（暂时注释，后期需要时取消注释）
		<view v-if="showBuyerPopup" class="popup-mask" @click.self="showBuyerPopup = false">
			<view class="popup-content">
				<view class="popup-header flex-box">
					<view class="fs34 fwb col1 flex-grow-1">{{ showAddForm ? '新增买家信息' : '选择买家' }}</view>
					<view class="fs28 col9" @click="showAddForm ? (showAddForm = false) : (showBuyerPopup = false)">{{ showAddForm ? '返回' : '关闭' }}</view>
				</view>
				<view v-if="!showAddForm" class="popup-body">
					<view v-if="buyerList.length === 0" class="fs28 col9 tc ptb30">暂无保存的买家信息</view>
					<view v-for="(item, idx) in buyerList" :key="item.id"
						class="buyer-select-item flex-box"
						:class="{ 'bb': idx < buyerList.length - 1, 'selected': selectedBuyer && selectedBuyer.id === item.id }"
						@click="onSelectBuyer(item)">
						<view class="flex-grow-1">
							<view class="fs28 fwb col1">{{ item.company_name }}</view>
							<view class="fs24 col5 mt8">{{ item.contact_name }}　{{ item.contact_phone }}</view>
							<view class="fs22 col9 mt5 m-ellipsis">{{ item.address }}</view>
						</view>
						<view v-if="selectedBuyer && selectedBuyer.id === item.id" class="check-mark">✓</view>
					</view>
					<view class="add-new-btn" @click="showAddForm = true">
						<view class="fs28 col4 tc">+ 新增买家信息</view>
					</view>
				</view>
				<view v-if="showAddForm" class="popup-body">
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">企业名称</view>
						<input type="text" class="flex-grow-1 tr" v-model="newBuyer.companyName" placeholder="请输入企业名称" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">收货地址</view>
						<input type="text" class="flex-grow-1 tr" v-model="newBuyer.address" placeholder="请输入收货地址" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">联系人</view>
						<input type="text" class="flex-grow-1 tr" v-model="newBuyer.contactName" placeholder="请输入联系人姓名" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">联系电话</view>
						<input type="number" maxlength="11" class="flex-grow-1 tr" v-model="newBuyer.contactPhone" placeholder="请输入联系电话" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">信用代码</view>
						<input type="text" maxlength="18" class="flex-grow-1 tr" v-model="newBuyer.creditCode" placeholder="请输入统一社会信用代码" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30">
						<view class="col5 label">税务登记证号</view>
						<input type="text" class="flex-grow-1 tr" v-model="newBuyer.taxNumber" placeholder="请输入税务登记证号" placeholder-class="cola" />
					</view>
					<view class="popup-footer">
						<view class="btn5" @click="onSaveNewBuyer">保存并选择</view>
					</view>
				</view>
			</view>
		</view>
		-->
	</view>
</template>

<script>
	// var validate = require("../../../xilu/validate.js"); // 买家验证暂时注释

	export default {
		data() {
			return {
				productId: '',
				quantity: 1,
				cartId: 0,
				isBatch: false,
				batchItems: [],
				productInfo: {},
				// 买家信息字段（暂时注释，后期需要时取消注释）
				// companyName: '',
				// address: '',
				// contactName: '',
				// contactPhone: '',
				// creditCode: '',
				// taxNumber: '',
				isAgree: false,
				// selectedBuyer: null,
				// buyerList: [],
				// showBuyerPopup: false,
				// showAddForm: false,
				// newBuyer: {
				// 	companyName: '',
				// 	address: '',
				// 	contactName: '',
				// 	contactPhone: '',
				// 	creditCode: '',
				// 	taxNumber: ''
				// }
			}
		},
		onLoad(options) {
			if (options.cartData) {
				try {
					let cartData = JSON.parse(decodeURIComponent(options.cartData));
					this.isBatch = true;
					this.batchItems = cartData;
				} catch (e) {
					console.log('cartData parse error', e);
				}
			} else {
				this.productId = options.productId;
				this.quantity = parseInt(options.quantity) || 1;
				this.cartId = parseInt(options.cartId) || 0;
				this.loadProductInfo();
			}
			// this.loadBuyerList(); // 买家信息暂时注释
		},
		methods: {
			loadProductInfo() {
				this.$core.get({
					url: 'xiluxc.jj_product/detail',
					data: { id: this.productId },
					loading: false,
					success: ret => {
						if (ret.data) {
							this.productInfo = {
								id: ret.data.id,
								name: ret.data.name,
								coverImage: ret.data.cover_image || '/static/images/icon_upload_logo.png',
								price: Number(ret.data.price) || 0,
								unit: ret.data.unit,
								commission: Number(ret.data.commission_rate) || 0
							};
						}
					},
					fail: () => { return false; }
				});
			},
			/* 买家相关方法（暂时注释，后期需要时取消注释）
			loadBuyerList() {
				this.$core.get({
					url: 'xiluxc.jj_buyer_info/index',
					loading: false,
					success: ret => {
						this.buyerList = ret.data || [];
					},
					fail: () => { return false; }
				});
			},
			openBuyerPopup() {
				this.showAddForm = false;
				this.showBuyerPopup = true;
				this.loadBuyerList();
			},
			onSelectBuyer(item) {
				this.selectedBuyer = item;
				this.companyName = item.company_name;
				this.address = item.address;
				this.contactName = item.contact_name;
				this.contactPhone = item.contact_phone;
				this.creditCode = item.credit_code || '';
				this.taxNumber = item.tax_number || '';
				this.showBuyerPopup = false;
			},
			resetNewBuyer() {
				this.newBuyer = {
					companyName: '',
					address: '',
					contactName: '',
					contactPhone: '',
					creditCode: '',
					taxNumber: ''
				};
			},
			onSaveNewBuyer() {
				let b = this.newBuyer;
				if (!b.companyName || !b.address || !b.contactName || !b.contactPhone) {
					uni.showToast({ title: '请填写必要信息', icon: 'none' });
					return;
				}
				this.$core.post({
					url: 'xiluxc.jj_buyer_info/add',
					data: {
						company_name: b.companyName,
						address: b.address,
						contact_name: b.contactName,
						contact_phone: b.contactPhone,
						credit_code: b.creditCode,
						tax_number: b.taxNumber
					},
					success: ret => {
						uni.showToast({ title: '保存成功', icon: 'success' });
						let savedBuyer = ret.data;
						this.resetNewBuyer();
						this.showAddForm = false;
						this.loadBuyerList();
						if (savedBuyer && savedBuyer.id) {
							this.onSelectBuyer(savedBuyer);
						}
					},
					fail: () => { return false; }
				});
			},
			*/
			onSubmit() {
				if (!this.isAgree) {
					uni.showToast({ title: '请同意接单服务协议', icon: 'none' });
					return;
				}

				/* 买家信息验证（暂时注释，后期需要时取消注释）
				let buyerData = {
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

				if (!validate.check(buyerData, rule)) {
					uni.showToast({ title: validate.getError()[0], icon: 'none' });
					return;
				}
				*/

				if (this.isBatch) {
					let items = this.batchItems.map(i => ({
						productId: i.productId,
						quantity: i.quantity,
						cartId: i.cartId || 0
					}));
					this.$core.post({
						url: 'xiluxc.jj_order/batch_submit',
						data: { items: JSON.stringify(items) },
						success: ret => {
							this.goBatchDeposit(ret.data);
						},
						fail: () => { return false; }
					});
				} else {
					let formData = {
						productId: this.productId,
						quantity: this.quantity,
						cart_id: this.cartId
					};
					this.$core.post({
						url: 'xiluxc.jj_order/submit',
						data: formData,
						success: ret => {
							this.goDeposit(ret.data);
						},
						fail: () => { return false; }
					});
				}
			},
			goDeposit(orderData) {
				let param = encodeURIComponent(JSON.stringify({
					productName: this.productInfo.name,
					coverImage: this.productInfo.coverImage,
					companyName: '', // 买家信息暂时注释
					commission: this.productInfo.commission,
					commissionAmount: orderData.commission_amount || 0,
					depositRate: orderData.deposit_rate || 0,
					contractUploadHours: orderData.contract_upload_hours || 0,
					executionHours: orderData.execution_hours || 72
				}));
				uni.redirectTo({
					url: '/pages/jj/jj_deposit/jj_deposit?orderId=' + orderData.order_id + '&param=' + param
				});
			},
			goBatchDeposit(batchData) {
				uni.redirectTo({
					url: '/pages/jj/jj_deposit/jj_deposit?batchId=' + batchData.batch_id
				});
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
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

	.batch-item {
		padding: 20rpx 0;
	}

	/* 买家相关样式（暂时注释，后期需要时取消注释）
	.select-buyer-btn {
		color: #FE4B01;
		border: 1px solid #FE4B01;
		padding: 8rpx 24rpx;
		border-radius: 30rpx;
	}

	.empty-buyer {
		padding: 40rpx 0;
		border: 2rpx dashed #D9D9D9;
		border-radius: 12rpx;
	}

	.buyer-info-card {
		background: #F9FAFB;
		border-radius: 12rpx;
		padding: 24rpx;
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
	*/

	.agree-ico {
		width: 38rpx;
		height: 38rpx;
		border-radius: 50%;
	}

	.foot_nav {
		padding: 10rpx 30rpx;
	}

	/* 弹框样式（暂时注释，后期需要时取消注释）
	.popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: flex-end;
	}

	.popup-content {
		width: 100%;
		background: #FFFFFF;
		border-radius: 30rpx 30rpx 0 0;
		max-height: 80vh;
		overflow-y: auto;
	}

	.popup-header {
		padding: 30rpx;
		border-bottom: 1px solid #F0F0F0;
		position: sticky;
		top: 0;
		background: #FFFFFF;
		z-index: 1;
		border-radius: 30rpx 30rpx 0 0;
	}

	.popup-body {
		padding: 0 30rpx;
	}

	.popup-footer {
		padding: 20rpx 0 40rpx;
	}

	.buyer-select-item {
		padding: 24rpx 0;
	}

	.buyer-select-item.selected {
		background: rgba(254, 75, 1, 0.04);
		margin: 0 -30rpx;
		padding: 24rpx 30rpx;
	}

	.check-mark {
		color: #FE4B01;
		font-size: 40rpx;
		font-weight: bold;
		flex-shrink: 0;
		margin-left: 20rpx;
	}

	.add-new-btn {
		padding: 30rpx 0;
		border-top: 1px solid #F0F0F0;
	}
	*/

	/* PC端适配 */
	@media screen and (min-width: 768px) {
		/* 买家相关PC适配（暂时注释，后期需要时取消注释）
		.inp_nav {
			height: auto;
			padding: 14px 0;
		}
		*/

		.foot_nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}

		.agree-ico {
			cursor: pointer;
		}

		/* 买家相关PC适配（暂时注释，后期需要时取消注释）
		.select-buyer-btn {
			cursor: pointer;

			&:hover {
				background: rgba(254, 75, 1, 0.05);
			}
		}

		.empty-buyer {
			cursor: pointer;

			&:hover {
				border-color: #FE4B01;
			}
		}

		.buyer-select-item {
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}

		.add-new-btn {
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}

		.popup-content {
			max-width: 600px;
			margin: 0 auto;
			border-radius: 12px 12px 0 0;
		}
		*/
	}

	@supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
		.container {
			padding-bottom: calc(130rpx + 68rpx);
			padding-bottom: calc(constant(safe-area-inset-bottom) + 130rpx);
			padding-bottom: calc(env(safe-area-inset-bottom) + 130rpx);
		}
	}
</style>
