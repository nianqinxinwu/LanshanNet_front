# IM发送消息功能测试指南

**测试时间**: 2026-03-02
**会话ID**: conv_user_10_user_13
**WebSocket服务**: ws://192.168.3.19:8282 ✅ 已运行

---

## 🎯 测试目标

测试用户在会话 `conv_user_10_user_13` 中发送消息的完整流程。

---

## ✅ 服务状态检查

### 1. WebSocket服务状态

```bash
# 进程检查
ps aux | grep -E "ImGateway|ImRegister|ImBusiness" | grep -v grep

# 结果：
✓ ImRegister  - 监听 1236端口（注册中心）
✓ ImGateway   - 监听 8282端口（WebSocket网关）× 2个进程
✓ ImBusinessWorker - 业务处理进程 × 2个进程

# 端口检查
netstat -an | grep 8282
✓ tcp4  *:8282  LISTEN  (WebSocket服务正常监听)
```

### 2. 数据库表检查

```sql
-- 会话表
SELECT * FROM fa_im_conversation WHERE conversation_id = 'conv_user_10_user_13';

-- 消息表
SELECT * FROM fa_im_message WHERE conversation_id = 'conv_user_10_user_13' ORDER BY id DESC LIMIT 10;
```

---

## 🧪 测试方法

### 方法1: 使用测试工具页面（推荐）

#### 步骤1: 访问测试页面

```
http://192.168.3.19:8000/im_test.html
```

#### 步骤2: 获取Token

1. **方式A: 从浏览器获取**

   打开浏览器控制台（F12），执行：
   ```javascript
   // 获取当前用户的token
   const userinfo = JSON.parse(localStorage.getItem('userinfo'));
   console.log('Token:', userinfo.token);
   console.log('用户ID:', userinfo.id);
   ```

2. **方式B: 登录接口获取**

   ```bash
   curl -X POST http://192.168.3.19:8000/api/xiluxc.user/login \
     -H "Content-Type: application/json" \
     -d '{
       "mobile": "17200475197",
       "captcha": "123456"
     }'

   # 从响应中获取 data.userinfo.token
   ```

#### 步骤3: 填写配置

- **WebSocket地址**: `ws://192.168.3.19:8282`
- **用户类型**: `user`
- **Token**: `<从上面步骤获取的token>`

#### 步骤4: 连接WebSocket

1. 点击 **"连接WebSocket"** 按钮
2. 等待连接成功提示
3. 等待认证成功提示（会显示用户ID）

#### 步骤5: 发送测试消息

填写发送消息表单：
- **会话ID**: `conv_user_10_user_13`
- **接收方类型**: `user`
- **接收方ID**: `13` （或 `10`，取决于你是哪个用户）
- **消息类型**: `1` （文本消息）
- **消息内容**: `这是一条测试消息`

点击 **"发送消息"** 按钮。

#### 步骤6: 查看结果

在日志区域应该看到：
```
发送消息: {"type":"chat",...}
收到消息: {"type":"chat_ack","msg_id":xxx,"msg":"发送成功"}
✓ 消息发送成功！消息ID: xxx
```

---

### 方法2: 使用浏览器控制台测试

如果你已经在前端页面登录，可以直接在控制台测试：

```javascript
// 1. 连接WebSocket
const ws = new WebSocket('ws://192.168.3.19:8282');

ws.onopen = function() {
    console.log('连接成功');

    // 2. 发送认证
    const userinfo = JSON.parse(localStorage.getItem('userinfo'));
    ws.send(JSON.stringify({
        type: 'auth',
        user_type: 'user',
        token: userinfo.token
    }));
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('收到消息:', data);

    // 认证成功后发送测试消息
    if (data.type === 'auth_success') {
        console.log('认证成功，用户ID:', data.uid);

        // 3. 发送聊天消息
        ws.send(JSON.stringify({
            type: 'chat',
            to_user_type: 'user',
            to_user_id: 13,  // 接收方ID
            msg_type: 1,     // 文本消息
            content: '测试消息：' + new Date().toLocaleTimeString(),
            client_msg_id: 'msg_' + Date.now()
        }));
    }

    // 收到发送确认
    if (data.type === 'chat_ack') {
        console.log('✓ 发送成功！消息ID:', data.msg_id);
    }
};

ws.onerror = function(error) {
    console.error('错误:', error);
};

ws.onclose = function() {
    console.log('连接关闭');
};
```

---

### 方法3: 使用前端页面测试

#### 步骤1: 登录系统

访问：`http://192.168.3.19:8082/web/#/pages/login/login`

登录账号：
- 手机号: `17200475197`
- 验证码: `123456`

#### 步骤2: 进入聊天页面

访问聊天列表：
```
http://192.168.3.19:8082/web/#/pages/im/im_chat_list/im_chat_list
```

点击会话 `conv_user_10_user_13` 进入聊天。

#### 步骤3: 发送消息

在输入框输入消息并点击发送按钮。

#### 步骤4: 检查Network

打开浏览器开发者工具（F12） → WS标签页，查看WebSocket消息：
- 应该能看到发送的chat消息
- 应该能收到chat_ack确认

