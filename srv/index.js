const Koa = require("koa");
const objection = require("objection");
const Knex = require("knex");
const logger = require("koa-logger");
const mount = require("koa-mount");
const bodyParser = require("koa-bodyparser");

const knexConfig = require("./knexfile");

const baseStation = require("./baseStation");

require("dotenv").config();

process.env.NODE_ENV = process.env.NODE_ENV || "development";
const knex = Knex(knexConfig[process.env.NODE_ENV]);
objection.Model.knex(knex);

const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(async (ctx, next) => {
  await next();
  if (ctx.status === 204) {
    ctx.body = "";
  } else {
    ctx.body = { error: ctx.error, content: ctx.body };
  }
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.error = err.message || "An error occured";
    ctx.status = err.status || 500;
  }
});

// apps
app.use(mount("/basestation", baseStation));

app.use(async ctx => {
  ctx.status = 404;
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening.");
});

module.exports = app;
