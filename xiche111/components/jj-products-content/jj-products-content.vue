<template>
	<view class="products-content">
		<!-- 搜索框 -->
		<view class="box mb30">
			<view class="search-bar flex-box">
				<image src="/static/icon/icon_search.png" mode="aspectFill" class="search-icon"></image>
				<input type="text" class="flex-grow-1 fs28" v-model="keyword" placeholder="搜索商品名称" placeholder-class="cola" @confirm="onSearch" />
				<view v-if="keyword" class="fs26 col4" @click="onSearch">搜索</view>
			</view>
		</view>

		<!-- 分类Tab -->
		<scroll-view scroll-x="true" class="tab-nav mb30">
			<view class="tab-item" :class="{ active: currentCategory === item.id }" v-for="(item, index) in categoryList"
				:key="index" @click="onCategoryChange(item.id)">{{ item.name }}</view>
		</scroll-view>

		<!-- 排序栏 -->
		<view class="sort-bar flex-box mb30">
			<view class="sort-item flex-box" :class="{ active: sortType === 'default' }" @click="onSortChange('default')">
				<text>综合排序</text>
			</view>
			<view class="sort-item flex-box" :class="{ active: sortType === 'commission_desc' }"
				@click="onSortChange('commission_desc')">
				<text>佣金最高</text>
				<image v-if="sortType === 'commission_desc'" src="/static/icon/icon_foot2_sc.png" mode="aspectFill"
					class="sort-arrow"></image>
			</view>
			<view class="sort-item flex-box" :class="{ active: sortType === 'price_asc' }"
				@click="onSortChange('price_asc')">
				<text>价格最低</text>
			</view>
		</view>

		<!-- 商品列表 -->
		<view class="product-card box mb30" v-for="(item, index) in productList" :key="item.id"
			@click="goDetail(item)">
			<view class="flex-box">
				<image :src="item.coverImage" mode="aspectFill" class="product-cover"></image>
				<view class="flex-grow-1 ml20">
					<view class="fs30 fwb col1 m-ellipsis lh36">{{ item.name }}</view>
					<view class="fs24 col9 mt10">工厂: {{ item.factoryName }}</view>
					<view class="flex-box mt10">
						<view class="commission-tag">佣金 {{ item.commission }}%</view>
						<view class="fs24 col9 ml15">库存: {{ item.stock }}{{ item.unit }}</view>
					</view>
					<view class="flex-box mt15">
						<view class="flex-grow-1">
							<text class="fs24 col4">¥</text>
							<text class="fs34 fwb col4">{{ formatPrice(item.price) }}</text>
							<text class="fs22 col9"> / {{ item.unit }}</text>
						</view>
						<view class="take-btn fs24" @click.stop="goDetail(item)">去接单</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 / 加载更多 -->
		<view class="nothing" v-if="moreButton.nothing">
			<view class="tc ptb40">
				<view class="fs28 col9">暂无商品</view>
			</view>
		</view>
		<view class="g-btn3-wrap" v-else>
			<view class="g-btn3 fs26 col9 tc ptb20" @click="loadProducts">{{ moreButton.text }}</view>
		</view>
	</view>
</template>

