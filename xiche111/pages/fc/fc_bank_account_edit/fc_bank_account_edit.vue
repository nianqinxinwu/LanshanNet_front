<template>
	<view>
		<view class="page-foot bg-white">
			<view class="foot_nav">
				<view class="btn5" @click="onSubmit">{{ isEdit ? '保存修改' : '添加账户' }}</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<view class="jj-box mb30">
					<view class="fs30 fwb col1 lh36 mb20">银行信息</view>

					<view class="inp_nav flex-box col1 fs30">
						<view class="inp-label">开户名称</view>
						<input type="text" class="flex-grow-1 ml10" v-model="form.account_name"
							placeholder="请输入开户名称" placeholder-class="cola" />
					</view>

					<view class="inp_nav flex-box col1 fs30">
						<view class="inp-label">开户银行</view>
						<input type="text" class="flex-grow-1 ml10" v-model="form.bank_name"
							placeholder="请输入开户银行" placeholder-class="cola" />
					</view>

					<view class="inp_nav flex-box col1 fs30">
						<view class="inp-label">开户支行</view>
						<input type="text" class="flex-grow-1 ml10" v-model="form.bank_branch"
							placeholder="请输入开户支行（选填）" placeholder-class="cola" />
					</view>

					<view class="inp_nav flex-box col1 fs30">
						<view class="inp-label">对公账号</view>
						<input type="text" class="flex-grow-1 ml10" v-model="form.bank_no"
							placeholder="请输入对公账号" placeholder-class="cola" />
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
				isEdit: false,
				editId: 0,
				form: {
					account_name: '',
					bank_name: '',
					bank_branch: '',
					bank_no: ''
				}
			}
		},
		onLoad(options) {
			if (options.id) {
				this.isEdit = true;
				this.editId = parseInt(options.id);
				this.form.account_name = decodeURIComponent(options.account_name || '');
				this.form.bank_name = decodeURIComponent(options.bank_name || '');
				this.form.bank_branch = decodeURIComponent(options.bank_branch || '');
				this.form.bank_no = decodeURIComponent(options.bank_no || '');
				uni.setNavigationBarTitle({ title: '编辑对公账户' });
			} else {
				uni.setNavigationBarTitle({ title: '添加对公账户' });
			}
		},
		methods: {
			onSubmit() {
				if (!this.form.account_name) {
					uni.showToast({ title: '请输入开户名称', icon: 'none' });
					return;
				}
				if (!this.form.bank_name) {
					uni.showToast({ title: '请输入开户银行', icon: 'none' });
					return;
				}
				if (!this.form.bank_no) {
					uni.showToast({ title: '请输入对公账号', icon: 'none' });
					return;
				}

				let url = this.isEdit ? 'xiluxc.fc_wallet/bank_account_edit' : 'xiluxc.fc_wallet/bank_account_add';
				let data = { ...this.form };
				if (this.isEdit) {
					data.id = this.editId;
				}

				this.$core.post({
					url: url,
					data: data,
					success: () => {
						uni.showToast({ title: this.isEdit ? '修改成功' : '添加成功', icon: 'success' });
						setTimeout(() => { uni.navigateBack(); }, 1500);
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.inp_nav {
		height: 100rpx;
		font-size: 30rpx;
		color: #101010;
		border-bottom: 1rpx solid #F0F0F0;
	}

	.inp-label {
		width: 160rpx;
		color: #555555;
		flex-shrink: 0;
	}

	.foot_nav {
		padding: 10rpx 30rpx;
	}

	@supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
		.container {
			padding-bottom: calc(130rpx + 68rpx);
			padding-bottom: calc(constant(safe-area-inset-bottom) + 130rpx);
			padding-bottom: calc(env(safe-area-inset-bottom) + 130rpx);
		}
	}

	@media screen and (min-width: 768px) {
		.inp_nav {
			height: auto;
			padding: 14px 0;
		}

		.inp-label {
			width: 100px;
		}

		.foot_nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}
	}
</style>
