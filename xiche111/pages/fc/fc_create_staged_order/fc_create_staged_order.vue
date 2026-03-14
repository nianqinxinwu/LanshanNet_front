<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 交付模式选择 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">交付模式</view>
				<view class="delivery-modes">
					<view class="mode-card" :class="{ active: deliveryMode === 1 }" @click="deliveryMode = 1">
						<view class="mode-icon" :class="{ active: deliveryMode === 1 }">
							<text class="fs28 colf">一</text>
						</view>
						<view class="mode-info">
							<view class="fs28 fwb col1">一次性交付</view>
							<view class="fs22 col9 mt5">订单完成后一次性结算佣金</view>
						</view>
					</view>
					<view class="mode-card" :class="{ active: deliveryMode === 2 }" @click="selectStagedMode">
						<view class="mode-icon staged" :class="{ active: deliveryMode === 2 }">
							<text class="fs28 colf">分</text>
						</view>
						<view class="mode-info">
							<view class="fs28 fwb col1">分阶段交付</view>
							<view class="fs22 col9 mt5">分多个阶段进行，每阶段独立结算</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 阶段数量设置（仅分阶段模式） -->
			<view class="jj-box mb30" v-if="deliveryMode === 2">
				<view class="fs34 fwb col1 lh36 mb20">
					阶段设置
					<text class="fs24 col-red ml10">*</text>
				</view>
				<view class="stage-count-selector">
					<view class="fs28 col5 mb15">阶段数量</view>
					<view class="count-buttons">
						<view v-for="count in [3, 5, 8, 10]" :key="count"
							class="count-btn" :class="{ active: totalStages === count }"
							@click="totalStages = count">
							{{ count }}阶段
						</view>
					</view>
					<view class="custom-count mt20">
						<view class="fs28 col5 mb10">自定义阶段数</view>
						<input v-model.number="customStages" type="number" placeholder="输入3-20之间的数字"
							class="custom-input" @blur="setCustomStages" />
					</view>
				</view>

				<!-- 阶段名称自定义（可选） -->
				<view class="mt30" v-if="totalStages > 0">
					<view class="fs28 col5 mb15">
						阶段名称 <text class="fs22 col9">(可选，留空则自动命名)</text>
					</view>
					<view v-for="n in totalStages" :key="n" class="stage-name-item mb15">
						<view class="stage-label fs26 col9">第{{ n }}阶段</view>
						<input v-model="stageNames[n-1]" :placeholder="'第' + n + '阶段'"
							class="stage-name-input" maxlength="20" />
					</view>
				</view>
			</view>

			<!-- 商品选择 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">
					选择商品
					<text class="fs24 col-red ml10">*</text>
				</view>
				<view class="product-selector" @click="selectProduct">
					<view v-if="!selectedProduct" class="placeholder fs28 col9">
						点击选择商品
					</view>
					<view v-else class="selected-product">
						<view class="fs28 col1 fwb">{{ selectedProduct.name }}</view>
						<view class="fs24 col5 mt5">单价：¥{{ formatPrice(selectedProduct.price) }}</view>
					</view>
					<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="arrow-icon"></image>
				</view>
			</view>

			<!-- 居间人选择 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">
					选择居间人
					<text class="fs24 col-red ml10">*</text>
				</view>
				<view class="agent-selector" @click="selectAgent">
					<view v-if="!selectedAgent" class="placeholder fs28 col9">
						点击选择居间人
					</view>
					<view v-else class="selected-agent flex-box">
						<image :src="selectedAgent.avatar" mode="aspectFill" class="agent-avatar"></image>
						<view class="flex-grow-1 ml15">
							<view class="fs28 col1 fwb">{{ selectedAgent.nickname }}</view>
							<view class="fs24 col5 mt5">佣金比例：{{ selectedAgent.commission_rate }}%</view>
						</view>
					</view>
					<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="arrow-icon"></image>
				</view>
			</view>

			<!-- 数量和金额 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">订单信息</view>
				<view class="info-row bb">
					<view class="col5 fs28">数量</view>
					<view class="flex-grow-1 tr">
						<input v-model.number="quantity" type="number" placeholder="请输入数量"
							class="quantity-input" @input="calculateAmount" />
					</view>
				</view>
				<view class="info-row bb" v-if="selectedProduct && quantity > 0">
					<view class="col5 fs28">订单总额</view>
					<view class="col1 fs28 fwb">¥{{ formatPrice(totalAmount) }}</view>
				</view>
				<view class="info-row bb" v-if="selectedAgent && totalAmount > 0">
					<view class="col5 fs28">佣金金额</view>
					<view class="fs28 fwb" style="color:#1890FF;">¥{{ formatPrice(commissionAmount) }}</view>
				</view>
				<view class="info-row" v-if="totalAmount > 0">
					<view class="col5 fs28">技术服务费</view>
					<view class="fs28" style="color:#FF4D4F;">¥{{ formatPrice(serviceFee) }}</view>
				</view>
			</view>

			<!-- 阶段模式提示 -->
			<view class="jj-box mb30" v-if="deliveryMode === 2 && totalStages > 0">
				<view class="tip-box">
					<view class="fs28 fwb mb10" style="color:#1890FF;">📌 分阶段交付说明</view>
					<view class="fs24 col5 lh36">
						• 订单将分为 <text class="fwb col1">{{ totalStages }}个阶段</text> 进行交付<br/>
						• 每个阶段由居间人上传付款证明后，您进行审核<br/>
						• 审核通过后，客服将根据实际情况填写放款金额<br/>
						• <text class="fwb col1">技术服务费仅在第1阶段扣除一次</text><br/>
						• 各阶段完成后自动进入下一阶段
					</view>
				</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-btn-wrap">
				<view class="submit-btn" @click="submitOrder" :class="{ disabled: !canSubmit }">
					<text class="fs32 colf fwb">创建订单</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			deliveryMode: 1, // 1=一次性 2=分阶段
			totalStages: 0,
			customStages: '',
			stageNames: [],
			selectedProduct: null,
			selectedAgent: null,
			quantity: 0,
			totalAmount: 0,
			commissionAmount: 0,
			serviceFee: 0,
			serviceFeeRate: 3, // 3%技术服务费
			submitting: false
		}
	},
	computed: {
		canSubmit() {
			if (this.submitting) return false;
			if (!this.selectedProduct || !this.selectedAgent || this.quantity <= 0) return false;
			if (this.deliveryMode === 2 && (this.totalStages < 3 || this.totalStages > 20)) return false;
			return true;
		}
	},
	methods: {
		selectStagedMode() {
			this.deliveryMode = 2;
			if (this.totalStages === 0) {
				this.totalStages = 5; // 默认5阶段
			}
		},
		setCustomStages() {
			const val = parseInt(this.customStages);
			if (val >= 3 && val <= 20) {
				this.totalStages = val;
			} else if (this.customStages !== '') {
				uni.showToast({ title: '阶段数需在3-20之间', icon: 'none' });
			}
		},
		selectProduct() {
			// 跳转到商品选择页面或弹出选择框
			uni.navigateTo({
				url: '/pages/fc/fc_product_select/fc_product_select?callback=onProductSelected'
			});
		},
		selectAgent() {
			// 跳转到居间人选择页面
			uni.navigateTo({
				url: '/pages/fc/fc_agent_select/fc_agent_select?callback=onAgentSelected'
			});
		},
		onProductSelected(product) {
			this.selectedProduct = product;
			this.calculateAmount();
		},
		onAgentSelected(agent) {
			this.selectedAgent = agent;
			this.calculateAmount();
		},
		calculateAmount() {
			if (!this.selectedProduct || this.quantity <= 0) {
				this.totalAmount = 0;
				this.commissionAmount = 0;
				this.serviceFee = 0;
				return;
			}

			this.totalAmount = this.selectedProduct.price * this.quantity;

			if (this.selectedAgent) {
				this.commissionAmount = this.totalAmount * (this.selectedAgent.commission_rate / 100);
				this.serviceFee = this.commissionAmount * (this.serviceFeeRate / 100);
			}
		},
		submitOrder() {
			if (!this.canSubmit) return;

			const data = {
				product_id: this.selectedProduct.id,
				agent_id: this.selectedAgent.id,
				quantity: this.quantity,
				delivery_mode: this.deliveryMode
			};

			if (this.deliveryMode === 2) {
				data.total_stages = this.totalStages;
				// 过滤空名称
				const names = this.stageNames.filter(n => n && n.trim());
				if (names.length > 0) {
					data.stage_names = names;
				}
			}

			uni.showModal({
				title: '确认创建',
				content: `确定创建${this.deliveryMode === 1 ? '一次性' : this.totalStages + '阶段'}订单吗？`,
				success: (res) => {
					if (res.confirm) {
						this.doSubmit(data);
					}
				}
			});
		},
		doSubmit(data) {
			this.submitting = true;
			uni.showLoading({ title: '创建中...' });

			const apiPath = this.deliveryMode === 2
				? '/api/xiluxc/FcOrder/create_staged_order'
				: '/api/xiluxc/FcOrder/create_order';

			uni.request({
				url: this.$baseUrl + apiPath,
				method: 'POST',
				header: {
					token: uni.getStorageSync('token')
				},
				data: data,
				success: (res) => {
					uni.hideLoading();
					if (res.data.code === 1) {
						uni.showToast({ title: '创建成功', icon: 'success' });
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({ title: res.data.msg || '创建失败', icon: 'none' });
					}
				},
				fail: () => {
					uni.hideLoading();
					uni.showToast({ title: '网络错误', icon: 'none' });
				},
				complete: () => {
					this.submitting = false;
				}
			});
		},
		formatPrice(price) {
			return Number(price || 0).toFixed(2);
		}
	}
}
</script>

