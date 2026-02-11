<template>
	<view>
		<!-- #ifdef H5 -->
		<pc-sidebar v-if="isPC" active="home" :menu-list="pcMenuList" />
		<!-- #endif -->

		<view class="container bg-f5" :class="{ 'pc-layout': isPC }">
			<view class="page-wrap p30">
				<!-- 用户信息 -->
				<view class="box mb30">
					<view class="flex-box">
						<image class="avatar" :src="userAvatar" mode="aspectFill"></image>
						<view class="ml20 flex-grow-1">
							<view class="fs34 fwb col1">居间人昵称</view>
							<view class="fs24 col9 mt10">信誉评分: 85分</view>
						</view>
					</view>
				</view>

				<!-- 能力雷达图 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">能力雷达图</view>
					<view class="radar-wrap">
						<canvas canvas-id="radarChart" id="radarChart" class="radar-canvas"></canvas>
					</view>
				</view>

				<!-- 收入卡片 -->
				<view class="income-row mb30">
					<view class="income-card box">
						<view class="fs24 col9">待结算(单位:元)</view>
						<view class="income-amount col4">¥12,580</view>
					</view>
					<view class="income-card box">
						<view class="fs24 col9">本月已结算(单位:元)</view>
						<view class="income-amount col1">¥8,320</view>
					</view>
					<view class="income-card box">
						<view class="fs24 col9">心愿进度</view>
						<view class="income-amount col2">68%</view>
					</view>
				</view>

				<!-- 快捷入口 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">快捷入口</view>
					<view class="quick-grid">
						<view class="quick-item" @click="onQuickEntry('products')">
							<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #52c41a, #73d13d);">
								<image src="/static/icon/icon_foot2_sc.png" mode="aspectFill" class="quick-icon"></image>
							</view>
							<view class="fs24 col3 mt10 tc">浏览商品</view>
						</view>
						<view class="quick-item" @click="onQuickEntry('bid')">
							<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #40a9ff, #69c0ff);">
								<image src="/static/icon/icon_foot3_sc.png" mode="aspectFill" class="quick-icon"></image>
							</view>
							<view class="fs24 col3 mt10 tc">竞标管理</view>
						</view>
						<view class="quick-item" @click="onQuickEntry('orders')">
							<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #ff7875, #ffa39e);">
								<image src="/static/icon/icon_foot4_sc.png" mode="aspectFill" class="quick-icon"></image>
							</view>
							<view class="fs24 col3 mt10 tc">我的订单</view>
						</view>
						<view class="quick-item" @click="onQuickEntry('guide')">
							<view class="quick-icon-wrap" style="background: linear-gradient(135deg, #ff8c00, #ffa940);">
								<image src="/static/icon/icon_foot1_sc.png" mode="aspectFill" class="quick-icon"></image>
							</view>
							<view class="fs24 col3 mt10 tc">新手指南</view>
						</view>
					</view>
				</view>

				<!-- 待办事项 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">待办事项</view>
					<view v-if="todoList.length === 0" class="fs28 col9 tc ptb30">暂无待办事项</view>
					<view v-for="(item, idx) in todoList" :key="idx" class="todo-item flex-box" :class="{ 'bb': idx < todoList.length - 1 }" @click="onTodoClick(item)">
						<view class="todo-dot"></view>
						<view class="flex-grow-1 ml15">
							<view class="fs28 col1">{{ item.title }}</view>
							<view class="fs24 col9 mt5">{{ item.desc }}</view>
						</view>
						<view class="fs24 col4">去处理 ></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 移动端 TabBar -->
		<jj-tabbar v-if="isMobile" active="home" />
	</view>
</template>

