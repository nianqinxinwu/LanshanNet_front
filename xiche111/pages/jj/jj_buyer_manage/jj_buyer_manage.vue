<template>
	<view class="container bg-f5">
		<view class="jj-page-wrap p30">
			<!-- 顶部操作栏 -->
			<view class="flex-box mb30">
				<view class="fs34 fwb col1 flex-grow-1">买家信息列表</view>
				<view class="add-btn fs26" @click="showAddPopup = true">+ 新增买家</view>
			</view>

			<!-- 空状态 -->
			<view v-if="buyerList.length === 0 && !loading" class="empty-wrap jj-box">
				<view class="fs28 col9 tc ptb30">暂无买家信息，请添加</view>
			</view>

			<!-- 买家列表 -->
			<view v-for="(item, idx) in buyerList" :key="item.id" class="buyer-card jj-box mb20">
				<view class="flex-box">
					<view class="flex-grow-1">
						<view class="fs30 fwb col1">{{ item.company_name }}</view>
						<view class="fs26 col5 mt10">{{ item.contact_name }}　{{ item.contact_phone }}</view>
						<view class="fs24 col9 mt8 m-ellipsis-2">{{ item.address }}</view>
						<view v-if="item.credit_code" class="fs22 col9 mt8">信用代码: {{ item.credit_code }}</view>
					</view>
					<view class="flex-shrink-0 ml20">
						<view v-if="item.is_default" class="default-tag fs22 mb10">默认</view>
						<view class="del-btn fs24" @click="onDelete(item)">删除</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 新增买家弹框 -->
		<view v-if="showAddPopup" class="popup-mask" @click.self="showAddPopup = false">
			<view class="popup-content">
				<view class="popup-header flex-box">
					<view class="fs34 fwb col1 flex-grow-1">新增买家信息</view>
					<view class="fs28 col9" @click="showAddPopup = false">关闭</view>
				</view>
				<view class="popup-body">
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">企业名称</view>
						<input type="text" class="flex-grow-1 tr" v-model="newBuyer.companyName" placeholder="请输入企业名称" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">收货地址</view>
						<input type="text" class="flex-grow-1 tr" v-model="newBuyer.address" placeholder="请输入收货地址" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">联系人</view>
						<input type="text" class="flex-grow-1 tr" v-model="newBuyer.contactName" placeholder="请输入联系人姓名" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">联系电话</view>
						<input type="number" maxlength="11" class="flex-grow-1 tr" v-model="newBuyer.contactPhone" placeholder="请输入联系电话" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30 bb">
						<view class="col5 label">信用代码</view>
						<input type="text" maxlength="18" class="flex-grow-1 tr" v-model="newBuyer.creditCode" placeholder="请输入统一社会信用代码" placeholder-class="cola" />
					</view>
					<view class="inp_nav flex-box col1 fs30">
						<view class="col5 label">税务登记证号</view>
						<input type="text" class="flex-grow-1 tr" v-model="newBuyer.taxNumber" placeholder="请输入税务登记证号" placeholder-class="cola" />
					</view>
				</view>
				<view class="popup-footer">
					<view class="btn5" @click="onSaveNewBuyer">保存</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loading: false,
				buyerList: [],
				showAddPopup: false,
				newBuyer: {
					companyName: '',
					address: '',
					contactName: '',
					contactPhone: '',
					creditCode: '',
					taxNumber: ''
				}
			}
		},
		onLoad() {
			this.loadBuyerList();
		},
		methods: {
			loadBuyerList() {
				this.loading = true;
				this.$core.get({
					url: 'xiluxc.jj_buyer_info/index',
					loading: false,
					success: ret => {
						this.buyerList = ret.data || [];
						this.loading = false;
					},
					fail: () => {
						this.loading = false;
						return false;
					}
				});
			},
			resetForm() {
				this.newBuyer = {
					companyName: '',
					address: '',
					contactName: '',
					contactPhone: '',
					creditCode: '',
					taxNumber: ''
				};
			},
			onSaveNewBuyer() {
				let b = this.newBuyer;
				if (!b.companyName || !b.address || !b.contactName || !b.contactPhone) {
					uni.showToast({ title: '请填写必要信息', icon: 'none' });
					return;
				}
				this.$core.post({
					url: 'xiluxc.jj_buyer_info/add',
					data: {
						company_name: b.companyName,
						address: b.address,
						contact_name: b.contactName,
						contact_phone: b.contactPhone,
						credit_code: b.creditCode,
						tax_number: b.taxNumber
					},
					success: ret => {
						uni.showToast({ title: '保存成功', icon: 'success' });
						this.showAddPopup = false;
						this.resetForm();
						this.loadBuyerList();
					},
					fail: () => { return false; }
				});
			},
			onDelete(item) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该买家信息吗？',
					success: (res) => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.jj_buyer_info/delete',
								data: { id: item.id },
								success: ret => {
									uni.showToast({ title: '删除成功', icon: 'success' });
									this.loadBuyerList();
								},
								fail: () => { return false; }
							});
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.add-btn {
		background: linear-gradient(135deg, #FE4B01, #FF8C00);
		color: #FFFFFF;
		padding: 12rpx 30rpx;
		border-radius: 30rpx;
	}

	.buyer-card {
		padding: 30rpx;
	}

	.default-tag {
		display: inline-block;
		background: rgba(254, 75, 1, 0.1);
		color: #FE4B01;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		text-align: center;
	}

	.del-btn {
		color: #ff4d4f;
		text-align: center;
		padding: 8rpx 0;
	}

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
	}

	.popup-content {
		width: 100%;
		background: #FFFFFF;
		border-radius: 30rpx 30rpx 0 0;
		max-height: 85vh;
		overflow-y: auto;
	}

	.popup-header {
		padding: 30rpx;
		border-bottom: 1px solid #F0F0F0;
	}

	.popup-body {
		padding: 0 30rpx;
	}

	.popup-footer {
		padding: 20rpx 30rpx 40rpx;
	}

	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;

		.label {
			width: 200rpx;
			flex-shrink: 0;
		}
	}

	/* PC端适配 */
	@media screen and (min-width: 768px) {
		.add-btn {
			cursor: pointer;

			&:hover {
				opacity: 0.9;
			}
		}

		.buyer-card:hover {
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		}

		.del-btn {
			cursor: pointer;

			&:hover {
				color: #ff1f1f;
			}
		}

		.popup-content {
			max-width: 600px;
			margin: 0 auto;
			border-radius: 12px 12px 0 0;
		}

		.inp_nav {
			height: auto;
			padding: 14px 0;
		}
	}
</style>
