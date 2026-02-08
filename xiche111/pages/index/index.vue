<template>
	<view>
		<view class="container">
			<!-- 替换背景图为轮播图 -->
			<swiper class="top_img" :autoplay="true" :interval="3000" :duration="500" circular indicator-dots indicator-color="rgba(255,255,255,0.3)" indicator-active-color="#FF8C00">
				<swiper-item v-for="(item, index) in bannerList" :key="index">
					<image :src="item" mode="aspectFill" class="swiper-img"></image>
				</swiper-item>
			</swiper>
			
			<view class="page-head">
				<hx-navbar ref="hxnb" :config="config">
					<template slot="max" class="flex-box w100">
						<view @click="chooseAddress" class="nav-location">
							<image src="@/static/icon/location.png" mode="aspectFill" class="location-icon"></image>
							<text class="pl30 fs34 fwb col1">{{currentCity?(currentCity.pois?currentCity.pois.name:currentCity.name):"定位中"}}</text>
							<image src="@/static/icon/icon__address_arrow.png" mode="aspectFill" class="top_arrow">
							</image>
						</view>
						<image @click="search()" src="@/static/icon/icon_search.png" mode="aspectFill" class="search">
						</image>
					</template>
				</hx-navbar>
			</view>

			<view class="header-nav">
				<view class="nav-grid">
					<view class="nav-item" @click="onNavClick('scan')">
						<view class="icon-wrapper" style="background: linear-gradient(135deg, #52c41a, #73d13d);">
							<image src="../../static/icon/home2.png" class="nav-icon"></image>
						</view>
						<text class="nav-text">扫码洗车</text>
					</view>

					<view class="nav-item" @click="onNavClick('groupon')">
						<view class="icon-wrapper" style="background: linear-gradient(135deg, #40a9ff, #69c0ff);">
							<image src="../../static/icon/home1.png" class="nav-icon"></image>
						</view>
						<text class="nav-text">团购核销</text>
					</view>

					<view class="nav-item" @click="onNavClick('appointment')">
						<view class="icon-wrapper" style="background: linear-gradient(135deg, #ff7875, #ffa39e);">
							<image src="../../static/icon/home4.png" class="nav-icon"></image>
						</view>
						<text class="nav-text">预约排队</text>
					</view>

					<view class="nav-item" @click="onNavClick('join')">
						<view class="icon-wrapper" style="background: linear-gradient(135deg, #ff8c00, #ffa940);">
							<image src="../../static/icon/home3.png" class="nav-icon"></image>
						</view>
						<text class="nav-text">店铺入驻</text>
					</view>
				</view>
			</view>
			
			<view class="store-section">
				<view class="section-header">
					<view class="section-title">
						<view class="title-line"></view>
						<text class="title-text">门店列表</text>
					</view>
					<navigator url="/pages/stores_list/stores_list" class="more-link" hover-class="none">
						<text class="more-text">查看更多</text>
						<image src="@/static/icon/arrow_right.png" mode="aspectFill" class="arrow-icon"></image>
					</navigator>
				</view>
				<store-list :shop-list="shopList" :type="1"></store-list>
			</view>
		</view>
	</view>
</template>

