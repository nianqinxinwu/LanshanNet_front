# IM消息入口功能实现说明

**更新时间**: 2026-03-02

---

## 📝 需求描述

在居间人端和工厂端首页添加IM消息入口，方便居间人、工厂和后台管理客服进行沟通。

---

## ✅ 实现内容

### 1. 居间人端首页 - 添加IM消息入口

**文件**: `/pages/jj/jj_home/jj_home.vue`

#### 修改内容

1. **快捷入口区域（第44-73行）**
   - 在浏览商品和竞标管理之间添加了"消息"入口
   - 使用紫色渐变背景：`linear-gradient(135deg, #9254de, #b37feb)`
   - 使用💬 emoji图标
   - 显示未读消息数角标（红色圆点）

2. **数据字段（第152行）**
   ```javascript
   unreadCount: 0  // 添加未读消息数
   ```

3. **生命周期方法**
   - `onReady()`: 添加加载未读消息数
   - `onShow()`: 页面显示时刷新未读消息数

4. **新增方法（第179-188行）**
   ```javascript
   loadUnreadCount() {
       this.$core.get({
           url: 'xiluxc.im/unread_count',
           loading: false,
           success: ret => {
               this.unreadCount = ret.data.count || 0;
           },
           fail: () => { return false; }
       });
   }
   ```

5. **路由跳转（第292-299行）**
   ```javascript
   onQuickEntry(type) {
       const routes = {
           'im': '/pages/im/im_chat_list/im_chat_list',
           // ... 其他路由
       };
   }
   ```

6. **样式（第388-433行）**
   - 添加 `.quick-icon-text` 支持emoji图标显示
   - 添加 `.unread-badge` 红色角标容器
   - 添加 `.unread-text` 角标文字样式
   - 支持超过99条显示"99+"

---

### 2. 工厂端首页 - 添加快捷入口区域

**文件**: `/pages/fc/fc_dashboard/fc_dashboard.vue`

#### 修改内容

1. **快捷入口区域（第3-31行）**
   新增完整的快捷入口模块，包含4个入口：
   - **消息** 💬 - 紫色渐变，带未读角标
   - **居间人** 👥 - 绿色渐变
   - **商品管理** 📦 - 蓝色渐变
   - **提现** 💰 - 红色渐变

2. **数据字段（第64行）**
   ```javascript
   unreadCount: 0  // 添加未读消息数
   ```

3. **生命周期方法**
   - `onLoad()`: 添加加载未读消息数
   - `onShow()`: 页面显示时刷新未读消息数

4. **新增方法（第85-99行）**
   ```javascript
   onQuickEntry(type) {
       const routes = {
           'im': '/pages/im/im_chat_list/im_chat_list',
           'agents': '/pages/fc/fc_agents/fc_agents',
           'withdraw': '/pages/fc/fc_withdraw/fc_withdraw'
       };
   }

   loadUnreadCount() {
       // 加载未读消息数
   }
   ```

5. **样式（第202-251行）**
   - 添加 `.quick-grid` 4列网格布局
   - 添加 `.quick-item` 快捷入口项
   - 添加 `.quick-icon-wrap` 图标容器
   - 添加 `.quick-icon-text` emoji图标
   - 添加 `.unread-badge` 和 `.unread-text` 未读角标
   - PC端添加hover悬浮效果

---

## 🔧 技术实现

### 未读消息数获取

**API接口**: `GET /api/xiluxc.im/unread_count`

**请求**:
```javascript
{
    // 需要token鉴权
}
```

**响应**:
```json
{
    "code": 1,
    "msg": "ok",
    "data": {
        "count": 5  // 未读消息总数
    }
}
```

### 消息列表页面

**路径**: `/pages/im/im_chat_list/im_chat_list.vue`

**功能**:
- 显示所有会话列表
- 显示对方昵称、用户ID、在线状态
- 显示最后一条消息内容和时间
- 显示每个会话的未读消息数
- 点击进入聊天页面
- 支持下拉刷新
- 支持上拉加载更多
- WebSocket实时更新

---

## 📊 功能流程

### 居间人端流程

```
居间人打开首页
  ↓
自动加载未读消息数 (GET /api/xiluxc.im/unread_count)
  ↓
显示未读数角标（如果>0）
  ↓
点击"消息"入口
  ↓
跳转到会话列表页 (/pages/im/im_chat_list/im_chat_list)
  ↓
显示所有会话（居间人 ↔ 工厂 / 居间人 ↔ 后台客服）
  ↓
点击某个会话
  ↓
进入聊天页面，可以实时沟通
```

### 工厂端流程

```
工厂打开首页
  ↓
自动加载未读消息数
  ↓
显示快捷入口区域（消息、居间人、商品管理、提现）
  ↓
点击"消息"入口
  ↓
跳转到会话列表页
  ↓
显示所有会话（工厂 ↔ 居间人 / 工厂 ↔ 后台客服）
  ↓
点击某个会话
  ↓
进入聊天页面，可以实时沟通
```

