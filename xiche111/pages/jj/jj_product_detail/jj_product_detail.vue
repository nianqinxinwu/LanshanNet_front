<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot-nav flex-box">
				<view class="btn-contact fs28" @click="onContact">联系厂家</view>
				<view class="btn-order btn5 flex-grow-1 ml20" @click="onTakeOrder">立即接单</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 商品主图 -->
				<view class="box mb30">
					<view class="detail-cover-wrap">
						<image :src="detail.coverImage" mode="aspectFill" class="detail-cover"></image>
					</view>
				</view>

				<!-- 商品基本信息 -->
				<view class="box mb30">
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
					<view class="fs30 fwb" style="color: #FFFFFF;">厂家预估产能佣金</view>
					<view class="commission-amount mt10">¥{{ estimatedCommission }}</view>
					<view class="commission-warn mt10">
						<text class="fs22">以上仅为预估金额，实际佣金以结算为准</text>
					</view>
				</view>

				<!-- 商品详细信息 -->
				<view class="box mb30">
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
				<view class="box mb30">
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
	// Mock 商品详情数据
	const MOCK_DETAIL_MAP = {
		1: { id: 1, name: '高强度螺纹钢 HRB400', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 4280.00, unit: '吨', commission: 3.5, stock: 500, factoryName: '鑫达钢铁有限公司', factoryRate: 96, craftStandard: 'GB/T 1499.2-2018', status: 1 },
		2: { id: 2, name: '聚氯乙烯树脂 SG-5', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 6850.00, unit: '吨', commission: 4.2, stock: 200, factoryName: '华源化工集团', factoryRate: 92, craftStandard: 'GB/T 5761-2006', status: 1 },
		3: { id: 3, name: 'CNC精密加工中心 VMC850', categoryId: 3, categoryName: '机械', coverImage: '/static/images/icon_upload_logo.png', price: 185000.00, unit: '台', commission: 2.0, stock: 15, factoryName: '精锐数控设备厂', factoryRate: 98, craftStandard: 'JB/T 8801.4', status: 1 },
		4: { id: 4, name: '工业级连接器 DB25', categoryId: 4, categoryName: '电子', coverImage: '/static/images/icon_upload_logo.png', price: 12.50, unit: '个', commission: 8.0, stock: 50000, factoryName: '联创电子科技', factoryRate: 94, craftStandard: 'GB/T 11918', status: 1 },
		5: { id: 5, name: '涤纶长丝 DTY 150D/48F', categoryId: 5, categoryName: '纺织', coverImage: '/static/images/icon_upload_logo.png', price: 8900.00, unit: '吨', commission: 3.0, stock: 300, factoryName: '恒通纺织集团', factoryRate: 90, craftStandard: 'FZ/T 54007', status: 1 },
		6: { id: 6, name: '普通硅酸盐水泥 P.O 42.5', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 480.00, unit: '吨', commission: 2.5, stock: 2000, factoryName: '华润水泥有限公司', factoryRate: 97, craftStandard: 'GB 175-2007', status: 1 },
		7: { id: 7, name: '环氧树脂 E-51', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 22000.00, unit: '吨', commission: 5.0, stock: 80, factoryName: '巴陵石化', factoryRate: 95, craftStandard: 'GB/T 13657', status: 1 },
		8: { id: 8, name: '液压油缸 HOB-63/35', categoryId: 3, categoryName: '机械', coverImage: '/static/images/icon_upload_logo.png', price: 1280.00, unit: '台', commission: 6.5, stock: 120, factoryName: '力源液压设备厂', factoryRate: 91, craftStandard: 'GB/T 15622', status: 1 },
		9: { id: 9, name: 'LED工业照明灯 200W', categoryId: 4, categoryName: '电子', coverImage: '/static/images/icon_upload_logo.png', price: 320.00, unit: '套', commission: 7.0, stock: 3000, factoryName: '光盛照明科技', factoryRate: 93, craftStandard: 'GB/T 24908', status: 1 },
		10: { id: 10, name: '全棉坯布 40s×40s', categoryId: 5, categoryName: '纺织', coverImage: '/static/images/icon_upload_logo.png', price: 15.80, unit: '米', commission: 4.0, stock: 100000, factoryName: '鲁泰纺织', factoryRate: 96, craftStandard: 'FZ/T 13001', status: 1 },
		11: { id: 11, name: '镀锌方管 40×40×2.0', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 5200.00, unit: '吨', commission: 3.2, stock: 350, factoryName: '天津钢管集团', factoryRate: 94, craftStandard: 'GB/T 3094', status: 1 },
		12: { id: 12, name: '丙烯酸乳液 BA-35', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 9800.00, unit: '吨', commission: 4.5, stock: 150, factoryName: '万华化学', factoryRate: 97, craftStandard: 'HG/T 4567', status: 1 },
	};

	export default {
		data() {
			return {
				id: '',
				detail: {}
			}
		},
		computed: {
			estimatedCommission() {
				if (!this.detail.price || !this.detail.commission) return '0.00';
				const amount = this.detail.price * this.detail.stock * this.detail.commission / 100;
				return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.fetchDetail();
		},
		methods: {
			fetchDetail() {
				// Mock: 根据 id 获取详情
				const data = MOCK_DETAIL_MAP[this.id];
				if (data) {
					this.detail = data;
				} else {
					uni.showToast({ title: '商品不存在', icon: 'none' });
					setTimeout(() => { uni.navigateBack(); }, 1500);
				}
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
		.page-wrap {
			max-width: 1200px;
			padding: 30px;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

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
