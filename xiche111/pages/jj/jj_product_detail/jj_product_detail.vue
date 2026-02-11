<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot-nav flex-box">
				<view class="btn-contact fs28" @click="onContact">联系厂家</view>
				<view class="btn-order btn5 flex-grow-1 ml20" @click="onTakeOrder">立即接单</view>
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
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				detail: {}
			}
		},
		computed: {
			estimatedCommission() {
				if (this.detail.estimatedCommission !== undefined) {
					return Number(this.detail.estimatedCommission).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				}
				return '0.00';
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
			onTakeOrder() {
				uni.navigateTo({
					url: '/pages/jj/jj_buyer_form/jj_buyer_form?productId=' + this.id
				});
			},
			onViewReport() {
				uni.showToast({ title: '暂无检测报告', icon: 'none' });
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
	}

	.btn-contact {
		border: 1px solid #FE4B01;
		color: #FE4B01;
		height: 80rpx;
		line-height: calc(80rpx - 2px);
		text-align: center;
		border-radius: 40rpx;
		padding: 0 40rpx;
	}

	.btn-order {
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		font-size: 30rpx;
		font-weight: bold;
		border-radius: 40rpx;
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

		.btn-contact {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}

		.btn-order {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
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