<script>
	import pcSidebar from '@/components/pc-sidebar/pc-sidebar.vue';
	import jjTabbar from '@/components/jj-tabbar/jj-tabbar.vue';

	export default {
		components: { pcSidebar, jjTabbar },
		data() {
			return {
				pcMenuList: [
					{
						key: 'home',
						label: '首页',
						icon: '/static/icon/icon_foot1_uc.png',
						iconActive: '/static/icon/icon_foot1_sc.png',
						url: '/pages/jj/jj_home/jj_home',
						isTab: false
					},
					{
						key: 'products',
						label: '商品池',
						icon: '/static/icon/icon_foot2_uc.png',
						iconActive: '/static/icon/icon_foot2_sc.png',
						url: '/pages/jj/jj_products/jj_products',
						isTab: false
					},
					{
						key: 'orders',
						label: '订单',
						icon: '/static/icon/icon_foot4_uc.png',
						iconActive: '/static/icon/icon_foot4_sc.png',
						url: '/pages/jj/jj_orders/jj_orders',
						isTab: false
					},
					{
						key: 'profile',
						label: '我的',
						icon: '/static/icon/icon_foot5_uc.png',
						iconActive: '/static/icon/icon_foot5_sc.png',
						url: '/pages/jj/jj_profile/jj_profile',
						isTab: false
					}
				],
				todoList: [
					{ type: 'pending_deposit', title: '缴纳履约保证金', desc: '完成保证金缴纳后可接单' },
					{ type: 'profile', title: '完善个人资料', desc: '补充详细信息提升信誉评分' },
					{ type: 'guide', title: '查看新手指南', desc: '了解平台规则和操作流程' }
				],
				userAvatar: '/static/icon/icon_foot5_sc.png'
			}
		},
		onReady() {
			this.drawRadar();
			this.loadAvatar();
		},
		onShow() {
			// #ifdef H5
			if (this.isPC) {
				uni.hideTabBar({ animation: false });
			}
			// #endif
		},
		methods: {
			loadAvatar() {
				this.$core.get({
					url: 'xiluxc.jj_agent/dashboard',
					loading: false,
					success: ret => {
						let d = ret.data;
						if (d.profile && d.profile.avatar) {
							this.userAvatar = d.profile.avatar;
						}
					},
					fail: () => { return false; }
				});
			},
			drawRadar() {
				const ctx = uni.createCanvasContext('radarChart', this);
				const centerX = 140;
				const centerY = 135;
				const radius = 90;
				const sides = 6;
				const labels = ['履约率', '成交额', '客户评价', '响应速度', '沟通能力', '专业领域'];
				const rawScores = [80, 60, 90, 70, 85, 75];
				const values = rawScores.map(v => v / 100);

				// 绘制背景网格（5层同心六边形）
				for (let level = 1; level <= 5; level++) {
					const r = radius * level / 5;
					ctx.beginPath();
					for (let i = 0; i < sides; i++) {
						const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
						const x = centerX + r * Math.cos(angle);
						const y = centerY + r * Math.sin(angle);
						if (i === 0) ctx.moveTo(x, y);
						else ctx.lineTo(x, y);
					}
					ctx.closePath();
					ctx.setStrokeStyle('#E8E8E8');
					ctx.setLineWidth(1);
					ctx.stroke();
				}

				// 绘制轴线
				for (let i = 0; i < sides; i++) {
					const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
					ctx.beginPath();
					ctx.moveTo(centerX, centerY);
					ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
					ctx.setStrokeStyle('#E8E8E8');
					ctx.setLineWidth(1);
					ctx.stroke();
				}

				// 绘制数据区域
				ctx.beginPath();
				for (let i = 0; i < sides; i++) {
					const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
					const r = radius * values[i];
					const x = centerX + r * Math.cos(angle);
					const y = centerY + r * Math.sin(angle);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.setFillStyle('rgba(254, 75, 1, 0.15)');
				ctx.fill();
				ctx.setStrokeStyle('#FE4B01');
				ctx.setLineWidth(2);
				ctx.stroke();

				// 绘制数据点
				for (let i = 0; i < sides; i++) {
					const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
					const r = radius * values[i];
					const x = centerX + r * Math.cos(angle);
					const y = centerY + r * Math.sin(angle);
					ctx.beginPath();
					ctx.arc(x, y, 4, 0, Math.PI * 2);
					ctx.setFillStyle('#FE4B01');
					ctx.fill();
				}

				// 绘制标签和数值
				for (let i = 0; i < sides; i++) {
					const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
					const labelR = radius + 25;
					const x = centerX + labelR * Math.cos(angle);
					const y = centerY + labelR * Math.sin(angle);

					ctx.setTextAlign('center');
					ctx.setTextBaseline('middle');

					let offsetY = 0;
					if (i === 0) {
						ctx.setTextBaseline('bottom');
						offsetY = -8;
					} else if (i === 3) {
						ctx.setTextBaseline('top');
						offsetY = 8;
					} else if (i === 1 || i === 2) {
						ctx.setTextAlign('left');
					} else if (i === 4 || i === 5) {
						ctx.setTextAlign('right');
					}

					// 标签名称
					ctx.setFontSize(11);
					ctx.setFillStyle('#666666');
					ctx.fillText(labels[i], x, y + offsetY);

					// 数值
					ctx.setFontSize(12);
					ctx.setFillStyle('#FE4B01');
					ctx.setTextBaseline('top');
					let scoreY = y + offsetY;
					if (i === 0) {
						scoreY = y + 4;
					} else if (i === 3) {
						scoreY = y + offsetY + 15;
					} else {
						scoreY = y + offsetY + 15;
					}
					ctx.fillText(rawScores[i] + '分', x, scoreY);
				}

				ctx.draw();
			},
			onQuickEntry(type) {
				const routes = {
					'products': '/pages/jj/jj_products/jj_products',
					'orders': '/pages/jj/jj_orders/jj_orders',
					'bid': '/pages/jj/jj_bid_board/jj_bid_board',
					'guide': ''
				};
				if (routes[type]) {
					uni.redirectTo({ url: routes[type] });
				} else {
					uni.showToast({ title: '功能开发中', icon: 'none' });
				}
			},
			onTodoClick(item) {
				const todoRoutes = {
					'pending_deposit': '/pages/jj/jj_orders/jj_orders?status=1',
					'pending_contract': '/pages/jj/jj_orders/jj_orders?status=3',
					'executing': '/pages/jj/jj_orders/jj_orders?status=4',
					'pending_settle': '/pages/jj/jj_orders/jj_orders?status=6',
					'profile': '/pages/jj/jj_profile/jj_profile',
					'guide': ''
				};
				let url = todoRoutes[item.type];
				if (url) {
					uni.navigateTo({ url: url });
				} else {
					uni.showToast({ title: '功能开发中', icon: 'none' });
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-wrap {
		max-width: 750rpx;
		margin-left: auto;
		margin-right: auto;
		padding-bottom: 120rpx;
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 2px solid #F0F0F0;
	}

	/* 雷达图 */
	.radar-wrap {
		display: flex;
		justify-content: center;
	}

	.radar-canvas {
		width: 280px;
		height: 310px;
	}

	/* 收入卡片 */
	.income-row {
		display: flex;
		gap: 20rpx;
	}

	.income-card {
		flex: 1;
		text-align: center;
		padding: 24rpx 10rpx;
	}

	.income-amount {
		font-size: 36rpx;
		font-weight: bold;
		margin-top: 16rpx;
	}

	/* 快捷入口 */
	.quick-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
	}

	.quick-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}

	.quick-icon-wrap {
		width: 90rpx;
		height: 90rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.12);
	}

	.quick-icon {
		width: 44rpx;
		height: 44rpx;
		filter: brightness(0) invert(1);
	}

	/* 待办事项 */
	.todo-item {
		padding: 24rpx 0;
	}

	.todo-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #FE4B01;
		flex-shrink: 0;
	}

	/* PC端适配 */
	.pc-layout {
		margin-left: 220px;
	}

	@media screen and (min-width: 768px) {
		.page-wrap {
			max-width: 700px;
			padding: 30px;
			padding-bottom: 30px;
		}

		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.income-row {
			gap: 16px;
		}

		.income-card {
			padding: 20px 10px;
		}

		.income-amount {
			font-size: 28px;
		}

		.quick-icon-wrap {
			cursor: pointer;
			transition: transform 0.2s;

			&:hover {
				transform: translateY(-4rpx);
			}
		}

		.todo-item {
			cursor: pointer;

			&:hover {
				background-color: #F5F7FB;
			}
		}
	}
</style>
