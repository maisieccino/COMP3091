const Koa = require("koa");

require("dotenv").config();

const app = new Koa();

app.listen(process.env.PORT || 3000);