<style scoped>
.delivery-modes {
	display: flex;
	gap: 20rpx;
}
.mode-card {
	flex: 1;
	padding: 30rpx 20rpx;
	border-radius: 12rpx;
	border: 2rpx solid #D9D9D9;
	background: #FAFAFA;
	display: flex;
	flex-direction: column;
	align-items: center;
	transition: all 0.3s;
}
.mode-card.active {
	border-color: #1890FF;
	background: rgba(24,144,255,0.05);
}
.mode-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: #D9D9D9;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 15rpx;
}
.mode-icon.active {
	background: #1890FF;
}
.mode-icon.staged.active {
	background: linear-gradient(135deg, #1890FF 0%, #52C41A 100%);
}
.mode-info {
	text-align: center;
}

.stage-count-selector {
	padding: 20rpx;
	background: #F7F9FA;
	border-radius: 12rpx;
}
.count-buttons {
	display: flex;
	gap: 15rpx;
}
.count-btn {
	flex: 1;
	padding: 20rpx;
	text-align: center;
	border-radius: 8rpx;
	border: 2rpx solid #D9D9D9;
	background: #fff;
	font-size: 28rpx;
	color: #262626;
}
.count-btn.active {
	border-color: #1890FF;
	color: #1890FF;
	background: rgba(24,144,255,0.1);
	font-weight: bold;
}

.custom-count {
	padding: 20rpx;
	background: #fff;
	border-radius: 8rpx;
}
.custom-input {
	width: 100%;
	padding: 20rpx;
	border: 2rpx solid #D9D9D9;
	border-radius: 8rpx;
	font-size: 28rpx;
}

.stage-name-item {
	display: flex;
	align-items: center;
	gap: 20rpx;
}
.stage-label {
	width: 150rpx;
	flex-shrink: 0;
}
.stage-name-input {
	flex: 1;
	padding: 15rpx 20rpx;
	background: #FAFAFA;
	border-radius: 8rpx;
	border: 2rpx solid #D9D9D9;
	font-size: 26rpx;
}

.product-selector, .agent-selector {
	padding: 30rpx;
	background: #FAFAFA;
	border-radius: 12rpx;
	border: 2rpx solid #D9D9D9;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.placeholder {
	flex: 1;
}
.selected-product, .selected-agent {
	flex: 1;
}
.agent-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
}
.arrow-icon {
	width: 24rpx;
	height: 24rpx;
	margin-left: 15rpx;
}

.quantity-input {
	text-align: right;
	font-size: 28rpx;
	color: #262626;
	font-weight: bold;
}

.tip-box {
	padding: 20rpx;
	background: rgba(24,144,255,0.05);
	border-radius: 8rpx;
	border-left: 4rpx solid #1890FF;
}

.submit-btn-wrap {
	padding: 30rpx 0 60rpx;
}
.submit-btn {
	height: 96rpx;
	border-radius: 48rpx;
	background: linear-gradient(135deg, #1890FF 0%, #52C41A 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}
.submit-btn.disabled {
	background: #D9D9D9;
	opacity: 0.5;
}
</style>
