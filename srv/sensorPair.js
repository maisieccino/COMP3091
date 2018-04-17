const Koa = require("koa");
const Router = require("koa-router");
const { SensorPair } = require("./models");

const app = new Koa();

const router = new Router();

/**
 * Middleware that fetches a sensor pair using the id parameter found in the url
 * @param {Koa.context} ctx The current app context
 * @param {Function} next Next function in middleware chain
 */
const getSensorPair = async (ctx, next) => {
  const { pairid } = ctx.params;
  const sensorPair = await SensorPair.query().findById(pairid);
  if (!sensorPair) {
    ctx.throw("No sensor pair found with that id", 404);
  }
  ctx.state.sensorPair = sensorPair;
  await next();
};

router.get("/:pairid", getSensorPair, async ctx => {
  ctx.body = ctx.state.sensorPair.toJSON();
});

router.patch("/:pairid", async ctx => {
  const { pairid } = ctx.params;
  const sensorPair = await SensorPair.query().patchAndFetchById(
    pairid,
    ctx.request.body,
  );
  ctx.body = sensorPair;
});

router.delete("/:pairid", async ctx => {
  const { pairid } = ctx.params;
  const rows = await SensorPair.query().deleteById(pairid);
  if (rows < 1) {
    ctx.throw("No sensor pair found with that id", 404);
  }
  ctx.status = 204;
});

router.get("/", async ctx => {
  ctx.body = await SensorPair.query();
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
