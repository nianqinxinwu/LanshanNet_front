<template>
	<view class="im-chat-list">
		<!-- 导航栏 -->
		<view class="nav-bar">
			<text class="nav-title">消息</text>
		</view>

		<!-- 会话列表 -->
		<scroll-view scroll-y class="chat-list-scroll" @scrolltolower="loadMore">
			<view v-if="loading && list.length === 0" class="loading-tip">
				<u-loading-icon></u-loading-icon>
			</view>

			<view v-if="!loading && list.length === 0" class="empty-tip">
				<text>暂无消息</text>
			</view>

			<view
				v-for="item in list"
				:key="item.conversation_id"
				class="chat-item"
				@click="goChat(item)"
			>
				<!-- 头像 -->
				<view class="avatar-wrap">
					<image class="avatar" :src="item.other_user.avatar" mode="aspectFill"></image>
					<view v-if="item.other_online" class="online-dot"></view>
				</view>

				<!-- 消息内容 -->
				<view class="chat-info">
					<view class="chat-top">
						<text class="nickname">{{ item.other_user.nickname }}</text>
						<text class="user-id">ID:{{ item.other_user.user_id }}</text>
						<text class="time">{{ formatTime(item.last_message_time) }}</text>
					</view>
					<view class="chat-bottom">
						<text class="last-msg">{{ item.last_message || '暂无消息' }}</text>
						<view v-if="item.unread_count > 0" class="badge">
							<text class="badge-text">{{ item.unread_count > 99 ? '99+' : item.unread_count }}</text>
						</view>
					</view>
				</view>
			</view>

			<view v-if="loadingMore" class="loading-more">
				<u-loading-icon size="20"></u-loading-icon>
				<text class="loading-more-text">加载中...</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [],
			page: 1,
			total: 0,
			loading: false,
			loadingMore: false,
			wsHandler: null
		};
	},
	onShow() {
		this.page = 1;
		this.loadList();
		this.listenWs();
	},
	onHide() {
		this.unlistenWs();
	},
	onPullDownRefresh() {
		this.page = 1;
		this.loadList(() => {
			uni.stopPullDownRefresh();
		});
	},
	methods: {
		loadList(cb) {
			if (this.page === 1) this.loading = true;
			this.$core.get({
				url: 'xiluxc.im/conversation_list',
				data: { page: this.page },
				loading: false,
				success: (ret) => {
					if (this.page === 1) {
						this.list = ret.data.list;
					} else {
						this.list = this.list.concat(ret.data.list);
					}
					this.total = ret.data.total;
					this.loading = false;
					this.loadingMore = false;
					if (typeof cb === 'function') cb();
				},
				fail: () => {
					this.loading = false;
					this.loadingMore = false;
					if (typeof cb === 'function') cb();
				}
			});
		},
		loadMore() {
			if (this.loadingMore || this.list.length >= this.total) return;
			this.loadingMore = true;
			this.page++;
			this.loadList();
		},
		goChat(item) {
			uni.navigateTo({
				url: '/pages/im/im_chat/im_chat?conversation_id=' + item.conversation_id +
					'&to_user_type=' + item.other_user.user_type +
					'&to_user_id=' + item.other_user.user_id +
					'&nickname=' + encodeURIComponent(item.other_user.nickname)
			});
		},
		listenWs() {
			this.wsHandler = (data) => {
				if (data.type === 'chat' || data.type === 'messages_read') {
					// 收到新消息或已读回执，刷新列表
					this.page = 1;
					this.loadList();
				}
			};
			this.$im.onMessage(this.wsHandler);
		},
		unlistenWs() {
			if (this.wsHandler) {
				this.$im.offMessage(this.wsHandler);
				this.wsHandler = null;
			}
		},
		formatTime(timestamp) {
			if (!timestamp) return '';
			const now = new Date();
			const date = new Date(timestamp * 1000);
			const diff = Math.floor((now - date) / 1000);

			if (diff < 60) return '刚刚';
			if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
			if (diff < 86400) return Math.floor(diff / 3600) + '小时前';

			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			const dayDiff = Math.floor((today - msgDay) / 86400000);

			if (dayDiff === 1) return '昨天';
			if (dayDiff < 7) return dayDiff + '天前';

			const m = (date.getMonth() + 1).toString().padStart(2, '0');
			const d = date.getDate().toString().padStart(2, '0');
			if (date.getFullYear() === now.getFullYear()) {
				return m + '-' + d;
			}
			return date.getFullYear() + '-' + m + '-' + d;
		}
	}
};
</script>

<style scoped>
.im-chat-list {
	min-height: 100vh;
	background: #f5f5f5;
}

.nav-bar {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	border-bottom: 1rpx solid #eee;
	padding-top: var(--status-bar-height);
}

.nav-title {
	font-size: 34rpx;
	font-weight: bold;
	color: #333;
}

.chat-list-scroll {
	height: calc(100vh - 88rpx - var(--status-bar-height));
}

.chat-item {
	display: flex;
	align-items: center;
	padding: 24rpx 30rpx;
	background: #fff;
	border-bottom: 1rpx solid #f0f0f0;
}

.chat-item:active {
	background: #f5f5f5;
}

.avatar-wrap {
	position: relative;
	flex-shrink: 0;
	width: 96rpx;
	height: 96rpx;
	margin-right: 24rpx;
}

.avatar {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: #eee;
}

.online-dot {
	position: absolute;
	right: 2rpx;
	bottom: 2rpx;
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	background: #52c41a;
	border: 3rpx solid #fff;
}

.chat-info {
	flex: 1;
	overflow: hidden;
}

.chat-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.nickname {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.user-id {
	font-size: 22rpx;
	color: #aaa;
	margin-left: 8rpx;
	flex-shrink: 0;
}

.time {
	font-size: 24rpx;
	color: #999;
	flex-shrink: 0;
	margin-left: 16rpx;
}

.chat-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.last-msg {
	font-size: 26rpx;
	color: #999;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
}

.badge {
	min-width: 36rpx;
	height: 36rpx;
	border-radius: 18rpx;
	background: #ff4d4f;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 10rpx;
	margin-left: 16rpx;
	flex-shrink: 0;
}

.badge-text {
	font-size: 20rpx;
	color: #fff;
	line-height: 36rpx;
}

.loading-tip,
.empty-tip {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}

.loading-more {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx 0;
}

.loading-more-text {
	font-size: 24rpx;
	color: #999;
	margin-left: 10rpx;
}
</style>
