const knex = require("knex");
const mockKnex = require("mock-knex");

const connSettings = {
  client: "mysql",
  debug: false,
};

const conn = knex(connSettings);

mockKnex.mock(conn, "knex@.14");

module.exports = conn;
