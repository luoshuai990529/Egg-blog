'use strict';

const Controller = require('egg').Controller;

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
class HomeController extends Controller {

  async setCookie() {
    this.ctx.cookies.set('name', 'luoshuai', {
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      /* 在eggjs中为了安全起见，建议在设置cookies时，
      给保存的数据生成一个签名，将来获取数据的时候，
      再利用获取到的数据生成一个签名，和当初保存的时候的签名
      进行对比，如果一致表示客户端的数据没有被篡改，如果不一致
      表示保存在客户端的数据被篡改了 */
      signed: true, // 根据config目录下的 keys配置来生成签名
      encrypt: true, // 让eggjs 给cookies加密再保存
    });
    this.ctx.body = '设置成功';
  }
  async getCookie() {
    const cookies = this.ctx.cookies.get('name', {
      // 获取的时候还需要解密
      signed: true,
      encrypt: true,
    });
    this.ctx.body = `获取的Cookies= ${cookies}`;
  }


}

module.exports = HomeController;
