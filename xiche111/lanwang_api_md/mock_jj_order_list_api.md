# 居间人订单模块 API 文档

## 1. 订单列表 - jj_order/list

**请求方式**: GET

**接口地址**: `xiluxc.jj_order/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 是 | 页码，从1开始 |
| pagesize | int | 是 | 每页条数，默认10 |
| state | int/string | 否 | 订单状态筛选，空或不传表示全部 |

**订单状态枚举**:

| 值 | 状态名 | 说明 |
|----|--------|------|
| 0 | 待确认 | 订单刚创建 |
| 1 | 待缴纳保证金 | 等待居间人缴纳保证金 |
| 2 | 保证金已缴 | 保证金已缴纳 |
| 3 | 合同上传中 | 等待上传买卖合同 |
| 4 | 履约执行中 | 合同已上传，等待工厂发货 |
| 5 | 待结算 | 物流已签收，等待工厂放款 |
| 6 | 已结算 | 佣金已结算到账 |
| 7 | 已取消 | 订单已取消 |
| 8 | 已逾期 | 超时未完成 |

**返回数据**:

```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "list": [
            {
                "id": 1001,
                "orderNo": "JJ202602080001",
                "productName": "高强度螺纹钢 HRB400",
                "coverImage": "https://example.com/product.jpg",
                "companyName": "鑫达建设有限公司",
                "commissionAmount": 14980.00,
                "state": 1,
                "depositRate": 10,
                "commission": 3.5,
                "createTime": "2026-02-08 10:30:00"
            }
        ],
        "total": 8,
        "page": 1,
        "pagesize": 10
    }
}
```

---

## 2. 订单详情 - jj_order/detail

**请求方式**: GET

**接口地址**: `xiluxc.jj_order/detail`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order_id | int | 是 | 订单ID |

**返回数据**:

```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "id": 1001,
        "orderNo": "JJ202602080001",
        "productName": "高强度螺纹钢 HRB400",
        "coverImage": "https://example.com/product.jpg",
        "companyName": "鑫达建设有限公司",
        "state": 4,
        "commissionAmount": 14980.00,
        "commission": 3.5,
        "depositRate": 10,
        "factoryBonus": 749.00,
        "logisticsRebate": 299.60,
        "createTime": "2026-02-08 10:30:00",
        "contractUploadHours": 24,
        "executionHours": 72,
        "deadline_timestamp": 1738900000
    }
}
```

**字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| commissionAmount | float | 基础佣金金额 |
| factoryBonus | float | 预计厂家奖金 |
| logisticsRebate | float | 预计物流返佣 |
| contractUploadHours | int | 合同上传期限（小时） |
| executionHours | int | 履约期限（小时） |
| deadline_timestamp | int | 倒计时截止时间戳（秒），0表示无倒计时 |

---

## 3. 物流信息查询 - jj_order/logistics

**请求方式**: GET

**接口地址**: `xiluxc.jj_order/logistics`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order_id | int | 是 | 订单ID |

**返回数据**:

```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "logistics_type": "platform",
        "logistics_info": {
            "companyName": "极速达物流",
            "companyType": "fast",
            "trackingNo": "JSD2026020800001",
            "status": "signed",
            "rebateAmount": 580.00
        },
        "timeline": [
            {
                "desc": "已签收 - 买方已确认收货",
                "time": "2026-02-08 14:30:00"
            },
            {
                "desc": "运输中 - 货物已到达目的地中转站",
                "time": "2026-02-07 18:20:00"
            },
            {
                "desc": "运输中 - 货物已从发货地出发",
                "time": "2026-02-06 09:15:00"
            },
            {
                "desc": "已发货 - 工厂已将货物交付物流公司",
                "time": "2026-02-05 16:40:00"
            },
            {
                "desc": "已下单 - 物流订单已创建",
                "time": "2026-02-05 10:00:00"
            }
        ],
        "self_pickup_info": {
            "status": "pending",
            "pickupTime": "",
            "pickupNoteUrl": ""
        },
        "checklist_files": [
            {
                "type": "image",
                "url": "https://example.com/checklist.jpg",
                "name": "发货清单-20260205.jpg",
                "time": "2026-02-05 16:45",
                "ext": "JPG"
            }
        ]
    }
}
```

**logistics_type 枚举**:

| 值 | 说明 |
|----|------|
| platform | 平台物流（享受返佣） |
| self | 自提（买方到厂提货） |

**物流公司类型 (companyType)**:

| 值 | 名称 | 说明 |
|----|------|------|
| fast | 极速达 | 速度最快 |
| high | 佣金王 | 返佣最高 |
| cheap | 省钱王 | 运费最低 |

**发货状态 (status)**:

| 值 | 说明 |
|----|------|
| pending | 待发货 |
| shipped | 已发货 |
| transit | 运输中 |
| signed | 已签收 |

**自提状态 (self_pickup_info.status)**:

| 值 | 说明 |
|----|------|
| pending | 待提货 |
| picked | 已提货 |
