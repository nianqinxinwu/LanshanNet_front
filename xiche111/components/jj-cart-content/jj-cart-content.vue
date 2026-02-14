<template>
	<view class="cart-content">
		<!-- 底部结算栏 -->
		<view class="page-foot bg-white" v-if="cartList.length > 0">
			<view class="foot-summary">
				<view class="flex-box">
					<view class="fs22 col9">合同金额:</view>
					<view class="fs22 fwb col1 ml8">¥{{ formatMoney(totalContract) }}</view>
					<view class="fs22 col9 ml20">佣金:</view>
					<view class="fs22 fwb col2 ml8">¥{{ formatMoney(totalCommission) }}</view>
					<view class="fs22 col9 ml20">保证金:</view>
					<view class="fs22 fwb col4 ml8">¥{{ formatMoney(totalDeposit) }}</view>
				</view>
			</view>
			<view class="foot-nav flex-box">
				<view class="flex-box" @click="toggleSelectAll">
					<image :src="'/static/icon/' + (isAllSelected ? 'choose_sc' : 'choose_uc') + '.png'" mode="aspectFill" class="check-ico mr10"></image>
					<view class="fs28 col5">全选</view>
				</view>
				<view class="flex-grow-1 tr mr20">
					<view class="fs24 col9">已选 {{ selectedCount }} 件</view>
				</view>
				<view class="btn5 settle-btn" :class="{ disabled: selectedCount === 0 }" @click="onSettle">去结算({{ selectedCount }})</view>
			</view>
		</view>

		<!-- 顶部操作栏 -->
		<view class="flex-box mb20" v-if="cartList.length > 0">
			<view class="fs30 fwb col1 flex-grow-1">共{{ cartList.length }}件商品</view>
			<view class="fs26 col9" @click="onClearAll">清空清单</view>
		</view>

		<!-- 空状态 -->
		<view v-if="loaded && cartList.length === 0" class="empty-wrap">
			<view class="fs30 col9 tc">清单为空</view>
			<view class="fs26 col9 tc mt10">去商品池逛逛吧</view>
			<view class="browse-btn mt30" @click="goProducts">去逛逛</view>
		</view>

		<!-- 商品列表 -->
		<view class="cart-item jj-box mb20" v-for="(item, idx) in cartList" :key="item.cart_id" :class="{ unavailable: !item.available }">
			<view class="flex-box">
				<!-- 勾选 -->
				<view class="check-wrap" @click="toggleSelect(idx)">
					<image :src="'/static/icon/' + (item.selected ? 'choose_sc' : 'choose_uc') + '.png'" mode="aspectFill" class="check-ico"></image>
				</view>

				<!-- 商品图片 -->
				<image :src="item.cover_image || '/static/images/icon_upload_logo.png'" mode="aspectFill" class="cart-thumb ml15"></image>

				<!-- 商品信息 -->
				<view class="flex-grow-1 ml20">
					<view class="fs28 fwb col1 m-ellipsis">{{ item.name }}</view>
					<view class="fs24 col9 mt6">{{ item.factory_name }}</view>
					<view class="mt6">
						<text class="fs24 col4">¥</text>
						<text class="fs28 fwb col4">{{ formatMoney(item.price) }}</text>
						<text class="fs22 col9"> / {{ item.unit }}</text>
					</view>
					<view v-if="!item.available" class="fs22 col10 mt6">商品已下架</view>
				</view>

				<!-- 删除 -->
				<view class="del-btn fs24" @click="onRemove(item, idx)">删除</view>
			</view>

			<!-- 数量控件 -->
			<view class="flex-box mt20" v-if="item.available">
				<view class="flex-grow-1"></view>
				<view class="quantity-ctrl flex-box">
					<view class="qty-btn" :class="{ disabled: item.quantity <= 1 }" @click="onQtyChange(idx, -1)">-</view>
					<input type="number" class="qty-input" :value="item.quantity" @blur="onQtyBlur(idx, $event)" />
					<view class="qty-btn" :class="{ disabled: item.quantity >= item.stock }" @click="onQtyChange(idx, 1)">+</view>
				</view>
			</view>

			<!-- 金额明细 -->
			<view class="amount-detail mt15" v-if="item.available">
				<view class="flex-box">
					<view class="fs22 col9">合同金额:</view>
					<view class="fs22 col1 ml10">¥{{ formatMoney(item.contract_amount) }}</view>
					<view class="fs22 col9 ml20">佣金:</view>
					<view class="fs22 col1 ml10">¥{{ formatMoney(item.commission) }}</view>
					<view class="fs22 col9 ml20">保证金:</view>
					<view class="fs22 col4 ml10">¥{{ formatMoney(item.deposit) }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'jj-cart-content',
		data() {
			return {
				cartList: [],
				loaded: false
			}
		},
		computed: {
			isAllSelected() {
				if (this.cartList.length === 0) return false;
				let available = this.cartList.filter(i => i.available);
				return available.length > 0 && available.every(i => i.selected);
			},
			selectedCount() {
				return this.cartList.filter(i => i.selected && i.available).length;
			},
			totalContract() {
				let total = 0;
				this.cartList.forEach(i => {
					if (i.selected && i.available) {
						total += Number(i.contract_amount) || 0;
					}
				});
				return total;
			},
			totalCommission() {
				let total = 0;
				this.cartList.forEach(i => {
					if (i.selected && i.available) {
						total += Number(i.commission) || 0;
					}
				});
				return total;
			},
			totalDeposit() {
				let total = 0;
				this.cartList.forEach(i => {
					if (i.selected && i.available) {
						total += Number(i.deposit) || 0;
					}
				});
				return total;
			}
		},
		mounted() {
			this.loadCart();
		},
		methods: {
			goProducts() {
				this.$emit('switchTab', 'products');
			},
			loadCart() {
				this.$core.get({
					url: 'xiluxc.jj_cart/lists',
					loading: !this.loaded,
					success: ret => {
						let list = ret.data.list || [];
						list.forEach(item => {
							item.selected = item.available;
							// 计算合同金额、佣金、保证金
							let price = Number(item.price) || 0;
							let quantity = Number(item.quantity) || 0;
							let commissionRate = Number(item.commission_rate) || 0;
							let depositRate = Number(item.deposit_rate) || 1;
							if (!item.contract_amount) {
								item.contract_amount = (price * quantity).toFixed(2);
							}
							if (!item.commission) {
								item.commission = (Number(item.contract_amount) * commissionRate / 100).toFixed(2);
							}
							if (!item.deposit) {
								item.deposit = (Number(item.commission) * depositRate / 100).toFixed(2);
							}
						});
						this.cartList = list;
						this.loaded = true;
					},
					fail: () => {
						this.loaded = true;
						return false;
					}
				});
			},
			toggleSelect(idx) {
				let item = this.cartList[idx];
				if (!item.available) return;
				this.$set(this.cartList[idx], 'selected', !item.selected);
			},
			toggleSelectAll() {
				let allSelected = this.isAllSelected;
				this.cartList.forEach((item, idx) => {
					if (item.available) {
						this.$set(this.cartList[idx], 'selected', !allSelected);
					}
				});
			},
			onQtyChange(idx, delta) {
				let item = this.cartList[idx];
				let newQty = item.quantity + delta;
				if (newQty < 1) newQty = 1;
				if (newQty > item.stock) newQty = item.stock;
				this.updateQuantity(idx, newQty);
			},
			onQtyBlur(idx, e) {
				let item = this.cartList[idx];
				let qty = parseInt(e.detail.value);
				if (isNaN(qty) || qty < 1) qty = 1;
				if (qty > item.stock) qty = item.stock;
				this.updateQuantity(idx, qty);
			},
			updateQuantity(idx, quantity) {
				let item = this.cartList[idx];
				if (item.quantity === quantity) return;

				this.$core.post({
					url: 'xiluxc.jj_cart/update',
					data: { cart_id: item.cart_id, quantity: quantity },
					loading: false,
					success: () => {
						let price = Number(item.price) || 0;
						let commissionRate = Number(item.commission_rate) || 0;
						let depositRate = Number(item.deposit_rate) || 1;
						let contractAmount = (price * quantity).toFixed(2);
						let commission = (Number(contractAmount) * commissionRate / 100).toFixed(2);
						let deposit = (Number(commission) * depositRate / 100).toFixed(2);

						this.$set(this.cartList[idx], 'quantity', quantity);
						this.$set(this.cartList[idx], 'contract_amount', contractAmount);
						this.$set(this.cartList[idx], 'commission', commission);
						this.$set(this.cartList[idx], 'deposit', deposit);
					},
					fail: () => { return false; }
				});
			},
			onRemove(item, idx) {
				uni.showModal({
					title: '提示',
					content: '确定删除该商品？',
					success: (res) => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.jj_cart/remove',
								data: { cart_id: item.cart_id },
								success: () => {
									this.cartList.splice(idx, 1);
									uni.showToast({ title: '已删除', icon: 'success' });
								},
								fail: () => { return false; }
							});
						}
					}
				});
			},
			onClearAll() {
				uni.showModal({
					title: '提示',
					content: '确定清空所有商品？',
					success: (res) => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.jj_cart/clear',
								success: () => {
									this.cartList = [];
									uni.showToast({ title: '已清空', icon: 'success' });
								},
								fail: () => { return false; }
							});
						}
					}
				});
			},
			onSettle() {
				let selected = this.cartList.filter(i => i.selected && i.available);
				if (selected.length === 0) {
					uni.showToast({ title: '请选择商品', icon: 'none' });
					return;
				}

				if (selected.length === 1) {
					// 单商品结算：直接提交订单
					let item = selected[0];
					this.$core.post({
						url: 'xiluxc.jj_order/submit',
						data: {
							productId: item.product_id,
							quantity: item.quantity,
							cart_id: item.cart_id || 0
						},
						success: ret => {
							let orderData = ret.data;
							let param = encodeURIComponent(JSON.stringify({
								productName: item.name,
								coverImage: item.cover_image || '/static/images/icon_upload_logo.png',
								companyName: '',
								commission: Number(item.commission_rate) || 0,
								commissionAmount: orderData.commission_amount || 0,
								depositRate: orderData.deposit_rate || 0,
								contractUploadHours: orderData.contract_upload_hours || 0,
								executionHours: orderData.execution_hours || 72
							}));
							uni.navigateTo({
								url: '/pages/jj/jj_deposit/jj_deposit?orderId=' + orderData.order_id + '&param=' + param
							});
						}
					});
				} else {
					// 多商品结算：批量提交订单
					let items = selected.map(i => ({
						productId: i.product_id,
						quantity: i.quantity,
						cartId: i.cart_id || 0
					}));
					this.$core.post({
						url: 'xiluxc.jj_order/batch_submit',
						data: { items: items },
						success: ret => {
							uni.navigateTo({
								url: '/pages/jj/jj_deposit/jj_deposit?batchId=' + ret.data.batch_id
							});
						}
					});
				}
			},
			formatMoney(n) {
				if (!n && n !== 0) return '0.00';
				return Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.empty-wrap {
		padding: 120rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.browse-btn {
		background: #FE4B01;
		color: #FFFFFF;
		font-size: 28rpx;
		padding: 16rpx 60rpx;
		border-radius: 40rpx;
	}

	.check-wrap {
		padding: 10rpx;
	}

	.check-ico {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
	}

	.cart-thumb {
		width: 140rpx;
		height: 140rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	.cart-item.unavailable {
		opacity: 0.5;
	}

	.del-btn {
		color: #FF4D4F;
		padding: 8rpx 16rpx;
		flex-shrink: 0;
	}

	/* 数量控件 */
	.quantity-ctrl {
		align-items: center;
	}

	.qty-btn {
		width: 64rpx;
		height: 64rpx;
		line-height: 64rpx;
		text-align: center;
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
		background: #FE4B01;
		border-radius: 12rpx;
		user-select: none;

		&.disabled {
			background: #D9D9D9;
		}
	}

	.qty-input {
		width: 100rpx;
		height: 64rpx;
		text-align: center;
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
		border: 2rpx solid #E0E0E0;
		border-radius: 8rpx;
		margin: 0 12rpx;
	}

	.amount-detail {
		background: #F9FAFB;
		border-radius: 10rpx;
		padding: 16rpx 20rpx;
	}

	/* 底部结算栏 */
	.foot-summary {
		padding: 12rpx 30rpx;
		border-bottom: 1px solid #F0F0F0;
	}

	.foot-nav {
		padding: 10rpx 30rpx;
		align-items: center;
	}

	.settle-btn {
		padding: 0 40rpx;
		height: 76rpx;
		line-height: 76rpx;
		font-size: 28rpx;
		border-radius: 38rpx;

		&.disabled {
			opacity: 0.5;
		}
	}

	@media screen and (min-width: 768px) {
		.page-foot {
			left: 220px;
		}

		.foot-summary {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
		}

		.foot-nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}

		.cart-thumb {
			width: 80px;
			height: 80px;
			border-radius: 8px;
		}

		.qty-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover:not(.disabled) {
				opacity: 0.85;
			}
		}

		.del-btn {
			cursor: pointer;

			&:hover {
				opacity: 0.7;
			}
		}

		.check-wrap {
			cursor: pointer;
		}

		.settle-btn {
			cursor: pointer;

			&:hover:not(.disabled) {
				opacity: 0.85;
			}
		}

		.browse-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}
	}
</style>
