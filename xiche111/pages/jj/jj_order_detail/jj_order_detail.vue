<template>
	<view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 状态横幅 -->
				<view class="box mb30 status-banner" :class="'banner-' + orderInfo.state">
					<view class="tc">
						<view class="fs30 fwb colf">{{ getStatusBannerText(orderInfo.state) }}</view>
						<view class="fs24 colf mt10" style="opacity:0.8;">{{ getStatusBannerDesc(orderInfo.state) }}</view>
					</view>
				</view>

				<!-- 订单信息摘要 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">订单信息</view>
					<view class="flex-box">
						<image :src="orderInfo.coverImage" mode="aspectFill" class="product-thumb"></image>
						<view class="flex-grow-1 ml20">
							<view class="fs28 fwb col1 m-ellipsis">{{ orderInfo.productName }}</view>
							<view class="mt10 fs24 col9">买家：{{ orderInfo.companyName }}</view>
							<view class="mt10 fs24 col9">订单编号：{{ orderInfo.orderNo }}</view>
							<view class="mt10 fs24 col9">下单时间：{{ orderInfo.createTime }}</view>
						</view>
					</view>
				</view>

				<!-- 佣金已锁定横幅（状态>=2时显示） -->
				<view class="box mb30 lock-banner" v-if="orderInfo.state >= 2">
					<view class="flex-box flex-center">
						<view class="lock-icon-wrap">
							<text class="fs24 colf">锁</text>
						</view>
						<view class="ml15">
							<view class="fs28 fwb col1">佣金已锁定</view>
							<view class="fs36 fwb col4 mt5">¥{{ formatPrice(orderInfo.commissionAmount) }}</view>
						</view>
					</view>
				</view>

				<!-- 金额明细 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">金额明细</view>
					<view class="detail-row flex-box bb">
						<view class="col5 fs28">基础佣金</view>
						<view class="flex-grow-1 tr fs28 col1">¥{{ formatPrice(orderInfo.commissionAmount) }}</view>
					</view>
					<view class="detail-row flex-box bb detail-clickable" @click="goFactoryBonus">
						<view class="col5 fs28">预计厂家奖金</view>
						<view class="flex-grow-1 tr fs28 col1">¥{{ formatPrice(orderInfo.factoryBonus) }}</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow ml10"></image>
					</view>
					<view class="detail-row flex-box bb detail-clickable" @click="goLogisticsRebate">
						<view class="col5 fs28">预计物流返佣</view>
						<view class="flex-grow-1 tr fs28 col1">¥{{ formatPrice(orderInfo.logisticsRebate) }}</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow ml10"></image>
					</view>
					<view class="detail-row flex-box">
						<view class="col5 fs28 fwb">预计到账总额</view>
						<view class="flex-grow-1 tr">
							<text class="fs24 col4">¥</text>
							<text class="fs40 fwb col4">{{ formatPrice(totalAmount) }}</text>
						</view>
					</view>
					<view class="fs24 col9 mt15 lh36">
						平台将在履约期结束后，扣除个税后打款至您的账户
					</view>
				</view>

				<!-- 厂家奖金详情弹窗 -->
				<view class="box mb30" v-if="showBonusDetail">
					<view class="flex-box mb20">
						<view class="fs34 fwb col1 lh36 flex-grow-1">厂家奖金详情</view>
						<view class="fs24 col9" @click="showBonusDetail = false">收起</view>
					</view>
					<view class="bonus-detail-card" v-for="(item, idx) in bonusRules" :key="idx"
						:class="{ mb15: idx < bonusRules.length - 1 }">
						<view class="flex-box">
							<view class="flex-grow-1">
								<view class="fs28 col1">{{ item.title }}</view>
								<view class="fs24 col9 mt5">{{ item.condition }}</view>
							</view>
							<view class="tr">
								<view class="fs28 fwb" :class="item.achieved ? 'col4' : 'col9'">
									¥{{ formatPrice(item.amount) }}
								</view>
								<view class="fs22 mt5" :class="item.achieved ? 'col-achieved' : 'col9'">
									{{ item.achieved ? '已达成' : '未达成' }}
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 物流返佣详情弹窗 -->
				<view class="box mb30" v-if="showRebateDetail">
					<view class="flex-box mb20">
						<view class="fs34 fwb col1 lh36 flex-grow-1">物流返佣详情</view>
						<view class="fs24 col9" @click="showRebateDetail = false">收起</view>
					</view>
					<view class="rebate-info">
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">物流公司</view>
							<view class="flex-grow-1 tr fs28 col1">{{ rebateInfo.companyName || '待选择' }}</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">返佣比例</view>
							<view class="flex-grow-1 tr fs28 col1">{{ rebateInfo.rate || 0 }}%</view>
						</view>
						<view class="detail-row flex-box bb">
							<view class="col5 fs28">返佣金额</view>
							<view class="flex-grow-1 tr fs28 fwb col4">¥{{ formatPrice(orderInfo.logisticsRebate) }}</view>
						</view>
						<view class="detail-row flex-box">
							<view class="col5 fs28">返佣状态</view>
							<view class="flex-grow-1 tr fs28" :class="orderInfo.state >= 5 ? 'col-achieved' : 'col9'">
								{{ orderInfo.state >= 6 ? '已到账' : (orderInfo.state >= 5 ? '已确认' : '待结算') }}
							</view>
						</view>
					</view>
					<view class="fs24 col9 mt15 lh36">
						选择平台合作物流可享受物流返佣，返佣将在订单结算时一并到账。物流签收后返佣状态变为"已确认"。
					</view>
				</view>

				<!-- 履约倒计时（状态3/4时显示） -->
				<view class="box mb30" v-if="orderInfo.state === 3 || orderInfo.state === 4">
					<view class="countdown-header flex-box">
						<view class="fs34 fwb col1 lh36 flex-grow-1">
							{{ orderInfo.state === 3 ? '合同上传倒计时' : '履约倒计时' }}
						</view>
						<view class="status-tag fs22" :class="orderInfo.state === 3 ? 'status-upload' : 'status-exec'">
							{{ orderInfo.state === 3 ? '待上传' : '履约中' }}
						</view>
					</view>
					<view class="countdown-box tc mt20">
						<view class="countdown-time">
							<text class="time-num">{{ countdownDisplay.hours }}</text>
							<text class="time-sep">:</text>
							<text class="time-num">{{ countdownDisplay.minutes }}</text>
							<text class="time-sep">:</text>
							<text class="time-num">{{ countdownDisplay.seconds }}</text>
						</view>
						<view class="fs24 col9 mt10">
							{{ orderInfo.state === 3 ? '请在倒计时结束前上传正式买卖合同' : '履约完成后佣金将自动结算' }}
						</view>
					</view>
				</view>

				<!-- 三流进度 -->
				<view class="box mb30">
					<view class="fs34 fwb col1 lh36 mb20">履约进度</view>

					<!-- 合同流 -->
					<view class="flow-item flex-box bb" @click="goContract">
						<view class="flow-icon-wrap" :class="{ done: orderInfo.state >= 3 }">
							<text class="fs22 colf">合</text>
						</view>
						<view class="flex-grow-1 ml15">
							<view class="fs28 col1">合同流</view>
							<view class="fs24 col9 mt5">{{ getContractFlowDesc() }}</view>
						</view>
						<view class="flow-status fs24" :class="{ 'col-done': orderInfo.state >= 3 }">
							{{ orderInfo.state >= 4 ? '已完成' : (orderInfo.state >= 3 ? '进行中' : '待处理') }}
						</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow ml10"></image>
					</view>

					<!-- 资金流 -->
					<view class="flow-item flex-box bb">
						<view class="flow-icon-wrap" :class="{ done: orderInfo.state >= 2 }"
							style="background: rgba(24,144,255,0.1);">
							<text class="fs22" :style="{ color: orderInfo.state >= 2 ? '#fff' : '#1890FF' }">资</text>
						</view>
						<view class="flex-grow-1 ml15">
							<view class="fs28 col1">资金流</view>
							<view class="fs24 col9 mt5">{{ getFundFlowDesc() }}</view>
						</view>
						<view class="flow-status fs24" :class="{ 'col-done': orderInfo.state >= 2 }">
							{{ orderInfo.state >= 6 ? '已结算' : (orderInfo.state >= 2 ? '已缴纳' : '待缴纳') }}
						</view>
					</view>

					<!-- 物流流 -->
					<view class="flow-item flex-box" @click="goLogistics">
						<view class="flow-icon-wrap" :class="{ done: orderInfo.state >= 5 }"
							style="background: rgba(82,196,26,0.1);">
							<text class="fs22" :style="{ color: orderInfo.state >= 5 ? '#fff' : '#52C41A' }">物</text>
						</view>
						<view class="flex-grow-1 ml15">
							<view class="fs28 col1">物流流</view>
							<view class="fs24 col9 mt5">{{ getLogisticsFlowDesc() }}</view>
						</view>
						<view class="flow-status fs24" :class="{ 'col-done': orderInfo.state >= 5 }">
							{{ orderInfo.state >= 5 ? '已签收' : (orderInfo.state >= 4 ? '运输中' : '待发货') }}
						</view>
						<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow ml10"></image>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="box mb30" v-if="getActions().length > 0">
					<view class="fs34 fwb col1 lh36 mb20">操作</view>
					<view v-for="(action, idx) in getActions()" :key="idx">
						<view class="action-btn flex-box" :class="{ bb: idx < getActions().length - 1 }"
							@click="onAction(action.type)">
							<view class="flex-grow-1 fs28 col1">{{ action.label }}</view>
							<view class="fs24 col9">{{ action.desc }}</view>
							<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow ml15"></image>
						</view>
					</view>
				</view>

				<!-- 已结算标识 -->
				<view class="box mb30 tc" v-if="orderInfo.state === 6">
					<view class="settled-badge">
						<view class="fs30 fwb" style="color: #52C41A;">已结算</view>
						<view class="fs24 col9 mt10">佣金已到账，保证金已退还</view>
					</view>
				</view>

				<!-- 提示文案 -->
				<view class="tip-box mb30" v-if="getTipText()">
					<view class="fs24 col9 lh40">
						<text class="fwb">说明：</text>
						{{ getTipText() }}
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
				orderId: '',
				orderInfo: {
					productName: '',
					coverImage: '/static/images/icon_upload_logo.png',
					companyName: '',
					orderNo: '',
					createTime: '',
					state: 0,
					commissionAmount: 0,
					commission: 0,
					depositRate: 10,
					factoryBonus: 0,
					logisticsRebate: 0,
					contractUploadHours: 24,
					executionHours: 72
				},
				countdownSeconds: 0,
				countdownTimer: null,
				showBonusDetail: false,
				showRebateDetail: false,
				bonusRules: [
					{ title: '完成5单奖励', condition: '累计完成5笔结算订单', amount: 500, achieved: true },
					{ title: '成交额达标奖', condition: '单笔订单成交额 ≥ ¥10,000', amount: 200, achieved: false },
					{ title: '月度优秀居间人', condition: '本月结算订单 ≥ 10笔', amount: 1000, achieved: false }
				],
				rebateInfo: {
					companyName: '极速达物流',
					rate: 2
				}
			}
		},
		computed: {
			totalAmount() {
				return (this.orderInfo.commissionAmount || 0) +
					(this.orderInfo.factoryBonus || 0) +
					(this.orderInfo.logisticsRebate || 0);
			},
			countdownDisplay() {
				let total = Math.max(0, this.countdownSeconds);
				let hours = Math.floor(total / 3600);
				let minutes = Math.floor((total % 3600) / 60);
				let seconds = total % 60;
				return {
					hours: String(hours).padStart(2, '0'),
					minutes: String(minutes).padStart(2, '0'),
					seconds: String(seconds).padStart(2, '0')
				};
			}
		},
		onLoad(options) {
			if (options.orderId) {
				this.orderId = options.orderId;
			}
			if (options.param) {
				try {
					let param = JSON.parse(decodeURIComponent(options.param));
					this.orderInfo = Object.assign(this.orderInfo, param);
				} catch (e) {
					console.log('param parse error', e);
				}
			}
			this.loadOrderDetail();
		},
		onUnload() {
			this.clearTimer();
		},
		methods: {
			loadOrderDetail() {
				this.$core.get({
					url: 'xiluxc.jj_order/detail',
					data: { order_id: this.orderId },
					loading: false,
					success: ret => {
						this.orderInfo = Object.assign(this.orderInfo, ret.data);
						this.initCountdown();
					},
					fail: () => {
						// 接口未就绪，使用URL参数中的Mock数据
						this.initMockData();
						this.initCountdown();
						return false;
					}
				});
			},

			initMockData() {
				// 根据状态补充Mock金额数据
				if (!this.orderInfo.factoryBonus) {
					this.orderInfo.factoryBonus = Math.round(this.orderInfo.commissionAmount * 0.05 * 100) / 100;
				}
				if (!this.orderInfo.logisticsRebate) {
					this.orderInfo.logisticsRebate = Math.round(this.orderInfo.commissionAmount * 0.02 * 100) / 100;
				}
			},

			initCountdown() {
				if (this.orderInfo.state === 3) {
					this.countdownSeconds = (this.orderInfo.contractUploadHours || 24) * 3600;
					this.startCountdown();
				} else if (this.orderInfo.state === 4) {
					this.countdownSeconds = (this.orderInfo.executionHours || 72) * 3600;
					this.startCountdown();
				}
			},

			startCountdown() {
				this.clearTimer();
				this.countdownTimer = setInterval(() => {
					if (this.countdownSeconds <= 0) {
						this.clearTimer();
						this.onCountdownEnd();
						return;
					}
					this.countdownSeconds--;
				}, 1000);
			},

			clearTimer() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer);
					this.countdownTimer = null;
				}
			},

			onCountdownEnd() {
				if (this.orderInfo.state === 3) {
					uni.showModal({
						title: '提示',
						content: '合同上传时间已到期',
						showCancel: false
					});
				} else if (this.orderInfo.state === 4) {
					this.orderInfo.state = 6;
					uni.showModal({
						title: '提示',
						content: '履约期已结束，佣金已自动结算，保证金已退还。',
						showCancel: false
					});
				}
			},

			getStatusBannerText(state) {
				const map = {
					0: '订单待确认',
					1: '待缴纳保证金',
					2: '保证金已缴纳',
					3: '合同上传中',
					4: '履约执行中',
					5: '待结算',
					6: '已结算',
					7: '已取消',
					8: '已逾期'
				};
				return map[state] || '未知状态';
			},

			getStatusBannerDesc(state) {
				const map = {
					1: '请尽快缴纳保证金以锁定佣金',
					3: '请在规定时间内上传买卖合同',
					4: '工厂正在处理订单，请耐心等待',
					5: '物流已签收，等待工厂确认放款',
					6: '佣金已到账，感谢您的服务'
				};
				return map[state] || '';
			},

			getContractFlowDesc() {
				if (this.orderInfo.state >= 4) return '买卖合同已上传';
				if (this.orderInfo.state >= 3) return '等待上传买卖合同（PDF）';
				return '缴纳保证金后开始';
			},

			getFundFlowDesc() {
				if (this.orderInfo.state >= 6) return '佣金已结算到账';
				if (this.orderInfo.state >= 2) return '保证金已冻结至托管账户';
				return '待缴纳履约保证金';
			},

			getLogisticsFlowDesc() {
				if (this.orderInfo.state >= 5) return '货物已签收';
				if (this.orderInfo.state >= 4) return '物流运输中';
				return '合同确认后安排发货';
			},

			getActions() {
				let actions = [];
				switch (this.orderInfo.state) {
					case 1:
						actions.push({ type: 'deposit', label: '去缴纳保证金', desc: '锁定佣金' });
						break;
					case 3:
						actions.push({ type: 'contract', label: '去上传合同', desc: '上传买卖合同' });
						break;
					case 4:
						actions.push({ type: 'logistics', label: '查看物流', desc: '查看物流跟踪信息' });
						actions.push({ type: 'urge', label: '催促工厂', desc: '发送催促通知' });
						break;
					case 5:
						actions.push({ type: 'logistics', label: '查看物流', desc: '查看物流跟踪信息' });
						break;
					case 6:
						actions.push({ type: 'logistics', label: '查看物流', desc: '查看历史物流信息' });
						break;
				}
				return actions;
			},

			getTipText() {
				const map = {
					1: '保证金将冻结至托管账户，履约完成后全额退还。逾期未上传合同，保证金将自动划转给工厂。',
					3: '请在倒计时结束前上传正式买卖合同，逾期未传合同保证金将自动划转给工厂。',
					4: '工厂点击【同意放款】或倒计时结束后，系统将自动结算佣金并退还保证金至您的账户。',
					5: '物流已签收，等待工厂确认后系统将自动放款。如有异常请联系平台客服。'
				};
				return map[this.orderInfo.state] || '';
			},

			onAction(type) {
				let param;
				switch (type) {
					case 'deposit':
						param = encodeURIComponent(JSON.stringify({
							productName: this.orderInfo.productName,
							coverImage: this.orderInfo.coverImage,
							companyName: this.orderInfo.companyName,
							commission: this.orderInfo.commission,
							commissionAmount: this.orderInfo.commissionAmount,
							depositRate: this.orderInfo.depositRate
						}));
						uni.navigateTo({
							url: '/pages/jj/jj_deposit/jj_deposit?orderId=' + this.orderId + '&param=' + param
						});
						break;
					case 'contract':
						param = encodeURIComponent(JSON.stringify({
							productName: this.orderInfo.productName,
							coverImage: this.orderInfo.coverImage,
							companyName: this.orderInfo.companyName
						}));
						uni.navigateTo({
							url: '/pages/jj/jj_contract/jj_contract?orderId=' + this.orderId + '&param=' + param
						});
						break;
					case 'logistics':
						uni.navigateTo({
							url: '/pages/jj/jj_logistics/jj_logistics?orderId=' + this.orderId
						});
						break;
					case 'urge':
						this.$core.post({
							url: 'xiluxc.jj_order/urge_factory',
							data: { order_id: this.orderId },
							success: () => {
								uni.showToast({ title: '催促通知已发送', icon: 'success' });
							},
							fail: () => {
								uni.showToast({ title: '催促通知已发送', icon: 'success' });
								return false;
							}
						});
						break;
				}
			},

			goContract() {
				if (this.orderInfo.state >= 3) {
					let param = encodeURIComponent(JSON.stringify({
						productName: this.orderInfo.productName,
						coverImage: this.orderInfo.coverImage,
						companyName: this.orderInfo.companyName
					}));
					uni.navigateTo({
						url: '/pages/jj/jj_contract/jj_contract?orderId=' + this.orderId + '&param=' + param
					});
				}
			},

			goLogistics() {
				if (this.orderInfo.state >= 4) {
					uni.navigateTo({
						url: '/pages/jj/jj_logistics/jj_logistics?orderId=' + this.orderId
					});
				}
			},

			goFactoryBonus() {
				this.showBonusDetail = !this.showBonusDetail;
				this.showRebateDetail = false;
			},

			goLogisticsRebate() {
				this.showRebateDetail = !this.showRebateDetail;
				this.showBonusDetail = false;
			},

			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

	/* 状态横幅 */
	.status-banner {
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
	}

	.banner-1 {
		background: linear-gradient(135deg, #FAAD14, #FA8C16);
	}

	.banner-2,
	.banner-3 {
		background: linear-gradient(135deg, #1890FF, #096DD9);
	}

	.banner-4 {
		background: linear-gradient(135deg, #52C41A, #389E0D);
	}

	.banner-5 {
		background: linear-gradient(135deg, #13C2C2, #08979C);
	}

	.banner-6 {
		background: linear-gradient(135deg, #8C8C8C, #595959);
	}

	.banner-7,
	.banner-8 {
		background: linear-gradient(135deg, #FF4D4F, #CF1322);
	}

	.banner-0 {
		background: linear-gradient(135deg, #BFBFBF, #8C8C8C);
	}

	.colf {
		color: #FFFFFF;
	}

	/* 佣金锁定横幅 */
	.lock-banner {
		background: linear-gradient(135deg, #FFF7E6, #FFFFFF);
		border: 2rpx solid #FFD591;
	}

	.lock-icon-wrap {
		width: 56rpx;
		height: 56rpx;
		background: #FE4B01;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.product-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	.detail-row {
		padding: 24rpx 0;
	}

	/* 倒计时 */
	.countdown-header {
		align-items: center;
	}

	.status-tag {
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
	}

	.status-upload {
		background: rgba(250, 173, 20, 0.1);
		color: #FAAD14;
	}

	.status-exec {
		background: rgba(82, 196, 26, 0.1);
		color: #52C41A;
	}

	.countdown-box {
		background: #F5F7FB;
		border-radius: 16rpx;
		padding: 30rpx 0;
	}

	.countdown-time {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.time-num {
		display: inline-block;
		width: 80rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background: #FE4B01;
		color: #FFFFFF;
		font-size: 36rpx;
		font-weight: bold;
		border-radius: 12rpx;
	}

	.time-sep {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin: 0 10rpx;
	}

	/* 三流进度 */
	.flow-item {
		padding: 28rpx 0;
		align-items: center;
	}

	.flow-icon-wrap {
		width: 56rpx;
		height: 56rpx;
		background: rgba(254, 75, 1, 0.1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		&.done {
			background: #52C41A;
		}
	}

	.flow-status {
		color: #999999;
		flex-shrink: 0;
	}

	.col-done {
		color: #52C41A;
	}

	.cell-arrow {
		width: 24rpx;
		height: 24rpx;
		flex-shrink: 0;
	}

	/* 操作按钮 */
	.action-btn {
		padding: 28rpx 0;
		align-items: center;
	}

	.detail-clickable {
		align-items: center;
	}

	/* 厂家奖金详情 */
	.bonus-detail-card {
		background: #F9FAFB;
		border-radius: 12rpx;
		padding: 20rpx;
	}

	.col-achieved {
		color: #52C41A;
	}

	/* 已结算标识 */
	.settled-badge {
		padding: 20rpx 0;
	}

	.tip-box {
		background: #FFFBE6;
		border-radius: 12rpx;
		padding: 24rpx;
		border-left: 6rpx solid #FAAD14;
	}

	/* PC 端适配 */
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

		.status-banner {
			padding: 32px 24px;
			border-radius: 12px;
		}

		.detail-row {
			padding: 16px 0;
		}

		.flow-item {
			padding: 18px 0;
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}

		.action-btn {
			padding: 18px 0;
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}

		.detail-clickable {
			cursor: pointer;

			&:hover {
				background: #F9FAFB;
			}
		}

		.bonus-detail-card {
			padding: 16px;
			border-radius: 8px;
		}

		.countdown-box {
			padding: 24px 0;
			border-radius: 12px;
		}

		.time-num {
			width: 56px;
			height: 56px;
			line-height: 56px;
			font-size: 24px;
			border-radius: 8px;
		}

		.time-sep {
			font-size: 24px;
			margin: 0 8px;
		}

		.tip-box {
			border-radius: 8px;
			padding: 16px;
		}
	}
</style>
