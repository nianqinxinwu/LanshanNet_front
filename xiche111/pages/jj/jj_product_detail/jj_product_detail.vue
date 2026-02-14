<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot-nav flex-box">
				<view class="btn-contact fs28" @click="onContact">联系厂家</view>
				<view class="btn-cart fs28" @click="onAddToCart">加入清单</view>
				<view class="btn-order btn5 fs28" @click="onCheckout">立即结算</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 商品主图 -->
				<view class="jj-box mb30">
					<view class="detail-cover-wrap">
						<image :src="detail.coverImage" mode="aspectFill" class="detail-cover"></image>
					</view>
				</view>

				<!-- 商品基本信息 -->
				<view class="jj-box mb30">
					<view class="fs36 fwb col1 lh40">{{ detail.name }}</view>
					<view class="price-row mt15">
						<text class="fs28 col4">¥</text>
						<text class="fs42 fwb col4">{{ formatPrice(detail.price) }}</text>
						<text class="fs26 col9"> / {{ detail.unit }}</text>
					</view>
					<view class="flex-box mt15">
						<view class="commission-tag">佣金比例 {{ detail.commission }}%</view>
						<view class="fs24 col9 ml20">库存: {{ detail.stock }}{{ detail.unit }}</view>
					</view>
				</view>

				<!-- 产能佣金展示区 -->
				<view class="commission-card mb30">
					<view class="fs30 fwb" style="color: #FFFFFF;">厂家预估产能佣金(单位:元)</view>
					<view class="commission-amount mt10">¥{{ estimatedCommission }}</view>
					<view class="commission-warn mt10">
						<text class="fs22">以上仅为预估金额，实际佣金以结算为准</text>
					</view>
				</view>

				<!-- 商品详细信息 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">商品信息</view>
					<view class="info-row bb">
						<view class="col5 fs28">品类</view>
						<view class="col1 fs28">{{ detail.categoryName }}</view>
					</view>
					<view class="info-row bb">
						<view class="col5 fs28">工艺标准</view>
						<view class="col1 fs28">{{ detail.craftStandard }}</view>
					</view>
					<view class="info-row bb">
						<view class="col5 fs28">库存</view>
						<view class="col1 fs28">{{ detail.stock }} {{ detail.unit }}</view>
					</view>
					<view class="info-row">
						<view class="col5 fs28">检测报告</view>
						<view class="col4 fs28" @click="onViewReport">查看</view>
					</view>
				</view>

				<!-- 工厂信息 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">工厂信息</view>
					<view class="info-row bb">
						<view class="col5 fs28">企业名称</view>
						<view class="col1 fs28">{{ detail.factoryName }}</view>
					</view>
					<view class="info-row">
						<view class="col5 fs28">历史履约率</view>
						<view class="fs28" :class="detail.factoryRate >= 90 ? 'col2' : 'col10'">{{ detail.factoryRate }}%</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 明细弹框 -->
		<view v-if="showDetailPopup" class="popup-mask" @click.self="showDetailPopup = false">
			<view class="popup-content">
				<view class="popup-header flex-box">
					<view class="fs34 fwb col1 flex-grow-1">明细</view>
					<view class="fs28 col9" @click="showDetailPopup = false">关闭</view>
				</view>
				<view class="popup-body">
					<!-- 商品摘要 -->
					<view class="flex-box popup-product-row bb">
						<image :src="detail.coverImage" mode="aspectFill" class="popup-thumb"></image>
						<view class="flex-grow-1 ml20">
							<view class="fs28 fwb col1 m-ellipsis">{{ detail.name }}</view>
							<view class="mt10">
								<text class="fs24 col4">¥</text>
								<text class="fs30 fwb col4">{{ formatPrice(detail.price) }}</text>
								<text class="fs22 col9"> / {{ detail.unit }}</text>
							</view>
						</view>
					</view>

					<!-- 数量选择 -->
					<view class="quantity-row flex-box bb">
						<view class="fs28 col5">购买数量</view>
						<view class="flex-grow-1"></view>
						<view class="quantity-ctrl flex-box">
							<view class="qty-btn qty-minus" :class="{ disabled: popupQuantity <= 1 }" @click="onQuantityChange(-1)">-</view>
							<input type="number" class="qty-input" v-model="popupQuantity" @blur="onQuantityBlur" />
							<view class="qty-btn qty-plus" :class="{ disabled: popupQuantity >= detail.stock }" @click="onQuantityChange(1)">+</view>
						</view>
					</view>

					<!-- 金额明细 -->
					<view class="detail-row flex-box bb">
						<view class="col5 fs28">合同金额</view>
						<view class="flex-grow-1 tr fs28 col1">¥{{ formatMoney(popupContractAmount) }}</view>
					</view>
					<view class="detail-row flex-box bb">
						<view class="col5 fs28">佣金</view>
						<view class="flex-grow-1 tr fs28 col1">¥{{ formatMoney(popupCommission) }}</view>
					</view>
					<view class="detail-row flex-box">
						<view class="col5 fs28 fwb">履约保证金</view>
						<view class="flex-grow-1 tr">
							<text class="fs24 col4">¥</text>
							<text class="fs34 fwb col4">{{ formatMoney(popupDeposit) }}</text>
						</view>
					</view>

					<!-- 确认按钮 -->
					<view class="popup-footer">
						<view class="btn5" @click="onConfirmPopup">{{ popupAction === 'cart' ? '确认加入清单' : '立即结算' }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				detail: {},
				showDetailPopup: false,
				popupAction: 'cart',
				popupQuantity: 1,
				depositRate: 1
			}
		},
		computed: {
			estimatedCommission() {
				if (this.detail.estimatedCommission !== undefined) {
					return Number(this.detail.estimatedCommission).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				}
				return '0.00';
			},
			popupContractAmount() {
				return (this.detail.price || 0) * (this.popupQuantity || 0);
			},
			popupCommission() {
				return this.popupContractAmount * (this.detail.commission || 0) / 100;
			},
			popupDeposit() {
				return this.popupCommission * (this.depositRate || 1) / 100;
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.fetchDetail();
		},
		methods: {
			mapProduct(item) {
				return {
					id: item.id,
					name: item.name,
					categoryId: item.category_id || item.categoryId,
					categoryName: item.category_name || item.categoryName,
					coverImage: item.cover_image || item.coverImage || '/static/images/icon_upload_logo.png',
					price: Number(item.price) || 0,
					unit: item.unit,
					commission: Number(item.commission_rate || item.commission) || 0,
					stock: item.stock,
					factoryName: (item.factory && item.factory.company_name) || item.factoryName || '',
					factoryRate: (item.factory && Number(item.factory.fulfill_rate)) || item.factoryRate || 0,
					craftStandard: item.craft_standard || item.craftStandard || '',
					status: item.status,
					estimatedCommission: Number(item.estimated_commission) || 0
				};
			},
			fetchDetail() {
				this.$core.get({
					url: 'xiluxc.jj_product/detail',
					data: { id: this.id },
					loading: true,
					success: ret => {
						if (ret.data && ret.data.id) {
							this.detail = this.mapProduct(ret.data);
							this.depositRate = Number(ret.data.deposit_rate) || 10;
						} else {
							uni.showToast({ title: '商品不存在', icon: 'none' });
							setTimeout(() => { uni.navigateBack(); }, 1500);
						}
					},
					fail: () => {
						uni.showToast({ title: '加载失败', icon: 'none' });
						setTimeout(() => { uni.navigateBack(); }, 1500);
						return false;
					}
				});
			},
			onContact() {
				uni.showToast({ title: '功能开发中', icon: 'none' });
			},
			onAddToCart() {
				this.popupAction = 'cart';
				this.popupQuantity = 1;
				this.showDetailPopup = true;
			},
			onCheckout() {
				this.popupAction = 'checkout';
				this.popupQuantity = 1;
				this.showDetailPopup = true;
			},
			onQuantityChange(delta) {
				let newQty = Number(this.popupQuantity) + delta;
				if (newQty < 1) newQty = 1;
				if (this.detail.stock && newQty > this.detail.stock) newQty = this.detail.stock;
				this.popupQuantity = newQty;
			},
			onQuantityBlur() {
				let qty = parseInt(this.popupQuantity);
				if (isNaN(qty) || qty < 1) qty = 1;
				if (this.detail.stock && qty > this.detail.stock) qty = this.detail.stock;
				this.popupQuantity = qty;
			},
			onConfirmPopup() {
				if (this.popupAction === 'cart') {
					this.$core.post({
						url: 'xiluxc.jj_cart/add',
						data: {
							product_id: this.id,
							quantity: this.popupQuantity
						},
						success: ret => {
							uni.showToast({ title: '已加入清单', icon: 'success' });
							this.showDetailPopup = false;
						},
						fail: () => { return false; }
					});
				} else {
					this.showDetailPopup = false;
					uni.navigateTo({
						url: '/pages/jj/jj_buyer_form/jj_buyer_form?productId=' + this.id + '&quantity=' + this.popupQuantity
					});
				}
			},
			onViewReport() {
				uni.showToast({ title: '暂无检测报告', icon: 'none' });
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			},
			formatMoney(n) {
				if (!n && n !== 0) return '0.00';
				return Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.detail-cover-wrap {
		width: 100%;
		border-radius: 15rpx;
		overflow: hidden;
	}

	.detail-cover {
		width: 100%;
		height: 400rpx;
		display: block;
		background: #F5F7FB;
	}

	.commission-tag {
		background: rgba(254, 75, 1, 0.1);
		color: #FE4B01;
		font-size: 24rpx;
		padding: 6rpx 20rpx;
		border-radius: 8rpx;
	}

	.commission-card {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.commission-amount {
		font-size: 48rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.commission-warn {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 8rpx;
		padding: 12rpx 20rpx;
		color: rgba(255, 255, 255, 0.9);
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
	}

	.foot-nav {
		padding: 10rpx 30rpx;
		gap: 16rpx;
	}

	.btn-contact {
		flex: 1;
		border: 1px solid #FE4B01;
		color: #FE4B01;
		height: 80rpx;
		line-height: calc(80rpx - 2px);
		text-align: center;
		border-radius: 40rpx;
	}

	.btn-cart {
		flex: 1;
		border: 1px solid #FE4B01;
		color: #FE4B01;
		background: rgba(254, 75, 1, 0.06);
		height: 80rpx;
		line-height: calc(80rpx - 2px);
		text-align: center;
		border-radius: 40rpx;
	}

	.btn-order {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		font-size: 30rpx;
		font-weight: bold;
		border-radius: 40rpx;
	}

	/* 弹框样式 */
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

	.popup-product-row {
		padding: 24rpx 0;
	}

	.popup-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	/* 数量控件 */
	.quantity-row {
		padding: 30rpx 0;
	}

	.quantity-ctrl {
		align-items: center;
	}

	.qty-btn {
		width: 70rpx;
		height: 70rpx;
		line-height: 70rpx;
		text-align: center;
		font-size: 38rpx;
		font-weight: bold;
		color: #FFFFFF;
		background: #FE4B01;
		border-radius: 14rpx;
		user-select: none;

		&.disabled {
			background: #D9D9D9;
			color: #FFFFFF;
		}
	}

	.qty-input {
		width: 120rpx;
		height: 70rpx;
		text-align: center;
		font-size: 34rpx;
		font-weight: bold;
		color: #333333;
		border: 2rpx solid #E0E0E0;
		border-radius: 10rpx;
		margin: 0 16rpx;
	}

	.detail-row {
		padding: 24rpx 0;
	}

	/* PC端适配 */
	@media screen and (min-width: 768px) {
		.detail-cover {
			height: 400px;
			border-radius: 8px;
		}

		.commission-card {
			border-radius: 12px;
			padding: 24px;
			margin-bottom: 20px;
		}

		.info-row {
			padding: 16px 0;
		}

		.foot-nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}

		.btn-contact,
		.btn-cart,
		.btn-order {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}

		.popup-content {
			max-width: 600px;
			margin: 0 auto;
			border-radius: 12px 12px 0 0;
		}

		.detail-row {
			padding: 16px 0;
		}

		.qty-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover:not(.disabled) {
				opacity: 0.85;
			}
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
