'use strict';
/**
 * 自定义中间件 接收两个参数：
 * @param options 是一个对象
 * @param app     服务器实例对象
 */
// { ua: /Chrome/ }
const jwt = require('jsonwebtoken');

module.exports = () => {
  return async (ctx, next) => {
    try {
      // 1.获取客户的请求头信息 拿到客户端token 通过verify方法进行校验
      const token = ctx.get('Authorization').split(' ')[1];
      const keys = ctx.app.config.keys; // 拿到config中的keys作为公钥
      const payload = jwt.verify(token, keys);
      if (payload.data.account === ctx.app.currentAccount) {
      // 如果携带了token 认证通过 就放行
        await next();
      } else {
        ctx.body = { code: 401, success: 'no', message: '用户身份认证错误！' };
      // ctx.status = 10002;
      // ctx.body = '用户身份认证错误！';
      }
    } catch (error) {
      // 捕获token校验错误 返回给客户端
      ctx.body = { code: 401, success: 'no', message: '用户身份信息过期或错误，请重新登录' };
    }
  };
};
