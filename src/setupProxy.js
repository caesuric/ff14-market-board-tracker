const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/xivapi",
    createProxyMiddleware({
      target: "https://xivapi.com",
      pathRewrite: {
        "^/xivapi": "",
      },
      changeOrigin: true,
      secure: false,
    })
  );
  app.use(
    "/uapi",
    createProxyMiddleware({
      target: "https://universalis.app/api/v2",
      pathRewrite: {
        "^/uapi": "",
      },
      changeOrigin: true,
      secure: false,
    })
  );
  app.use(
    "/tracker",
    createProxyMiddleware({
      target: "http://xivmarketstats.com:1414",
      pathRewrite: {
        "^/tracker": "",
      },
      changeOrigin: true,
      secure: false,
    })
  );
};
