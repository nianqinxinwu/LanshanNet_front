<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 状态进度条 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">订单状态</view>
				<view class="progress-steps">
					<view class="step" v-for="(step, idx) in steps" :key="idx" :class="{ 'step-active': order.state >= step.value, 'step-current': order.state === step.value }">
						<view class="step-dot"></view>
						<view class="step-label fs22">{{ step.label }}</view>
						<view class="step-line" v-if="idx < steps.length - 1"></view>
					</view>
				</view>
			</view>

			<!-- 订单基本信息 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">订单信息</view>
				<view class="info-row bb">
					<view class="col5 fs28">订单编号</view>
					<view class="col1 fs28">{{ order.orderNo }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">下单时间</view>
					<view class="col1 fs28">{{ order.createTime }}</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28">订单状态</view>
					<view class="fs28" :class="'status-color-' + order.state">{{ getStateName(order.state) }}</view>
				</view>
			</view>

			<!-- 商品信息 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">商品信息</view>
				<view class="flex-box">
					<image :src="order.coverImage" mode="aspectFill" class="order-cover"></image>
					<view class="flex-grow-1 ml20">
						<view class="fs28 fwb col1">{{ order.productName }}</view>
						<view class="fs24 col9 mt10">¥{{ order.unitPrice }} × {{ order.quantity }}</view>
					</view>
					<view class="tr ml15" style="flex-shrink:0;">
						<view class="fs22 col9">订单总额</view>
						<view class="fs30 fwb col4 mt6">¥{{ order.totalAmount }}</view>
					</view>
				</view>
			</view>

			<!-- 居间人信息 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">居间人信息</view>
				<view class="info-row bb">
					<view class="col5 fs28">居间人</view>
					<view class="col1 fs28">{{ order.agentName }}</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28">联系电话</view>
					<view class="col1 fs28">{{ order.agentMobile }}</view>
				</view>
			</view>

			<!-- 佣金信息 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">佣金信息</view>
				<view class="info-row bb">
					<view class="col5 fs28">佣金比例</view>
					<view class="col1 fs28">{{ order.commissionRate }}%</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">佣金总额</view>
					<view class="col4 fs28 fwb">¥{{ order.commissionAmount }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">锁定状态</view>
					<view class="fs28" :class="order.commissionLocked ? 'col2' : 'col4'">{{ order.commissionLocked ? '已锁定' : '未锁定' }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">保证金比例</view>
					<view class="col1 fs28">{{ order.depositRate }}%</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">保证金金额</view>
					<view class="col4 fs28 fwb">¥{{ order.depositAmount }}</view>
				</view>
				<view class="info-row bb">
					<view class="col5 fs28">技术服务费比例</view>
					<view class="col1 fs28">{{ order.serviceFeeRate }}%</view>
				</view>
				<view class="info-row">
					<view class="col5 fs28">技术服务费</view>
					<view class="col4 fs28 fwb">¥{{ order.serviceFee }}</view>
				</view>
			</view>

			<!-- 状态操作区 -->
			<!-- 状态0：确认接单 -->
			<view class="jj-box mb30" v-if="order.state === 0">
				<view class="fs34 fwb col1 lh36 mb20">确认接单</view>
				<view class="fs28 col5 mb20">请确认是否接受此订单，确认后将进入保证金缴纳流程。</view>
				<view class="action-btn-full" @click="confirmOrder">确认接单</view>
			</view>

			<!-- 状态1：缴纳佣金及服务费 -->
			<view class="jj-box mb30" v-if="order.state === 1">
				<view class="fs34 fwb col1 lh36 mb20">缴纳佣金及服务费</view>
				<view class="detail-row bb">
					<view class="col5 fs28">佣金金额</view>
					<view class="col1 fs28">¥{{ order.commissionAmount }}</view>
				</view>
				<view class="detail-row bb">
					<view class="col5 fs28">技术服务费</view>
					<view class="col1 fs28">¥{{ order.serviceFee }}</view>
				</view>
				<view class="detail-row bb">
					<view class="col5 fs28 fwb">合计缴纳</view>
					<view class="col4 fs28 fwb">¥{{ formatPrice(Number(order.commissionAmount.replace(/,/g,'')) + Number(order.serviceFee.replace(/,/g,''))) }}</view>
				</view>
				<view class="detail-row" @click="showContractPopup = true">
					<view class="col-warn fs28 fwb">请选择合同上传期限</view>
					<view class="col4 fs28">{{ contractUploadHours ? contractHoursLabel : '请选择' }} ></view>
				</view>
				<view class="fs28 col5 mt20 mb20">确认缴纳后，佣金及服务费将从钱包中冻结至托管账户。</view>
				<view class="action-btn-full" @click="payCommission">缴纳佣金及服务费</view>
			</view>

			<!-- 状态2：锁定佣金 -->
			<view class="jj-box mb30" v-if="order.state === 2">
				<view class="fs34 fwb col1 lh36 mb20">锁定佣金</view>
				<view class="countdown-box mb20" v-if="order.lockDeadline">
					<view class="fs28 col4">锁定倒计时</view>
					<view class="fs36 fwb col4 mt10">{{ lockCountdown }}</view>
				</view>
				<view class="detail-row bb">
					<view class="col5 fs28">佣金金额</view>
					<view class="col1 fs28">¥{{ order.commissionAmount }}</view>
				</view>
				<view class="detail-row bb">
					<view class="col5 fs28">技术服务费</view>
					<view class="col1 fs28">¥{{ order.serviceFee }}</view>
				</view>
				<view class="detail-row bb">
					<view class="col5 fs28 fwb">合计冻结</view>
					<view class="col4 fs28 fwb">¥{{ formatPrice(Number(order.commissionAmount.replace(/,/g,'')) + Number(order.serviceFee.replace(/,/g,''))) }}</view>
				</view>
				<view class="detail-row" @click="showContractPopup = true">
					<view class="col-warn fs28 fwb">请选择合同上传期限</view>
					<view class="col4 fs28">{{ contractUploadHours ? contractHoursLabel : '请选择' }} ></view>
				</view>
				<view class="fs28 col5 mt20 mb20">请在2小时内完成佣金锁定，超时订单将自动取消。确认后佣金及服务费将从钱包中冻结至托管账户。</view>
				<view class="action-btn-full" @click="lockCommission">锁定佣金</view>
			</view>

			<!-- 状态3：待上传合同 / 合同审核 -->
			<view class="jj-box mb30" v-if="order.state === 3">
				<view class="fs34 fwb col1 lh36 mb20">
					{{ (order.contractInfo && order.contractInfo.status >= 1) ? '合同审核' : '等待合同上传' }}
				</view>
				<view class="fs28 col5 mb16" v-if="contractUploadHours">合同上传期限：{{ contractUploadHours }}小时</view>
				<template v-if="order.contractInfo && order.contractInfo.status >= 1">
					<!-- 合同文件卡片 -->
					<view class="contract-file-card mb20" v-if="order.contractInfo.file_url">
						<view class="flex-box" style="align-items:center;">
							<view class="contract-file-icon">
								<view class="fs22 colf">PDF</view>
							</view>
							<view class="flex-grow-1 ml20">
								<view class="fs28 col1 fwb m-ellipsis">{{ order.contractInfo.file_name || '买卖合同.pdf' }}</view>
								<view class="fs24 col9 mt5">居间人已上传</view>
							</view>
						</view>
						<view class="contract-file-actions flex-box mt20" style="gap: 20rpx;">
							<view class="preview-btn flex-grow-1 tc" @click="previewContract">在线查看</view>
							<view class="download-btn flex-grow-1 tc" @click="downloadContract">下载合同</view>
						</view>
					</view>
					<!-- 付款期限选择 -->
					<view class="detail-row" @click="showUrgePopup = true">
						<view class="col5 fs28 fwb">买家付款期限</view>
						<view class="col4 fs28">{{ paymentUrgeDays ? paymentUrgeDaysLabel : '请选择' }} ></view>
					</view>
					<view class="flex-box mt20" style="gap: 20rpx;">
						<view class="reject-btn flex-grow-1" @click="reviewContract('reject')">驳回</view>
						<view class="approve-btn flex-grow-1" @click="reviewContract('approve')">审核通过</view>
					</view>
				</template>
				<template v-else>
					<view class="fs28 col9 tc ptb30">等待居间人上传合同</view>
				</template>
			</view>

			<!-- 状态4：履约执行 -->
			<view class="jj-box mb30" v-if="order.state === 4">
				<!-- 买家付款凭证未上传 -->
				<template v-if="!order.paymentProof">
					<view class="fs34 fwb col1 lh36 mb20">等待买家付款</view>
					<view class="waiting-box tc ptb30">
						<view class="fs28 col9">买家尚未上传付款凭证</view>
						<view class="fs24 col9 mt10">付款凭证上传后可查看并安排发货</view>
					</view>
				</template>

				<!-- 买家付款凭证已上传 -->
				<template v-else>
					<view class="fs34 fwb col1 lh36 mb20">确认发货</view>

					<!-- 付款凭证查看区 -->
					<view class="proof-card mb20">
						<view class="flex-box mb10" style="align-items:center;">
							<view class="proof-status-dot" :class="'proof-status-' + order.paymentProof.status"></view>
							<view class="fs28 fwb col1 ml10">买家付款凭证</view>
							<view class="flex-grow-1 tr fs24" :class="order.paymentProof.status == 1 ? 'col4' : 'col9'">
								{{ order.paymentProof.status_text || '已上传' }}
							</view>
						</view>
						<view class="fs24 col9" v-if="order.paymentProof.remark">备注：{{ order.paymentProof.remark }}</view>

						<!-- 凭证文件列表 -->
						<view class="proof-files mt15" v-if="order.paymentProof.file_urls && order.paymentProof.file_urls.length">
							<view class="proof-file-item flex-box mb10" v-for="(fileUrl, fIdx) in order.paymentProof.file_urls" :key="fIdx">
								<view class="proof-file-icon">
									<text class="fs20 colf">{{ isFilePdf(fileUrl) ? 'PDF' : '图' }}</text>
								</view>
								<view class="flex-grow-1 ml15 fs24 col1 m-ellipsis">{{ getFileNameFromUrl(fileUrl) }}</view>
								<view class="fs24 col4 ml15" @click="previewProofFile(fileUrl)">查看</view>
								<view class="fs24 ml15" style="color:#52C41A;" @click="downloadProofFile(fileUrl)">下载</view>
							</view>
						</view>
					</view>

					<!-- 物流方式展示 -->
					<view class="fs28 fwb col1 mb15">物流方式</view>

					<!-- 自提模式 -->
					<template v-if="order.paymentProof.logistics_method === 'pickup'">
						<view class="pickup-info-card mb20">
							<view class="flex-box" style="align-items:center;">
								<view class="pickup-icon-box">
									<text class="fs24 colf">提</text>
								</view>
								<view class="flex-grow-1 ml15">
									<view class="fs28 fwb col1">买家自提</view>
									<view class="fs24 col9 mt5">买家将自行到厂提货，确认后系统自动结算</view>
								</view>
							</view>
						</view>
					</template>

					<!-- 工厂代发模式 -->
					<template v-else-if="order.paymentProof.logistics_method === 'factory_ship'">
						<view class="ship-info-card mb20">
							<view class="flex-box mb15" style="align-items:center;">
								<view class="ship-icon-box">
									<text class="fs24 colf">发</text>
								</view>
								<view class="flex-grow-1 ml15">
									<view class="fs28 fwb col1">工厂代发</view>
									<view class="fs24 col9 mt5">请填写物流信息后确认发货</view>
								</view>
							</view>
							<view class="inp_nav flex-box col1 fs30 bb">
								<view class="col5 label">物流公司</view>
								<picker :range="logisticsCompanyList" @change="onLogisticsChange">
									<view class="flex-grow-1 tr" :class="logisticsCompany ? 'col1' : 'cola'">{{ logisticsCompany || '请选择物流公司' }}</view>
								</picker>
							</view>
							<view class="inp_nav flex-box col1 fs30">
								<view class="col5 label">运单号</view>
								<input type="text" class="flex-grow-1 tr" v-model="trackingNo" placeholder="请输入运单号" placeholder-class="cola" />
							</view>
						</view>
					</template>

					<!-- 确认发货提示 + 按钮 -->
					<view class="confirm-tip mb15" v-if="order.paymentProof.logistics_method">
						<view class="fs24 col-warn lh40">
							<text class="fwb">提示：</text>点击"{{ order.paymentProof.logistics_method === 'pickup' ? '确认自提' : '确认发货' }}"即表示您已确认买家的付款凭证，系统将自动完成佣金结算、保证金退还等流程。请仔细核对凭证后再操作。
						</view>
					</view>

					<view class="action-btn-full" v-if="order.paymentProof.logistics_method" @click="confirmShipment">
						{{ order.paymentProof.logistics_method === 'pickup' ? '确认自提并结算' : '确认发货并结算' }}
					</view>
				</template>
			</view>

			<!-- 状态5：已自动结算（仅展示结算完成信息） -->
			<view class="jj-box mb30" v-if="order.state === 5">
				<view class="fs34 fwb col1 lh36 mb20">结算信息</view>
				<view class="waiting-box tc ptb30">
					<view class="fs28 col4">订单已进入结算流程</view>
				</view>
			</view>

			<!-- 操作日志 -->
			<view class="jj-box mb30">
				<view class="fs34 fwb col1 lh36 mb20">操作日志</view>
				<view v-if="logs.length === 0" class="fs28 col9 tc ptb30">暂无操作记录</view>
				<view v-for="(log, idx) in logs" :key="idx" class="log-item" :class="{ 'bb': idx < logs.length - 1 }">
					<view class="flex-box">
						<view class="log-dot"></view>
						<view class="flex-grow-1 ml15">
							<view class="fs28 col1">{{ log.title }}</view>
							<view class="fs24 col9 mt5">{{ log.time }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 合同上传期限选择弹窗 -->
		<view class="popup-mask" v-if="showContractPopup" @click="showContractPopup = false">
			<view class="popup-box" @click.stop>
				<view class="popup-header">
					<view class="fs32 fwb col1">选择合同上传期限</view>
					<view class="popup-close fs30 col9" @click="showContractPopup = false">×</view>
				</view>
				<view class="popup-body">
					<view
						class="popup-option"
						:class="{ active: contractUploadHours === item.value }"
						v-for="(item, idx) in contractHoursList"
						:key="idx"
						@click="onSelectContractHours(item.value)"
					>
						<view class="fs30">{{ item.label }}</view>
						<image v-if="contractUploadHours === item.value" src="/static/icon/choose_sc.png" mode="aspectFill" class="popup-check-ico"></image>
					</view>
				</view>
			</view>
		</view>

		<!-- 买家付款期限选择弹窗 -->
		<view class="popup-mask" v-if="showUrgePopup" @click="showUrgePopup = false">
			<view class="popup-box" @click.stop>
				<view class="popup-header">
					<view class="fs32 fwb col1">选择买家付款期限</view>
					<view class="popup-close fs30 col9" @click="showUrgePopup = false">×</view>
				</view>
				<view class="popup-body">
					<view
						class="popup-option"
						:class="{ active: paymentUrgeDays === item.value }"
						v-for="(item, idx) in paymentUrgeDaysList"
						:key="idx"
						@click="onSelectUrgeDays(item.value)"
					>
						<view class="fs30">{{ item.label }}</view>
						<image v-if="paymentUrgeDays === item.value" src="/static/icon/choose_sc.png" mode="aspectFill" class="popup-check-ico"></image>
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
				order: {
					orderNo: '',
					createTime: '',
					state: 0,
					productName: '',
					coverImage: '/static/images/icon_upload_logo.png',
					unitPrice: '0.00',
					quantity: 0,
					totalAmount: '0.00',
					buyerCompany: '',
					buyerContact: '',
					buyerPhone: '',
					buyerAddress: '',
					agentName: '',
					agentMobile: '',
					commissionRate: 0,
					commissionAmount: '0.00',
					commissionLocked: false,
					depositRate: 0,
					depositAmount: '0.00',
					serviceFeeRate: 1,
					serviceFee: '0.00',
					lockDeadline: 0,
					contractInfo: null,
					depositInfo: null,
					logisticsInfo: null,
					paymentProof: null
				},
				logs: [],
				logisticsCompany: '',
				logisticsCompanyList: ['顺丰速运', '中通快递', '圆通速递', '韵达快递', '德邦物流', '安能物流', '百世快递'],
				trackingNo: '',
				contractUploadHours: 0,
				contractHoursList: [
					{ label: '24小时', value: 24 },
					{ label: '48小时', value: 48 }
				],
				showContractPopup: false,
				paymentUrgeDays: 0,
				paymentUrgeDaysList: [
					{ label: '7天', value: 7 },
					{ label: '14天', value: 14 }
				],
				showUrgePopup: false,
				lockCountdown: '',
				countdownTimer: null,
				steps: [
					{ label: '待确认', value: 0 },
					{ label: '保证金', value: 1 },
					{ label: '锁佣金', value: 2 },
					{ label: '合同', value: 3 },
					{ label: '履约', value: 4 },
					{ label: '结算', value: 5 },
					{ label: '完成', value: 6 }
				]
			}
		},
		computed: {
			contractHoursLabel() {
				let item = this.contractHoursList.find(i => i.value === this.contractUploadHours);
				return item ? item.label : '请选择';
			},
			paymentUrgeDaysLabel() {
				let item = this.paymentUrgeDaysList.find(i => i.value === this.paymentUrgeDays);
				return item ? item.label : '请选择';
			}
		},
		onLoad(options) {
			if (options && options.orderId) {
				this.orderId = options.orderId;
				this.loadDetail();
			}
		},
		onShow() {
			if (this.orderId) {
				this.loadDetail();
			}
		},
		onUnload() {
			if (this.countdownTimer) clearInterval(this.countdownTimer);
		},
		methods: {
			getStateName(state) {
				const map = { 0: '待确认', 1: '待缴纳佣金及服务费', 2: '待锁定佣金', 5: '结算中', 6: '已结算', 7: '已取消', 8: '已逾期' };
				if (state === 3) {
					return (this.order.contractInfo && this.order.contractInfo.status >= 1) ? '合同审核中' : '待上传合同';
				}
				if (state === 4) {
					if (this.order.paymentProof) return '待确认发货';
					return '等待买家付款';
				}
				return map[state] || '未知';
			},
			loadDetail() {
				this.$core.get({
					url: 'xiluxc.fc_order/detail',
					data: { order_id: this.orderId },
					success: ret => {
						let d = ret.data;
						this.order.orderNo = d.order_sn || '';
						this.order.createTime = d.create_time || '';
						this.order.state = d.status !== undefined ? d.status : 0;
						this.order.productName = d.product_name || '';
						this.order.coverImage = d.cover_image || '/static/images/icon_upload_logo.png';
						this.order.unitPrice = d.unit_price || '0.00';
						this.order.quantity = d.quantity || 0;
						this.order.totalAmount = d.total_amount || '0.00';
						this.order.buyerCompany = d.buyer_company || '';
						this.order.buyerContact = d.buyer_contact || '';
						this.order.buyerPhone = d.buyer_phone || '';
						this.order.buyerAddress = d.buyer_address || '';
						this.order.agentName = d.agent_name || '';
						this.order.agentMobile = d.agent_mobile || '';
						this.order.commissionRate = Number(d.commission_rate) || 0;
						this.order.commissionAmount = d.commission_amount || '0.00';
						this.order.commissionLocked = d.status >= 3 || !!d.commission_lock_time;
						this.order.depositRate = Number(d.deposit_rate) || 0;
						this.order.depositAmount = d.deposit_amount || '0.00';
						this.order.serviceFeeRate = Number(d.service_fee_rate) || 1;
						this.order.serviceFee = d.service_fee || '0.00';
						this.order.lockDeadline = d.lock_deadline || 0;
						this.order.contractInfo = d.contract_info || null;
						this.contractUploadHours = d.contract_upload_hours || 0;
						this.order.depositInfo = d.deposit_info || null;
						this.order.logisticsInfo = d.logistics_info || null;
						this.order.paymentProof = d.payment_proof || null;

						this.logs = [];

						if (this.order.state === 2 && this.order.lockDeadline) {
							this.startCountdown();
						}
					}
				});
			},
			startCountdown() {
				const update = () => {
					let now = Math.floor(Date.now() / 1000);
					let diff = this.order.lockDeadline - now;
					if (diff <= 0) {
						this.lockCountdown = '已超时';
						if (this.countdownTimer) clearInterval(this.countdownTimer);
						return;
					}
					let h = Math.floor(diff / 3600);
					let m = Math.floor((diff % 3600) / 60);
					let s = diff % 60;
					this.lockCountdown = (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
				};
				update();
				this.countdownTimer = setInterval(update, 1000);
			},
			payCommission() {
				if (!this.contractUploadHours) {
					uni.showToast({ title: '请先选择合同上传期限', icon: 'none' });
					return;
				}
				let commAmt = this.order.commissionAmount.replace(/,/g, '');
				let svcFee = this.order.serviceFee.replace(/,/g, '');
				let total = (Number(commAmt) + Number(svcFee)).toFixed(2);
				uni.showModal({
					title: '缴纳佣金及服务费',
					content: '佣金 ¥' + this.order.commissionAmount + ' + 服务费 ¥' + this.order.serviceFee + '，合计 ¥' + total + '，将从钱包余额中冻结。合同上传期限：' + this.contractHoursLabel + '。',
					success: (res) => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.fc_order/lock_commission',
								data: {
									order_id: this.orderId,
									contract_upload_hours: this.contractUploadHours
								},
								success: ret => {
									uni.showToast({ title: '缴纳成功', icon: 'success' });
									this.loadDetail();
								}
							});
						}
					}
				});
			},
			onSelectContractHours(val) {
				this.contractUploadHours = val;
				this.showContractPopup = false;
			},
			onSelectUrgeDays(val) {
				this.paymentUrgeDays = val;
				this.showUrgePopup = false;
			},
			confirmOrder() {
				uni.showModal({
					title: '确认接单',
					content: '确定要接受此订单吗？',
					success: (res) => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.fc_order/confirm',
								data: { order_id: this.orderId },
								success: ret => {
									uni.showToast({ title: '已确认接单', icon: 'success' });
									this.loadDetail();
								}
							});
						}
					}
				});
			},
			lockCommission() {
				if (!this.contractUploadHours) {
					uni.showToast({ title: '请先选择合同上传期限', icon: 'none' });
					return;
				}
				let commAmt = this.order.commissionAmount.replace(/,/g, '');
				let svcFee = this.order.serviceFee.replace(/,/g, '');
				let total = (Number(commAmt) + Number(svcFee)).toFixed(2);
				uni.showModal({
					title: '锁定佣金',
					content: '佣金 ¥' + this.order.commissionAmount + ' + 服务费 ¥' + this.order.serviceFee + '，合计 ¥' + total + '，将从钱包余额中冻结。合同上传期限：' + this.contractHoursLabel + '。',
					success: (res) => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.fc_order/lock_commission',
								data: {
									order_id: this.orderId,
									contract_upload_hours: this.contractUploadHours
								},
								success: ret => {
									uni.showToast({ title: '佣金已锁定', icon: 'success' });
									this.loadDetail();
								}
							});
						}
					}
				});
			},
			reviewContract(action) {
				if (action === 'reject') {
					uni.showModal({
						title: '驳回合同',
						editable: true,
						placeholderText: '请输入驳回原因',
						success: (res) => {
							if (res.confirm) {
								this.$core.post({
									url: 'xiluxc.fc_order/review_contract',
									data: { order_id: this.orderId, action: 'reject', reject_reason: res.content || '不符合要求' },
									success: ret => {
										uni.showToast({ title: '已驳回', icon: 'success' });
										this.loadDetail();
									}
								});
							}
						}
					});
				} else {
					if (!this.paymentUrgeDays) {
						uni.showToast({ title: '请先选择买家付款期限', icon: 'none' });
						return;
					}
					uni.showModal({
						title: '审核通过',
						content: '确定审核通过此合同？审核通过后进入催款期，买家付款期限为' + this.paymentUrgeDaysLabel + '。',
						success: (res) => {
							if (res.confirm) {
								this.$core.post({
									url: 'xiluxc.fc_order/review_contract',
									data: {
										order_id: this.orderId,
										action: 'approve',
										payment_urge_days: this.paymentUrgeDays
									},
									success: ret => {
										uni.showToast({ title: '已通过', icon: 'success' });
										this.loadDetail();
									}
								});
							}
						}
					});
				}
			},
			confirmShipment() {
				let method = this.order.paymentProof ? this.order.paymentProof.logistics_method : '';
				if (!method) {
					uni.showToast({ title: '物流方式未确定', icon: 'none' });
					return;
				}
				if (method === 'factory_ship') {
					if (!this.logisticsCompany) {
						uni.showToast({ title: '请选择物流公司', icon: 'none' });
						return;
					}
					if (!this.trackingNo) {
						uni.showToast({ title: '请输入运单号', icon: 'none' });
						return;
					}
				}
				let confirmTitle = method === 'pickup' ? '确认自提并结算' : '确认发货并结算';
				let confirmContent = method === 'pickup'
					? '确认买家自提取货？确认后系统将自动完成结算，佣金释放给居间人，保证金退还。'
					: '确认发货并结算？物流公司：' + this.logisticsCompany + '，运单号：' + this.trackingNo + '。确认后系统将自动完成结算。';
				uni.showModal({
					title: confirmTitle,
					content: confirmContent,
					success: (res) => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.fc_order/confirm_shipment',
								data: {
									order_id: this.orderId,
									logistics_method: method,
									company_name: method === 'factory_ship' ? this.logisticsCompany : '',
									tracking_no: method === 'factory_ship' ? this.trackingNo : ''
								},
								success: ret => {
									uni.showToast({ title: '操作成功，已自动结算', icon: 'success' });
									this.loadDetail();
								}
							});
						}
					}
				});
			},
			previewContract() {
				let url = this.order.contractInfo && this.order.contractInfo.file_url ? this.order.contractInfo.file_url : '';
				if (url) {
					// #ifdef H5
					window.open(url, '_blank');
					// #endif
					// #ifdef MP-WEIXIN
					uni.showLoading({ title: '加载中' });
					uni.downloadFile({
						url: url,
						success: res => {
							uni.hideLoading();
							uni.openDocument({
								filePath: res.tempFilePath,
								fileType: 'pdf',
								showMenu: true
							});
						},
						fail: () => {
							uni.hideLoading();
							uni.showToast({ title: '文件加载失败', icon: 'none' });
						}
					});
					// #endif
				}
			},
			downloadContract() {
				let url = this.order.contractInfo && this.order.contractInfo.file_url ? this.order.contractInfo.file_url : '';
				if (!url) return;
				// #ifdef H5
				let a = document.createElement('a');
				a.href = url;
				a.download = this.order.contractInfo.file_name || '买卖合同.pdf';
				a.target = '_blank';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				// #endif
				// #ifdef MP-WEIXIN
				uni.showLoading({ title: '下载中' });
				uni.downloadFile({
					url: url,
					success: res => {
						uni.hideLoading();
						uni.saveFile({
							tempFilePath: res.tempFilePath,
							success: saved => {
								uni.showToast({ title: '已保存', icon: 'success' });
							},
							fail: () => {
								// 保存失败时用 openDocument 让用户自行保存
								uni.openDocument({
									filePath: res.tempFilePath,
									fileType: 'pdf',
									showMenu: true
								});
							}
						});
					},
					fail: () => {
						uni.hideLoading();
						uni.showToast({ title: '下载失败', icon: 'none' });
					}
				});
				// #endif
			},
			onLogisticsChange(e) {
				this.logisticsCompany = this.logisticsCompanyList[e.detail.value];
			},
			isFilePdf(url) {
				if (!url) return false;
				return url.toLowerCase().endsWith('.pdf');
			},
			getFileNameFromUrl(url) {
				if (!url) return '';
				let parts = url.split('/');
				return parts[parts.length - 1] || '';
			},
			previewProofFile(fileUrl) {
				if (!fileUrl) return;
				if (this.isFilePdf(fileUrl)) {
					// #ifdef H5
					window.open(fileUrl, '_blank');
					// #endif
					// #ifdef MP-WEIXIN
					uni.showLoading({ title: '加载中' });
					uni.downloadFile({
						url: fileUrl,
						success: res => {
							uni.hideLoading();
							uni.openDocument({
								filePath: res.tempFilePath,
								fileType: 'pdf',
								showMenu: true
							});
						},
						fail: () => {
							uni.hideLoading();
							uni.showToast({ title: '文件加载失败', icon: 'none' });
						}
					});
					// #endif
				} else {
					// 图片预览
					let imageUrls = (this.order.paymentProof.file_urls || []).filter(u => !this.isFilePdf(u));
					let current = imageUrls.indexOf(fileUrl);
					uni.previewImage({
						urls: imageUrls.length ? imageUrls : [fileUrl],
						current: current >= 0 ? current : 0
					});
				}
			},
			downloadProofFile(fileUrl) {
				if (!fileUrl) return;
				// #ifdef H5
				let a = document.createElement('a');
				a.href = fileUrl;
				a.download = this.getFileNameFromUrl(fileUrl);
				a.target = '_blank';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				// #endif
				// #ifdef MP-WEIXIN
				uni.showLoading({ title: '下载中' });
				uni.downloadFile({
					url: fileUrl,
					success: res => {
						uni.hideLoading();
						uni.saveFile({
							tempFilePath: res.tempFilePath,
							success: () => {
								uni.showToast({ title: '已保存', icon: 'success' });
							},
							fail: () => {
								uni.openDocument({
									filePath: res.tempFilePath,
									showMenu: true
								});
							}
						});
					},
					fail: () => {
						uni.hideLoading();
						uni.showToast({ title: '下载失败', icon: 'none' });
					}
				});
				// #endif
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

	.detail-row {
		display: flex;
		justify-content: space-between;
		padding: 24rpx 0;
	}

	.order-cover {
		width: 140rpx;
		height: 140rpx;
		border-radius: 15rpx;
		flex-shrink: 0;
		background: #F5F7FB;
	}

	.status-color-0,
	.status-color-1 {
		color: #FAAD14;
	}

	.status-color-2 {
		color: #FF4D4F;
	}

	.status-color-3 {
		color: #1890FF;
	}

	.status-color-4,
	.status-color-5 {
		color: #52C41A;
	}

	.status-color-6 {
		color: #999999;
	}

	.status-color-7,
	.status-color-8 {
		color: #FF4D4F;
	}

	.progress-steps {
		display: flex;
		align-items: flex-start;
		overflow-x: auto;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		flex: 1;
		min-width: 80rpx;
	}

	.step-dot {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background: #E0E0E0;
		z-index: 1;
	}

	.step-active .step-dot {
		background: #FE4B01;
	}

	.step-current .step-dot {
		background: #FE4B01;
		box-shadow: 0 0 0 6rpx rgba(254, 75, 1, 0.2);
	}

	.step-label {
		color: #999999;
		margin-top: 10rpx;
		text-align: center;
	}

	.step-active .step-label {
		color: #FE4B01;
	}

	.step-line {
		position: absolute;
		top: 10rpx;
		left: 50%;
		right: -50%;
		height: 2rpx;
		background: #E0E0E0;
	}

	.step-active .step-line {
		background: #FE4B01;
	}

	.countdown-box {
		background: rgba(254, 75, 1, 0.05);
		border-radius: 15rpx;
		padding: 24rpx;
		text-align: center;
	}

	/* 等待状态 */
	.waiting-box {
		background: #F5F7FB;
		border-radius: 16rpx;
	}

	/* 付款凭证卡片 */
	.proof-card {
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 24rpx;
	}

	.proof-status-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.proof-status-0 {
		background: #FAAD14;
	}

	.proof-status-1 {
		background: #52C41A;
	}

	.proof-status-2 {
		background: #FF4D4F;
	}

	/* 凭证文件列表 */
	.proof-file-item {
		background: #FFFFFF;
		border-radius: 8rpx;
		padding: 16rpx 20rpx;
		align-items: center;
	}

	.proof-file-icon {
		width: 48rpx;
		height: 48rpx;
		border-radius: 8rpx;
		background: #1890FF;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* 自提提示 */
	.pickup-tip {
		background: #FFFBE6;
		border-radius: 8rpx;
		padding: 16rpx 20rpx;
		border-left: 6rpx solid #FAAD14;
	}

	/* 自提信息卡片 */
	.pickup-info-card {
		background: #F6FFED;
		border: 2rpx solid #B7EB8F;
		border-radius: 16rpx;
		padding: 24rpx;
	}

	.pickup-icon-box {
		width: 60rpx;
		height: 60rpx;
		background: #52C41A;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* 工厂代发信息卡片 */
	.ship-info-card {
		background: #E6F7FF;
		border: 2rpx solid #91D5FF;
		border-radius: 16rpx;
		padding: 24rpx;
	}

	.ship-icon-box {
		width: 60rpx;
		height: 60rpx;
		background: #1890FF;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* 确认提示 */
	.confirm-tip {
		background: #FFFBE6;
		border: 2rpx solid #FFE58F;
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
		border-left: 6rpx solid #FAAD14;
	}

	.action-btn-full {
		background: #FE4B01;
		color: #FFFFFF;
		text-align: center;
		padding: 24rpx 0;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: bold;
		cursor: pointer;
	}

	.approve-btn {
		background: #52C41A;
		color: #FFFFFF;
		text-align: center;
		padding: 24rpx 0;
		border-radius: 40rpx;
		font-size: 30rpx;
		cursor: pointer;
	}

	.reject-btn {
		background: #FFFFFF;
		color: #FF4D4F;
		border: 1px solid #FF4D4F;
		text-align: center;
		padding: 24rpx 0;
		border-radius: 40rpx;
		font-size: 30rpx;
		cursor: pointer;
	}

	/* 合同文件卡片 */
	.contract-file-card {
		background: #F5F7FB;
		border-radius: 16rpx;
		padding: 24rpx;
	}

	.contract-file-icon {
		width: 60rpx;
		height: 60rpx;
		background: #FF4D4F;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.contract-file-actions {
		border-top: 1rpx solid #E8E8E8;
		padding-top: 20rpx;
	}

	.preview-btn {
		background: #1890FF;
		color: #FFFFFF;
		padding: 16rpx 0;
		border-radius: 30rpx;
		font-size: 26rpx;
		cursor: pointer;
	}

	.download-btn {
		background: #FFFFFF;
		color: #1890FF;
		border: 1px solid #1890FF;
		padding: 16rpx 0;
		border-radius: 30rpx;
		font-size: 26rpx;
		cursor: pointer;
	}

	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;

		.label {
			width: 160rpx;
		}
	}

	.log-item {
		padding: 24rpx 0;
	}

	.log-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #FE4B01;
		flex-shrink: 0;
		margin-top: 12rpx;
	}

	@media screen and (min-width: 768px) {
		.order-cover {
			width: 100px;
			height: 100px;
			border-radius: 8px;
		}

		.inp_nav {
			height: auto;
			padding: 14px 0;
		}

		.action-btn-full,
		.approve-btn,
		.reject-btn {
			max-width: 400px;
			margin: 0 auto;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}

		.contract-file-card {
			border-radius: 12px;
			padding: 16px;
		}

		.preview-btn,
		.download-btn {
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.85;
			}
		}
	}

	/* 警示色 */
	.col-warn {
		color: #FAAD14;
	}

	/* 底部弹窗 */
	.popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.popup-box {
		width: 100%;
		max-width: 750rpx;
		background: #FFFFFF;
		border-radius: 30rpx 30rpx 0 0;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 40rpx;
		border-bottom: 1px solid #F0F0F0;
	}

	.popup-close {
		width: 60rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		font-size: 40rpx;
	}

	.popup-body {
		padding: 20rpx 40rpx 40rpx;
	}

	.popup-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 20rpx;
		border-radius: 16rpx;
		margin-bottom: 16rpx;
		background: #F5F8FC;

		&.active {
			background: rgba(254, 75, 1, 0.08);
			color: #FE4B01;
		}
	}

	.popup-check-ico {
		width: 40rpx;
		height: 40rpx;
	}

	@media screen and (min-width: 768px) {
		.popup-box {
			max-width: 480px;
			border-radius: 16px 16px 0 0;
		}

		.popup-option {
			cursor: pointer;
			transition: background 0.2s;

			&:hover:not(.active) {
				background: #EEF1F5;
			}
		}

		.popup-close {
			cursor: pointer;
		}
	}
</style>
