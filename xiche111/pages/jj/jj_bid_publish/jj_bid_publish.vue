<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" @click="onSubmit()">发起竞标</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="page-wrap p30">
				<!-- 步骤指示 -->
				<view class="steps-bar mb30">
					<view class="step-item" :class="{ 'step-active': currentStep >= 1 }">
						<view class="step-dot">1</view>
						<view class="fs22 mt5">选择工厂</view>
					</view>
					<view class="step-line" :class="{ 'line-active': currentStep >= 2 }"></view>
					<view class="step-item" :class="{ 'step-active': currentStep >= 2 }">
						<view class="step-dot">2</view>
						<view class="fs22 mt5">填写需求</view>
					</view>
					<view class="step-line" :class="{ 'line-active': currentStep >= 3 }"></view>
					<view class="step-item" :class="{ 'step-active': currentStep >= 3 }">
						<view class="step-dot">3</view>
						<view class="fs22 mt5">买家信息</view>
					</view>
				</view>

				<!-- 第一步：选择工厂 -->
				<view v-show="currentStep === 1">
					<!-- 筛选条件 -->
					<view class="box mb30">
						<view class="fs34 fwb col1 lh36 mb20">筛选工厂</view>
						<view class="filter-row">
							<view class="filter-item" @click="showPicker('province')">
								<text class="fs26">{{ selectedProvince || '省份' }}</text>
								<text class="fs22 col9 ml5">▼</text>
							</view>
							<view class="filter-item" @click="showPicker('industry')">
								<text class="fs26">{{ selectedIndustry || '行业' }}</text>
								<text class="fs22 col9 ml5">▼</text>
							</view>
						</view>
						<view class="fs22 col9 mt15">已选 {{ selectedFactories.length }}/5 家工厂</view>
					</view>

					<!-- 工厂列表 -->
					<view class="box mb30">
						<view class="fs30 fwb col1 lh36 mb20">工厂列表</view>
						<view
							v-for="(factory, idx) in filteredFactories"
							:key="factory.id"
							class="factory-item flex-box"
							:class="{
								'factory-selected': isSelected(factory.id),
								'bb': idx < filteredFactories.length - 1
							}"
							@click="toggleFactory(factory)"
						>
							<view class="check-box mr20" :class="{ 'checked': isSelected(factory.id) }">
								<text v-if="isSelected(factory.id)" class="check-mark">✓</text>
							</view>
							<view class="flex-grow-1">
								<view class="fs28 fwb col1">{{ factory.name }}</view>
								<view class="fs22 col9 mt5">{{ factory.province }} · {{ factory.industry }}</view>
								<view class="flex-box mt8">
									<view class="mini-info mr20">
										<text class="fs22 col9">履约率 </text>
										<text class="fs22 col4">{{ factory.fulfillRate }}%</text>
									</view>
									<view class="mini-info">
										<text class="fs22 col9">产品 </text>
										<text class="fs22 col1">{{ factory.productCount }}款</text>
									</view>
								</view>
							</view>
						</view>
						<view v-if="filteredFactories.length === 0" class="fs28 col9 tc ptb30">暂无匹配工厂</view>
					</view>

					<view class="btn-next" :class="{ 'btn-disabled': selectedFactories.length === 0 }" @click="nextStep(2)">下一步：填写需求</view>
				</view>

				<!-- 第二步：填写需求 -->
				<view v-show="currentStep === 2">
					<view class="box mb30">
						<view class="fs34 fwb col1 lh36 mb30">需求信息</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">产品品类</view>
							<view class="flex-grow-1 tr" @click="showPicker('category')">
								<text :class="categoryName ? 'col1' : 'cola'">{{ categoryName || '请选择品类' }}</text>
								<text class="fs22 col9 ml5">▼</text>
							</view>
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">需求数量</view>
							<input type="digit" class="flex-grow-1 tr" v-model="quantity" placeholder="请输入数量" placeholder-class="cola" />
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">计量单位</view>
							<view class="flex-grow-1 tr" @click="showPicker('unit')">
								<text :class="unitName ? 'col1' : 'cola'">{{ unitName || '请选择单位' }}</text>
								<text class="fs22 col9 ml5">▼</text>
							</view>
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">期望交货</view>
							<picker mode="date" :value="expectDelivery" :start="today" @change="onDeliveryChange">
								<view class="flex-grow-1 tr">
									<text :class="expectDelivery ? 'col1' : 'cola'">{{ expectDelivery || '请选择日期' }}</text>
								</view>
							</picker>
						</view>
						<view class="inp_nav flex-box col1 fs30">
							<view class="col5 label">目标佣金</view>
							<input type="digit" class="flex-grow-1 tr" v-model="targetCommission" placeholder="选填，供工厂参考" placeholder-class="cola" />
						</view>
					</view>

					<!-- 已选工厂摘要 -->
					<view class="box mb30">
						<view class="fs26 col9 mb15">已选工厂（{{ selectedFactories.length }}家）</view>
						<view class="factory-tags">
							<view v-for="f in selectedFactories" :key="f.id" class="factory-tag">
								{{ f.name }}
							</view>
						</view>
					</view>

					<view class="flex-box" style="gap: 20rpx;">
						<view class="btn-prev flex-grow-1" @click="prevStep">上一步</view>
						<view class="btn-next flex-grow-1" @click="nextStep(3)">下一步：买家信息</view>
					</view>
				</view>

				<!-- 第三步：买家信息 -->
				<view v-show="currentStep === 3">
					<view class="box mb30">
						<view class="fs34 fwb col1 lh36 mb30">买家信息</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">企业名称</view>
							<input type="text" class="flex-grow-1 tr" v-model="companyName" placeholder="请输入企业名称" placeholder-class="cola" />
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">收货地址</view>
							<input type="text" class="flex-grow-1 tr" v-model="address" placeholder="省市区+详细地址" placeholder-class="cola" />
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">联系人</view>
							<input type="text" class="flex-grow-1 tr" v-model="contactName" placeholder="请输入联系人姓名" placeholder-class="cola" />
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">联系电话</view>
							<input type="number" maxlength="11" class="flex-grow-1 tr" v-model="contactPhone" placeholder="请输入联系电话" placeholder-class="cola" />
						</view>
						<view class="inp_nav flex-box col1 fs30 bb">
							<view class="col5 label">信用代码</view>
							<input type="text" maxlength="18" class="flex-grow-1 tr" v-model="creditCode" placeholder="统一社会信用代码" placeholder-class="cola" />
						</view>
						<view class="inp_nav flex-box col1 fs30">
							<view class="col5 label">税务登记号</view>
							<input type="text" class="flex-grow-1 tr" v-model="taxNumber" placeholder="选填" placeholder-class="cola" />
						</view>
					</view>

					<!-- 提交摘要 -->
					<view class="box mb30">
						<view class="fs26 fwb col1 mb15">竞标摘要</view>
						<view class="summary-row">
							<text class="fs24 col9">品类：</text>
							<text class="fs24 col1">{{ categoryName || '-' }}</text>
						</view>
						<view class="summary-row">
							<text class="fs24 col9">数量：</text>
							<text class="fs24 col1">{{ quantity || '-' }}{{ unitName }}</text>
						</view>
						<view class="summary-row">
							<text class="fs24 col9">交货日期：</text>
							<text class="fs24 col1">{{ expectDelivery || '-' }}</text>
						</view>
						<view class="summary-row">
							<text class="fs24 col9">目标佣金：</text>
							<text class="fs24 col4">{{ targetCommission ? '¥' + targetCommission : '面议' }}</text>
						</view>
						<view class="summary-row">
							<text class="fs24 col9">邀请工厂：</text>
							<text class="fs24 col1">{{ selectedFactories.length }}家</text>
						</view>
					</view>

					<view class="flex-box" style="gap: 20rpx;">
						<view class="btn-prev flex-grow-1" @click="prevStep">上一步</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 筛选弹窗 -->
		<u-popup :show="pickerVisible" mode="bottom" round="20" @close="pickerVisible = false">
			<view class="picker-wrap">
				<view class="flex-box flex-between p30">
					<view class="fs30 col9" @click="pickerVisible = false">取消</view>
					<view class="fs30 fwb col1">{{ pickerTitle }}</view>
					<view class="fs30 col4" @click="confirmPicker">确定</view>
				</view>
				<scroll-view scroll-y class="picker-list">
					<view
						v-for="(opt, idx) in pickerOptions"
						:key="idx"
						class="picker-option"
						:class="{ 'picker-option-active': pickerTempValue === opt }"
						@click="pickerTempValue = opt"
					>
						{{ opt }}
					</view>
				</scroll-view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	var validate = require("../../../xilu/validate.js");

	// Mock 工厂数据
	const MOCK_FACTORIES = [
		{ id: 101, name: '鑫达钢铁有限公司', province: '河北', city: '唐山', industry: '建材', fulfillRate: 96, productCount: 12 },
		{ id: 102, name: '华北钢铁集团', province: '河北', city: '邯郸', industry: '建材', fulfillRate: 92, productCount: 8 },
		{ id: 103, name: '中原特钢有限公司', province: '河南', city: '郑州', industry: '建材', fulfillRate: 88, productCount: 6 },
		{ id: 201, name: '齐鲁石化工业', province: '山东', city: '淄博', industry: '化工', fulfillRate: 95, productCount: 15 },
		{ id: 202, name: '长江化工集团', province: '江苏', city: '南京', industry: '化工', fulfillRate: 90, productCount: 20 },
		{ id: 203, name: '蓝星化工研究院', province: '北京', city: '北京', industry: '化工', fulfillRate: 97, productCount: 10 },
		{ id: 301, name: '沈阳机床集团', province: '辽宁', city: '沈阳', industry: '机械', fulfillRate: 94, productCount: 18 },
		{ id: 302, name: '大连数控设备', province: '辽宁', city: '大连', industry: '机械', fulfillRate: 91, productCount: 9 },
		{ id: 303, name: '济南重工机械', province: '山东', city: '济南', industry: '机械', fulfillRate: 87, productCount: 14 },
		{ id: 401, name: '富士康精密电子', province: '广东', city: '深圳', industry: '电子', fulfillRate: 98, productCount: 25 },
		{ id: 402, name: '华星光电科技', province: '广东', city: '深圳', industry: '电子', fulfillRate: 93, productCount: 11 },
		{ id: 501, name: '鲁泰纺织集团', province: '山东', city: '淄博', industry: '纺织', fulfillRate: 89, productCount: 16 },
		{ id: 502, name: '魏桥纺织股份', province: '山东', city: '滨州', industry: '纺织', fulfillRate: 92, productCount: 22 },
		{ id: 601, name: '海螺水泥集团', province: '安徽', city: '芜湖', industry: '建材', fulfillRate: 96, productCount: 7 },
		{ id: 602, name: '华润水泥控股', province: '广东', city: '广州', industry: '建材', fulfillRate: 94, productCount: 5 }
	];

	const PROVINCES = ['全部', '河北', '河南', '山东', '江苏', '北京', '辽宁', '广东', '安徽'];
	const INDUSTRIES = ['全部', '建材', '化工', '机械', '电子', '纺织'];
	const CATEGORIES = ['螺纹钢', '钢板', '钢管', '聚氯乙烯树脂', '环氧树脂', '丙烯酸乳液', 'CNC加工中心', '液压设备', '工业连接器', 'LED照明', '涤纶长丝', '棉坯布', '水泥'];
	const UNITS = ['吨', '台', '个', '套', '米', '千克', '件'];

	export default {
		data() {
			return {
				currentStep: 1,
				// 筛选
				selectedProvince: '',
				selectedIndustry: '',
				// 工厂列表
				factoryList: [],
				selectedFactories: [],
				// 需求
				categoryName: '',
				quantity: '',
				unitName: '',
				expectDelivery: '',
				targetCommission: '',
				// 买家信息
				companyName: '',
				address: '',
				contactName: '',
				contactPhone: '',
				creditCode: '',
				taxNumber: '',
				// Picker
				pickerVisible: false,
				pickerTitle: '',
				pickerType: '',
				pickerOptions: [],
				pickerTempValue: '',
				// 日期
				today: ''
			}
		},
		computed: {
			filteredFactories() {
				return this.factoryList.filter(f => {
					if (this.selectedProvince && this.selectedProvince !== '全部' && f.province !== this.selectedProvince) return false;
					if (this.selectedIndustry && this.selectedIndustry !== '全部' && f.industry !== this.selectedIndustry) return false;
					return true;
				});
			}
		},
		onLoad() {
			let d = new Date();
			this.today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
			this.loadFactories();
		},
		methods: {
			loadFactories() {
				this.$core.get({
					url: 'xiluxc.jj_bid/factory_list',
					data: {},
					success: ret => {
						this.factoryList = ret.data.list || [];
					},
					fail: () => {
						this.factoryList = JSON.parse(JSON.stringify(MOCK_FACTORIES));
						return false;
					}
				});
			},
			isSelected(factoryId) {
				return this.selectedFactories.some(f => f.id === factoryId);
			},
			toggleFactory(factory) {
				let idx = this.selectedFactories.findIndex(f => f.id === factory.id);
				if (idx !== -1) {
					this.selectedFactories.splice(idx, 1);
				} else {
					if (this.selectedFactories.length >= 5) {
						uni.showToast({ title: '最多选择5家工厂', icon: 'none' });
						return;
					}
					this.selectedFactories.push(factory);
				}
			},
			showPicker(type) {
				this.pickerType = type;
				if (type === 'province') {
					this.pickerTitle = '选择省份';
					this.pickerOptions = PROVINCES;
					this.pickerTempValue = this.selectedProvince || '全部';
				} else if (type === 'industry') {
					this.pickerTitle = '选择行业';
					this.pickerOptions = INDUSTRIES;
					this.pickerTempValue = this.selectedIndustry || '全部';
				} else if (type === 'category') {
					this.pickerTitle = '选择品类';
					this.pickerOptions = CATEGORIES;
					this.pickerTempValue = this.categoryName || '';
				} else if (type === 'unit') {
					this.pickerTitle = '选择单位';
					this.pickerOptions = UNITS;
					this.pickerTempValue = this.unitName || '';
				}
				this.pickerVisible = true;
			},
			confirmPicker() {
				if (this.pickerType === 'province') {
					this.selectedProvince = this.pickerTempValue === '全部' ? '' : this.pickerTempValue;
				} else if (this.pickerType === 'industry') {
					this.selectedIndustry = this.pickerTempValue === '全部' ? '' : this.pickerTempValue;
				} else if (this.pickerType === 'category') {
					this.categoryName = this.pickerTempValue;
				} else if (this.pickerType === 'unit') {
					this.unitName = this.pickerTempValue;
				}
				this.pickerVisible = false;
			},
			onDeliveryChange(e) {
				this.expectDelivery = e.detail.value;
			},
			nextStep(step) {
				if (step === 2) {
					if (this.selectedFactories.length === 0) {
						uni.showToast({ title: '请至少选择1家工厂', icon: 'none' });
						return;
					}
				}
				if (step === 3) {
					if (!this.categoryName) {
						uni.showToast({ title: '请选择产品品类', icon: 'none' });
						return;
					}
					if (!this.quantity || parseFloat(this.quantity) <= 0) {
						uni.showToast({ title: '请输入需求数量', icon: 'none' });
						return;
					}
					if (!this.unitName) {
						uni.showToast({ title: '请选择计量单位', icon: 'none' });
						return;
					}
					if (!this.expectDelivery) {
						uni.showToast({ title: '请选择期望交货时间', icon: 'none' });
						return;
					}
				}
				this.currentStep = step;
				uni.pageScrollTo({ scrollTop: 0, duration: 200 });
			},
			prevStep() {
				if (this.currentStep > 1) {
					this.currentStep--;
					uni.pageScrollTo({ scrollTop: 0, duration: 200 });
				}
			},
			onSubmit() {
				if (this.currentStep !== 3) {
					uni.showToast({ title: '请先完成所有步骤', icon: 'none' });
					return;
				}

				let formData = {
					companyName: this.companyName,
					address: this.address,
					contactName: this.contactName,
					contactPhone: this.contactPhone,
					creditCode: this.creditCode,
					taxNumber: this.taxNumber
				};

				let rule = [
					{ name: 'companyName', nameChn: '企业名称', rules: ['require'], errorMsg: { require: '请输入企业名称' } },
					{ name: 'address', nameChn: '收货地址', rules: ['require'], errorMsg: { require: '请输入收货地址' } },
					{ name: 'contactName', nameChn: '联系人', rules: ['require'], errorMsg: { require: '请输入联系人姓名' } },
					{ name: 'contactPhone', nameChn: '联系电话', rules: ['require', 'mobile'], errorMsg: { require: '请输入联系电话', mobile: '请输入正确的手机号' } },
					{ name: 'creditCode', nameChn: '信用代码', rules: ['require'], errorMsg: { require: '请输入统一社会信用代码' } }
				];

				if (!validate.check(formData, rule)) {
					uni.showToast({ title: validate.getError()[0], icon: 'none' });
					return;
				}

				let submitData = {
					factory_ids: this.selectedFactories.map(f => f.id),
					category_name: this.categoryName,
					quantity: parseFloat(this.quantity),
					unit: this.unitName,
					expect_delivery: this.expectDelivery,
					target_commission: this.targetCommission ? parseFloat(this.targetCommission) : 0,
					company_name: this.companyName,
					address: this.address,
					contact_name: this.contactName,
					contact_phone: this.contactPhone,
					credit_code: this.creditCode,
					tax_number: this.taxNumber
				};

				this.$core.post({
					url: 'xiluxc.jj_bid/publish',
					data: submitData,
					success: ret => {
						uni.showToast({ title: '竞标发起成功', icon: 'success' });
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					},
					fail: () => {
						// Mock 成功流程
						uni.showToast({ title: '竞标发起成功', icon: 'success' });
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
						return false;
					}
				});
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

	/* 步骤条 */
	.steps-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx 20rpx;
	}

	.step-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #CCCCCC;
	}

	.step-active {
		color: #FE4B01;
	}

	.step-dot {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		background: #F0F0F0;
		color: #CCCCCC;
		font-size: 24rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.step-active .step-dot {
		background: #FE4B01;
		color: #FFFFFF;
	}

	.step-line {
		width: 80rpx;
		height: 4rpx;
		background: #F0F0F0;
		margin: 0 10rpx;
		margin-bottom: 30rpx;
	}

	.line-active {
		background: #FE4B01;
	}

	/* 筛选行 */
	.filter-row {
		display: flex;
		gap: 20rpx;
	}

	.filter-item {
		flex: 1;
		background: #F5F7FB;
		border-radius: 12rpx;
		padding: 18rpx 20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	/* 工厂列表 */
	.factory-item {
		padding: 24rpx 0;
		align-items: flex-start;
	}

	.factory-selected {
		background: rgba(254, 75, 1, 0.03);
		margin: 0 -30rpx;
		padding: 24rpx 30rpx;
		border-radius: 12rpx;
	}

	.check-box {
		width: 44rpx;
		height: 44rpx;
		border: 2rpx solid #DDDDDD;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 4rpx;
	}

	.checked {
		background: #FE4B01;
		border-color: #FE4B01;
	}

	.check-mark {
		color: #FFFFFF;
		font-size: 28rpx;
		font-weight: bold;
	}

	.mini-info {
		display: inline-flex;
		align-items: center;
	}

	/* 表单 */
	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;
	}

	.inp_nav .label {
		width: 200rpx;
		flex-shrink: 0;
	}

	/* 工厂标签 */
	.factory-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.factory-tag {
		background: rgba(254, 75, 1, 0.08);
		color: #FE4B01;
		font-size: 24rpx;
		padding: 8rpx 20rpx;
		border-radius: 8rpx;
	}

	/* 摘要 */
	.summary-row {
		padding: 10rpx 0;
	}

	/* 按钮 */
	.btn-next {
		background: linear-gradient(135deg, #FE4B01, #FF7A45);
		color: #FFFFFF;
		font-size: 30rpx;
		font-weight: bold;
		text-align: center;
		padding: 24rpx 0;
		border-radius: 38rpx;
	}

	.btn-disabled {
		opacity: 0.5;
	}

	.btn-prev {
		background: #F5F7FB;
		color: #666666;
		font-size: 30rpx;
		text-align: center;
		padding: 24rpx 0;
		border-radius: 38rpx;
	}

	/* 底部提交 */
	.foot_nav {
		padding: 10rpx 30rpx;
	}

	/* Picker 弹窗 */
	.picker-wrap {
		padding-bottom: 40rpx;
	}

	.picker-list {
		max-height: 600rpx;
		padding: 0 30rpx;
	}

	.picker-option {
		padding: 24rpx 20rpx;
		font-size: 30rpx;
		color: #333333;
		border-bottom: 1rpx solid #F5F5F5;
		border-radius: 8rpx;
	}

	.picker-option-active {
		background: rgba(254, 75, 1, 0.06);
		color: #FE4B01;
		font-weight: bold;
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

		.steps-bar {
			padding: 24px 20px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.step-dot {
			width: 32px;
			height: 32px;
			font-size: 14px;
		}

		.step-line {
			width: 60px;
			margin-bottom: 24px;
		}

		.filter-item {
			padding: 12px 16px;
			border-radius: 8px;
			cursor: pointer;
		}

		.filter-item:hover {
			background: #EEF1F6;
		}

		.factory-item {
			padding: 16px 0;
			cursor: pointer;
		}

		.factory-item:hover {
			background: rgba(254, 75, 1, 0.02);
		}

		.factory-selected {
			margin: 0 -24px;
			padding: 16px 24px;
		}

		.check-box {
			width: 22px;
			height: 22px;
		}

		.inp_nav {
			height: auto;
			padding: 14px 0;
		}

		.btn-next, .btn-prev {
			font-size: 15px;
			padding: 14px 0;
			cursor: pointer;
			transition: opacity 0.2s;
		}

		.btn-next:hover {
			opacity: 0.85;
		}

		.btn-prev:hover {
			background: #EAEDF3;
		}

		.foot_nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}

		.picker-option {
			cursor: pointer;
		}

		.picker-option:hover {
			background: #F5F7FB;
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
