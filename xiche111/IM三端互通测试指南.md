# IM三端互通测试指南

**更新时间**: 2026-03-02

---

## ✅ 系统支持的通信

当前IM系统已完整支持**三端互通**：

| 端 | 用户类型 | 认证表 | Token表 |
|----|---------|--------|---------|
| **居间人端** | `user` | `fa_user` | `fa_user_token` |
| **工厂端** | `user` | `fa_user` | `fa_user_token` |
| **后台管理端** | `admin` | `fa_admin` | Session认证 |

---

## 🔄 通信矩阵

### 支持的所有通信组合

| 发送方 | 接收方 | user_type组合 | 会话ID格式 | 状态 |
|-------|-------|---------------|-----------|------|
| 居间人 | 工厂 | `user` ↔ `user` | `conv_user_10_user_13` | ✅ |
| 居间人 | 客服 | `user` ↔ `admin` | `conv_admin_1_user_10` | ✅ |
| 工厂 | 居间人 | `user` ↔ `user` | `conv_user_10_user_13` | ✅ |
| 工厂 | 客服 | `user` ↔ `admin` | `conv_admin_1_user_13` | ✅ |
| 客服 | 居间人 | `admin` ↔ `user` | `conv_admin_1_user_10` | ✅ |
| 客服 | 工厂 | `admin` ↔ `user` | `conv_admin_1_user_13` | ✅ |

---

## 🎯 业务场景示例

### 场景1: 居间人咨询工厂

**业务流程**:
```
居间人在商品详情页 → 点击"联系厂家" → 进入IM聊天
  ↓
发送消息: "你好，请问这款产品的最小起订量是多少？"
  ↓
工厂收到消息（如果在线） → 实时回复
  ↓
居间人收到回复 → 继续沟通
```

**技术实现**:
```javascript
// 居间人端（user_id=10）
{
    from_user_type: 'user',
    from_user_id: 10,
    to_user_type: 'user',
    to_user_id: 13,  // 工厂user_id
    content: '你好，请问这款产品的最小起订量是多少？'
}

// 会话ID: conv_user_10_user_13
```

### 场景2: 居间人联系客服

**业务流程**:
```
居间人遇到问题 → 点击"联系客服" → 进入IM聊天
  ↓
发送消息: "请问订单审核需要多久？"
  ↓
后台客服收到消息 → 查看处理
  ↓
客服回复 → 居间人收到
```

**技术实现**:
```javascript
// 居间人端（user_id=10）
{
    from_user_type: 'user',
    from_user_id: 10,
    to_user_type: 'admin',
    to_user_id: 1,  // 客服admin_id
    content: '请问订单审核需要多久？'
}

// 会话ID: conv_admin_1_user_10
```

### 场景3: 工厂联系客服

**业务流程**:
```
工厂上传付款证明后 → 点击"联系客服" → 进入IM聊天
  ↓
发送消息: "付款证明已上传，请尽快审核"
  ↓
后台客服收到提醒 → 查看审核
  ↓
客服回复审核结果 → 工厂收到
```

**技术实现**:
```javascript
// 工厂端（user_id=13）
{
    from_user_type: 'user',
    from_user_id: 13,
    to_user_type: 'admin',
    to_user_id: 1,  // 客服admin_id
    content: '付款证明已上传，请尽快审核'
}

// 会话ID: conv_admin_1_user_13
```

### 场景4: 客服主动联系用户

**业务流程**:
```
后台客服审核订单 → 需要补充材料 → 点击用户名 → 进入IM聊天
  ↓
发送消息: "您的付款证明不清晰，请重新上传"
  ↓
用户收到消息（如果在线） → 及时处理
```

**技术实现**:
```javascript
// 后台客服（admin_id=1）
{
    from_user_type: 'admin',
    from_user_id: 1,
    to_user_type: 'user',
    to_user_id: 10,  // 居间人user_id
    content: '您的付款证明不清晰，请重新上传'
}

// 会话ID: conv_admin_1_user_10
```

---

## 🧪 三端通信测试

### 测试环境

- **后端API**: http://192.168.3.19:8000
- **WebSocket**: ws://192.168.3.19:8282
- **前端页面**: http://192.168.3.19:8082/web/
- **测试工具**: http://192.168.3.19:8000/im_test.html

### 测试准备

#### 1. 准备3个测试账号

```sql
-- 居间人账号（user_id=10）
SELECT id, mobile, nickname FROM fa_user WHERE id = 10;

-- 工厂账号（user_id=13）
SELECT id, mobile, nickname FROM fa_user WHERE id = 13;

-- 后台客服账号（admin_id=1）
SELECT id, username, nickname FROM fa_admin WHERE id = 1;
```

#### 2. 获取Token

**普通用户Token**:
```sql
SELECT u.id, u.nickname, t.token
FROM fa_user u
LEFT JOIN fa_user_token t ON u.id = t.user_id
WHERE u.id IN (10, 13)
  AND (t.expiretime = 0 OR t.expiretime > UNIX_TIMESTAMP())
ORDER BY u.id;
```

**后台管理员Token**:
- 登录后台管理系统
- 浏览器控制台获取Session或Token

---

### 测试步骤

#### 测试1: 居间人 ↔ 工厂通信

**步骤1**: 打开两个浏览器窗口

- **窗口A**: 居间人（user_id=10）
- **窗口B**: 工厂（user_id=13）

**步骤2**: 两边都连接WebSocket

```javascript
// 窗口A（居间人）
WebSocket地址: ws://192.168.3.19:8282
用户类型: user
Token: <居间人token>

// 窗口B（工厂）
WebSocket地址: ws://192.168.3.19:8282
用户类型: user
Token: <工厂token>
```

**步骤3**: 居间人发送消息给工厂

