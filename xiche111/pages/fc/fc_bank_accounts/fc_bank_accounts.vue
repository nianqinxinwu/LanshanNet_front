<template>
	<view>
		<view class="page-foot bg-white" v-if="!loading">
			<view class="foot_nav">
				<view class="btn5" @click="goAdd">添加对公账户</view>
			</view>
		</view>
		<view class="container bg-f5">
			<view class="jj-page-wrap p30">
				<view class="account-card box mb20" v-for="(item, index) in list" :key="index">
					<view class="flex-box mb20">
						<view class="flex-grow-1">
							<view class="fs30 fwb col1">{{ item.account_name }}</view>
							<view class="fs24 col9 mt8">{{ item.bank_name }} {{ item.bank_branch }}</view>
							<view class="fs28 col5 mt8">{{ maskBankNo(item.bank_no) }}</view>
						</view>
						<view class="default-tag" v-if="item.is_default">默认</view>
					</view>
					<view class="flex-box account-actions">
						<view class="action-btn" @click="goEdit(item)">编辑</view>
						<view class="action-btn" @click="onSetDefault(item)" v-if="!item.is_default">设为默认</view>
						<view class="action-btn del" @click="onDelete(item)">删除</view>
					</view>
				</view>

				<view class="nothing" v-if="!loading && list.length === 0">
					<view class="tc ptb40">
						<view class="fs28 col9">暂无对公账户</view>
						<view class="fs24 col9 mt10">请点击下方按钮添加</view>
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
				list: [],
				loading: true
			}
		},
		onLoad() {
			this.loadList();
		},
		onShow() {
			this.loadList();
		},
		methods: {
			loadList() {
				this.$core.get({
					url: 'xiluxc.fc_wallet/bank_account_list',
					loading: false,
					success: ret => {
						this.list = ret.data.list || [];
						this.loading = false;
					},
					fail: () => {
						this.loading = false;
						return false;
					}
				});
			},
			maskBankNo(no) {
				if (!no || no.length <= 4) return no;
				return '****  ****  ****  ' + no.slice(-4);
			},
			goAdd() {
				uni.navigateTo({ url: '/pages/fc/fc_bank_account_edit/fc_bank_account_edit' });
			},
			goEdit(item) {
				uni.navigateTo({
					url: '/pages/fc/fc_bank_account_edit/fc_bank_account_edit?id=' + item.id
						+ '&account_name=' + encodeURIComponent(item.account_name)
						+ '&bank_name=' + encodeURIComponent(item.bank_name)
						+ '&bank_branch=' + encodeURIComponent(item.bank_branch)
						+ '&bank_no=' + encodeURIComponent(item.bank_no)
				});
			},
			onSetDefault(item) {
				this.$core.post({
					url: 'xiluxc.fc_wallet/bank_account_set_default',
					data: { id: item.id },
					success: () => {
						uni.showToast({ title: '设置成功', icon: 'success' });
						this.loadList();
					}
				});
			},
			onDelete(item) {
				uni.showModal({
					title: '提示',
					content: '确定删除该对公账户？',
					success: res => {
						if (res.confirm) {
							this.$core.post({
								url: 'xiluxc.fc_wallet/bank_account_delete',
								data: { id: item.id },
								success: () => {
									uni.showToast({ title: '删除成功', icon: 'success' });
									this.loadList();
								}
							});
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.account-card {
		position: relative;
	}

	.box {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.default-tag {
		background: #FE4B01;
		color: #FFFFFF;
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 6rpx;
		height: fit-content;
	}

	.account-actions {
		border-top: 1rpx solid #F0F0F0;
		padding-top: 20rpx;
		gap: 30rpx;
	}

	.action-btn {
		font-size: 26rpx;
		color: #FE4B01;
		cursor: pointer;

		&.del {
			color: #FF4D4F;
		}
	}

	.nothing {
		padding: 60rpx 0;
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
		.box {
			padding: 24px;
			border-radius: 12px;
			margin-bottom: 16px;
		}

		.foot_nav {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding: 10px 30px;
		}
	}
</style>
