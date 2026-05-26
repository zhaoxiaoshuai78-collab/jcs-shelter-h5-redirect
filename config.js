window.JCS_REDIRECT_CONFIG = {
  h5: {
    // 部署后改为真实公网地址。固定二维码建议只编码这个 URL。
    publicUrl: "https://zhaoxiaoshuai78-collab.github.io/jcs-shelter-h5-redirect/"
  },

  miniProgram: {
    // project.config.json 中的 AppID，仅用于文档展示和统计标识。
    appId: "wxc5154ed36828a18a",

    // wx-open-launch-weapp 必须填写“小程序原始 ID”，通常是 gh_ 开头。
    // 登录微信公众平台：设置 -> 基本设置 -> 原始 ID。
    username: "gh_78d74bf1e49c",

    // 体验版用 trial；正式上线后可改为 release；开发版可用 develop。
    envVersion: "trial",

    // 默认进入页面。支持后期改为体验页、指定城市页或指定避难所详情页。
    defaultPath: "/pages/map-home/index"
  },

  routing: {
    // 允许外部二维码覆盖的 path 参数名。
    pathParamName: "path",

    // 这些参数会自动拼接到小程序 path 后面。
    passthroughParams: ["scene", "city", "communityId", "shelterId", "source", "channel"],

    // 简单白名单，防止错误路径。需要新增页面时在这里补充。
    allowedPathPrefixes: [
      "/pages/map-home/",
      "/pages/shelter-detail/",
      "/pages/community-select/",
      "/pages/community-setting/",
      "/pages/emergency-info/",
      "/pages/my/"
    ]
  },

  wxJsSdk: {
    // 使用 wx-open-launch-weapp 正式上线时，需要服务端按当前 URL 生成签名并注入。
    // 如果已有后端，可把 enabled 改为 true，并替换 timestamp/nonceStr/signature。
    enabled: false,
    appId: "wxc5154ed36828a18a",
    timestamp: "",
    nonceStr: "",
    signature: ""
  },

  tracking: {
    // 可选：后期接入统计接口后开启。页面会优先使用 navigator.sendBeacon。
    enabled: false,
    endpoint: "",
    localStorageKey: "jcs_redirect_scan_count"
  }
};
