'use strict';

const Controller = require('egg').Controller;
const svgCaptcha = require('svg-captcha');

/*
      MVC的Controller层：处理应用程序业务逻辑, 数据和页面的桥梁
      在Eggjs中，eggJS会自动给控制器的this挂载一些属性
      this.ctx：当前请求的上下文Context对象的实例，通过它我们可以拿到框架封装好的处理当前请求的
      各种便捷属性和方法。
      this.app：当前应用Application 对象的实例，通过它我们可以拿到框架提供的全局对象和方法。
      this.service：应用定义的Service，通过它我们可以访问到抽象出的业务层，等价于this.ctx.service
      this.config：应用运行时的配置项
      this.logger:logger对象，上面有四个方法（debug,info,warn,error）,分别代表打印四个不同级别的日志，
      使用方法和效果与context logger 中介绍的一样，但是通过这个logger对象记录的日志，在日至前面会加上打印该日志的文件路径
      以便快速定位日志打印位置。
    */
class UserController extends Controller {
  //   登录账号
  async loginUserController() {
    const result = await this.ctx.service.user.queryUserService(this.ctx.request.body);
    this.ctx.body = result;
  }

  // 注册账号
  async registerUserController() {
    const result = await this.ctx.service.user.insertUserService(this.ctx.request.body);
    this.ctx.body = result;
  }

  //   查询用户信息
  async getUserInfoController() {
    const result = await this.ctx.service.user.queryUserInfoService();
    this.ctx.body = result;
  }
  // 创建验证码
  async createCaptchaController() {
    const captcha = svgCaptcha.create({ size: 4, ignoreChars: '0o1i', noise: 2, background: '#f4838d' });
    this.ctx.body = { code: 200, success: 'ok', ...captcha };
  }

}

module.exports = UserController;
