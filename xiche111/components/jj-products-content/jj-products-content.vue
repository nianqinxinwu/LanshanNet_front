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
					status: item.status
				};
			},

			// 加载商品列表
			loadProducts() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				this.$core.get({
					url: 'xiluxc.jj_product/index',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						category_id: this.currentCategory || '',
						keyword: this.keyword || ''
					},
					loading: false,
					success: ret => {
						let rawList = ret.data.data || ret.data.list || ret.data || [];
						let list = Array.isArray(rawList) ? rawList.map(item => this.mapProduct(item)) : [];
						// 本地排序（后端暂不支持排序参数）
						if (this.sortType === 'commission_desc') {
							list.sort((a, b) => b.commission - a.commission);
						} else if (this.sortType === 'price_asc') {
							list.sort((a, b) => a.price - b.price);
						}
						this.handleListData(list);
					},
					fail: () => {
						this.moreButton.loading = false;
						this.moreButton.text = '加载失败，点击重试';
						return false;
					}
				});
			},

			handleListData(list) {
				if (list.length === 0 && this.moreButton.page === 1) {
					this.moreButton.nothing = true;
					this.moreButton.text = '暂无商品';
				} else if (list.length < 10) {
					this.productList = this.productList.concat(list);
					this.moreButton.nomore = true;
					this.moreButton.text = '—— 我是有底线的 ——';
				} else {
					this.productList = this.productList.concat(list);
					this.moreButton.page += 1;
					this.moreButton.text = '加载更多';
				}
				this.moreButton.loading = false;
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
