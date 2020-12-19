'use strict';

const Service = require('egg').Service;
const jwt = require('jsonwebtoken');
/*
    MVC的Model层处理数据逻辑的部分
*/
class UserService extends Service {

  /*
          Service的上下文属性上海挂载了一些其他的属性
          this.ctx.curl 发起网络请求
          this.ctx.service.otherService 调用其他 Service.
          this.ctx.db 发起数据库调用等，db可能是其他插件提前挂载到app上的模块
      */
  //    注册账号：插入数据
  async insertUserService(data) {
    try {
      // 注册之前先查询user表中是否有相同的account，如果有就返回该账号已注册
      const account = data.account;
      const accountRes = await this.ctx.app.mysql.get('user', { account });
      if (accountRes) {
        // 如果账号存在 就提示用户账号已存在
        return { code: 202, success: 'ok', message: '该账号已存在,请重新注册' };
      }
      const salt = account.substring(account.length - 4);
      const password = this.ctx.helper.md5(this.ctx.helper.md5(data.password + salt));
      const username = this.ctx.helper.createUserName();
      const res = await this.ctx.app.mysql.insert('user', { account, password, username });
      // res.affectedRows如果===1 就表示插入成功
      if (res.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '注册成功' };
      }
    } catch (error) {
      return { code: 202, success: 'ok', message: '注册失败' };
    }
  }
  //   查询账号：查询数据
  async queryUserService(data) {
    try {
      // 1.先去数据库查询看看是否有该账号密码
      const account = data.account;
      const salt = account.substring(account.length - 4);
      // 1.1 密码也需要加密之后再去数据库进行查询
      const password = this.ctx.helper.md5(this.ctx.helper.md5(data.password + salt));
      const result = await this.ctx.app.mysql.get('user', { account, password });
      if (result.state === 0) {
        return { code: 403, success: 'ok', message: '你的账号已被冻结，禁止访问' };
      }
      //   const keys = 'Lewis&Florence';
      const keys = this.ctx.app.config.keys; // 拿到config中的keys作为公钥
      if (result) {
        this.app.currentUid = result.id;
        this.app.currentAccount = data.account;
        // 2.如果可以查到结果就 生成token
        const token = jwt.sign(
          {
            data: this.ctx.request.body, // 需要放到token的参数
          },
          keys, // 加密的密文，私钥对应着公钥
          {
            expiresIn: 60 * 60 * 2, // 2小时到期时间 超过两小时后向客户端返回过期报错
          }
        );
        // 给前端返回token
        return { code: 200, success: 'ok', message: '登录成功', data: { token } };
      }
      // 如果不存在账号 就提示用户
      return { code: 403, success: 'no', message: '用户或密码错误，请重新输入' };

    } catch (error) {
      return { code: 403, success: 'no', message: error };
    }
  }

  //   查询用户信息
  async queryUserInfoService() {
    try {
      // 获取当前上下文存储的uid
      const id = this.app.currentUid;
      // const result = await this.ctx.app.mysql.get('user', { id });
      const sql = `select rrt.id,account,username,birthday,icon,right_path from rights r right join(
        select uur.id,account,username,birthday,icon,role_id,right_id from  role_rights rr right join (
            select u.id,account,username,birthday,icon,uid,rid from user u 
            left join user_roles ur on u.id=ur.uid 
            where u.id=${id} and u.state=1
        ) uur on rr.role_id=uur.rid
      ) rrt on r.id = rrt.right_id 
    where right_type='menu' GROUP BY right_path`;
      const result = await this.ctx.app.mysql.query(sql);
      if (result) {
        const userInfo = { name: result[0].username, birthday: result[0].birthday, account: result[0].account, userId: result[0].id, staffPhoto: result[0].icon };
        const menus = result.map(item => {
          return item.right_path;
        });
        return { code: 200, success: 'ok', message: '成功', data: { roles: { menus }, userInfo } };
      }
    } catch (error) {
      return { code: 403, success: 'ok', message: '用户被冻结，请重新登录' };
    }
  }
}

module.exports = UserService;
