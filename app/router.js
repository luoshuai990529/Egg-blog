'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  // 1.从服务端的实例对象中解构出对象中处理路由的对象和处理控制器的对象
  const { router, controller } = app;

  /*
    1.EggJS中间件
    EggJS是基于KOA的, 所以EggJS的中间件形式和 Koa 的中间件形式是一样的
    只不过EggJS规定我们需要将中间件写到特殊的目录中
    只不过EggJS中为中间件提供了多种使用方式
    https://eggjs.org/zh-cn/basics/middleware.html
    * */
  // const clientCheck = app.middleware.clientCheck({ ua: /Chrome/ });
  const tokenCheck = app.middleware.tokenCheck();
  // 在执行请求test之前先要经过clientCheck，通过了才往下执行
  // 2.利用处理路由的对象监听路由的请求
  router.post('/api/login', controller.user.loginUserController);
  router.post('/api/register', controller.user.registerUserController);
  router.get('/api/captcha', controller.user.createCaptchaController);
  router.post('/api/user', tokenCheck, controller.user.getUserInfoController);
  router.get('/api/auth/list', tokenCheck, controller.auth.getAuthListController);
  // router.get('/api/register/:name/:age', controller.home.getParams);
  // router.post('/login', controller.home.getBody);
  // router.get('/setcookie', controller.home.setCookie);
  // router.get('/getcookie', controller.home.getCookie);
  // router.get('/create', controller.home.insertUse);
};

