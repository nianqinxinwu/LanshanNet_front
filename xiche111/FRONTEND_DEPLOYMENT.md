# 前端代码部署清单 - 分阶段交付模式

## 已创建的前端页面

### 居间人端（jj）- 3个页面

#### 1. 阶段列表页
**路径**: `pages/jj/jj_stage_list/jj_stage_list.vue`
**功能**:
- 显示订单的所有阶段列表
- 显示完成进度条
- 每个阶段显示状态、金额信息
- 点击进入阶段详情
- 当前阶段可上传付款证明

**API调用**:
- GET `/api/xiluxc/JjOrder/stage_list?order_id=xxx`

---

#### 2. 上传阶段付款证明页
**路径**: `pages/jj/jj_stage_proof_upload/jj_stage_proof_upload.vue`
**功能**:
- 上传付款证明图片/PDF（最多5个文件）
- 填写备注信息
- 显示驳回原因（如果被驳回）
- 提交审核

**API调用**:
- POST `/api/xiluxc/Common/upload` (文件上传)
- POST `/api/xiluxc/JjOrder/upload_stage_proof`

---

#### 3. 阶段详情页
**路径**: `pages/jj/jj_stage_detail/jj_stage_detail.vue`
**功能**:
- 显示阶段完整信息
- 付款证明状态和文件列表
- 放款信息（工厂建议金额、实际放款金额）
- 佣金明细（包含技术服务费）
- 打款状态（三状态：通知打款→审核中→已完成）
- 操作时间线

**API调用**:
- GET `/api/xiluxc/JjOrder/stage_detail?order_id=xxx&stage_no=xxx`

---

### 工厂端（fc）- 已创建的页面

#### 4. 创建分阶段订单页 ✅
**路径**: `pages/fc/fc_create_staged_order/fc_create_staged_order.vue`
**功能**:
- 选择商品
- 选择居间人
- 填写数量
- **选择交付模式**：一次性 / 分阶段
- **设置阶段数**（3-20阶段，支持快捷选择和自定义）
- 自定义阶段名称（可选）
- 实时计算订单总额、佣金、服务费

**API调用**:
- POST `/api/xiluxc/FcOrder/create_staged_order`

---

#### 5. 阶段列表页（工厂视角） ✅
**路径**: `pages/fc/fc_stage_list/fc_stage_list.vue`
**功能**:
- 显示订单所有阶段
- 查看每个阶段的付款证明状态（4步进度：上传→审核→客服确认→打款）
- 查看金额信息（建议金额、实际放款、佣金、服务费）
- 待审核阶段显示"审核证明"按钮
- 已驳回阶段显示"查看驳回详情"按钮
- 其他阶段显示"查看详情"按钮

**API调用**:
- GET `/api/xiluxc/FcOrder/stage_list`

---

#### 6. 审核阶段付款证明页 ✅
**路径**: `pages/fc/fc_stage_proof_review/fc_stage_proof_review.vue`
**功能**:
- 查看居间人上传的付款证明
- 预览图片/PDF
- **审核操作**：通过 / 驳回
- 通过时填写**建议放款金额**
- 驳回时填写**驳回原因**

**API调用**:
- POST `/api/xiluxc/FcOrder/review_stage_proof`

---

## 需要修改的现有页面

### 1. 居间人订单详情页
**路径**: `pages/jj/jj_order_detail/jj_order_detail.vue`
**修改内容**:
```vue
<!-- 在订单信息区域添加 -->
<view class="info-row bb" v-if="orderInfo.deliveryMode === 2">
	<view class="col5 fs28">交付模式</view>
	<view class="col4 fs28 fwb">分阶段交付</view>
</view>
<view class="info-row bb" v-if="orderInfo.deliveryMode === 2">
	<view class="col5 fs28">阶段进度</view>
	<view class="col1 fs28">{{ orderInfo.completedStages }}/{{ orderInfo.totalStages }}</view>
</view>

<!-- 添加查看阶段按钮 -->
<view class="action-btn" v-if="orderInfo.deliveryMode === 2" @click="goStageList">
	<view class="action-icon-wrap">
		<text class="fs20 colf">阶</text>
	</view>
	<view class="flex-grow-1 ml15">
		<view class="fs28 fwb">查看阶段列表</view>
		<view class="fs22 mt4 col9">查看所有阶段的完成情况</view>
	</view>
	<image src="/static/icon/icon_right_gray.png" mode="aspectFill" class="cell-arrow ml15"></image>
</view>
```

**添加方法**:
```javascript
goStageList() {
	uni.navigateTo({
		url: '/pages/jj/jj_stage_list/jj_stage_list?orderId=' + this.orderId
	});
}
```

---

