'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, ' + this.app.plugins.aesWrap.name;
  }
  async test() {
    const query = this.ctx.query;
    const username = query.username;
    const age = query.age;

    this.ctx.body = [
      {
        userId: 1,
      },
      {
        username,
        age,
      },
    ];
  }

  async testPost() {
    // console.log('this.ctx.query >>>');
    // console.log(this.ctx.query);
    const query = this.ctx.query;
    // console.log('this.ctx.request.body >>>');
    // console.log(this.ctx.request.body);
    const body = this.ctx.request.body;

    this.ctx.body = {
      query: 'o',
      username: query.username,
      type: body.type,
      array: body.array,
      num: body.num,
      age: query.age,
    };
  }


  async testIgnorePath() {
    this.ctx.body = {
      test: 'ok',
      q: this.ctx.query.q,
    };
  }

  async testIgnoreFunc() {
    this.ctx.body = {
      test: 'ok',
      q: this.ctx.query.q,
    };
  }
  async ignoreExportFunc() {
    this.ctx.body = {
      test: 'ok',
    };
  }
}

module.exports = HomeController;
