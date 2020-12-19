'use strict';
/**
 * 自定义中间件 接收两个参数：
 * @param options 是一个对象
 * @param app     服务器实例对象
 */
// { ua: /Chrome/ }

module.exports = options => {
  return async (ctx, next) => {
    // 1.获取客户端的请求信息
    const userAgent = ctx.get('user-agent');
    // 2.判断客户端是否是谷歌浏览器
    const flag = options.ua.test(userAgent);
    if (flag) {
      ctx.status = 401;
      ctx.body = '不支持当前的浏览器';
    } else {
      // 放行
      next();
    }
  };
};
