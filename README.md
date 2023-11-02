## 简介

请先阅读 https://github.com/lqzhgood/Shmily

此工具是将 导出的短信/通话记录，转换成 `Shmily-Msg` 格式的工具 <br/>
对结果仅去重和排序(按时间从小到大) <br/>

安卓 App 使用的是 `超级备份专业版(com.idea.backup.smscontactspro)`，已在 tools 中提供 <br/>

## 使用

### 0. 安装 node 环境 [http://lqzhgood.github.io/Shmily/guide/setup-runtime/nodejs.html]

### 1.修改 config.js

```
`right` 是指聊天记录右边 一般是指我方信息 <br/>
`left` 是指聊天记录左边 一般是指对方信息 <br/>
`FILTER_ARR` 将筛选数组内的号码
```

### 2. AndroidBackup 通讯记录（可选）

通讯记录放入 `./input/calllogs/` 文件夹中,执行 `npm run logs`

##### 注意

-   通讯记录 --> leftName 采用原始数据中的 name 字段 （可能为空），可能数据没有 name 字段，
-   通话记录 无法区分 `呼出挂断` `呼出未接`

因为导出的数据没有接收方的数据

```
direction == 'go'
    只有 receiver receiverName 准确， 因为数据中没有 sender senderName, 这两个值是手写硬编码的

direction == 'come'
    只有 sender senderName 准确，  因为数据中没有 receiver receiverName, 这两个值是手写硬编码的
```

A,B <br> B 为右边，数据备份人。呼入/呼出 全部是以右边为目标

- 呼入已接 A --> B 接了 x 秒
- 呼入未接 A --> B 响铃 x 秒
- 呼入挂断 A --> B B 主动挂断 | duration == 0

---

- 呼出已接 A <-- B 接了 x 秒
- 呼出未接(呼出挂断) A <-- B A 未接，或 A 主动挂断 | duration == 0

| key               | value    | 枚举值                                         | 默认值 | 备注    |
| ----------------- | -------- | ---------------------------------------------- | ------ | ------- |
| type              |          | [呼入已接,呼入未接,呼入挂断,呼出已接,呼出未接] |        |         |
| $CallLog.duration | 通话时间 |                                                |        | 单位 秒 |

<br/>



### 3. AndroidBackup 短信（可选）

短信放入 `./input/sms/` 文件夹,执行 `npm run sms`

##### 注意

-   彩信未处理
-   超级 QQ 短信大部分是由 106 开头发出的， 筛选内容包含 QQ 号的, 需在 `config.js` 中填写 QQ 号码

### 4. s60 短信（可选）

将提取好的 S60 短信放入 `./input/smsS60Nbu/` 文件夹,执行 `npm run smss60`

##### 注意

S60 短信导出时不同于安卓一次导出所有短信，而是导出指定某人的短信。

所以这里的短信都确定是本人，数据会打上 `numberIsTrue: true` 的标签,在 `Merger` 时不会被过滤掉

###### type 类型

`type` 类型的设置有优先级，先匹配飞信 再匹配彩信。 因为飞信也有可能有图片，详见 `smsType` 方法

## 感谢

http://lqzhgood.github.io/Shmily/guide/other/thanks.html

## 捐赠

点击链接 http://lqzhgood.github.io/Shmily/guide/other/donation.html 看世界上最可爱的动物