```javascript
// 窗口A填写
接收方类型: user
接收方ID: 13
消息内容: 你好，我是居间人
```

**预期结果**:
- ✅ 窗口A收到 `chat_ack` 确认
- ✅ 窗口B收到 `chat` 消息
- ✅ 数据库 `fa_im_message` 新增记录

**步骤4**: 工厂回复消息

```javascript
// 窗口B填写
接收方类型: user
接收方ID: 10
消息内容: 你好，我是工厂
```

**预期结果**:
- ✅ 窗口B收到 `chat_ack` 确认
- ✅ 窗口A收到 `chat` 消息

---

#### 测试2: 居间人 ↔ 客服通信

**步骤1**: 打开两个浏览器窗口

- **窗口A**: 居间人（user_id=10, user_type=user）
- **窗口C**: 后台客服（admin_id=1, user_type=admin）

**步骤2**: 两边都连接WebSocket

```javascript
// 窗口A（居间人）
用户类型: user
Token: <居间人token>

// 窗口C（客服）
用户类型: admin
Token: <管理员token或session>
```

**步骤3**: 居间人发送消息给客服

```javascript
// 窗口A填写
接收方类型: admin
接收方ID: 1
消息内容: 客服你好，我有问题咨询
```

**预期结果**:
- ✅ 会话ID: `conv_admin_1_user_10`
- ✅ 窗口A收到发送成功确认
- ✅ 窗口C收到消息

**步骤4**: 客服回复

```javascript
// 窗口C填写
接收方类型: user
接收方ID: 10
消息内容: 您好，有什么可以帮您的？
```

**预期结果**:
- ✅ 窗口C收到发送成功确认
- ✅ 窗口A收到客服回复

---

#### 测试3: 工厂 ↔ 客服通信

**步骤1**: 打开两个浏览器窗口

- **窗口B**: 工厂（user_id=13, user_type=user）
- **窗口C**: 后台客服（admin_id=1, user_type=admin）

**步骤2**: 工厂发送消息给客服

```javascript
// 窗口B填写
接收方类型: admin
接收方ID: 1
消息内容: 客服你好，订单审核进度如何？
```

**预期结果**:
- ✅ 会话ID: `conv_admin_1_user_13`
- ✅ 窗口B收到发送成功确认
- ✅ 窗口C收到消息

**步骤3**: 客服查看并回复

```javascript
// 窗口C填写
接收方类型: user
接收方ID: 13
消息内容: 订单正在审核中，请稍候
```

**预期结果**:
- ✅ 窗口C收到发送成功确认
- ✅ 窗口B收到客服回复

---

## 📊 数据库验证

### 查看会话列表

```sql
-- 查看所有会话
SELECT
    conversation_id,
    user_type_1, user_id_1,
    user_type_2, user_id_2,
    last_message,
    FROM_UNIXTIME(last_message_time) as last_time
FROM fa_im_conversation
ORDER BY last_message_time DESC;
```

**预期结果**:
```
conversation_id           | user_type_1 | user_id_1 | user_type_2 | user_id_2 | last_message
--------------------------|-------------|-----------|-------------|-----------|-------------
conv_user_10_user_13      | user        | 10        | user        | 13        | 你好，我是工厂
conv_admin_1_user_10      | admin       | 1         | user        | 10        | 您好，有什么...
conv_admin_1_user_13      | admin       | 1         | user        | 13        | 订单正在审核中
```

### 查看消息记录

```sql
-- 查看居间人与工厂的聊天记录
SELECT
    id,
    from_user_type, from_user_id,
    to_user_type, to_user_id,
    content,
    FROM_UNIXTIME(createtime) as create_time
FROM fa_im_message
WHERE conversation_id = 'conv_user_10_user_13'
ORDER BY createtime DESC
LIMIT 10;
```

---

## ⚠️ 注意事项

### 1. 用户类型区分

| 角色 | user_type | 表 | 说明 |
|------|----------|-----|------|
| 居间人 | `user` | `fa_user` | 普通用户 |
| 工厂 | `user` | `fa_user` | 普通用户 |
| 后台客服 | `admin` | `fa_admin` | 管理员 |

⚠️ **关键**: 居间人和工厂的 `user_type` 都是 `user`，**不要混淆**！

### 2. 会话ID规则

会话ID按字母序和数值序排列，保证唯一性：

```javascript
// admin < user (字母序)
conv_admin_1_user_10  ✅ 正确
conv_user_10_admin_1  ❌ 错误

// 同类型按id数值序
conv_user_10_user_13  ✅ 正确（10 < 13）
conv_user_13_user_10  ❌ 错误
```

### 3. 后台管理端集成

目前后台管理端需要单独集成IM功能，包括：

- [ ] 添加IM聊天页面
- [ ] 集成WebSocket连接
- [ ] 添加会话列表
- [ ] 添加消息提醒

---

## 🎉 总结

### 当前状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 居间人 ↔ 工厂 | ✅ 完成 | 已实现并测试 |
| 居间人 ↔ 客服 | ✅ 完成 | WebSocket已支持 |
| 工厂 ↔ 客服 | ✅ 完成 | WebSocket已支持 |
| 客服 ↔ 用户 | ✅ 完成 | 需前端集成 |
| 心跳保活 | ✅ 完成 | 双向心跳 |
| 断线重连 | ✅ 完成 | 自动重连 |
| 消息持久化 | ✅ 完成 | 存储在数据库 |
| 未读计数 | ✅ 完成 | 实时统计 |

### 待完成

- [ ] 后台管理端IM界面开发
- [ ] 图片/文件消息测试
- [ ] 已读回执测试
- [ ] 离线消息推送

---

**三端互通已实现，可以开始业务测试！** 🎉
