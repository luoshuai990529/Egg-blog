'use strict';

const Service = require('egg').Service;
/*
    MVC的Model层处理数据逻辑的部分
*/
class HomeService extends Service {

  async queryAuthListService() {
    try {
      const sql = `
      SELECT DISTINCT
      username,
      account,
      icon,
      state,
      role_name 
      FROM
      USER u
      LEFT JOIN user_roles ur ON u.id = ur.uid
      LEFT JOIN role r ON r.id = ur.rid
      `;
      const result = await this.ctx.app.mysql.query(sql);
      result.forEach(item => {
        if (item.state === 1) {
          item.stateDesc = '正常';
        } else {
          item.stateDesc = '已冻结';
        }
      });
      return { code: 200, success: 'ok', message: '成功', data: result };
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }

}

module.exports = HomeService;
