(function () {
  var config = window.JCS_REDIRECT_CONFIG || {};
  var params = new URLSearchParams(window.location.search);
  var isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  var launcher = document.getElementById("weappLauncher");
  var fallbackButton = document.getElementById("fallbackButton");
  var envText = document.getElementById("envText");
  var statusDot = document.getElementById("statusDot");
  var wechatTip = document.getElementById("wechatTip");
  var pathPreview = document.getElementById("pathPreview");

  function normalizePath(value) {
    var fallback = config.miniProgram && config.miniProgram.defaultPath ? config.miniProgram.defaultPath : "/pages/map-home/index";
    var raw = value || fallback;

    try {
      raw = decodeURIComponent(raw);
    } catch (error) {}

    if (!raw || raw.charAt(0) !== "/") raw = "/" + raw;

    var allowed = (config.routing && config.routing.allowedPathPrefixes) || [];
    var matched = allowed.some(function (prefix) {
      return raw.indexOf(prefix) === 0;
    });

    return matched ? raw : fallback;
  }

  function appendQuery(path) {
    var passthrough = (config.routing && config.routing.passthroughParams) || [];
    var query = new URLSearchParams();

    passthrough.forEach(function (key) {
      var value = params.get(key);
      if (value !== null && value !== "") query.set(key, value);
    });

    var queryString = query.toString();
    if (!queryString) return path;

    return path + (path.indexOf("?") >= 0 ? "&" : "?") + queryString;
  }

  function toWeappPath(path) {
    // wx-open-launch-weapp 的 path 通常不需要开头的斜杠。
    return path.replace(/^\/+/, "");
  }

  function resolveTargetPath() {
    var pathParamName = (config.routing && config.routing.pathParamName) || "path";
    return appendQuery(normalizePath(params.get(pathParamName)));
  }

  function updateLaunchTag(path) {
    var username = config.miniProgram && config.miniProgram.username;
    var envVersion = (config.miniProgram && config.miniProgram.envVersion) || "trial";

    if (launcher) {
      launcher.setAttribute("username", username || "");
      launcher.setAttribute("path", toWeappPath(path));
      launcher.setAttribute("env-version", envVersion);
    }

    if (pathPreview) {
      pathPreview.textContent = "当前跳转路径：" + path;
    }
  }

  function markEnvironment() {
    document.body.classList.toggle("is-wechat", isWeChat);
    document.body.classList.toggle("is-not-wechat", !isWeChat);

    if (envText) {
      envText.textContent = isWeChat ? "已在微信内打开，可进入小程序" : "当前不是微信环境";
    }

    if (statusDot) {
      statusDot.className = "status-dot " + (isWeChat ? "status-ok" : "status-warn");
    }

    if (wechatTip) {
      wechatTip.hidden = isWeChat;
    }
  }

  function configureWxSdk() {
    var wxConfig = config.wxJsSdk || {};
    if (!isWeChat || !window.wx || !wxConfig.enabled) return;

    window.wx.config({
      debug: false,
      appId: wxConfig.appId,
      timestamp: Number(wxConfig.timestamp),
      nonceStr: wxConfig.nonceStr,
      signature: wxConfig.signature,
      jsApiList: [],
      openTagList: ["wx-open-launch-weapp"]
    });

    window.wx.error(function () {
      if (envText) envText.textContent = "微信签名未生效，请检查 JS 安全域名和签名";
      if (statusDot) statusDot.className = "status-dot status-warn";
    });
  }

  function track(path) {
    var tracking = config.tracking || {};
    var key = tracking.localStorageKey || "jcs_redirect_scan_count";

    try {
      var count = Number(localStorage.getItem(key) || "0") + 1;
      localStorage.setItem(key, String(count));
    } catch (error) {}

    if (!tracking.enabled || !tracking.endpoint) return;

    var payload = JSON.stringify({
      appId: config.miniProgram && config.miniProgram.appId,
      path: path,
      query: window.location.search,
      scene: params.get("scene") || "",
      city: params.get("city") || "",
      shelterId: params.get("shelterId") || "",
      channel: params.get("channel") || "",
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString()
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(tracking.endpoint, new Blob([payload], { type: "application/json" }));
      return;
    }

    fetch(tracking.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    }).catch(function () {});
  }

  function bindFallback(path) {
    if (!fallbackButton) return;

    fallbackButton.addEventListener("click", function () {
      if (!isWeChat) {
        alert("请使用微信打开");
        return;
      }

      alert("如无法拉起小程序，请确认 config.js 中已填写 gh_ 开头的小程序原始 ID，并完成微信 JS-SDK 签名配置。当前路径：" + path);
    });
  }

  var targetPath = resolveTargetPath();
  updateLaunchTag(targetPath);
  markEnvironment();
  configureWxSdk();
  bindFallback(targetPath);
  track(targetPath);
})();
