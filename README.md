# JCS避难场所小程序中转网页系统

用于解决“体验版二维码频繁变化导致失效”的问题：

```text
固定二维码 -> 打开 H5 中转页 -> 进入当前配置的小程序页面
```

## 文件说明

- `index.html`：移动端 H5 中转页。
- `styles.css`：政务/应急/科技蓝视觉样式。
- `config.js`：小程序原始 ID、默认 path、动态参数、统计接口配置。
- `app.js`：微信环境检测、path/scene 拼接、微信开放标签初始化。
- `qrcode.html`：二维码生成页面。
- `qrcode.svg`：默认固定二维码示例。
- `assets/`：Logo 和二维码生成脚本资源。

## 必填配置

打开 `config.js`，重点修改：

```js
miniProgram: {
  appId: "wxc5154ed36828a18a",
  username: "gh_xxxxxxxxxxxx",
  envVersion: "trial",
  defaultPath: "/pages/map-home/index"
}
```

注意：`wx-open-launch-weapp` 使用的是“小程序原始 ID”，通常是 `gh_` 开头，不是 AppID。原始 ID 可在微信公众平台的“设置 -> 基本设置”中查看。

`envVersion` 用来控制进入哪个版本：

- `trial`：体验版
- `release`：正式版
- `develop`：开发版

## 微信内打开要求

正式使用 `wx-open-launch-weapp` 时，需要：

1. H5 页面部署到 HTTPS 域名。
2. 域名配置到小程序/公众号对应的 JS 安全域名或业务域名。
3. 页面引入微信 JS-SDK。
4. 后端按当前 URL 生成 `timestamp`、`nonceStr`、`signature`，并注入到 `config.js` 或接口返回。
5. `wxJsSdk.enabled` 改为 `true`。

没有完成 JS-SDK 签名时，页面仍可展示，但微信开放标签可能无法真正拉起小程序。

## 固定二维码

部署后把 `config.js` 中的：

```js
h5: {
  publicUrl: "https://example.com/h5-redirect/"
}
```

改为真实地址，例如：

```text
https://jcs.example.gov.cn/h5-redirect/
```

然后打开：

```text
https://jcs.example.gov.cn/h5-redirect/qrcode.html
```

即可生成固定二维码。用户以后一直扫描这个 H5 地址，跳转目标通过 `config.js` 或 URL 参数控制。

## 动态 path

默认进入首页：

```text
https://jcs.example.gov.cn/h5-redirect/
```

进入避难所详情页：

```text
https://jcs.example.gov.cn/h5-redirect/?path=%2Fpages%2Fshelter-detail%2Findex&shelterId=shelter-jinchuan-park
```

进入指定城市：

```text
https://jcs.example.gov.cn/h5-redirect/?city=jinchang&scene=city_qr
```

不同二维码进入不同避难所：

```text
https://jcs.example.gov.cn/h5-redirect/?scene=shelter_qr_001&shelterId=shelter-people-square
```

页面会把 `scene`、`city`、`communityId`、`shelterId`、`source`、`channel` 自动拼接到小程序 path 后面。

## 扫码统计

后期如需统计扫码次数，配置：

```js
tracking: {
  enabled: true,
  endpoint: "https://jcs.example.gov.cn/api/redirect-scan",
  localStorageKey: "jcs_redirect_scan_count"
}
```

页面会发送：

- `path`
- `scene`
- `city`
- `shelterId`
- `channel`
- `userAgent`
- `createdAt`

推荐后端按 `scene/channel/city/shelterId` 做聚合统计。

## 多城市跳转

通过 URL 参数传城市：

```text
?city=jinchang
?city=chengdu
```

小程序首页读取 `options.city` 后，可切换默认城市或小区。当前 H5 已完成参数透传，小程序侧按需读取即可。

## 部署建议

1. 将整个 `h5-redirect/` 上传到 HTTPS 静态站点。
2. 配置 `config.js` 的真实 `publicUrl` 和 `username`。
3. 接入微信 JS-SDK 签名。
4. 用 `qrcode.html` 生成固定二维码。
5. 将固定二维码用于海报、通知、领导演示和测试分发。

最终效果：用户永远扫描同一个二维码，H5 中转页负责把用户导向当前配置的小程序入口。
