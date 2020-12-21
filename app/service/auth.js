'use strict';

const Service = require('egg').Service;
/*
    MVC的Model层处理数据逻辑的部分
*/
class HomeService extends Service {
  // 查询出所有的用户与对应角色
  async queryAuthListService({current,size}) {
    try {
      /*总条数 12  
        current   size   (current-1)*size ,
          1        5     0,5
          2        5     5,10
          3        5     10,current*size

       */
      const start = (current-1)*size;
      const end = current*size;
      const sql1 = `
      SELECT DISTINCT
      u.id as uid,
      r.id as rid,
      username,
      account,
      icon,
      state,
      role_name 
      FROM
      USER u
      LEFT JOIN user_roles ur ON u.id = ur.uid
      LEFT JOIN role r ON r.id = ur.rid
      LIMIT ${start},
	    ${end}
      `;
      const list = await this.ctx.app.mysql.query(sql1);
      const res = await this.ctx.app.mysql.query(`select count(*) from user`)
      const totalCount = res[0]['count(*)']
      list.forEach(item => {
        if (item.state == 1) {
          item.stateDesc = '正常';
        } else {
          item.stateDesc = '已冻结';

        }
      });
      return { code: 200, success: 'ok', message: '成功', data: {totalCount,current,size,list} };
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 查询出所有的roles
  async queryRolesService(){
    try {
      const result = await this.ctx.app.mysql.query("select id,role_name from role")
      return {code: 200,success: 'ok',message:'成功', data:[...result]}
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 根据uid查出 rid
  async queryUserAuthService({id}){
    try {
      const sql = `
      SELECT
        rid,
        role_name,
        description 
      FROM
        USER u
        LEFT JOIN user_roles ur ON u.id = ur.uid
        LEFT JOIN role r ON r.id = ur.rid 
      WHERE
        u.id = ${id}`
      const result = await this.ctx.app.mysql.query(sql)
      return {code: 200,success: 'ok',message:'成功', data:{...result[0]}}
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 编辑用户的角色
  async editUserAuthService({uid,rid}){
    try {
      const sql = `
      UPDATE user_roles ur 
      SET ur.rid = ${rid} 
      WHERE
        uid = ${uid}`
      const result = await this.ctx.app.mysql.query(sql)
      if(result.affectedRows == 1){
        return {code:200 ,success:'ok',message:'编辑成功'}
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 冻结账号
  async freezeUserService({id}){
    try {
      const sql = `
      UPDATE USER 
        SET state = 0 
      WHERE 
        id = ${id}
      `
      const result = await this.ctx.app.mysql.query(sql)
      if(result.affectedRows == 1){
        return {code:200 ,success:'ok',message:'账户已被冻结！'}
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 激活账号
  async activeUserService({id}){
     try {
      const sql = `
      UPDATE USER 
        SET state = 1 
      WHERE 
        id = ${id}
      `
      const result = await this.ctx.app.mysql.query(sql)
      if(result.affectedRows == 1){
        return {code:200 ,success:'ok',message:'账户已被激活！'}
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
}

module.exports = HomeService;
