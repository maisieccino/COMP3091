const Koa = require("koa");
const { ValidationError } = require("objection");
const Router = require("koa-router");
const { BaseStation } = require("./models");

const app = new Koa();

const router = new Router();

/**
 * Middleware that fetches a base station using the id parameter found in the url
 * @param {Koa.context} ctx The current app context
 * @param {Function} next Next function in middleware chain
 */
const getBaseStation = async (ctx, next) => {
  const { id } = ctx.params;
  const baseStation = await BaseStation.query().findById(id);
  if (!baseStation) {
    ctx.throw("No base station found with that id", 404);
  }
  ctx.state.baseStation = baseStation;
  await next();
};

router.get("/:id/sensorpairs", getBaseStation, async ctx => {
  ctx.body = await ctx.state.baseStation.$relatedQuery("sensorPairs");
});

router.post("/:id/sensorpairs", getBaseStation, async ctx => {
  try {
    const sensorPair = await ctx.state.baseStation
      .$relatedQuery("sensorPairs")
      .insert(ctx.request.body);
    ctx.status = 201;
    ctx.body = sensorPair;
  } catch (err) {
    ctx.body = {};
    if (err instanceof ValidationError) {
      ctx.throw(
        typeof err.message === "object"
          ? JSON.stringify(err.message)
          : err.message,
        400,
      );
    }
    ctx.throw(err.message, 500);
  }
});

router.get("/:id", getBaseStation, async ctx => {
  ctx.body = ctx.state.baseStation.toJSON();
});

router.patch("/:id", async ctx => {
  const { id } = ctx.params;
  const baseStation = await BaseStation.query().patchAndFetchById(
    id,
    ctx.request.body,
  );
  ctx.body = baseStation.toJSON();
});

router.delete("/:id", async ctx => {
  const { id } = ctx.params;
  const rows = await BaseStation.query().deleteById(id);
  if (rows < 1) {
    ctx.throw("base station not found with that id", 404);
  }
  ctx.status = 204;
});

router.get("/", async ctx => {
  ctx.body = await BaseStation.query();
});

router.post("/", async ctx => {
  try {
    const baseStation = await BaseStation.query().insert(ctx.request.body);
    ctx.body = baseStation;
    ctx.status = 201;
  } catch (err) {
    ctx.body = {};
    if (err instanceof ValidationError) {
      ctx.throw(
        typeof err.message === "object"
          ? JSON.stringify(err.message)
          : err.message,
        400,
      );
    }
    ctx.throw(err.message, 500);
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
