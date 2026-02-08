<template>
	<view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 奖池金额 -->
				<view class="pool-header mb30">
					<view class="tc">
						<view class="fs26" style="color: rgba(255,255,255,0.8);">本周奖池总额</view>
						<view class="pool-amount">¥{{ formatPrice(poolInfo.totalAmount) }}</view>
						<view class="fs24 mt10" style="color: rgba(255,255,255,0.6);">资金来源：平台服务费 1%</view>
					</view>
					<view class="pool-time tc mt20">
						<view class="fs24" style="color: rgba(255,255,255,0.7);">
							统计周期：{{ poolInfo.startDate }} ~ {{ poolInfo.endDate }}
						</view>
					</view>
				</view>

				<!-- 我的排名 -->
				<view class="box mb30">
					<view class="flex-box flex-center">
						<view class="my-rank-circle">
							<view class="fs36 fwb colf">{{ myRank.rank > 0 ? myRank.rank : '-' }}</view>
						</view>
						<view class="ml20 flex-grow-1">
							<view class="fs28 fwb col1">我的排名</view>
							<view class="fs24 col9 mt5">本周成交额：¥{{ formatPrice(myRank.amount) }}</view>
						</view>
						<view class="tr" v-if="myRank.rank > 0 && myRank.rank <= 10">
							<view class="fs24 col5">预计奖金</view>
							<view class="fs30 fwb col4 mt5">¥{{ formatPrice(myRank.prize) }}</view>
						</view>
						<view class="tr" v-else>
							<view class="fs24 col9">未进入 Top10</view>
							<view class="fs22 col9 mt5">继续加油</view>
						</view>
					</view>
				</view>

				<!-- 分配规则 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">分配规则</view>
					<view class="rule-item flex-box mb15" v-for="(item, idx) in rules" :key="idx">
						<view class="rule-dot"></view>
						<view class="fs26 col5 ml15 flex-grow-1">{{ item }}</view>
					</view>
				</view>

				<!-- Top10 排行榜 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">Top 10 排行榜</view>

					<!-- 表头 -->
					<view class="rank-header flex-box">
						<view class="rank-col-rank fs24 col9">排名</view>
						<view class="rank-col-name fs24 col9 flex-grow-1">居间人</view>
						<view class="rank-col-amount fs24 col9">成交额</view>
						<view class="rank-col-prize fs24 col9">奖金</view>
					</view>

					<!-- 排行列表 -->
					<view class="rank-item flex-box" v-for="(item, idx) in rankList" :key="idx"
						:class="{ 'rank-highlight': item.isMe, bb: idx < rankList.length - 1 }">
						<view class="rank-col-rank">
							<view class="rank-badge" :class="'rank-' + (idx + 1)" v-if="idx < 3">{{ idx + 1 }}</view>
							<view class="fs28 col5" v-else>{{ idx + 1 }}</view>
						</view>
						<view class="rank-col-name flex-grow-1">
							<view class="fs28" :class="item.isMe ? 'col4 fwb' : 'col1'">{{ item.name }}</view>
						</view>
						<view class="rank-col-amount">
							<view class="fs26 col1">¥{{ formatShortPrice(item.amount) }}</view>
						</view>
						<view class="rank-col-prize">
							<view class="fs26 fwb col4">¥{{ formatPrice(item.prize) }}</view>
						</view>
					</view>

					<view class="tc ptb30" v-if="rankList.length === 0">
						<view class="fs28 col9">暂无排行数据</view>
					</view>
				</view>

				<!-- 历史奖池 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">历史奖池</view>
					<view v-for="(item, idx) in historyPools" :key="idx" class="history-pool-item"
						:class="{ bb: idx < historyPools.length - 1 }">
						<view class="flex-box">
							<view class="flex-grow-1">
								<view class="fs28 col1">{{ item.period }}</view>
								<view class="fs24 col9 mt5">奖池 ¥{{ formatPrice(item.totalAmount) }}</view>
							</view>
							<view class="tr">
								<view class="fs26 col4" v-if="item.myPrize > 0">获得 ¥{{ formatPrice(item.myPrize) }}</view>
								<view class="fs26 col9" v-else>未获奖</view>
								<view class="fs22 col9 mt5">排名 #{{ item.myRank || '-' }}</view>
							</view>
						</view>
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
				poolInfo: {
					totalAmount: 50000.00,
					startDate: '2026-02-03',
					endDate: '2026-02-09'
				},
				myRank: {
					rank: 5,
					amount: 85000.00,
					prize: 3200.00
				},
				rules: [
					'奖池资金来源于平台服务费的 1%',
					'每周结算一次，Top 10 居间人按成交额占比分配奖金',
					'奖金 = 奖池总额 × (个人成交额 / Top10 总成交额)',
					'奖金将在每周一自动发放至您的账户',
					'成交额以实际完成结算的订单为准'
				],
				rankList: [
					{ name: '张**', amount: 320000, prize: 12800, isMe: false },
					{ name: '李**', amount: 256000, prize: 10240, isMe: false },
					{ name: '王**', amount: 198000, prize: 7920, isMe: false },
					{ name: '赵**', amount: 145000, prize: 5800, isMe: false },
					{ name: '我', amount: 85000, prize: 3200, isMe: true },
					{ name: '刘**', amount: 78000, prize: 3120, isMe: false },
					{ name: '陈**', amount: 62000, prize: 2480, isMe: false },
					{ name: '周**', amount: 45000, prize: 1800, isMe: false },
					{ name: '吴**', amount: 32000, prize: 1280, isMe: false },
					{ name: '孙**', amount: 21000, prize: 1360, isMe: false }
				],
				historyPools: [
					{ period: '2026年第5周', totalAmount: 48000, myPrize: 2800, myRank: 6 },
					{ period: '2026年第4周', totalAmount: 52000, myPrize: 4100, myRank: 4 },
					{ period: '2026年第3周', totalAmount: 45000, myPrize: 0, myRank: 15 },
					{ period: '2026年第2周', totalAmount: 39000, myPrize: 1800, myRank: 9 }
				]
			}
		},
		onLoad() {
			this.loadPoolData();
		},
		methods: {
			loadPoolData() {
				this.$core.get({
					url: 'xiluxc.jj_pk_pool/info',
					loading: false,
					success: ret => {
						let data = ret.data;
						if (data.pool_info) this.poolInfo = Object.assign(this.poolInfo, data.pool_info);
						if (data.my_rank) this.myRank = Object.assign(this.myRank, data.my_rank);
						if (data.rank_list) this.rankList = data.rank_list;
						if (data.history_pools) this.historyPools = data.history_pools;
					},
					fail: () => { return false; }
				});
			},

			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			},

			formatShortPrice(price) {
				if (price >= 10000) {
					return (price / 10000).toFixed(1) + '万';
				}
				return this.formatPrice(price);
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

	.colf { color: #FFFFFF; }

	/* 奖池头部 */
	.pool-header {
		background: linear-gradient(135deg, #722ED1, #B37FEB);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
	}

	.pool-amount {
		font-size: 60rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-top: 15rpx;
	}

	/* 我的排名 */
	.my-rank-circle {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* 规则 */
	.rule-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #722ED1;
		flex-shrink: 0;
		margin-top: 12rpx;
	}

	/* 排行表头 */
	.rank-header {
		padding: 16rpx 0;
		border-bottom: 2rpx solid #F0F0F0;
	}

	.rank-col-rank { width: 80rpx; text-align: center; }
	.rank-col-amount { width: 160rpx; text-align: right; }
	.rank-col-prize { width: 140rpx; text-align: right; }

	/* 排行项 */
	.rank-item {
		padding: 24rpx 0;
		align-items: center;
	}

	.rank-highlight {
		background: rgba(254, 75, 1, 0.04);
		margin: 0 -30rpx;
		padding: 24rpx 30rpx;
		border-radius: 12rpx;
	}

	/* 排名徽章 */
	.rank-badge {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin: 0 auto;
	}

	.rank-1 { background: linear-gradient(135deg, #FFD700, #FFA500); }
	.rank-2 { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); }
	.rank-3 { background: linear-gradient(135deg, #CD7F32, #A0522D); }

	/* 历史奖池 */
	.history-pool-item {
		padding: 24rpx 0;
	}

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

		.pool-header {
			padding: 32px 24px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.pool-amount {
			font-size: 42px;
		}

		.rank-item {
			padding: 16px 0;
		}

		.rank-highlight {
			margin: 0 -24px;
			padding: 16px 24px;
			border-radius: 8px;
		}

		.history-pool-item {
			padding: 16px 0;
			cursor: pointer;

			&:hover { background: #F9FAFB; }
		}
	}
</style>
