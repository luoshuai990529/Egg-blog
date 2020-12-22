'use strict';

const Controller = require('egg').Controller;

class AuthController extends Controller {

  async getAuthListController() {
    const query = this.ctx.query;
    const result = await this.ctx.service.auth.queryAuthListService(query);
    this.ctx.body = result;
  }

  async getRolesController() {
    const result = await this.ctx.service.auth.queryRolesService();
    this.ctx.body = result;
  }

  async getUserAuthController() {
    const query = this.ctx.query;
    const result = await this.ctx.service.auth.queryUserAuthService(query);
    this.ctx.body = result;
  }

  async editUserAuthController() {
    const query = this.ctx.request.body;
    const result = await this.ctx.service.auth.editUserAuthService(query);
    this.ctx.body = result;
  }

  async freezeUserController() {
    const query = this.ctx.request.body;
    const result = await this.ctx.service.auth.freezeUserService(query);
    this.ctx.body = result;
  }

  async activeUserController() {
    const query = this.ctx.request.body;
    const result = await this.ctx.service.auth.activeUserService(query);
    this.ctx.body = result;
  }

  async getRightListController() {
    const result = await this.ctx.service.auth.getRightListService();
    this.ctx.body = result;
  }

  async createRoleController() {
    const query = this.ctx.request.body;
    const result = await this.ctx.service.auth.createRoleService(query);
    this.ctx.body = result;
  }

  async deleteRoleController() {
    const query = this.ctx.request.body;
    const result = await this.ctx.service.auth.deleteRoleService(query);
    this.ctx.body = result;
  }

  async getRoleInfoController() {
    const query = this.ctx.query;
    const result = await this.ctx.service.auth.getRoleInfoService(query);
    this.ctx.body = result;
  }

  async editRoleController() {
    const query = this.ctx.request.body;
    const result = await this.ctx.service.auth.editRoleService(query);
    this.ctx.body = result;
  }
}

module.exports = AuthController;
