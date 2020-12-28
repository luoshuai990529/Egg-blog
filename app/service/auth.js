'use strict';

const Service = require('egg').Service;
/*
    MVC的Model层处理数据逻辑的部分
*/
class HomeService extends Service {
  // 查询出所有的用户与对应角色
  async queryAuthListService({ current, size }) {
    try {
      /* 总条数 12
        current   size   (current-1)*size ,
          1        5     0,5
          2        5     5,10
          3        5     10,current*size

       */
      const start = (current - 1) * size;
      const end = current * size;
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
      LEFT JOIN role r ON r.id = ur.rid ORDER BY r.id asc
      LIMIT ${start},
	    ${end}
      `;
      const list = await this.ctx.app.mysql.query(sql1);
      const res = await this.ctx.app.mysql.query('select count(*) from user');
      const totalCount = res[0]['count(*)'];
      list.forEach(item => {
        if (item.state === '1') {
          item.stateDesc = '正常';
        } else {
          item.stateDesc = '已冻结';
        }
      });
      return { code: 200, success: 'ok', message: '成功', data: { totalCount, current, size, list } };
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 查询出所有的roles
  async queryRolesService() {
    try {
      const result = await this.ctx.app.mysql.query('select id,role_name,description,create_time,update_time from role');
      return { code: 200, success: 'ok', message: '成功', data: [ ...result ] };
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 根据uid查出 rid
  async queryUserAuthService({ id }) {
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
        u.id = ${id}`;
      const result = await this.ctx.app.mysql.query(sql);
      return { code: 200, success: 'ok', message: '成功', data: { ...result[0] } };
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 编辑用户的角色
  async editUserAuthService({ uid, rid }) {
    try {
      const sql = `
      UPDATE user_roles ur 
      SET ur.rid = ${rid} 
      WHERE
        uid = ${uid}`;
      const result = await this.ctx.app.mysql.query(sql);
      if (result.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '编辑成功' };
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 冻结账号
  async freezeUserService({ id }) {
    try {
      const sql = `
      UPDATE USER 
        SET state = 0 
      WHERE 
        id = ${id}
      `;
      const result = await this.ctx.app.mysql.query(sql);
      if (result.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '账户已被冻结！' };
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 激活账号
  async activeUserService({ id }) {
    try {
      const sql = `
      UPDATE USER 
        SET state = 1 
      WHERE 
        id = ${id}
      `;
      const result = await this.ctx.app.mysql.query(sql);
      if (result.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '账户已被激活！' };
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 查询所有的菜单权限和api权限
  async getRightListService() {
    try {
      const sql = `SELECT
                    id,
                    right_name as name,
                    right_type as type,
                    right_path as path,
                    right_desc as description
                  FROM
                    rights`;
      const result = await this.ctx.app.mysql.query(sql);
      const menus = [];
      const actions = [];
      result.forEach(item => {
        if (item.type === 'menu') {
          menus.push(item);
        }
        if (item.type === 'action') {
          actions.push(item);
        }
      });
      if (result) {
        return { code: 200, success: 'ok', message: '成功', data: { menus, actions } };
      }
    } catch (error) {
      console.log(error);
      return { code: 200, success: 'no', message: '获取权限信息失败' };
    }
  }
  // 新增角色
  async createRoleService(data) {
    // 1-初始化事务
    const conn = await this.ctx.app.mysql.beginTransaction();
    try {
      const sql1 = `
                    INSERT INTO role ( role_name, description, create_time )
                    VALUES
                      ( '${data.name}', '${data.desc}', now( ) )
                    `;
      // 第一步操作：新增角色
      const res1 = await conn.query(sql1);
      // 第二部操作：新增角色对应的权限
      const str1 = `INSERT INTO role_rights ( role_id, right_id, create_time )
                    VALUES`;
      let str2 = '';
      data.rights.forEach((item, index) => {
        index === data.rights.length - 1 ? str2 += `(${res1.insertId},${item},now())` : str2 += `(${res1.insertId},${item},now()),`;
      });
      const sql2 = str1 + str2;
      const res2 = await conn.query(sql2);
      await conn.commit(); // 提交事务
      if (res2.affectedRows !== 0) {
        return { code: 200, success: 'ok', message: '新增角色成功！' };
      }
    } catch (error) {
      // 捕获异常  回滚事务！
      await conn.rollback();
      return { code: 200, success: 'no', message: '新增角色失败' };
    }
  }
  // 删除角色
  async deleteRoleService({ id }) {
    // 1-初始化事务
    const conn = await this.ctx.app.mysql.beginTransaction();
    try {
      // 第一步先进行查询对应角色有无对应用户在使用
      const sql1 = `SELECT
                      u.account,
                      ur.rid 
                    FROM
                      USER u
                      LEFT JOIN user_roles ur ON u.id = ur.uid 
                    WHERE
                      rid = ${id}`;
      const res1 = await this.ctx.app.mysql.query(sql1);
      if (res1.length > 0) {
        return { code: 201, success: 'ok', message: '该角色正在被使用，请修改后再试！' };
      }
      const sql2 = `delete from role_rights where role_id = ${id}`;
      const sql3 = `delete from role where id = ${id}`;
      await conn.query(sql2);
      const res2 = await conn.query(sql3);
      await conn.commit(); // 提交事务
      if (res2.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '删除角色成功' };
      }
    } catch (error) {
      await conn.rollback();
      return { code: 200, success: 'no', message: '删除失败' };
    }
  }
  // 查询角色对应的权限以及角色名称和描述
  async getRoleInfoService({ id }) {
    try {
      const sql = `
                  SELECT
                    r.role_name,
                    r.description,
                    rr.right_id ,
                    rt.right_type
                  FROM
                    role r
                    LEFT JOIN role_rights rr ON r.id = rr.role_id 
                    left join rights rt on rr.right_id = rt.id
                  WHERE
                    r.id = ${id}
                        `;
      const result = await this.ctx.app.mysql.query(sql);
      const actionRights = [];
      const routerRights = [];
      result.forEach(item => {
        if (item.right_type === 'menu') {
          routerRights.push(item.right_id);
        }
        if (item.right_type === 'action') {
          actionRights.push(item.right_id);
        }
      });
      return { code: 200, success: 'ok', message: '成功', data: { rolename: result[0].role_name, desc: result[0].description, routerRights, actionRights } };
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
  // 编辑角色信息
  async editRoleService(data) {
    // 1-初始化事务
    const conn = await this.ctx.app.mysql.beginTransaction();
    try {
      const { id, name, desc, rights } = data;
      const sql1 = `UPDATE role 
      SET role_name = '${name}',
      description = '${desc}' 
      WHERE
        id = ${id}`;
      const sql2 = `
      DELETE role_rights 
      FROM
        role_rights 
      WHERE
        role_id = ${id}
      `;
      await conn.query(sql1);
      await conn.query(sql2);
      // 第二部操作：新增角色对应的权限
      const str1 = `INSERT INTO role_rights ( role_id, right_id, create_time )
                    VALUES`;
      let str2 = '';
      rights.forEach((item, index) => {
        index === data.rights.length - 1 ? str2 += `(${id},${item},now())` : str2 += `(${id},${item},now()),`;
      });
      const sql3 = str1 + str2;
      const result = await conn.query(sql3);
      await conn.commit(); // 提交事务
      if (result.affectedRows > 0) {
        return { code: 200, success: 'ok', message: '编辑成功' };
      }
    } catch (error) {
      await conn.rollback();
      return { code: 200, success: 'no', message: error };
    }
  }
}

module.exports = HomeService;
