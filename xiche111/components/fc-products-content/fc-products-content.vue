<template>
	<view class="products-content">
		<!-- 搜索栏 + 新增按钮 -->
		<view class="box mb30">
			<view class="flex-box">
				<view class="search-bar flex-box flex-grow-1">
					<image src="/static/icon/icon_search.png" mode="aspectFill" class="search-icon"></image>
					<input type="text" class="flex-grow-1 fs28" v-model="keyword" placeholder="搜索产品名称" placeholder-class="cola" @confirm="onSearch" />
					<view v-if="keyword" class="fs26 col4" @click="onSearch">搜索</view>
				</view>
				<view class="add-btn fs26 ml20" @click="goAdd">发布新产品</view>
			</view>
		</view>

		<!-- 状态Tab -->
		<scroll-view scroll-x="true" class="tab-nav mb30">
			<view class="tab-item" :class="{ active: currentTab === item.value }" v-for="(item, index) in tabList"
				:key="index" @click="onTabChange(item.value)">{{ item.label }}</view>
		</scroll-view>

		<!-- 产品列表 -->
		<view class="product-card box mb30" v-for="(item, index) in productList" :key="item.id">
			<view class="flex-box">
				<image :src="item.coverImage" mode="aspectFill" class="product-cover"></image>
				<view class="flex-grow-1 ml20">
					<view class="fs30 fwb col1 m-ellipsis lh36">{{ item.name }}</view>
					<view class="flex-box mt10">
						<view class="commission-tag">佣金 {{ item.commissionRate }}%</view>
						<view class="fs24 col9 ml15">库存: {{ item.stock }}{{ item.unit }}</view>
					</view>
					<view class="flex-box mt10">
						<view class="flex-grow-1">
							<text class="fs24 col4">¥</text>
							<text class="fs34 fwb col4">{{ item.price }}</text>
							<text class="fs22 col9"> / {{ item.unit }}</text>
						</view>
						<view class="status-tag fs22" :class="'tag-' + item.status">{{ getStatusText(item.status) }}</view>
					</view>
					<view v-if="item.onshelfTime" class="fs22 col9 mt8">上架时间: {{ item.onshelfTime }}</view>
				</view>
			</view>
			<view class="flex-box mt20 flex-end">
				<view class="outline-btn fs24 mr15" @click="goEdit(item)">编辑</view>
				<view class="action-btn fs24" v-if="item.status === 1" @click="toggleShelf(item, 0)">下架</view>
				<view class="action-btn fs24" v-else-if="item.status === 0" @click="toggleShelf(item, 1)">上架</view>
			</view>
		</view>

		<!-- 空状态 / 加载更多 -->
		<view class="nothing" v-if="moreButton.nothing">
			<view class="tc ptb40">
				<view class="fs28 col9">暂无产品</view>
			</view>
		</view>
		<view class="g-btn3-wrap" v-else>
			<view class="g-btn3 fs26 col9 tc ptb20" @click="loadProducts">{{ moreButton.text }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'fc-products-content',
		data() {
			return {
				tabList: [
					{ label: '全部', value: 'all' },
					{ label: '上架中', value: 1 },
					{ label: '已下架', value: 0 }
				],
				currentTab: 'all',
				keyword: '',
				productList: [],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		mounted() {
			this.loadProducts();
		},
		methods: {
			getStatusText(status) {
				const map = { 0: '下架', 1: '上架' };
				return map[status] || '未知';
			},
			loadProducts() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				this.$core.get({
					url: 'xiluxc.fc_product/index',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						status: this.currentTab === 'all' ? '' : this.currentTab,
						keyword: this.keyword
					},
					loading: false,
					success: ret => {
						let listData = ret.data.list || {};
						let rawList = listData.data || [];
						let list = rawList.map(item => ({
							id: item.id,
							name: item.name,
							coverImage: item.cover_image || '/static/images/icon_upload_logo.png',
							price: item.price || '0.00',
							unit: item.unit || '件',
							commissionRate: Number(item.commission_rate) || 0,
							stock: item.stock || 0,
							status: item.status !== undefined ? item.status : 0,
							onshelfTime: item.onshelf_time ? this.formatTime(item.onshelf_time) : ''
						}));
						if (list.length === 0 && this.moreButton.page === 1) {
							this.moreButton.nothing = true;
							this.moreButton.text = '暂无产品';
						} else if (this.moreButton.page >= (listData.last_page || 1)) {
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
					fail: () => {
						this.moreButton.loading = false;
						this.moreButton.text = '加载失败，点击重试';
						return false;
					}
				});
			},
			onTabChange(value) {
				if (this.currentTab === value) return;
				this.currentTab = value;
				this.resetAndLoad();
			},
			resetAndLoad() {
				this.productList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadProducts();
			},
			onSearch() {
				this.resetAndLoad();
			},
			goAdd() {
				uni.navigateTo({ url: '/pages/fc/fc_product_edit/fc_product_edit' });
			},
			goEdit(item) {
				uni.navigateTo({ url: '/pages/fc/fc_product_edit/fc_product_edit?id=' + item.id });
			},
			toggleShelf(item, status) {
				let url = status === 1 ? 'xiluxc.fc_product/on_shelf' : 'xiluxc.fc_product/off_shelf';
				this.$core.post({
					url: url,
					data: { id: item.id },
					success: ret => {
						uni.showToast({ title: status === 1 ? '已上架' : '已下架', icon: 'success' });
						this.resetAndLoad();
					}
				});
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			},
			formatTime(ts) {
				if (!ts) return '';
				let d = new Date(ts * 1000);
				let y = d.getFullYear();
				let m = String(d.getMonth() + 1).padStart(2, '0');
				let day = String(d.getDate()).padStart(2, '0');
				let h = String(d.getHours()).padStart(2, '0');
				let min = String(d.getMinutes()).padStart(2, '0');
				return y + '-' + m + '-' + day + ' ' + h + ':' + min;
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

	.add-btn {
		background: #FE4B01;
		color: #FFFFFF;
		padding: 0 30rpx;
		height: 72rpx;
		line-height: 72rpx;
		border-radius: 40rpx;
		white-space: nowrap;
		cursor: pointer;
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

	.status-tag {
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
	}

	.tag-1 {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.tag-0 {
		background: rgba(0, 0, 0, 0.04);
		color: #999999;
	}

	.tag-2 {
		background: rgba(24, 144, 255, 0.1);
		color: #1890FF;
	}

	.flex-end {
		justify-content: flex-end;
	}

	.action-btn {
		background: #FE4B01;
		color: #FFFFFF;
		padding: 12rpx 36rpx;
		border-radius: 30rpx;
	}

	.outline-btn {
		border: 1px solid #DDDDDD;
		color: #666666;
		padding: 12rpx 36rpx;
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

		.add-btn {
			height: 44px;
			line-height: 44px;
			padding: 0 24px;
			border-radius: 22px;
			font-size: 14px;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
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

		.action-btn,
		.outline-btn {
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}
	}
</style>
