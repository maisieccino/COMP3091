const Koa = require("koa");
const { ValidationError } = require("objection");
const Router = require("koa-router");
const BaseStation = require("./models/BaseStation");

const app = new Koa();

const router = new Router();

const getBaseStation = id => BaseStation.query().findById(id);

router.get("/:id", async ctx => {
  const { id } = ctx.params;
  const baseStation = await getBaseStation(id);
  if (!baseStation) {
    ctx.throw("Base station not found with that id", 404);
  }
  ctx.body = baseStation.toJSON();
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
  ctx.body = "";
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
