/**
 * 登录成功后，进入首页
 */
export function toHome() {
  // 跳转页面，优先跳转上次登出页面
  const lastHref = window.sessionStorage.getItem('last-href');

  // 强制跳转 进入系统之后，需要一些初始化工作，需要所有的js重新加载
  // 拼接ROUTE_BASE_NAME，系统有可能发布在域名二级目录下
  window.location.href = lastHref || '/home/users';
}

export function toLogin() {
  window.location.href = '/login';
}

export function renderNode(treeData, cb) {
  const loop = (data) =>
    data.map((item) => {
      if (item.children) {
        return cb(item, loop(item.children)); // item children Item
      }

      return cb(item); // 叶子节点
    });
  return loop(treeData);
}
