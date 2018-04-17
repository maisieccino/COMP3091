exports.up = knex =>
  knex.schema.createTable("readings", table => {
    table
      .uuid("id")
      .notNullable()
      .primary();
    table
      .uuid("sensorpair_id")
      .references("id")
      .inTable("sensorpairs")
      .notNullable();
    table.dateTime("t");
    table.json("counts");
    table.timestamps();
  });

exports.down = knex => knex.schema.dropTable("readings");