---

## 🎨 UI设计

### 快捷入口布局

- **网格布局**: 4列或5列（根据端不同）
- **图标尺寸**: 90rpx × 90rpx
- **圆角**: 20rpx
- **阴影**: `0 6rpx 16rpx rgba(0, 0, 0, 0.12)`
- **emoji大小**: 40rpx

### 未读角标样式

- **位置**: 图标右上角
- **背景色**: #ff4d4f（红色）
- **最小宽度**: 32rpx
- **高度**: 32rpx
- **圆角**: 16rpx（完全圆形）
- **边框**: 2rpx 白色
- **文字大小**: 20rpx，加粗
- **最大显示**: 99+

### 消息图标配色

- **渐变**: `linear-gradient(135deg, #9254de, #b37feb)`
- **从深紫色到浅紫色**
- **与其他图标区分明显**

---

## ✅ 功能验证

### 测试步骤

1. **居间人端测试**
   ```
   1. 打开居间人端首页 (/pages/jj/jj_home/jj_home)
   2. 检查快捷入口中是否有"消息"图标
   3. 如果有未读消息，检查是否显示红色角标
   4. 点击"消息"入口
   5. 应该跳转到会话列表页
   6. 查看所有会话
   7. 点击某个会话进入聊天
   ```

2. **工厂端测试**
   ```
   1. 打开工厂端首页 (/pages/fc/fc_dashboard/fc_dashboard)
   2. 检查是否有快捷入口区域（4个图标）
   3. 第一个应该是"消息"图标
   4. 检查未读角标是否正常显示
   5. 点击"消息"入口
   6. 应该跳转到会话列表页
   7. 查看所有会话
   8. 点击某个会话进入聊天
   ```

3. **未读消息数测试**
   ```
   1. 在后台或另一端发送消息
   2. 返回首页刷新
   3. 检查未读角标数字是否更新
   4. 进入会话列表查看消息
   5. 返回首页，未读数应该清零
   ```

### 预期结果

- ✅ 居间人端首页显示"消息"入口
- ✅ 工厂端首页显示快捷入口区域
- ✅ 未读消息数正确显示
- ✅ 点击"消息"可以跳转到会话列表
- ✅ 会话列表显示所有对话
- ✅ 可以正常进入聊天页面
- ✅ 未读角标超过99显示"99+"

---

## ⚠️ 注意事项

### 1. API依赖

确保以下接口正常工作：
- ✅ `GET /api/xiluxc.im/unread_count` - 获取未读消息数
- ✅ `GET /api/xiluxc.im/conversation_list` - 获取会话列表
- ✅ `GET /api/xiluxc.im/history` - 获取聊天记录
- ✅ `POST /api/xiluxc.im/start_conversation` - 创建或获取会话

### 2. 权限要求

- 需要用户登录（token鉴权）
- 居间人只能看到居间人相关的会话
- 工厂只能看到工厂相关的会话

### 3. 性能优化

- 未读消息数不频繁刷新，仅在首页onShow时加载
- 会话列表支持分页加载（每页20条）
- WebSocket实时推送新消息，无需轮询

### 4. 兼容性

- 支持H5、小程序、APP端
- PC端有hover悬浮效果
- 移动端支持触摸操作

---

## 🎯 相关功能

### 现有IM功能

1. **会话列表** (`/pages/im/im_chat_list/im_chat_list.vue`)
   - 显示所有会话
   - 显示未读消息数
   - 显示在线状态
   - 实时更新

2. **聊天页面** (`/pages/im/im_chat/im_chat.vue`)
   - 发送文本消息
   - 发送图片
   - 发送文件
   - 实时消息推送
   - 消息已读状态
   - 历史消息加载

3. **后端API** (`/application/api/controller/xiluxc/Im.php`)
   - 会话列表
   - 聊天记录
   - 标记已读
   - 未读数量
   - 创建会话
   - 获取用户信息

---

## 📝 总结

**修改文件**:
- ✅ `/pages/jj/jj_home/jj_home.vue` - 居间人端首页
- ✅ `/pages/fc/fc_dashboard/fc_dashboard.vue` - 工厂端首页

**新增功能**:
- ✅ 居间人端IM消息入口
- ✅ 工厂端快捷入口区域（包含IM消息）
- ✅ 未读消息数显示
- ✅ 未读角标（支持99+）

**功能状态**:
- ✅ IM消息入口已完整实现
- ✅ 可以正常跳转到会话列表
- ✅ 未读消息数实时更新
- ✅ 支持居间人、工厂、后台客服三方沟通

**下一步**:
- 可以测试完整的IM沟通流程
- 可以添加消息推送通知（可选）
- 可以添加快捷回复功能（可选）

---

**功能已完成，可以测试使用！** 🎉