### 2. 工厂订单详情页
**路径**: `pages/fc/fc_order_detail/fc_order_detail.vue`
**修改内容**:
```vue
<!-- 在订单信息区域添加 -->
<view class="info-row bb" v-if="order.deliveryMode === 2">
	<view class="col5 fs28">交付模式</view>
	<view class="col4 fs28 fwb">分阶段交付</view>
</view>
<view class="info-row" v-if="order.deliveryMode === 2">
	<view class="col5 fs28">完成进度</view>
	<view class="col2 fs28 fwb">{{ order.completedStages }}/{{ order.totalStages }}阶段</view>
</view>

<!-- 添加查看阶段按钮 -->
<view class="jj-box mb30" v-if="order.deliveryMode === 2">
	<view class="fs34 fwb col1 lh36 mb20">阶段管理</view>
	<view class="action-btn-full" @click="goStageList">
		查看阶段列表
	</view>
</view>
```

**添加方法**:
```javascript
goStageList() {
	uni.navigateTo({
		url: '/pages/fc/fc_stage_list/fc_stage_list?orderId=' + this.order.id
	});
}
```

---

## pages.json 路由配置

需要在 `pages.json` 中添加以下路由：

```json
{
	"path": "pages/jj/jj_stage_list/jj_stage_list",
	"style": {
		"navigationBarTitleText": "阶段列表",
		"enablePullDownRefresh": false
	}
},
{
	"path": "pages/jj/jj_stage_detail/jj_stage_detail",
	"style": {
		"navigationBarTitleText": "阶段详情",
		"enablePullDownRefresh": false
	}
},
{
	"path": "pages/jj/jj_stage_proof_upload/jj_stage_proof_upload",
	"style": {
		"navigationBarTitleText": "上传付款证明",
		"enablePullDownRefresh": false
	}
},
{
	"path": "pages/fc/fc_create_staged_order/fc_create_staged_order",
	"style": {
		"navigationBarTitleText": "创建订单",
		"enablePullDownRefresh": false
	}
},
{
	"path": "pages/fc/fc_stage_list/fc_stage_list",
	"style": {
		"navigationBarTitleText": "阶段管理",
		"enablePullDownRefresh": false
	}
},
{
	"path": "pages/fc/fc_stage_proof_review/fc_stage_proof_review",
	"style": {
		"navigationBarTitleText": "审核付款证明",
		"enablePullDownRefresh": false
	}
}
```

---

## 部署步骤

### 1. 上传居间人端页面 ✅
```bash
# 已创建完成，直接使用
pages/jj/jj_stage_list/jj_stage_list.vue
pages/jj/jj_stage_detail/jj_stage_detail.vue
pages/jj/jj_stage_proof_upload/jj_stage_proof_upload.vue
```

### 2. 上传工厂端页面 ✅
```bash
# 已创建完成，直接使用
pages/fc/fc_create_staged_order/fc_create_staged_order.vue
pages/fc/fc_stage_list/fc_stage_list.vue
pages/fc/fc_stage_proof_review/fc_stage_proof_review.vue
```

### 3. 修改现有页面
- 修改 `pages/jj/jj_order_detail/jj_order_detail.vue`
- 修改 `pages/fc/fc_order_detail/fc_order_detail.vue`

### 4. 更新 pages.json
添加6个新路由配置

### 5. 配置 API baseUrl
确保 `main.js` 或配置文件中设置了正确的 API 地址：
```javascript
Vue.prototype.$baseUrl = 'https://your-domain.com'
```

---

## API 接口对照表

| 功能 | 方法 | 路径 | 端 |
|------|------|------|-----|
| 查询阶段列表 | GET | /api/xiluxc/JjOrder/stage_list | 居间人 |
| 上传阶段证明 | POST | /api/xiluxc/JjOrder/upload_stage_proof | 居间人 |
| 查询阶段详情 | GET | /api/xiluxc/JjOrder/stage_detail | 居间人 |
| 创建分阶段订单 | POST | /api/xiluxc/FcOrder/create_staged_order | 工厂 |
| 审核阶段证明 | POST | /api/xiluxc/FcOrder/review_stage_proof | 工厂 |
| 文件上传 | POST | /api/xiluxc/Common/upload | 通用 |

---

## 测试检查清单

- [ ] 居间人可以查看阶段列表
- [ ] 居间人可以上传付款证明
- [ ] 居间人可以查看阶段详情
- [ ] 工厂可以创建分阶段订单
- [ ] 工厂可以审核付款证明（通过/驳回）
- [ ] 阶段状态流转正确
- [ ] 服务费仅在第1阶段扣除
- [ ] 打款状态三状态正确显示

---

## ✅ 完成状态

**已完成**:
- 居间人端 3个页面 ✅
- 工厂端 3个页面 ✅
- 前端部署文档 ✅

**总计**: 6个完整的前端页面，支持完整的分阶段交付业务流程

---

## 🎯 功能覆盖

### 居间人端功能
✅ 查看订单阶段列表
✅ 上传阶段付款证明
✅ 查看阶段详细信息
✅ 查看审核状态和驳回原因
✅ 查看佣金明细和打款进度

### 工厂端功能
✅ 创建分阶段订单（支持3-20阶段）
✅ 查看订单阶段列表
✅ 审核居间人付款证明
✅ 填写建议放款金额
✅ 驳回证明并说明原因

---

**前端代码已全部准备完毕！** 🎉

上传文件 → 修改订单详情页 → 更新pages.json → 测试功能 → 完成部署
