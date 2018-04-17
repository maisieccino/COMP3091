const Koa = require("koa");
const objection = require("objection");
const Knex = require("knex");
const logger = require("koa-logger");
const mount = require("koa-mount");
const bodyParser = require("koa-bodyparser");

const knexConfig = require("./knexfile");

require("dotenv").config();

process.env.NODE_ENV = process.env.NODE_ENV || "development";
const knex = Knex(knexConfig[process.env.NODE_ENV]);
objection.Model.knex(knex);

const app = new Koa();

app.use(logger());
app.use(bodyParser());

// adds ability to pretty-print output if requested, using the
// `prettyprint` query parameter
app.use(async (ctx, next) => {
  await next();
  if (ctx.status !== 204 && ctx.query.prettyprint === "true") {
    ctx.body = JSON.stringify(ctx.body, "\n", 2);
  }
});

app.use(async (ctx, next) => {
  await next();
  if (ctx.status === 204) {
    ctx.body = null;
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
app.use(mount("/basestation", require("./baseStation")));
app.use(mount("/sensorpair", require("./sensorPair")));

app.use(async ctx => {
  ctx.throw("URL not found", 404);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening.");
});

module.exports = app;
