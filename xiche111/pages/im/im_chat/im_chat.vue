<template>
	<view class="im-chat">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack">
				<u-icon name="arrow-left" color="#333" size="20"></u-icon>
			</view>
			<view class="nav-center">
				<text class="nav-title">{{ nickname }}<text class="nav-uid">（ID:{{ toUserId }}）</text></text>
				<text v-if="otherOnline" class="online-status">在线</text>
			</view>
			<view class="nav-right"></view>
		</view>

		<!-- 消息列表 -->
		<scroll-view
			class="msg-scroll"
			:style="{ height: scrollHeight + 'px' }"
			scroll-y
			:scroll-into-view="scrollToId"
			:scroll-with-animation="true"
			@scrolltoupper="loadMoreHistory"
		>
			<view v-if="loadingHistory" class="loading-history">
				<u-loading-icon size="20"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>

			<view class="msg-list" id="msgListContainer">
				<view
					v-for="(msg, index) in messageList"
					:key="msg.client_msg_id || msg.id"
					:id="'msg_' + (msg.id || msg.client_msg_id)"
					class="msg-item"
					:class="{ 'msg-self': isSelf(msg), 'msg-other': !isSelf(msg), 'msg-system': msg.msg_type == 10 }"
				>
					<!-- 时间分隔 -->
					<view v-if="shouldShowTime(index)" class="time-divider">
						<text class="time-text">{{ formatMsgTime(msg.createtime) }}</text>
					</view>

					<!-- 系统消息 -->
					<view v-if="msg.msg_type == 10" class="system-msg">
						<text class="system-msg-text">{{ msg.content }}</text>
					</view>

					<!-- 普通消息 -->
					<view v-else class="msg-bubble-wrap" :class="{ 'self': isSelf(msg) }">
						<!-- 对方头像 -->
						<image v-if="!isSelf(msg)" class="msg-avatar" :src="otherAvatar" mode="aspectFill"></image>

						<view class="bubble-container" :class="{ 'self': isSelf(msg) }">
							<!-- 文本消息 -->
							<view v-if="msg.msg_type == 1" class="bubble" :class="{ 'bubble-self': isSelf(msg) }">
								<text class="bubble-text" :class="{ 'text-self': isSelf(msg) }">{{ msg.content }}</text>
							</view>

							<!-- 图片消息 -->
							<view v-else-if="msg.msg_type == 2" class="bubble-img" @click="previewImage(msg.content)">
								<image class="msg-image" :src="msg.content" mode="widthFix"></image>
							</view>

							<!-- 文件消息 -->
							<view v-else-if="msg.msg_type == 3" class="bubble" :class="{ 'bubble-self': isSelf(msg) }">
								<view class="file-msg" @click="openFile(msg.content)">
									<u-icon name="attach" size="18" color="#666"></u-icon>
									<text class="file-name">{{ getFileName(msg.content) }}</text>
								</view>
							</view>

							<!-- 订单卡片 -->
							<view v-else-if="msg.msg_type == 11" class="bubble order-card" @click="goOrderDetail(msg.extra)">
								<text class="order-card-title">订单信息</text>
								<text class="order-card-content">{{ getOrderSummary(msg.extra) }}</text>
								<text class="order-card-link">查看详情 ></text>
							</view>

							<!-- 发送状态 -->
							<view v-if="msg._sending" class="sending-status">
								<u-loading-icon size="14"></u-loading-icon>
							</view>
						</view>

						<!-- 自己头像 -->
						<image v-if="isSelf(msg)" class="msg-avatar" :src="myAvatar" mode="aspectFill"></image>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部输入栏 -->
		<view class="input-bar" :style="{ paddingBottom: keyboardHeight + 'px' }">
			<view class="input-row">
				<input
					class="msg-input"
					v-model="inputText"
					:adjust-position="false"
					confirm-type="send"
					placeholder="输入消息..."
					@confirm="sendTextMsg"
					@focus="onInputFocus"
					@blur="onInputBlur"
				/>
				<!-- 图片按钮 -->
				<view class="tool-btn" @click="chooseImage">
					<u-icon name="photo" size="24" color="#666"></u-icon>
				</view>
				<!-- 发送按钮 -->
				<view class="send-btn" :class="{ active: inputText.trim() }" @click="sendTextMsg">
					<text class="send-btn-text">发送</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			conversationId: '',
			toUserType: '',
			toUserId: 0,
			nickname: '',
			otherAvatar: '/assets/img/avatar.png',
			otherOnline: false,
			myAvatar: '/assets/img/avatar.png',
			myUserType: 'user',
			myUserId: 0,
			messageList: [],
			inputText: '',
			keyboardHeight: 0,
			scrollToId: '',
			loadingHistory: false,
			hasMoreHistory: true,
			statusBarHeight: 0,
			scrollHeight: 500,
			wsHandler: null
		};
	},
	onLoad(options) {
		this.conversationId = options.conversation_id || '';
		this.toUserType = options.to_user_type || '';
		this.toUserId = parseInt(options.to_user_id || 0);
		this.nickname = decodeURIComponent(options.nickname || '');

		const sysInfo = uni.getSystemInfoSync();
		this.statusBarHeight = sysInfo.statusBarHeight || 0;
		// 计算滚动区域高度: 屏幕高 - 导航栏(44+状态栏) - 输入栏(约100rpx)
		const navHeight = this.statusBarHeight + 44;
		const inputBarHeight = 55; // px
		this.scrollHeight = sysInfo.windowHeight - navHeight - inputBarHeight;

		const userinfo = this.$core.getUserinfo();
		if (userinfo) {
			this.myUserId = userinfo.id;
			this.myAvatar = userinfo.avatar || '/assets/img/avatar.png';
		}

		this.loadHistory();
		this.loadOtherInfo();
		this.markRead();
		this.listenWs();
	},
	onUnload() {
		this.unlistenWs();
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},

		// 加载历史消息
		loadHistory() {
			let lastId = 0;
			if (this.messageList.length > 0) {
				lastId = this.messageList[0].id || 0;
			}
			this.loadingHistory = true;
			this.$core.get({
				url: 'xiluxc.im/history',
				data: {
					conversation_id: this.conversationId,
					last_id: lastId
				},
				loading: false,
				success: (ret) => {
					const msgs = (ret.data.list || []).reverse(); // API返回倒序，翻转为正序
					if (msgs.length < 20) {
						this.hasMoreHistory = false;
					}
					if (lastId === 0) {
						this.messageList = msgs;
						this.$nextTick(() => { this.scrollToBottom(); });
					} else {
						this.messageList = msgs.concat(this.messageList);
					}
					this.loadingHistory = false;
				},
				fail: () => {
					this.loadingHistory = false;
				}
			});
		},

		// 上拉加载更多
		loadMoreHistory() {
			if (this.loadingHistory || !this.hasMoreHistory) return;
			this.loadHistory();
		},

		// 加载对方信息
		loadOtherInfo() {
			this.$core.get({
				url: 'xiluxc.im/user_info',
				data: {
					user_type: this.toUserType,
					user_id: this.toUserId
				},
				loading: false,
				success: (ret) => {
					this.nickname = ret.data.nickname || this.nickname;
					this.otherAvatar = ret.data.avatar || this.otherAvatar;
					this.otherOnline = ret.data.online || false;
				}
			});
		},

		// 标记已读
		markRead() {
			if (!this.conversationId) return;
			this.$core.post({
				url: 'xiluxc.im/mark_read',
				data: { conversation_id: this.conversationId },
				loading: false,
				success: () => {},
				fail: () => {}
			});
			// WebSocket也发送已读
			this.$im.sendRead(this.conversationId);
		},

		// 发送文本消息
		sendTextMsg() {
			const text = this.inputText.trim();
			if (!text) return;
			this.inputText = '';

			const clientMsgId = this.$im.generateMsgId();
			// 乐观UI：先显示
			const msg = {
				client_msg_id: clientMsgId,
				from_user_type: this.myUserType,
				from_user_id: this.myUserId,
				to_user_type: this.toUserType,
				to_user_id: this.toUserId,
				msg_type: 1,
				content: text,
				createtime: Math.floor(Date.now() / 1000),
				_sending: true
			};
			this.messageList.push(msg);
			this.$nextTick(() => { this.scrollToBottom(); });

			// 通过WebSocket发送
			this.$im.sendChat(this.toUserType, this.toUserId, 1, text, clientMsgId);
		},

		// 选择图片发送
		chooseImage() {
			const that = this;
			uni.chooseImage({
				count: 1,
				success: (res) => {
					const filePath = res.tempFilePaths[0];
					const clientMsgId = that.$im.generateMsgId();

					// 乐观UI
					const msg = {
						client_msg_id: clientMsgId,
						from_user_type: that.myUserType,
						from_user_id: that.myUserId,
						to_user_type: that.toUserType,
						to_user_id: that.toUserId,
						msg_type: 2,
						content: filePath,
						createtime: Math.floor(Date.now() / 1000),
						_sending: true
					};
					that.messageList.push(msg);
					that.$nextTick(() => { that.scrollToBottom(); });

					// 上传图片到IM专用存储
					that.uploadImFile(filePath, function(url) {
						msg.content = url;
						msg._sending = false;
						that.$im.sendChat(that.toUserType, that.toUserId, 2, url, clientMsgId);
					}, function() {
						msg._sending = false;
						msg._failed = true;
					});
				}
			});
		},

		// 监听WebSocket消息
		listenWs() {
			this.wsHandler = (data) => {
				if (data.type === 'chat') {
					if (data.conversation_id === this.conversationId) {
						// 检查是否已有乐观UI的消息
						const idx = this.messageList.findIndex(m => m.client_msg_id === data.client_msg_id);
						if (idx === -1) {
							// 对方发来的新消息
							this.messageList.push(data);
							this.$nextTick(() => { this.scrollToBottom(); });
							this.markRead();
						}
					}
				} else if (data.type === 'chat_ack') {
					// 确认发送成功
					const idx = this.messageList.findIndex(m => m.client_msg_id === data.client_msg_id);
					if (idx > -1) {
						this.$set(this.messageList[idx], 'id', data.msg_id);
						this.$set(this.messageList[idx], 'createtime', data.createtime);
						this.$set(this.messageList[idx], '_sending', false);
					}
				} else if (data.type === 'messages_read') {
					if (data.conversation_id === this.conversationId) {
						// 对方已读，更新状态
						this.messageList.forEach(msg => {
							if (this.isSelf(msg)) {
								this.$set(msg, 'is_read', 1);
							}
						});
					}
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

		isSelf(msg) {
			return msg.from_user_type === this.myUserType && msg.from_user_id == this.myUserId;
		},

		scrollToBottom() {
			if (this.messageList.length > 0) {
				const last = this.messageList[this.messageList.length - 1];
				this.scrollToId = 'msg_' + (last.id || last.client_msg_id);
			}
		},

		shouldShowTime(index) {
			if (index === 0) return true;
			const curr = this.messageList[index];
			const prev = this.messageList[index - 1];
			return (curr.createtime - prev.createtime) > 300; // 5分钟间隔显示时间
		},

		formatMsgTime(timestamp) {
			if (!timestamp) return '';
			const date = new Date(timestamp * 1000);
			const h = date.getHours().toString().padStart(2, '0');
			const m = date.getMinutes().toString().padStart(2, '0');
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			const dayDiff = Math.floor((today - msgDay) / 86400000);

			if (dayDiff === 0) return h + ':' + m;
			if (dayDiff === 1) return '昨天 ' + h + ':' + m;
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			return month + '-' + day + ' ' + h + ':' + m;
		},

		previewImage(url) {
			uni.previewImage({ urls: [url], current: url });
		},

		openFile(url) {
			// #ifdef H5
			window.open(url);
			// #endif
			// #ifndef H5
			uni.downloadFile({
				url: url,
				success: (res) => {
					uni.openDocument({ filePath: res.tempFilePath });
				}
			});
			// #endif
		},

		getFileName(url) {
			if (!url) return '文件';
			const parts = url.split('/');
			return decodeURIComponent(parts[parts.length - 1]) || '文件';
		},

		getOrderSummary(extra) {
			try {
				const data = typeof extra === 'string' ? JSON.parse(extra) : extra;
				return data.title || data.order_sn || '订单详情';
			} catch (e) {
				return '订单详情';
			}
		},

		goOrderDetail(extra) {
			try {
				const data = typeof extra === 'string' ? JSON.parse(extra) : extra;
				if (data.order_id) {
					uni.navigateTo({
						url: '/pages/jj/jj_order_detail/jj_order_detail?id=' + data.order_id
					});
				}
			} catch (e) {}
		},

		onInputFocus(e) {
			this.keyboardHeight = e.detail.height || 0;
			this.$nextTick(() => { this.scrollToBottom(); });
		},

		onInputBlur() {
			this.keyboardHeight = 0;
		},

		/**
		 * IM专用文件上传（使用IM独立存储路径）
		 * @param {string} filePath 临时文件路径
		 * @param {function} successCb 成功回调 (url)
		 * @param {function} failCb 失败回调
		 */
		uploadImFile(filePath, successCb, failCb) {
			const userinfo = this.$core.getUserinfo();
			const header = {};
			if (userinfo && userinfo.token) {
				header.token = userinfo.token;
			}
			uni.showLoading({ title: '上传中' });
			uni.uploadFile({
				name: 'file',
				filePath: filePath,
				formData: {},
				url: getApp({ allowDefault: true }).globalData.apiBaseUri + '/xiluxc.im_upload/upload',
				header: header,
				success: (res) => {
					uni.hideLoading();
					if (res.statusCode !== 200) {
						uni.showToast({ title: '上传失败', icon: 'none' });
						if (typeof failCb === 'function') failCb();
						return;
					}
					let data;
					try {
						data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
					} catch(e) {
						uni.showToast({ title: '上传失败', icon: 'none' });
						if (typeof failCb === 'function') failCb();
						return;
					}
					if (data.code == 1 && data.data && data.data.url) {
						if (typeof successCb === 'function') successCb(data.data.url);
					} else {
						uni.showToast({ title: data.msg || '上传失败', icon: 'none' });
						if (typeof failCb === 'function') failCb();
					}
				},
				fail: () => {
					uni.hideLoading();
					uni.showToast({ title: '上传失败', icon: 'none' });
					if (typeof failCb === 'function') failCb();
				}
			});
		}
	}
};
</script>

<style scoped>
.im-chat {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f5f5;
}

/* 导航栏 */
.nav-bar {
	display: flex;
	align-items: center;
	height: 88rpx;
	background: #fff;
	border-bottom: 1rpx solid #eee;
	padding-left: 20rpx;
	padding-right: 20rpx;
	flex-shrink: 0;
}

.nav-left {
	width: 80rpx;
	display: flex;
	align-items: center;
}

.nav-center {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.nav-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.nav-uid {
	font-size: 24rpx;
	font-weight: normal;
	color: #999;
}

.online-status {
	font-size: 22rpx;
	color: #52c41a;
	margin-top: 2rpx;
}

.nav-right {
	width: 80rpx;
}

/* 消息滚动区域 */
.msg-scroll {
	flex: 1;
	overflow: hidden;
}

.loading-history {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx;
}

.loading-text {
	font-size: 24rpx;
	color: #999;
	margin-left: 10rpx;
}

.msg-list {
	padding: 20rpx 24rpx;
}

/* 消息条目 */
.msg-item {
	margin-bottom: 20rpx;
}

/* 时间分隔 */
.time-divider {
	display: flex;
	justify-content: center;
	margin: 16rpx 0;
}

.time-text {
	font-size: 22rpx;
	color: #999;
	background: rgba(0,0,0,0.05);
	padding: 6rpx 20rpx;
	border-radius: 20rpx;
}

/* 系统消息 */
.system-msg {
	display: flex;
	justify-content: center;
	margin: 12rpx 0;
}

.system-msg-text {
	font-size: 24rpx;
	color: #999;
	background: rgba(0,0,0,0.05);
	padding: 10rpx 24rpx;
	border-radius: 8rpx;
	max-width: 80%;
	text-align: center;
}

/* 气泡容器 */
.msg-bubble-wrap {
	display: flex;
	align-items: flex-start;
}

.msg-bubble-wrap.self {
	flex-direction: row-reverse;
}

.msg-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	flex-shrink: 0;
	background: #eee;
}

.bubble-container {
	margin: 0 16rpx;
	max-width: 65%;
	display: flex;
	align-items: center;
}

.bubble-container.self {
	flex-direction: row-reverse;
}

/* 气泡 */
.bubble {
	padding: 18rpx 24rpx;
	border-radius: 16rpx;
	background: #fff;
	word-break: break-all;
}

.bubble-self {
	background: #95ec69;
}

.bubble-text {
	font-size: 30rpx;
	color: #333;
	line-height: 1.5;
}

.text-self {
	color: #000;
}

/* 图片消息 */
.bubble-img {
	border-radius: 12rpx;
	overflow: hidden;
}

.msg-image {
	max-width: 400rpx;
	min-width: 100rpx;
	border-radius: 12rpx;
}

/* 文件消息 */
.file-msg {
	display: flex;
	align-items: center;
}

.file-name {
	font-size: 28rpx;
	color: #1890ff;
	margin-left: 10rpx;
	text-decoration: underline;
}

/* 订单卡片 */
.order-card {
	background: #fff;
	border: 1rpx solid #eee;
	padding: 20rpx;
	min-width: 300rpx;
}

.order-card-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 10rpx;
}

.order-card-content {
	font-size: 26rpx;
	color: #666;
	display: block;
	margin-bottom: 10rpx;
}

.order-card-link {
	font-size: 24rpx;
	color: #1890ff;
}

/* 发送状态 */
.sending-status {
	margin: 0 8rpx;
}

/* 输入栏 */
.input-bar {
	background: #fff;
	border-top: 1rpx solid #eee;
	flex-shrink: 0;
	padding: 16rpx 20rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.input-row {
	display: flex;
	align-items: center;
}

.msg-input {
	flex: 1;
	height: 72rpx;
	background: #f5f5f5;
	border-radius: 36rpx;
	padding: 0 28rpx;
	font-size: 28rpx;
}

.tool-btn {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 10rpx;
}

.send-btn {
	height: 64rpx;
	padding: 0 28rpx;
	background: #ddd;
	border-radius: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 10rpx;
}

.send-btn.active {
	background: #07c160;
}

.send-btn-text {
	font-size: 28rpx;
	color: #fff;
}
</style>