<script>
	// Mock 商品数据
	const MOCK_PRODUCTS = [
		{ id: 1, name: '高强度螺纹钢 HRB400', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 4280.00, unit: '吨', commission: 3.5, stock: 500, factoryName: '鑫达钢铁有限公司', factoryRate: 96, craftStandard: 'GB/T 1499.2-2018', status: 1 },
		{ id: 2, name: '聚氯乙烯树脂 SG-5', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 6850.00, unit: '吨', commission: 4.2, stock: 200, factoryName: '华源化工集团', factoryRate: 92, craftStandard: 'GB/T 5761-2006', status: 1 },
		{ id: 3, name: 'CNC精密加工中心 VMC850', categoryId: 3, categoryName: '机械', coverImage: '/static/images/icon_upload_logo.png', price: 185000.00, unit: '台', commission: 2.0, stock: 15, factoryName: '精锐数控设备厂', factoryRate: 98, craftStandard: 'JB/T 8801.4', status: 1 },
		{ id: 4, name: '工业级连接器 DB25', categoryId: 4, categoryName: '电子', coverImage: '/static/images/icon_upload_logo.png', price: 12.50, unit: '个', commission: 8.0, stock: 50000, factoryName: '联创电子科技', factoryRate: 94, craftStandard: 'GB/T 11918', status: 1 },
		{ id: 5, name: '涤纶长丝 DTY 150D/48F', categoryId: 5, categoryName: '纺织', coverImage: '/static/images/icon_upload_logo.png', price: 8900.00, unit: '吨', commission: 3.0, stock: 300, factoryName: '恒通纺织集团', factoryRate: 90, craftStandard: 'FZ/T 54007', status: 1 },
		{ id: 6, name: '普通硅酸盐水泥 P.O 42.5', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 480.00, unit: '吨', commission: 2.5, stock: 2000, factoryName: '华润水泥有限公司', factoryRate: 97, craftStandard: 'GB 175-2007', status: 1 },
		{ id: 7, name: '环氧树脂 E-51', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 22000.00, unit: '吨', commission: 5.0, stock: 80, factoryName: '巴陵石化', factoryRate: 95, craftStandard: 'GB/T 13657', status: 1 },
		{ id: 8, name: '液压油缸 HOB-63/35', categoryId: 3, categoryName: '机械', coverImage: '/static/images/icon_upload_logo.png', price: 1280.00, unit: '台', commission: 6.5, stock: 120, factoryName: '力源液压设备厂', factoryRate: 91, craftStandard: 'GB/T 15622', status: 1 },
		{ id: 9, name: 'LED工业照明灯 200W', categoryId: 4, categoryName: '电子', coverImage: '/static/images/icon_upload_logo.png', price: 320.00, unit: '套', commission: 7.0, stock: 3000, factoryName: '光盛照明科技', factoryRate: 93, craftStandard: 'GB/T 24908', status: 1 },
		{ id: 10, name: '全棉坯布 40s×40s', categoryId: 5, categoryName: '纺织', coverImage: '/static/images/icon_upload_logo.png', price: 15.80, unit: '米', commission: 4.0, stock: 100000, factoryName: '鲁泰纺织', factoryRate: 96, craftStandard: 'FZ/T 13001', status: 1 },
		{ id: 11, name: '镀锌方管 40×40×2.0', categoryId: 1, categoryName: '建材', coverImage: '/static/images/icon_upload_logo.png', price: 5200.00, unit: '吨', commission: 3.2, stock: 350, factoryName: '天津钢管集团', factoryRate: 94, craftStandard: 'GB/T 3094', status: 1 },
		{ id: 12, name: '丙烯酸乳液 BA-35', categoryId: 2, categoryName: '化工', coverImage: '/static/images/icon_upload_logo.png', price: 9800.00, unit: '吨', commission: 4.5, stock: 150, factoryName: '万华化学', factoryRate: 97, craftStandard: 'HG/T 4567', status: 1 },
	];

	export default {
		name: 'jj-products-content',
		data() {
			return {
				keyword: '',
				categoryList: [
					{ id: 0, name: '全部' },
					{ id: 1, name: '建材' },
					{ id: 2, name: '化工' },
					{ id: 3, name: '机械' },
					{ id: 4, name: '电子' },
					{ id: 5, name: '纺织' }
				],
				currentCategory: 0,
				sortType: 'default',
				productList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		mounted() {
			this.loadProducts();
		},
		methods: {
			// 获取筛选后的Mock数据
			getFilteredProducts() {
				let list = [...MOCK_PRODUCTS];

				// 分类筛选
				if (this.currentCategory !== 0) {
					list = list.filter(item => item.categoryId === this.currentCategory);
				}

				// 关键词搜索
				if (this.keyword) {
					const kw = this.keyword.toLowerCase();
					list = list.filter(item =>
						item.name.toLowerCase().includes(kw) ||
						item.factoryName.toLowerCase().includes(kw)
					);
				}

				// 排序
				if (this.sortType === 'commission_desc') {
					list.sort((a, b) => b.commission - a.commission);
				} else if (this.sortType === 'price_asc') {
					list.sort((a, b) => a.price - b.price);
				}

				return list;
			},

			// 模拟分页加载
			loadProducts() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				// 模拟网络延迟
				setTimeout(() => {
					const allFiltered = this.getFilteredProducts();
					const pageSize = 10;
					const start = (this.moreButton.page - 1) * pageSize;
					const pageData = allFiltered.slice(start, start + pageSize);

					if (pageData.length === 0 && this.moreButton.page === 1) {
						this.moreButton.nothing = true;
						this.moreButton.text = '暂无商品';
					} else if (pageData.length < pageSize) {
						this.productList = this.productList.concat(pageData);
						this.moreButton.nomore = true;
						this.moreButton.text = '—— 我是有底线的 ——';
					} else {
						this.productList = this.productList.concat(pageData);
						this.moreButton.page += 1;
						this.moreButton.text = '加载更多';
					}

					this.moreButton.loading = false;
				}, 300);
			},

			// 切换分类
			onCategoryChange(id) {
				if (this.currentCategory === id) return;
				this.currentCategory = id;
				this.resetAndLoad();
			},

			// 切换排序
			onSortChange(type) {
				if (this.sortType === type) return;
				this.sortType = type;
				this.resetAndLoad();
			},

			// 搜索
			onSearch() {
				this.resetAndLoad();
			},

			// 重置列表并重新加载
			resetAndLoad() {
				this.productList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadProducts();
			},

			// 跳转详情
			goDetail(product) {
				uni.navigateTo({
					url: '/pages/jj/jj_product_detail/jj_product_detail?id=' + product.id
				});
			},

			// 价格格式化
			formatPrice(price) {
				return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.search-bar {
		background: #F5F7FB;
		border-radius: 40rpx;
		padding: 0 30rpx;
		height: 72rpx;
	}

	.search-icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 15rpx;
		opacity: 0.5;
	}

	.tab-nav {
		white-space: nowrap;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 0 10rpx;

		.tab-item {
			display: inline-block;
			vertical-align: top;
			line-height: 80rpx;
			height: 80rpx;
			padding: 0 30rpx;
			font-size: 28rpx;
			color: #666666;
			position: relative;

			&.active {
				font-weight: bold;
				color: #FE4B01;
			}

			&.active::after {
				content: '';
				width: 30rpx;
				height: 6rpx;
				background: #FE4B01;
				border-radius: 3rpx;
				position: absolute;
				bottom: 6rpx;
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}

	.sort-bar {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 0 20rpx;

		.sort-item {
			flex: 1;
			justify-content: center;
			height: 72rpx;
			font-size: 26rpx;
			color: #666666;

			&.active {
				color: #FE4B01;
				font-weight: bold;
			}
		}
	}

	.sort-arrow {
		width: 20rpx;
		height: 20rpx;
		margin-left: 6rpx;
	}

	.product-card {
		cursor: pointer;
	}

	.product-cover {
		width: 180rpx;
		height: 180rpx;
		border-radius: 15rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	.commission-tag {
		background: rgba(254, 75, 1, 0.1);
		color: #FE4B01;
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
	}

	.take-btn {
		background: #FE4B01;
		color: #FFFFFF;
		padding: 10rpx 30rpx;
		border-radius: 30rpx;
	}

	.nothing {
		padding: 60rpx 0;
	}

	@media screen and (min-width: 768px) {
		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.search-bar {
			height: 44px;
			padding: 0 20px;
			border-radius: 22px;
		}

		.tab-nav {
			border-radius: 12px;
			margin-bottom: 20px;

			.tab-item {
				height: 48px;
				line-height: 48px;
				padding: 0 24px;
				font-size: 15px;
				cursor: pointer;

				&:hover {
					color: #FE4B01;
				}
			}
		}

		.sort-bar {
			border-radius: 12px;
			margin-bottom: 20px;
			padding: 0 16px;

			.sort-item {
				height: 44px;
				font-size: 14px;
				cursor: pointer;

				&:hover {
					color: #FE4B01;
				}
			}
		}

		.product-card {
			margin-bottom: 20px;
			transition: box-shadow 0.2s;

			&:hover {
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
			}
		}

		.product-cover {
			width: 120px;
			height: 120px;
			border-radius: 8px;
		}

		.take-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}
	}
</style>
