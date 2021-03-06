// const { createProxyMiddleware } = require('http-proxy-middleware');
// module.exports = function (app) {
//   app.use(
//     createProxyMiddleware('/api', {
//       target: 'http://localhost:3000', //代理到的目标服务器
//       pathRewrite: { '^/api': '' }, //url规则重写
//       changeOrigin: true,
//       secure: false, //SSL验证
//     })
//   );
// };

const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
  app.use(
    createProxyMiddleware('/uploadToGuochuangyun', {
      target: 'http://hn216.api.yesapi.cn', //代理到的目标服务器
      pathRewrite: { '^/uploadToGuochuangyun': '' }, //url规则重写
      changeOrigin: true,
      secure: false, //SSL验证
    })
  );
};
