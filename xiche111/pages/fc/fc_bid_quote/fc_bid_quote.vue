<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" @click="onSubmit()">{{ quoteId ? '修改报价' : '提交报价' }}</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<!-- 竞标需求信息 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb20">竞标需求</view>
					<view class="info-row bb">
						<view class="col5 fs28">品类需求</view>
						<view class="col1 fs28">{{ bidInfo.categoryName }}</view>
					</view>
					<view class="info-row bb">
						<view class="col5 fs28">需求数量</view>
						<view class="col1 fs28">{{ bidInfo.quantity }}{{ bidInfo.unit }}</view>
					</view>
					<view class="info-row bb">
						<view class="col5 fs28">期望交货</view>
						<view class="col1 fs28">{{ bidInfo.expectDelivery }}</view>
					</view>
					<view class="info-row">
						<view class="col5 fs28">目标佣金</view>
						<view class="col1 fs28">¥{{ bidInfo.targetCommission }}</view>
					</view>
				</view>

				<!-- 72小时修改限制提示 -->
				<view class="notice-box mb30" v-if="quoteId">
					<view class="fs26 col4">提示：报价提交后72小时内可修改，超时将无法修改。</view>
				</view>

				<!-- 报价表单 -->
				<view class="jj-box mb30">
					<view class="fs34 fwb col1 lh36 mb30">报价信息</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">合同价(元)</view>
						<input type="digit" class="flex-grow-1 tr" v-model="contractPrice" placeholder="请输入合同价" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">交货日期</view>
						<picker mode="date" @change="onDateChange">
							<view class="flex-grow-1 tr" :class="deliveryDate ? 'col1' : 'cola'">{{ deliveryDate || '请选择交货日期' }}</view>
						</picker>
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">佣金总额</view>
						<view class="flex-grow-1 tr col9">{{ commissionAmount ? '¥' + commissionAmount : '提交后自动计算' }}</view>
					</view>
					<view class="inp_nav-textarea">
						<view class="col5 fs28 mb10">备注</view>
						<textarea class="textarea" v-model="remark" placeholder="请输入备注信息（选填）" placeholder-class="cola" maxlength="200" />
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
				bidId: '',
				quoteId: '',
				bidInfo: {
					categoryName: '',
					quantity: 0,
					unit: '件',
					expectDelivery: '',
					targetCommission: '0.00'
				},
				contractPrice: '',
				deliveryDate: '',
				commissionAmount: '',
				remark: ''
			}
		},
		onLoad(options) {
			if (options) {
				this.bidId = options.bidId || '';
			}
			this.loadBidInfo();
		},
		methods: {
			loadBidInfo() {
				this.$core.get({
					url: 'xiluxc.fc_bid/detail',
					data: { bid_id: this.bidId },
					success: ret => {
						let d = ret.data;
						this.bidInfo.categoryName = d.category_name || '';
						this.bidInfo.quantity = d.quantity || 0;
						this.bidInfo.unit = d.unit || '件';
						this.bidInfo.expectDelivery = d.expect_delivery || '';
						this.bidInfo.targetCommission = d.target_commission || '0.00';
						if (d.my_quote && d.my_quote.status > 0) {
							this.contractPrice = d.my_quote.contract_price ? String(d.my_quote.contract_price) : '';
							this.deliveryDate = d.my_quote.delivery_date || '';
							this.remark = d.my_quote.remark || '';
							this.quoteId = d.my_quote.id || '';
							if (d.my_quote.commission_amount) {
								this.commissionAmount = d.my_quote.commission_amount;
							}
						}
					}
				});
			},
			onDateChange(e) {
				this.deliveryDate = e.detail.value;
			},
			onSubmit() {
				if (!this.contractPrice) {
					uni.showToast({ title: '请输入合同价', icon: 'none' });
					return;
				}
				if (!this.deliveryDate) {
					uni.showToast({ title: '请选择交货日期', icon: 'none' });
					return;
				}

				let url = this.quoteId ? 'xiluxc.fc_bid/update_quote' : 'xiluxc.fc_bid/submit_quote';
				let data = {
					bid_id: this.bidId,
					contract_price: this.contractPrice,
					delivery_date: this.deliveryDate,
					remark: this.remark
				};

				this.$core.post({
					url: url,
					data: data,
					success: ret => {
						if (ret.data && ret.data.commission_amount) {
							this.commissionAmount = ret.data.commission_amount;
						}
						uni.showToast({ title: this.quoteId ? '修改成功' : '报价成功', icon: 'success' });
						setTimeout(() => { uni.navigateBack(); }, 1500);
					}
				});
			},
			formatPrice(price) {
				if (!price && price !== 0) return '0.00';
				return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 24rpx 0;
	}

	.notice-box {
		background: rgba(254, 75, 1, 0.05);
		border: 1px solid rgba(254, 75, 1, 0.2);
		border-radius: 15rpx;
		padding: 20rpx 24rpx;
	}

	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;

		.label {
			width: 180rpx;
		}
	}

	.inp_nav-textarea {
		padding: 24rpx 0;
	}

	.textarea {
		width: 100%;
		min-height: 160rpx;
		font-size: 28rpx;
		padding: 20rpx;
		background: #F5F8FC;
		border-radius: 15rpx;
		box-sizing: border-box;
	}

	.foot_nav {
		padding: 10rpx 30rpx;
	}

	@media screen and (min-width: 768px) {
		.inp_nav {
			height: auto;
			padding: 14px 0;
		}

		.textarea {
			min-height: 100px;
			font-size: 14px;
		}

		.foot_nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
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
