<template>
	<view class="home-content">
		<!-- 用户信息 -->
		<view class="jj-box mb30">
			<view class="flex-box">
				<image class="avatar" :src="profile.avatar" mode="aspectFill"></image>
				<view class="ml20 flex-grow-1">
					<view class="fs34 fwb col1">{{ profile.realName }}</view>
					<view class="fs24 col9 mt10">信誉评分: {{ profile.creditScore }}分</view>
				</view>
			</view>
		</view>

		<!-- 能力雷达图 -->
		<view class="jj-box mb30">
			<view class="fs34 fwb col1 lh36 mb20">能力雷达图</view>
			<view class="radar-wrap">
				<canvas canvas-id="radarChart" id="radarChart" class="radar-canvas"></canvas>
			</view>
		</view>

		<!-- 收入卡片 -->
		<view class="income-row mb30">
			<view class="income-card jj-box">
				<view class="fs24 col9">待结算(单位:元)</view>
				<view class="income-amount col4">¥{{ formatPrice(income.pendingRevenue) }}</view>
			</view>
			<view class="income-card jj-box">
				<view class="fs24 col9">已结算(单位:元)</view>
				<view class="income-amount col1">¥{{ formatPrice(income.settledRevenue) }}</view>
			</view>
			<view class="income-card jj-box">
				<view class="fs24 col9">累计收入(单位:元)</view>
				<view class="income-amount col2">¥{{ formatPrice(income.totalRevenue) }}</view>
			</view>
		</view>

		<!-- 快捷入口 -->
		<view class="jj-box mb30">
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
		<view class="jj-box mb30">
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
</template>

<script>
	export default {
		name: 'jj-home-content',
		data() {
			return {
				profile: {
					realName: '居间人',
					creditScore: 0,
					avatar: '/static/icon/icon_foot5_sc.png'
				},
				income: {
					pendingRevenue: 0,
					settledRevenue: 0,
					totalRevenue: 0
				},
				hexagonData: {
					dealAbility: 0,
					creditScore: 0,
					activeLevel: 0,
					fulfillRate: 0,
					teamScale: 0,
					growthRate: 0
				},
				todoList: []
			}
		},
		mounted() {
			this.loadDashboard();
		},
		methods: {
			loadDashboard() {
				this.$core.get({
					url: 'xiluxc.jj_agent/dashboard',
					loading: false,
					success: ret => {
						let d = ret.data;
						if (d.profile) {
							this.profile.realName = d.profile.real_name || '居间人';
							this.profile.creditScore = d.profile.credit_score || 0;
							if (d.profile.avatar) {
								this.profile.avatar = d.profile.avatar;
							}
						}
						if (d.income) {
							this.income.pendingRevenue = Number(d.income.pending_revenue) || 0;
							this.income.settledRevenue = Number(d.income.settled_revenue) || 0;
							this.income.totalRevenue = Number(d.income.total_revenue) || 0;
						}
						if (d.hexagonData) {
							this.hexagonData = d.hexagonData;
						}
						// 构建待办事项
						this.buildTodoList(d.todo);
						this.$nextTick(() => { this.drawRadar(); });
					},
					fail: () => { return false; }
				});
			},
			buildTodoList(todo) {
				this.todoList = [];
				if (!todo) return;
				if (todo.pending_deposit > 0) {
					this.todoList.push({ type: 'pending_deposit', title: '缴纳履约保证金', desc: todo.pending_deposit + '笔保证金待支付' });
				}
				if (todo.pending_contract > 0) {
					this.todoList.push({ type: 'pending_contract', title: '上传合同', desc: todo.pending_contract + '笔订单待上传合同' });
				}
				if (todo.executing > 0) {
					this.todoList.push({ type: 'executing', title: '跟踪履约订单', desc: todo.executing + '笔订单履约中' });
				}
				if (todo.pending_settle > 0) {
					this.todoList.push({ type: 'pending_settle', title: '待结算佣金', desc: todo.pending_settle + '笔佣金待结算' });
				}
				if (this.todoList.length === 0) {
					this.todoList.push({ type: 'guide', title: '查看新手指南', desc: '了解平台规则和操作流程' });
				}
			},
			drawRadar() {
				const ctx = uni.createCanvasContext('radarChart', this);
				const centerX = 180;
				const centerY = 155;
				const radius = 100;
				const sides = 6;
				const labels = ['成交能力', '信誉评分', '活跃度', '履约率', '团队规模', '成长速度'];
				const h = this.hexagonData;
				const rawScores = [
					h.dealAbility || 0,
					h.creditScore || 0,
					h.activeLevel || 0,
					h.fulfillRate || 0,
					h.teamScale || 0,
					h.growthRate || 0
				];
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
					const labelR = radius + 28;
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
					ctx.setFontSize(12);
					ctx.setFillStyle('#666666');
					ctx.fillText(labels[i], x, y + offsetY);

					// 数值
					ctx.setFontSize(13);
					ctx.setFillStyle('#FE4B01');
					ctx.setTextBaseline('top');
					let scoreY = y + offsetY;
					if (i === 0) {
						scoreY = y + 4;
					} else if (i === 3) {
						scoreY = y + offsetY + 16;
					} else {
						scoreY = y + offsetY + 16;
					}
					ctx.fillText(rawScores[i] + '分', x, scoreY);
				}

				ctx.draw();
			},
			onQuickEntry(type) {
				if (type === 'products' || type === 'orders') {
					this.$emit('switchTab', type);
				} else if (type === 'bid') {
					uni.navigateTo({ url: '/pages/jj/jj_bid_board/jj_bid_board' });
				} else {
					uni.showToast({ title: '功能开发中', icon: 'none' });
				}
			},
			onTodoClick(item) {
				const todoRoutes = {
					'pending_deposit': { tab: 'orders', status: 1 },
					'pending_contract': { tab: 'orders', status: 3 },
					'executing': { tab: 'orders', status: 4 },
					'pending_settle': { tab: 'orders', status: 6 },
					'guide': null
				};
				let route = todoRoutes[item.type];
				if (route) {
					this.$emit('switchTab', route.tab, route.status);
				} else {
					uni.showToast({ title: '功能开发中', icon: 'none' });
				}
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 2px solid #F0F0F0;
	}

	.radar-wrap {
		display: flex;
		justify-content: center;
	}

	.radar-canvas {
		width: 360px;
		height: 350px;
	}

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

	@media screen and (min-width: 768px) {
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
