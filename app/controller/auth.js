'use strict';

const Controller = require('egg').Controller;

class AuthController extends Controller {

  async getAuthListController() {
    const result = await this.ctx.service.auth.queryAuthListService();
    this.ctx.body = result;
  }

}

module.exports = AuthController;