<script>
	const app = getApp();
	import htzRate from '@/components/htz-rate/htz-rate.vue';
	import storeList from '../../components/store-list/store-list.vue';
	export default {
		components: {
			htzRate,
			storeList
		},
		data() {
			return {
				config: {
					color: '#101010',
					back: false,
					maxSlot: true,
					//背景颜色;参数一：透明度（0-1）;参数二：背景颜色（array则为线性渐变，string为单色背景）
					backgroundColor: [0, ['#FFFFFF', '#FFFFFF']],
					slideBackgroundColor: [1, ['#FFFFFF', '#FFFFFF']],
				},
				// 轮播图数据
				bannerList: [
					'https://xiche.zzlanshan.site/uploads/lunbo1.png',
					'https://xiche.zzlanshan.site/uploads/lunbo2.png'
				],
				currentCity: null,
				navigationList: [],
				shopList: [],
				newsList: [],
				newsMore: {
					page: 1
				},
				list1: [], // 瀑布流第一列数据
				list2: [], // 瀑布流第二列数据
				leftGap: 15,
				rightGap: 15,
				columnGap: 10,

				userCar: null
			}
		},
		onLoad() {
			let page = this;
			if (this.$core.getUserinfo()) {
				this.getUserCar();
			}
			this.$core.getLocation();
			uni.$on(app.globalData.Event.CurrentCityChange, function(currentCity) {
				page.currentCity = currentCity;
				page.refreshPage();
			})

			uni.$on("user_update", function() {
				page.getUserCar();
			})
		},
		computed: {
			imageStyle(item) {
				return item => {
					const v = uni.upx2px(750) - this.leftGap - this.rightGap - this.columnGap;
					const w = v / 2;
					const rate = w / item.w;
					const h = rate * item.h;
					return {
						width: w + 'px',
						height: h + 'px'
					}
				}
			}
		},
		onReachBottom() {
			this.fetchNews()
		},
		onPullDownRefresh() {
			this.getUserCar();
			this.refreshPage();
		},
		onShareAppMessage() {

		},
		onShareTimeline() {

		},
		onUnload() {
			uni.$off(app.globalData.Event.CurrentCityChange, this);
		},
		onPageScroll(e) {
			// 重点，用到滑动切换必须加上
			this.$refs.hxnb.pageScroll(e);
		},
		methods: {
			search() {
				uni.navigateTo({
					url: '/pages/search/search'
				})
			},
			onAddCar() {
				if (!this.$core.getUserinfo(true)) {
					return;
				}
				uni.navigateTo({
					url: '/pages/add_car/add_car',
					events: {
						setCarSuccess: data => {
							this.getUserCar();
						}
					}
				})
			},
			onChangeCar() {
				if (!this.$core.getUserinfo(true)) {
					return;
				}
				uni.navigateTo({
					url: '/pages/switch_my_car/switch_my_car',
					events: {
						setCarSuccess: data => {
							this.getUserCar();
						}
					}
				})
			},
			getUserCar() {
				this.$core.post({
					url: 'xiluxc.user_car/mycar',
					data: {},
					loading: false,
					success: ret => {
						this.userCar = ret.data;
					},
					fail: err => {
						console.log(err);
					}
				});
			},
			refreshPage() {
				//金刚区
				this.$core.get({
					url: 'xiluxc.common/navication',
					data: {},
					loading: false,
					success: (ret) => {
						this.navigationList = ret.data;
					}
				})
				//附近门店
				let currentCity = this.currentCity;
				let lat = currentCity.pois ? currentCity.pois.latitude : app.globalData.location.latitude;
				let lng = currentCity.pois ? currentCity.pois.longitude : app.globalData.location.longitude
				this.$core.get({
					url: 'xiluxc.shop',
					data: {
						lat: lat,
						lng: lng,
						pagesize: 2,
						sort: "distance",
						order: 'asc'
					},
					loading: false,
					success: (ret) => {
						this.shopList = ret.data.data;
					}
				})
				//文章
				this.fetchNews();
				uni.stopPullDownRefresh();
			},
			//金刚区
			navigation(item) {
				if (item.type == '1') {
					if (item.jump_type == 'switchtab') {
						uni.switchTab({
							url: item.url
						})
					} else {

						uni.navigateTo({
							url: item.url
						})
					}
				} else if (item.type == '2') {
					location.href = item.url;
				} else if (item.type == '3') {
					uni.navigateToMiniProgram({
						appId: item.mini_appid,
						path: item.url
					})
				}
			},
			fetchNews() {
				this.$util.fetch(this, 'xiluxc.news', {
					pagesize: 10
				}, 'newsMore', 'newsList', 'data', data => {

				})
			},
			onNewsDetail(id) {
				uni.navigateTo({
					url: '/pages/car_knowledge_info/car_knowledge_info?id=' + id
				})
			},
			chooseAddress() {
				let page = this;
				let currentCity = this.currentCity;
				uni.chooseLocation({
					latitude: currentCity ? currentCity.pois.latitude : app.globalData.location.latitude,
					longitude: currentCity.pois ? currentCity.pois.longitude : app.globalData.location.longitude,
					success(res) {
						page.$core.getCityByLat(res.latitude, res.longitude)
						// currentCity.pois = res;
						// page.$core.setCurrentCity(currentCity);
					},
					fail(res) {
						console.log(res)
					}
				})
			},
			changeList(e) {
				this[e.name].push(e.value);
			},
			// 快捷入口点击
			onNavClick(selectType) {
				// 这里可以根据type跳转到不同页面
				const routes = {
					'scan': '/pages/scan/scan',
					'groupon': '/pages/groupon/groupon',
					'appointment': '/pages/suggestions/suggestions',
					'join': '/pages/business_entry/business_entry'
				}
				
				
				
				if (routes[selectType]) {
					uni.navigateTo({
						url: routes[selectType]
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		background: #f8f9fa;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	/* 轮播图区域 */
	.top_img {
		height: 420rpx;
		position: relative;
		width: 100%;
		z-index: 1;
		
		.swiper-img {
			width: 100%;
			height: 100%;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 80rpx;
			background: linear-gradient(to bottom, transparent, #f8f9fa);
			z-index: 2;
		}
	}

	/* 导航栏 */
	.page-head {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		padding-top: 80rpx;
		
		::v-deep .hx-navbar {
			background: transparent !important;
		}
	}

	.nav-location {
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(20rpx);
		border-radius: 30rpx;
		padding: 12rpx 24rpx;
	}

	.location-icon {
		width: 28rpx;
		height: 28rpx;
	}

	.pl30 {
		padding-left: 16rpx !important;
	}

	.fs34 {
		font-size: 28rpx !important;
	}

	.fwb {
		font-weight: 600 !important;
	}

	.col1 {
		color: white !important;
	}

	.top_arrow {
		width: 16rpx;
		height: 16rpx;
		margin-left: 8rpx;
	}

	.search {
		width: 36rpx;
		height: 36rpx;
		margin-left: auto;
		margin-right: 30rpx;
	}

	/* 快捷入口 */
	.header-nav {
		margin: -40rpx 30rpx 30rpx;
		background: white;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
		position: relative;
		z-index: 3;
		
		.nav-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 20rpx;
		}
		
		.nav-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.icon-wrapper {
				width: 100rpx;
				height: 100rpx;
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 20rpx;
				box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
				transition: all 0.3s ease;
				
				&:active {
					transform: translateY(-4rpx);
					box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.2);
				}
			}
			
			.nav-icon {
				width: 50rpx;
				height: 50rpx;
				filter: brightness(0) invert(1);
			}
			
			.nav-text {
				font-size: 24rpx;
				color: #333;
				font-weight: 500;
				text-align: center;
				line-height: 1.4;
			}
		}
	}

	/* 门店列表区域 */
	.store-section {
		margin: 0 30rpx;
		position: relative;
		z-index: 2;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		padding: 20rpx 0;
	}

	.section-title {
		display: flex;
		align-items: center;
	}

	.title-line {
		width: 8rpx;
		height: 36rpx;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 4rpx;
		margin-right: 16rpx;
	}

	.title-text {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
	}

	.more-link {
		display: flex;
		align-items: center;
	}

	.more-text {
		font-size: 26rpx;
		color: #666;
	}

	.arrow-icon {
		width: 24rpx;
		height: 24rpx;
		margin-left: 8rpx;
	}

	/* 其他原有样式保持 */
	.w100 {
		width: 100%;
		min-width: 100%;
	}

	.flex-box {
		display: flex;
		align-items: center;
	}

	.mt50 {
		margin-top: 50rpx !important;
	}

	.plr30 {
		padding-left: 30rpx;
		padding-right: 30rpx;
	}

	.flex-grow-1 {
		flex-grow: 1;
	}

	.col89 {
		color: #898989 !important;
	}

	.fs24 {
		font-size: 24rpx !important;
	}

	/* 动画效果 */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.header-nav, .store-section {
		animation: fadeInUp 0.5s ease-out;
	}
</style>