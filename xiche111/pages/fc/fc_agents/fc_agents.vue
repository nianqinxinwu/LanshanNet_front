<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 搜索栏 -->
			<view class="search-bar mb20">
				<view class="search-inner flex-box">
					<image src="/static/icon/icon_search.png" mode="aspectFill" class="search-icon"></image>
					<input type="text" class="search-input flex-grow-1" v-model="keyword" placeholder="搜索居间人名称" placeholder-class="cola" confirm-type="search" @confirm="onSearch" />
					<view v-if="keyword" class="search-clear fs24" @click="onClearSearch">清除</view>
				</view>
			</view>

			<!-- 筛选条件 -->
			<view class="jj-box mb30">
				<view class="flex-box mb20">
					<view class="flex-grow-1">
						<view class="fs28 col1">六边形身价评分 ≥ 80</view>
						<view class="fs22 col9 mt4">开启后仅展示信誉评分达到80分以上的居间人</view>
					</view>
					<switch :checked="highScoreOnly" @change="onScoreFilterChange" color="#FE4B01" />
				</view>
				<view class="flex-box">
					<view class="fs28 col5 mr20">排序</view>
					<view class="sort-options">
						<view class="sort-opt fs24" :class="{ active: sortType === 'score' }" @click="sortType = 'score'; resetAndLoad()">综合</view>
						<view class="sort-opt fs24" :class="{ active: sortType === 'deals' }" @click="sortType = 'deals'; resetAndLoad()">成交量最高</view>
						<view class="sort-opt fs24" :class="{ active: sortType === 'rate' }" @click="sortType = 'rate'; resetAndLoad()">履约率最高</view>
					</view>
				</view>
			</view>

			<!-- 居间人列表 -->
			<view class="agent-card jj-box mb30" v-for="(item, index) in agentList" :key="item.id">
				<view class="agent-card-body">
					<!-- 左侧：居间人信息 -->
					<view class="agent-left">
						<view class="flex-box">
							<image :src="item.avatar || '/static/icon/icon_foot5_sc.png'" mode="aspectFill" class="agent-avatar"></image>
							<view class="flex-grow-1 ml20">
								<view class="fs30 fwb col1">{{ item.name }}</view>
								<view class="fs24 col9 mt8">信誉评分: {{ item.creditScore }}分</view>
							</view>
						</view>
						<view class="agent-stats mt20">
							<view class="stat-item">
								<view class="stat-val fs30 fwb col1">{{ item.dealCount }}</view>
								<view class="fs22 col9 mt4">成交量</view>
							</view>
							<view class="stat-item">
								<view class="stat-val fs30 fwb col1">{{ item.fulfillRate }}%</view>
								<view class="fs22 col9 mt4">履约率</view>
							</view>
							<view class="stat-item">
								<view class="stat-val fs30 fwb col1">{{ item.creditScore }}</view>
								<view class="fs22 col9 mt4">信誉分</view>
							</view>
						</view>
						<view class="flex-box mt20">
							<view class="outline-btn fs24 mr15 flex-grow-1 tc" @click="viewDetail(item)">查看详情</view>
							<view class="action-btn fs24 flex-grow-1 tc" @click="contactAgent(item)">联系TA</view>
						</view>
					</view>
					<!-- 右侧：雷达图 -->
					<view class="agent-right">
						<canvas :canvas-id="'radar_' + item.id" :id="'radar_' + item.id" class="radar-canvas"></canvas>
					</view>
				</view>
			</view>

			<!-- 空状态 / 加载更多 -->
			<view class="nothing" v-if="moreButton.nothing">
				<view class="tc ptb40">
					<view class="fs28 col9">暂无居间人</view>
				</view>
			</view>
			<view class="g-btn3-wrap" v-else>
				<view class="g-btn3 fs26 col9 tc ptb20" @click="loadAgents">{{ moreButton.text }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				highScoreOnly: false,
				sortType: 'score',
				agentList: [],
				radarLabels: ['成交', '信誉', '活跃', '履约', '团队', '增长'],
				radarKeys: ['dealAbility', 'creditScore', 'activeLevel', 'fulfillRate', 'teamScale', 'growthRate'],
				moreButton: { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false }
			}
		},
		onLoad() {
			this.loadAgents();
		},
		methods: {
			loadAgents() {
				if (this.moreButton.loading || this.moreButton.nomore) return;
				this.moreButton.loading = true;
				this.moreButton.text = '加载中...';

				this.$core.get({
					url: 'xiluxc.fc_agent/list',
					data: {
						page: this.moreButton.page,
						pagesize: 10,
						keyword: this.keyword,
						min_score: this.highScoreOnly ? 80 : 0,
						sort: this.sortType
					},
					loading: false,
					success: ret => {
						let pageData = ret.data || {};
						let rawList = pageData.data || [];
						let list = Array.isArray(rawList) ? rawList.map(item => ({
							id: item.id,
							name: item.real_name || (item.user && item.user.nickname) || '',
							avatar: (item.user && item.user.avatar) || '',
							creditScore: item.credit_score || 0,
							dealCount: item.total_deals || 0,
							fulfillRate: item.fulfill_rate || 0,
							hexagon: item.hexagon_data || {}
						})) : [];
						if (list.length === 0 && this.moreButton.page === 1) {
							this.moreButton.nothing = true;
						} else if (this.moreButton.page >= (pageData.last_page || 1)) {
							this.agentList = this.agentList.concat(list);
							this.moreButton.nomore = true;
							this.moreButton.text = '—— 我是有底线的 ——';
						} else {
							this.agentList = this.agentList.concat(list);
							this.moreButton.page += 1;
							this.moreButton.text = '加载更多';
						}
						this.moreButton.loading = false;
						this.$nextTick(() => {
							setTimeout(() => { this.drawAllRadars(); }, 300);
						});
					},
					fail: () => {
						this.moreButton.loading = false;
						this.moreButton.text = '加载失败，点击重试';
						return false;
					}
				});
			},
			drawAllRadars() {
				this.agentList.forEach(agent => {
					this.drawMiniRadar(agent);
				});
			},
			drawMiniRadar(agent) {
				const canvasId = 'radar_' + agent.id;
				const ctx = uni.createCanvasContext(canvasId, this);
				const W = 220;
				const H = 170;
				const centerX = W / 2;
				const centerY = H / 2;
				const radius = 50;
				const sides = 6;
				const h = agent.hexagon || {};
				const labels = this.radarLabels;
				const keys = this.radarKeys;
				const values = keys.map(k => (h[k] || 0) / 100);

				ctx.clearRect(0, 0, W, H);

				// 背景网格（3层）
				for (let level = 1; level <= 3; level++) {
					const r = radius * level / 3;
					ctx.beginPath();
					for (let i = 0; i < sides; i++) {
						const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
						const x = centerX + r * Math.cos(angle);
						const y = centerY + r * Math.sin(angle);
						if (i === 0) ctx.moveTo(x, y);
						else ctx.lineTo(x, y);
					}
					ctx.closePath();
					ctx.setStrokeStyle('#E0E0E0');
					ctx.setLineWidth(0.5);
					ctx.stroke();
				}

				// 轴线
				for (let i = 0; i < sides; i++) {
					const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
					ctx.beginPath();
					ctx.moveTo(centerX, centerY);
					ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
					ctx.setStrokeStyle('#E0E0E0');
					ctx.setLineWidth(0.5);
					ctx.stroke();
				}

				// 数据区域填充
				ctx.beginPath();
				for (let i = 0; i < sides; i++) {
					const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
					const r = radius * Math.max(values[i], 0.05);
					const x = centerX + r * Math.cos(angle);
					const y = centerY + r * Math.sin(angle);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.setFillStyle('rgba(254, 75, 1, 0.18)');
				ctx.fill();
				ctx.setStrokeStyle('#FE4B01');
				ctx.setLineWidth(1.5);
				ctx.stroke();

				// 数据点
				for (let i = 0; i < sides; i++) {
					const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
					const r = radius * Math.max(values[i], 0.05);
					const x = centerX + r * Math.cos(angle);
					const y = centerY + r * Math.sin(angle);
					ctx.beginPath();
					ctx.arc(x, y, 2.5, 0, Math.PI * 2);
					ctx.setFillStyle('#FE4B01');
					ctx.fill();
				}

				// 维度标签 + 数值
				ctx.setFontSize(10);
				ctx.setFillStyle('#555555');
				for (let i = 0; i < sides; i++) {
					const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
					const labelR = radius + 18;
					let x = centerX + labelR * Math.cos(angle);
					let y = centerY + labelR * Math.sin(angle);
					const val = Math.round(h[keys[i]] || 0);
					const text = labels[i] + val;

					if (i === 0) {
						ctx.setTextAlign('center');
						y -= 3;
					} else if (i === 3) {
						ctx.setTextAlign('center');
						y += 10;
					} else if (i === 1 || i === 2) {
						ctx.setTextAlign('left');
						x += 2;
						y += 4;
					} else {
						ctx.setTextAlign('right');
						x -= 2;
						y += 4;
					}
					ctx.fillText(text, x, y);
				}

				ctx.draw();
			},
			onSearch() {
				this.resetAndLoad();
			},
			onClearSearch() {
				this.keyword = '';
				this.resetAndLoad();
			},
			onScoreFilterChange(e) {
				this.highScoreOnly = e.detail.value;
				this.resetAndLoad();
			},
			resetAndLoad() {
				this.agentList = [];
				this.moreButton = { page: 1, loading: false, text: '加载更多', nomore: false, nothing: false };
				this.loadAgents();
			},
			viewDetail(item) {
				uni.showToast({ title: '功能开发中', icon: 'none' });
			},
			contactAgent(item) {
				uni.showToast({ title: '功能开发中', icon: 'none' });
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search-bar {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 20rpx 30rpx;
	}

	.search-inner {
		background: #F5F7FB;
		border-radius: 30rpx;
		padding: 0 24rpx;
		height: 68rpx;
		align-items: center;
	}

	.search-icon {
		width: 32rpx;
		height: 32rpx;
		flex-shrink: 0;
		margin-right: 16rpx;
	}

	.search-input {
		font-size: 26rpx;
		height: 68rpx;
		line-height: 68rpx;
	}

	.search-clear {
		color: #999999;
		flex-shrink: 0;
		padding-left: 16rpx;
	}

	.sort-options {
		display: flex;
		gap: 16rpx;
	}

	.sort-opt {
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		background: #F5F7FB;
		color: #666666;

		&.active {
			background: #FE4B01;
			color: #FFFFFF;
		}
	}

	.agent-card {
		overflow: visible;
	}

	.agent-card-body {
		display: flex;
		align-items: stretch;
		gap: 20rpx;
	}

	.agent-left {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.agent-right {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.radar-canvas {
		width: 220px;
		height: 170px;
	}

	.agent-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		flex-shrink: 0;
		border: 2px solid #F0F0F0;
	}

	.agent-stats {
		display: flex;
		gap: 10rpx;
	}

	.stat-item {
		flex: 1;
		text-align: center;
		background: #F9FAFB;
		border-radius: 12rpx;
		padding: 16rpx 8rpx;
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
		.search-bar {
			border-radius: 12px;
			padding: 14px 20px;
		}

		.search-inner {
			border-radius: 20px;
			padding: 0 16px;
			height: 42px;
		}

		.sort-opt {
			cursor: pointer;
			transition: background-color 0.2s;

			&:hover:not(.active) {
				background: #E8E8E8;
			}
		}

		.agent-card {
			transition: box-shadow 0.2s;

			&:hover {
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
			}
		}

		.agent-card-body {
			gap: 24px;
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
