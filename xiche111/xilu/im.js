/**
 * IM WebSocket 客户端
 * 使用方式: import im from './xilu/im.js'; Vue.prototype.$im = im;
 */

let socketTask = null;
let isConnected = false;
let reconnectTimer = null;
let reconnectCount = 0;
let heartbeatTimer = null;
let messageHandlers = [];
let pendingAuth = null;

const MAX_RECONNECT = 10;
const RECONNECT_BASE = 3000;
const HEARTBEAT_INTERVAL = 25000;

module.exports = {
	/**
	 * 连接WebSocket
	 * @param {string} wsUrl WebSocket地址 如 ws://xxx:8282 或 wss://xxx/wss
	 * @param {string} userType 用户类型 user|admin
	 * @param {string} token 认证token
	 * @param {function} onConnected 连接成功回调
	 */
	connect(wsUrl, userType, token, onConnected) {
		if (socketTask && isConnected) {
			this.disconnect();
		}

		pendingAuth = { userType, token, onConnected };
		reconnectCount = 0;
		this._doConnect(wsUrl);
	},

	_doConnect(wsUrl) {
		const that = this;

		socketTask = uni.connectSocket({
			url: wsUrl,
			complete: () => {}
		});

		socketTask.onOpen(() => {
			console.log('[IM] WebSocket connected');
			isConnected = true;
			reconnectCount = 0;

			// 发送认证
			if (pendingAuth) {
				that._send({
					type: 'auth',
					user_type: pendingAuth.userType,
					token: pendingAuth.token
				});
			}

			// 启动心跳
			that._startHeartbeat();
		});

		socketTask.onMessage((res) => {
			let data;
			try {
				data = JSON.parse(res.data);
			} catch (e) {
				return;
			}

			// 处理特殊消息类型
			if (data.type === 'connect') {
				// 服务端分配client_id
				return;
			}

			if (data.type === 'auth_success') {
				console.log('[IM] Auth success, uid:', data.uid);
				if (pendingAuth && typeof pendingAuth.onConnected === 'function') {
					pendingAuth.onConnected(data);
				}
				return;
			}

			if (data.type === 'auth_fail') {
				console.error('[IM] Auth failed:', data.msg);
				return;
			}

			if (data.type === 'ping') {
				that._send({ type: 'pong' });
				return;
			}

			// 分发给所有注册的消息处理器
			for (let i = 0; i < messageHandlers.length; i++) {
				try {
					messageHandlers[i](data);
				} catch (e) {
					console.error('[IM] Handler error:', e);
				}
			}
		});

		socketTask.onError((err) => {
			console.error('[IM] WebSocket error:', err);
			isConnected = false;
		});

		socketTask.onClose(() => {
			console.log('[IM] WebSocket closed');
			isConnected = false;
			that._stopHeartbeat();
			that._tryReconnect(wsUrl);
		});
	},

	/**
	 * 发送聊天消息
	 */
	sendChat(toUserType, toUserId, msgType, content, clientMsgId, extra) {
		let msg = {
			type: 'chat',
			to_user_type: toUserType,
			to_user_id: toUserId,
			msg_type: msgType,
			content: content,
			client_msg_id: clientMsgId || this.generateMsgId()
		};
		if (extra) {
			msg.extra = extra;
		}
		this._send(msg);
		return msg.client_msg_id;
	},

	/**
	 * 发送已读回执
	 */
	sendRead(conversationId) {
		this._send({
			type: 'read',
			conversation_id: conversationId
		});
	},

	/**
	 * 注册消息回调
	 */
	onMessage(handler) {
		if (typeof handler === 'function' && messageHandlers.indexOf(handler) === -1) {
			messageHandlers.push(handler);
		}
	},

	/**
	 * 移除消息回调
	 */
	offMessage(handler) {
		const idx = messageHandlers.indexOf(handler);
		if (idx > -1) {
			messageHandlers.splice(idx, 1);
		}
	},

	/**
	 * 断开连接
	 */
	disconnect() {
		reconnectCount = MAX_RECONNECT; // 阻止重连
		this._stopHeartbeat();
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
		if (socketTask) {
			try {
				socketTask.close();
			} catch (e) {}
			socketTask = null;
		}
		isConnected = false;
		pendingAuth = null;
		messageHandlers = [];
	},

	/**
	 * 是否已连接
	 */
	isConnected() {
		return isConnected;
	},

	/**
	 * 生成客户端消息ID
	 */
	generateMsgId() {
		return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
	},

	// --- 内部方法 ---

	_send(data) {
		if (socketTask && isConnected) {
			socketTask.send({
				data: JSON.stringify(data),
				fail: (err) => {
					console.error('[IM] Send failed:', err);
				}
			});
		}
	},

	_startHeartbeat() {
		this._stopHeartbeat();
		heartbeatTimer = setInterval(() => {
			if (isConnected) {
				this._send({ type: 'pong' });
			}
		}, HEARTBEAT_INTERVAL);
	},

	_stopHeartbeat() {
		if (heartbeatTimer) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = null;
		}
	},

	_tryReconnect(wsUrl) {
		if (reconnectCount >= MAX_RECONNECT) {
			console.log('[IM] Max reconnect attempts reached');
			return;
		}
		// 指数退避
		const delay = RECONNECT_BASE * Math.pow(1.5, reconnectCount);
		reconnectCount++;
		console.log('[IM] Reconnecting in ' + delay + 'ms (attempt ' + reconnectCount + ')');
		reconnectTimer = setTimeout(() => {
			this._doConnect(wsUrl);
		}, delay);
	}
};