---

## 📝 预期结果

### 1. WebSocket连接流程

```
客户端 → 服务端: WebSocket连接请求
  ↓
服务端 → 客户端: {"type":"connect","client_id":"xxx"}
  ↓
客户端 → 服务端: {"type":"auth","user_type":"user","token":"xxx"}
  ↓
服务端 → 客户端: {"type":"auth_success","uid":10}
  ↓ (认证成功)
```

### 2. 发送消息流程

```
客户端 → 服务端: {"type":"chat","to_user_id":13,"content":"测试"}
  ↓
服务端处理:
  1. 保存消息到数据库 (fa_im_message表)
  2. 更新会话最后消息 (fa_im_conversation表)
  3. 推送给接收方（如果在线）
  4. 发送ACK给发送方
  ↓
服务端 → 客户端: {"type":"chat_ack","msg_id":123,"msg":"发送成功"}
  ↓
服务端 → 接收方: {"type":"chat","content":"测试","from_user_id":10}
```

### 3. 数据库变化

```sql
-- 消息表新增记录
INSERT INTO fa_im_message (
    conversation_id,
    from_user_type, from_user_id,
    to_user_type, to_user_id,
    msg_type, content,
    is_read, createtime
) VALUES (
    'conv_user_10_user_13',
    'user', 10,
    'user', 13,
    1, '测试消息',
    0, 1709389200
);

-- 会话表更新
UPDATE fa_im_conversation
SET last_message = '测试消息',
    last_message_time = 1709389200
WHERE conversation_id = 'conv_user_10_user_13';
```

---

## 🔍 故障排查

### 问题1: 无法连接WebSocket

**检查**:
```bash
# 检查服务是否运行
ps aux | grep ImGateway

# 检查端口是否监听
netstat -an | grep 8282

# 查看服务日志
tail -f /tmp/im_server.log
```

**解决**: 如果服务未运行，启动服务：
```bash
cd /Users/wujilingtong/CYProject/andone.zzlanshan.site_online_001
php think im:server start -d
```

### 问题2: 认证失败

**检查**:
```javascript
// 浏览器控制台检查token
const userinfo = JSON.parse(localStorage.getItem('userinfo'));
console.log('Token:', userinfo.token);
console.log('是否有效:', !!userinfo.token);
```

**解决**: 重新登录获取新token。

### 问题3: 消息发送失败

**检查Events.php日志**:
```bash
# 查看PHP错误日志
tail -f /Users/wujilingtong/CYProject/andone.zzlanshan.site_online_001/runtime/log/202603/02.log
```

**检查数据库**:
```sql
-- 检查消息是否保存
SELECT * FROM fa_im_message ORDER BY id DESC LIMIT 5;
```

### 问题4: 对方收不到消息

**原因**: 对方不在线或WebSocket未连接

**检查**:
```bash
# 查看在线用户
# 需要在GatewayClient中调用Gateway::getAllClientInfo()
```

---

## 📊 测试用例

### 用例1: 发送文本消息

**输入**:
```json
{
    "type": "chat",
    "to_user_type": "user",
    "to_user_id": 13,
    "msg_type": 1,
    "content": "你好，这是测试消息",
    "client_msg_id": "msg_1709389200_abc123"
}
```

**预期**:
- ✅ 收到 `{"type":"chat_ack","msg_id":xxx}`
- ✅ 数据库新增消息记录
- ✅ 对方收到消息（如果在线）

### 用例2: 发送图片消息

**输入**:
```json
{
    "type": "chat",
    "to_user_type": "user",
    "to_user_id": 13,
    "msg_type": 2,
    "content": "http://192.168.3.19:8000/uploads/im/202603/abc123.jpg",
    "client_msg_id": "msg_1709389201_def456"
}
```

**预期**:
- ✅ 收到 `{"type":"chat_ack","msg_id":xxx}`
- ✅ 会话最后消息显示为 `[图片]`

### 用例3: 连续发送多条消息

发送5条消息，每条间隔1秒，验证：
- ✅ 所有消息都成功发送
- ✅ 消息顺序正确
- ✅ 没有丢失

---

## 🎉 测试总结

### 测试环境

- **后端服务**: http://192.168.3.19:8000 ✅
- **WebSocket服务**: ws://192.168.3.19:8282 ✅
- **前端页面**: http://192.168.3.19:8082/web/ ✅
- **测试工具**: http://192.168.3.19:8000/im_test.html ✅

### 测试内容

- [x] WebSocket连接
- [x] 用户认证
- [x] 发送文本消息
- [ ] 发送图片消息
- [ ] 接收实时消息
- [ ] 已读回执

### 相关文件

- ✅ `/application/im/Events.php` - WebSocket事件处理（已创建）
- ✅ `/application/command/ImServer.php` - WebSocket服务启动
- ✅ `/application/extra/im.php` - IM配置
- ✅ `/public/im_test.html` - 测试工具页面（已创建）

---

**开始测试请访问**: http://192.168.3.19:8000/im_test.html 🚀
